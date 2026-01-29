import { z } from 'zod'
import type { EventConfig } from 'motia'
import { initSwarmState, getAllAgentOutputs } from '../services/swarm-state'
import { DEFAULT_SWARM_CONFIG } from '../orchestration/types'
import type { SwarmConfig, AgentType } from '../orchestration/types'

const inputSchema = z.object({
  jobId: z.string(),
  taskId: z.string(),
  concept: z.string(),
  quality: z.enum(['low', 'medium', 'high']),
  style: z.string(),
  nluResult: z.any(),
  task: z.any().optional(),
  proposalCount: z.number().optional(),
  config: z.object({
    mode: z.literal('competitive'),
    agents: z.array(z.string()),
    minQualityScore: z.number().optional(),
  }).optional(),
})

export const config: EventConfig = {
  type: 'event',
  name: 'SwarmCompetitive',
  description: 'Competitive swarm execution - multiple proposals, best wins',
  subscribes: ['swarm.competitive.requested'],
  emits: ['competitive.analysis.start', 'swarm.failed'],
  input: inputSchema as any,
}

export const handler = async (input: unknown, { emit, state, logger }: { emit: any; state: any; logger: any }) => {
  const parsed = inputSchema.parse(input)
  const { jobId, taskId, concept, quality, style, nluResult, task, proposalCount, config: inputConfig } = parsed

  logger.info('Starting competitive swarm execution', { jobId, taskId })

  try {
    const swarmConfig: SwarmConfig = {
      ...DEFAULT_SWARM_CONFIG,
      mode: 'competitive',
      agents: (inputConfig?.agents || DEFAULT_SWARM_CONFIG.agents) as AgentType[],
      minQualityScore: inputConfig?.minQualityScore ?? 0.7,
    }

    await initSwarmState(state, jobId, swarmConfig)

    const analysisAgents = [
      'prerequisite-explorer',
      'math-enricher',
      'visual-designer',
      'narrative-composer',
    ].filter(a => swarmConfig.agents.includes(a as AgentType)) as AgentType[]

    await emit({
      topic: 'competitive.analysis.start',
      data: {
        jobId,
        taskId,
        concept,
        quality,
        style,
        nluResult,
        task,
        agents: analysisAgents,
        proposalCount: proposalCount ?? 3,
      },
    })

    logger.info('Competitive swarm started', {
      jobId,
      analysisAgents,
      proposalCount: proposalCount ?? 3,
    })
  } catch (error) {
    logger.error('Failed to start competitive swarm', {
      jobId,
      error: error instanceof Error ? error.message : String(error),
    })

    await emit({
      topic: 'swarm.failed',
      data: {
        jobId,
        taskId,
        error: `Failed to start competitive swarm: ${error}`,
      },
    })
  }
}

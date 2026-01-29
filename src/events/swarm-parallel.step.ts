import { z } from 'zod'
import type { EventConfig } from 'motia'
import { initSwarmState } from '../services/swarm-state'
import { DEFAULT_SWARM_CONFIG } from '../orchestration/types'
import type { SwarmConfig, AgentType } from '../orchestration/types'

const inputSchema = z.object({
  jobId: z.string(),
  taskId: z.string(),
  concept: z.string(),
  quality: z.enum(['low', 'medium', 'high']),
  style: z.string(),
  nluResult: z.any(),
  config: z.object({
    mode: z.literal('parallel'),
    agents: z.array(z.string()),
    maxIterations: z.number().optional(),
    minQualityScore: z.number().optional(),
    agentTimeout: z.number().optional(),
    totalTimeout: z.number().optional(),
  }).optional(),
})

export const config: EventConfig = {
  type: 'event',
  name: 'SwarmParallel',
  description: 'Start parallel swarm execution - runs independent agents concurrently',
  subscribes: ['swarm.parallel.requested'],
  emits: ['parallel.agents.start', 'swarm.failed'],
  input: inputSchema as any,
}

export const handler = async (input: unknown, { emit, state, logger }: { emit: any; state: any; logger: any }) => {
  const parsed = inputSchema.parse(input)
  const { jobId, taskId, concept, quality, style, nluResult, config: inputConfig } = parsed

  logger.info('Starting parallel swarm execution', { jobId, taskId })

  try {
    const swarmConfig: SwarmConfig = {
      ...DEFAULT_SWARM_CONFIG,
      mode: 'parallel',
      agents: (inputConfig?.agents || DEFAULT_SWARM_CONFIG.agents) as AgentType[],
      maxIterations: inputConfig?.maxIterations ?? 1,
      minQualityScore: inputConfig?.minQualityScore ?? 0.7,
      agentTimeout: inputConfig?.agentTimeout ?? 30000,
      totalTimeout: inputConfig?.totalTimeout ?? 120000,
    }

    await initSwarmState(state, jobId, swarmConfig)

    const independentAgents = [
      'prerequisite-explorer',
      'math-enricher',
      'visual-designer',
      'narrative-composer',
    ].filter(a => swarmConfig.agents.includes(a as AgentType)) as AgentType[]

    await emit({
      topic: 'parallel.agents.start',
      data: {
        jobId,
        taskId,
        concept,
        quality,
        style,
        nluResult,
        agents: independentAgents,
        phase: 'independent',
      },
    })

    logger.info('Parallel swarm started', {
      jobId,
      independentAgents,
      agentCount: independentAgents.length,
    })
  } catch (error) {
    logger.error('Failed to start parallel swarm', {
      jobId,
      error: error instanceof Error ? error.message : String(error),
    })

    await emit({
      topic: 'swarm.failed',
      data: {
        jobId,
        taskId,
        error: `Failed to start parallel swarm: ${error}`,
      },
    })
  }
}

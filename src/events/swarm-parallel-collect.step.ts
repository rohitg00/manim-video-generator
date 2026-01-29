import { z } from 'zod'
import type { EventConfig } from 'motia'
import {
  getSwarmState,
  updateSwarmState,
  storeAgentOutput,
  getAllAgentOutputs,
  isSwarmComplete,
} from '../services/swarm-state'
import type { AgentType, AgentOutput } from '../orchestration/types'

const inputSchema = z.object({
  jobId: z.string(),
  taskId: z.string(),
  agentType: z.string(),
  output: z.object({
    agent: z.string(),
    success: z.boolean(),
    code: z.string().optional(),
    sceneGraph: z.any().optional(),
    insights: z.array(z.string()),
    suggestions: z.array(z.any()),
    qualityScore: z.number(),
    processingTime: z.number(),
    error: z.string().optional(),
    metadata: z.record(z.any()).optional(),
  }),
  phase: z.enum(['independent', 'dependent']).optional(),
})

export const config: EventConfig = {
  type: 'event',
  name: 'SwarmParallelCollect',
  description: 'Collect outputs from parallel agent execution',
  subscribes: ['parallel.agent.complete'],
  emits: ['parallel.aggregation.ready', 'parallel.dependent.start'],
  input: inputSchema as any,
}

export const handler = async (input: unknown, { emit, state, logger }: { emit: any; state: any; logger: any }) => {
  const parsed = inputSchema.parse(input)
  const { jobId, taskId, agentType, output, phase } = parsed

  logger.info('Collecting parallel agent output', { jobId, agentType, phase })

  const swarmState = await getSwarmState(state, jobId)
  if (!swarmState) {
    logger.error('Swarm state not found', { jobId })
    return
  }

  await storeAgentOutput(state, jobId, agentType as AgentType, output as AgentOutput)

  await updateSwarmState(state, jobId, {
    completedAgents: [agentType as AgentType],
    insights: output.insights,
  })

  const updatedState = await getSwarmState(state, jobId)
  if (!updatedState) return

  const independentAgents = [
    'prerequisite-explorer',
    'math-enricher',
    'visual-designer',
    'narrative-composer',
  ].filter(a => updatedState.config.agents.includes(a as AgentType)) as AgentType[]

  const independentComplete = independentAgents.every(
    agent => updatedState.completedAgents.includes(agent)
  )

  if (phase === 'independent' && independentComplete) {
    const dependentAgents = [
      'code-generator',
      'quality-reviewer',
      'style-harmonizer',
    ].filter(a => updatedState.config.agents.includes(a as AgentType)) as AgentType[]

    if (dependentAgents.length > 0) {
      logger.info('Independent phase complete, starting dependent agents', {
        jobId,
        dependentAgents,
      })

      const outputs = await getAllAgentOutputs(state, jobId)

      await emit({
        topic: 'parallel.dependent.start',
        data: {
          jobId,
          taskId,
          agents: dependentAgents,
          context: {
            previousOutputs: outputs,
            insights: updatedState.insights,
          },
        },
      })
    } else {
      await emit({
        topic: 'parallel.aggregation.ready',
        data: {
          jobId,
          taskId,
        },
      })
    }
  } else if (phase === 'dependent') {
    const allComplete = isSwarmComplete(updatedState)

    if (allComplete) {
      logger.info('All parallel agents complete, ready for aggregation', { jobId })

      await emit({
        topic: 'parallel.aggregation.ready',
        data: {
          jobId,
          taskId,
        },
      })
    }
  }
}

import { z } from 'zod'
import type { EventConfig } from 'motia'
import {
  initSwarmState,
  getSwarmState,
  updateSwarmState,
  getAllAgentOutputs,
  getAgentOutputsMap,
} from '../services/swarm-state'
import { aggregateOutputs } from '../orchestration/result-aggregator'
import { DEFAULT_SWARM_CONFIG } from '../orchestration/types'
import type { SwarmConfig, AgentType, AnimationTask } from '../orchestration/types'

const inputSchema = z.object({
  jobId: z.string(),
  taskId: z.string(),
  concept: z.string(),
  quality: z.enum(['low', 'medium', 'high']),
  style: z.string(),
  nluResult: z.any(),
  task: z.any().optional(),
  config: z.object({
    mode: z.literal('collaborative'),
    agents: z.array(z.string()),
    maxIterations: z.number().optional(),
    minQualityScore: z.number().optional(),
    votingThreshold: z.number().optional(),
  }).optional(),
})

export const config: EventConfig = {
  type: 'event',
  name: 'SwarmCollaborative',
  description: 'Collaborative swarm execution with iterative refinement',
  subscribes: ['swarm.collaborative.requested', 'collaborative.iteration.complete'],
  emits: ['collaborative.iteration.start', 'swarm.complete', 'swarm.failed'],
  input: inputSchema as any,
}

export const handler = async (input: unknown, { emit, state, logger }: { emit: any; state: any; logger: any }) => {
  const parsed = inputSchema.parse(input)
  const { jobId, taskId, concept, quality, style, nluResult, task, config: inputConfig } = parsed

  let swarmState = await getSwarmState(state, jobId)

  if (!swarmState) {
    logger.info('Starting collaborative swarm execution', { jobId, taskId })

    const swarmConfig: SwarmConfig = {
      ...DEFAULT_SWARM_CONFIG,
      mode: 'collaborative',
      agents: (inputConfig?.agents || DEFAULT_SWARM_CONFIG.agents) as AgentType[],
      maxIterations: inputConfig?.maxIterations ?? 3,
      minQualityScore: inputConfig?.minQualityScore ?? 0.7,
      votingThreshold: inputConfig?.votingThreshold ?? 0.6,
    }

    swarmState = await initSwarmState(state, jobId, swarmConfig)
  }

  const currentIteration = swarmState.iteration

  if (currentIteration > swarmState.config.maxIterations) {
    logger.info('Max iterations reached, completing swarm', { jobId, currentIteration })

    const outputs = await getAgentOutputsMap(state, jobId)
    const animationTask = task as AnimationTask

    if (animationTask && outputs.size > 0) {
      const aggregated = aggregateOutputs(outputs, animationTask, 'weighted-merge')

      await emit({
        topic: 'swarm.complete',
        data: {
          jobId,
          taskId,
          success: aggregated.code.length > 0,
          code: aggregated.code,
          sceneGraph: aggregated.sceneGraph,
          qualityScore: aggregated.qualityScore,
          iterations: currentIteration - 1,
          mode: 'collaborative',
        },
      })
    }
    return
  }

  if (currentIteration > 1) {
    const outputs = await getAgentOutputsMap(state, jobId)
    const animationTask = task as AnimationTask

    if (animationTask && outputs.size > 0) {
      const aggregated = aggregateOutputs(outputs, animationTask, 'best-wins')

      if (aggregated.qualityScore >= swarmState.config.minQualityScore) {
        logger.info('Quality threshold reached, completing swarm', {
          jobId,
          qualityScore: aggregated.qualityScore,
          iteration: currentIteration,
        })

        await emit({
          topic: 'swarm.complete',
          data: {
            jobId,
            taskId,
            success: true,
            code: aggregated.code,
            sceneGraph: aggregated.sceneGraph,
            qualityScore: aggregated.qualityScore,
            iterations: currentIteration - 1,
            mode: 'collaborative',
          },
        })
        return
      }
    }
  }

  logger.info('Starting collaborative iteration', { jobId, iteration: currentIteration })

  const previousOutputs = await getAllAgentOutputs(state, jobId)

  await emit({
    topic: 'collaborative.iteration.start',
    data: {
      jobId,
      taskId,
      concept,
      quality,
      style,
      nluResult,
      task,
      iteration: currentIteration,
      context: {
        previousOutputs,
        insights: swarmState.insights,
        notes: swarmState.notes,
      },
    },
  })

  await updateSwarmState(state, jobId, {
    iteration: currentIteration + 1,
  })
}

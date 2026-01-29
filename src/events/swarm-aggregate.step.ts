import { z } from 'zod'
import type { EventConfig } from 'motia'
import {
  getSwarmState,
  getAgentOutputsMap,
  cleanupSwarmState,
} from '../services/swarm-state'
import { createSwarmResult } from '../orchestration/result-aggregator'
import type { AnimationTask } from '../orchestration/types'

const inputSchema = z.object({
  jobId: z.string(),
  taskId: z.string(),
  task: z.any().optional(),
  concept: z.string().optional(),
  quality: z.enum(['low', 'medium', 'high']).optional(),
  style: z.string().optional(),
  nluResult: z.any().optional(),
})

export const config: EventConfig = {
  type: 'event',
  name: 'SwarmAggregate',
  description: 'Aggregate outputs from swarm execution and emit final result',
  subscribes: ['parallel.aggregation.ready', 'swarm.complete'],
  emits: ['code.generated', 'swarm.completed', 'swarm.failed'],
  input: inputSchema as any,
}

export const handler = async (input: unknown, { emit, state, logger }: { emit: any; state: any; logger: any }) => {
  const parsed = inputSchema.parse(input)
  const { jobId, taskId, task, concept, quality, style, nluResult } = parsed

  logger.info('Aggregating swarm outputs', { jobId, taskId })

  const swarmState = await getSwarmState(state, jobId)
  if (!swarmState) {
    logger.error('Swarm state not found', { jobId })
    await emit({
      topic: 'swarm.failed',
      data: { jobId, taskId, error: 'Swarm state not found' },
    })
    return
  }

  const outputs = await getAgentOutputsMap(state, jobId)

  if (outputs.size === 0) {
    logger.warn('No agent outputs to aggregate', { jobId })
    await emit({
      topic: 'swarm.failed',
      data: { jobId, taskId, error: 'No agent outputs available' },
    })
    return
  }

  let animationTask: AnimationTask
  if (task) {
    animationTask = task as AnimationTask
  } else {
    animationTask = {
      id: taskId,
      jobId,
      input: concept || '',
      nluResult: nluResult || {
        intent: 'UNKNOWN',
        confidence: 0,
        entities: {
          mathExpressions: [],
          objects: [],
          colors: [],
          actions: [],
          concepts: [],
        },
        suggestedSkill: 'basic',
        style: style || '3blue1brown',
        hasLatex: false,
        needs3D: false,
        estimatedDuration: 10,
      },
      style: (style || '3blue1brown') as any,
      quality: quality || 'medium',
      priority: 5,
      createdAt: swarmState.startTime,
    }
  }

  const result = createSwarmResult(
    taskId,
    jobId,
    outputs,
    animationTask,
    swarmState.mode,
    swarmState.startTime,
    swarmState.iteration
  )

  logger.info('Swarm aggregation complete', {
    jobId,
    success: result.success,
    qualityScore: result.qualityScore.toFixed(3),
    totalTime: result.totalTime,
    participatingAgents: result.participatingAgents,
    iterations: result.iterations,
  })

  if (result.success && result.code) {
    await emit({
      topic: 'code.generated',
      data: {
        jobId,
        concept: concept || animationTask.input,
        quality: quality || animationTask.quality,
        manimCode: result.code,
        usedAI: true,
        generationType: 'swarm',
        skill: nluResult?.suggestedSkill,
        style: style || animationTask.style,
        intent: nluResult?.intent,
        swarmMetadata: {
          mode: result.mode,
          iterations: result.iterations,
          qualityScore: result.qualityScore,
          participatingAgents: result.participatingAgents,
          totalTime: result.totalTime,
        },
      },
    })

    await emit({
      topic: 'swarm.completed',
      data: {
        jobId,
        taskId,
        success: true,
        mode: result.mode,
        qualityScore: result.qualityScore,
        totalTime: result.totalTime,
        iterations: result.iterations,
        warnings: result.warnings,
      },
    })
  } else {
    await emit({
      topic: 'swarm.failed',
      data: {
        jobId,
        taskId,
        warnings: result.warnings,
        qualityScore: result.qualityScore,
      },
    })

    await emit({
      topic: 'code.generated',
      data: {
        jobId,
        concept: concept || animationTask.input,
        quality: quality || animationTask.quality,
        manimCode: null,
        usedAI: false,
        generationType: 'fallback',
        skill: nluResult?.suggestedSkill,
        style: style || animationTask.style,
        intent: nluResult?.intent,
        swarmFailed: true,
      },
    })
  }

  await cleanupSwarmState(state, jobId)
}

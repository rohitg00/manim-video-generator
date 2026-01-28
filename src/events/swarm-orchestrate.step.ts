/**
 * Swarm Orchestration Step
 * Coordinates multi-agent swarm for complex animation generation
 * Wraps the existing pipeline with swarm orchestration capabilities
 */

import { z } from 'zod'
import type { EventConfig, Handlers } from 'motia'
import {
  getAgentSwarm,
  createAnimationTask,
  type SwarmMode,
  type SwarmConfig,
} from '../orchestration'
import type { NLUResult, StylePreset } from '../types/nlu.types'

// Input schema - receives NLU result for swarm processing
const inputSchema = z.object({
  jobId: z.string(),
  concept: z.string(),
  quality: z.enum(['low', 'medium', 'high']),
  nluResult: z.object({
    intent: z.string(),
    confidence: z.number(),
    entities: z.object({
      mathExpressions: z.array(z.string()),
      objects: z.array(z.string()),
      colors: z.array(z.string()),
      actions: z.array(z.string()),
      concepts: z.array(z.string()),
      duration: z.number().optional(),
      style: z.string().optional(),
      complexity: z.enum(['simple', 'medium', 'complex']).optional(),
      manimClasses: z.array(z.string()).optional(),
      numbers: z.array(z.number()).optional(),
      textContent: z.array(z.string()).optional(),
    }),
    suggestedSkill: z.string(),
    style: z.string(),
    rawInterpretation: z.string().optional(),
    alternativeIntents: z.array(z.object({
      intent: z.string(),
      confidence: z.number(),
    })).optional(),
    hasLatex: z.boolean(),
    needs3D: z.boolean(),
    estimatedDuration: z.number(),
  }),
  style: z.enum(['3blue1brown', 'minimalist', 'playful', 'corporate', 'neon']).optional(),
  swarmMode: z.enum(['sequential', 'parallel', 'collaborative', 'competitive']).optional(),
  useSwarm: z.boolean().optional().default(true),
})

export const config: EventConfig = {
  type: 'event',
  name: 'SwarmOrchestrate',
  description: 'Coordinate multi-agent swarm for complex animation generation',
  subscribes: ['swarm.requested'],
  emits: ['code.generated', 'swarm.completed', 'swarm.failed'],
  input: inputSchema as any,
}

export const handler: Handlers['SwarmOrchestrate'] = async (input, { emit, logger }) => {
  const parsed = inputSchema.parse(input)
  const {
    jobId,
    concept,
    quality,
    nluResult,
    style,
    swarmMode,
    useSwarm,
  } = parsed

  logger.info('Starting swarm orchestration', {
    jobId,
    mode: swarmMode || 'collaborative',
    useSwarm,
    intent: nluResult.intent,
  })

  if (!useSwarm) {
    // Skip swarm, emit directly to code.generated for legacy pipeline
    logger.info('Swarm disabled, using legacy pipeline', { jobId })
    await emit({
      topic: 'code.generated',
      data: {
        jobId,
        concept,
        quality,
        manimCode: null,
        usedAI: false,
        generationType: 'legacy',
        skill: nluResult.suggestedSkill,
        style: style || nluResult.style,
        intent: nluResult.intent,
      },
    })
    return
  }

  try {
    // Configure swarm based on mode
    const swarmConfig: Partial<SwarmConfig> = {
      mode: (swarmMode as SwarmMode) || 'collaborative',
      enableParallel: true,
      maxIterations: 3,
      minQualityScore: 0.7,
    }

    // Adjust config based on task complexity
    if (nluResult.entities.complexity === 'complex') {
      swarmConfig.maxIterations = 4
      swarmConfig.minQualityScore = 0.75
    } else if (nluResult.entities.complexity === 'simple') {
      swarmConfig.maxIterations = 2
      swarmConfig.mode = 'parallel' // Faster for simple tasks
    }

    // Get or create swarm
    const swarm = getAgentSwarm(swarmConfig)

    // Create animation task
    const task = createAnimationTask(
      jobId,
      concept,
      nluResult as unknown as NLUResult,
      (style || nluResult.style) as StylePreset,
      quality
    )

    logger.info('Created animation task', {
      jobId,
      taskId: task.id,
      mode: swarm.mode,
      agentCount: swarm.agents.length,
    })

    // Coordinate swarm
    const result = await swarm.coordinate(task)

    logger.info('Swarm coordination complete', {
      jobId,
      taskId: task.id,
      success: result.success,
      qualityScore: result.qualityScore.toFixed(3),
      totalTime: result.totalTime,
      iterations: result.iterations,
      participatingAgents: result.participatingAgents,
      conflictCount: result.conflictResolutions.length,
    })

    if (result.success && result.code) {
      // Emit successful result
      await emit({
        topic: 'code.generated',
        data: {
          jobId,
          concept,
          quality,
          manimCode: result.code,
          usedAI: true,
          generationType: 'swarm',
          skill: nluResult.suggestedSkill,
          style: style || nluResult.style,
          intent: nluResult.intent,
          swarmMetadata: {
            mode: result.mode,
            iterations: result.iterations,
            qualityScore: result.qualityScore,
            participatingAgents: result.participatingAgents,
            totalTime: result.totalTime,
          },
        },
      })

      // Also emit swarm completed event for monitoring
      await emit({
        topic: 'swarm.completed',
        data: {
          jobId,
          taskId: task.id,
          success: true,
          mode: result.mode,
          qualityScore: result.qualityScore,
          totalTime: result.totalTime,
          iterations: result.iterations,
          warnings: result.warnings,
        },
      })
    } else {
      // Swarm failed, emit failure event
      logger.warn('Swarm orchestration failed', {
        jobId,
        warnings: result.warnings,
        qualityScore: result.qualityScore,
      })

      await emit({
        topic: 'swarm.failed',
        data: {
          jobId,
          taskId: task.id,
          warnings: result.warnings,
          qualityScore: result.qualityScore,
        },
      })

      // Fall back to legacy pipeline
      await emit({
        topic: 'code.generated',
        data: {
          jobId,
          concept,
          quality,
          manimCode: null,
          usedAI: false,
          generationType: 'fallback',
          skill: nluResult.suggestedSkill,
          style: style || nluResult.style,
          intent: nluResult.intent,
          swarmFailed: true,
        },
      })
    }
  } catch (error) {
    logger.error('Swarm orchestration error', {
      jobId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })

    // Emit failure event
    await emit({
      topic: 'swarm.failed',
      data: {
        jobId,
        error: String(error),
      },
    })

    // Fall back to legacy pipeline
    await emit({
      topic: 'code.generated',
      data: {
        jobId,
        concept,
        quality,
        manimCode: null,
        usedAI: false,
        generationType: 'fallback',
        skill: nluResult.suggestedSkill,
        style: style || nluResult.style,
        intent: nluResult.intent,
        swarmError: String(error),
      },
    })
  }
}

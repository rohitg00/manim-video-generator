import { z } from 'zod'
import type { EventConfig } from 'motia'
import { v4 as uuidv4 } from 'uuid'
import { DEFAULT_SWARM_CONFIG, type SwarmMode, type SwarmConfig } from '../orchestration/types'
import type { NLUResult, StylePreset } from '../types/nlu.types'

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
  emits: [
    'code.generated',
    'swarm.parallel.requested',
    'swarm.collaborative.requested',
    'swarm.competitive.requested',
    'concept.analyzed',
  ],
  input: inputSchema as any,
}

function createAnimationTask(
  jobId: string,
  concept: string,
  nluResult: NLUResult,
  style: StylePreset,
  quality: 'low' | 'medium' | 'high'
) {
  return {
    id: uuidv4(),
    jobId,
    input: concept,
    nluResult,
    style,
    quality,
    priority: 5,
    createdAt: Date.now(),
  }
}

export const handler = async (input: unknown, { emit, logger }: { emit: any; logger: any }) => {
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

  const effectiveMode = swarmMode || 'sequential'

  logger.info('Starting swarm orchestration', {
    jobId,
    mode: effectiveMode,
    useSwarm,
    intent: nluResult.intent,
  })

  if (!useSwarm) {
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

  const taskId = uuidv4()
  const effectiveStyle = (style || nluResult.style) as StylePreset

  const task = createAnimationTask(
    jobId,
    concept,
    nluResult as unknown as NLUResult,
    effectiveStyle,
    quality
  )

  const swarmConfig: Partial<SwarmConfig> = {
    mode: effectiveMode as SwarmMode,
    enableParallel: true,
    maxIterations: 3,
    minQualityScore: 0.7,
  }

  if (nluResult.entities.complexity === 'complex') {
    swarmConfig.maxIterations = 4
    swarmConfig.minQualityScore = 0.75
  } else if (nluResult.entities.complexity === 'simple') {
    swarmConfig.maxIterations = 2
  }

  logger.info('Created animation task', {
    jobId,
    taskId,
    mode: effectiveMode,
    complexity: nluResult.entities.complexity,
  })

  try {
    switch (effectiveMode) {
      case 'sequential':
        await emit({
          topic: 'concept.analyzed',
          data: {
            jobId,
            concept,
            quality,
            analysisType: 'nlu',
            manimCode: null,
            needsAI: true,
            skill: nluResult.suggestedSkill,
            style: effectiveStyle,
            intent: nluResult.intent,
          },
        })
        break

      case 'parallel':
        await emit({
          topic: 'swarm.parallel.requested',
          data: {
            jobId,
            taskId,
            concept,
            quality,
            style: effectiveStyle,
            nluResult,
            task,
            config: {
              mode: 'parallel',
              agents: DEFAULT_SWARM_CONFIG.agents,
              maxIterations: swarmConfig.maxIterations,
              minQualityScore: swarmConfig.minQualityScore,
            },
          },
        })
        break

      case 'collaborative':
        await emit({
          topic: 'swarm.collaborative.requested',
          data: {
            jobId,
            taskId,
            concept,
            quality,
            style: effectiveStyle,
            nluResult,
            task,
            config: {
              mode: 'collaborative',
              agents: DEFAULT_SWARM_CONFIG.agents,
              maxIterations: swarmConfig.maxIterations,
              minQualityScore: swarmConfig.minQualityScore,
              votingThreshold: DEFAULT_SWARM_CONFIG.votingThreshold,
            },
          },
        })
        break

      case 'competitive':
        await emit({
          topic: 'swarm.competitive.requested',
          data: {
            jobId,
            taskId,
            concept,
            quality,
            style: effectiveStyle,
            nluResult,
            task,
            proposalCount: 3,
            config: {
              mode: 'competitive',
              agents: DEFAULT_SWARM_CONFIG.agents,
              minQualityScore: swarmConfig.minQualityScore,
            },
          },
        })
        break

      default:
        await emit({
          topic: 'concept.analyzed',
          data: {
            jobId,
            concept,
            quality,
            analysisType: 'nlu',
            manimCode: null,
            needsAI: true,
            skill: nluResult.suggestedSkill,
            style: effectiveStyle,
            intent: nluResult.intent,
          },
        })
    }
  } catch (error) {
    logger.error('Swarm orchestration error', {
      jobId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })

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

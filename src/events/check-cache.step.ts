/**
 * Check Cache Step
 * First step in the pipeline - checks if we have a cached result for this concept
 * Uses Motia's event system to route to either cached result or fresh generation
 */

import { z } from 'zod'
import type { EventConfig, Handlers } from 'motia'
import {
  getCachedResult,
  isCachingEnabled,
  normalizeConcept,
  generateConceptHash
} from '../services/concept-cache'

// Input schema
const inputSchema = z.object({
  jobId: z.string(),
  concept: z.string(),
  quality: z.enum(['low', 'medium', 'high']),
  timestamp: z.string(),
  forceRefresh: z.boolean().optional().default(false)
})

export const config: EventConfig = {
  type: 'event',
  name: 'CheckCache',
  description: 'Check if a cached result exists for this concept',
  subscribes: ['animation.requested'],
  emits: ['cache.hit', 'cache.miss'],
  input: inputSchema as any
}

// Handler type will be generated after motia dev runs
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handler: Handlers[keyof Handlers] = async (input: any, { emit, state, logger }: any) => {
  const { jobId, concept, quality, timestamp, forceRefresh } = inputSchema.parse(input)

  logger.info('Checking cache for concept', {
    jobId,
    conceptHash: generateConceptHash(concept, quality),
    forceRefresh,
    cachingEnabled: isCachingEnabled()
  })

  // Skip cache if disabled or force refresh requested
  if (!isCachingEnabled() || forceRefresh) {
    logger.info('Cache bypassed', { jobId, reason: forceRefresh ? 'force_refresh' : 'caching_disabled' })

    await emit({
      topic: 'cache.miss',
      data: {
        jobId,
        concept,
        quality,
        timestamp,
        cacheStatus: 'bypassed'
      }
    })
    return
  }

  // Check cache using Motia state
  const cachedResult = await getCachedResult(state, concept, quality)

  if (cachedResult) {
    logger.info('Cache HIT - returning cached result', {
      jobId,
      cachedJobId: cachedResult.jobId,
      conceptHash: cachedResult.conceptHash,
      age: Math.round((Date.now() - cachedResult.createdAt) / 1000) + 's'
    })

    await emit({
      topic: 'cache.hit',
      data: {
        jobId,
        concept,
        quality,
        cachedResult: {
          videoUrl: cachedResult.videoUrl,
          manimCode: cachedResult.manimCode,
          generationType: cachedResult.generationType,
          usedAI: cachedResult.usedAI,
          originalJobId: cachedResult.jobId
        }
      }
    })
  } else {
    logger.info('Cache MISS - proceeding with generation', {
      jobId,
      normalizedConcept: normalizeConcept(concept),
      conceptHash: generateConceptHash(concept, quality)
    })

    await emit({
      topic: 'cache.miss',
      data: {
        jobId,
        concept,
        quality,
        timestamp,
        cacheStatus: 'miss'
      }
    })
  }
}

/**
 * Handle Cache Hit Step
 * Processes cache hits by storing the cached result for the new job
 * Uses Motia's event system to complete the workflow without re-generation
 */

import { z } from 'zod'
import type { EventConfig, Handlers } from 'motia'
import { storeJobResult } from '../services/job-store'

// Input schema
const inputSchema = z.object({
  jobId: z.string(),
  concept: z.string(),
  quality: z.enum(['low', 'medium', 'high']),
  cachedResult: z.object({
    videoUrl: z.string(),
    manimCode: z.string(),
    generationType: z.string(),
    usedAI: z.boolean(),
    originalJobId: z.string()
  })
})

export const config: EventConfig = {
  type: 'event',
  name: 'HandleCacheHit',
  description: 'Handle cache hits by storing cached result for new job',
  subscribes: ['cache.hit'],
  emits: [],
  input: inputSchema as any
}

// Handler type will be generated after motia dev runs
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handler: Handlers[keyof Handlers] = async (input: any, { state, logger }: any) => {
  const { jobId, concept, quality, cachedResult } = inputSchema.parse(input)

  logger.info('Processing cache hit', {
    jobId,
    originalJobId: cachedResult.originalJobId,
    videoUrl: cachedResult.videoUrl
  })

  // Store the cached result for this new job
  await storeJobResult(state, jobId, {
    status: 'completed',
    data: {
      videoUrl: cachedResult.videoUrl,
      manimCode: cachedResult.manimCode,
      usedAI: cachedResult.usedAI,
      quality,
      generationType: `cached:${cachedResult.generationType}`
    }
  })

  logger.info('Cache hit processed - job completed', {
    jobId,
    concept,
    source: 'cache',
    originalJobId: cachedResult.originalJobId
  })
}

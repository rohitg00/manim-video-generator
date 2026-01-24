/**
 * Store Result Step
 * Stores job results for later retrieval via the status API
 * Also caches successful results for future reuse
 */

import { z } from 'zod'
import type { EventConfig, Handlers } from 'motia'
import { storeJobResult } from '../services/job-store'
import { cacheResult, isCachingEnabled } from '../services/concept-cache'

// Input schemas for both success and failure events
const videoRenderedSchema = z.object({
  jobId: z.string(),
  concept: z.string(),
  manimCode: z.string(),
  usedAI: z.boolean(),
  generationType: z.string(),
  quality: z.string(),
  videoUrl: z.string(),
  videoPath: z.string(),
  // NLU metadata (optional)
  skill: z.string().optional(),
  style: z.string().optional(),
  intent: z.string().optional()
})

const videoFailedSchema = z.object({
  jobId: z.string(),
  error: z.string(),
  details: z.string().optional()
})

const inputSchema = z.union([videoRenderedSchema, videoFailedSchema])

export const config: EventConfig = {
  type: 'event',
  name: 'StoreResult',
  description: 'Store job results for polling',
  subscribes: ['video.rendered', 'video.failed'],
  emits: [],
  input: inputSchema as any
}

export const handler: Handlers['StoreResult'] = async (input, { logger, state }) => {
  const parsedInput = inputSchema.parse(input)
  // Determine if this is a success or failure based on presence of videoUrl
  const isSuccess = 'videoUrl' in parsedInput

  if (isSuccess) {
    const data = parsedInput as z.infer<typeof videoRenderedSchema>
    await storeJobResult(state, data.jobId, {
      status: 'completed',
      data: {
        videoUrl: data.videoUrl,
        manimCode: data.manimCode,
        usedAI: data.usedAI,
        quality: data.quality,
        generationType: data.generationType,
        // NLU metadata
        skill: data.skill,
        style: data.style,
        intent: data.intent
      }
    })
    logger.info('Stored successful result', {
      jobId: data.jobId,
      videoUrl: data.videoUrl,
      generationType: data.generationType,
      skill: data.skill,
      style: data.style
    })

    // Cache the result for future reuse (if caching is enabled)
    if (isCachingEnabled()) {
      try {
        await cacheResult(state, {
          jobId: data.jobId,
          concept: data.concept,
          quality: data.quality,
          videoUrl: data.videoUrl,
          manimCode: data.manimCode,
          generationType: data.generationType,
          usedAI: data.usedAI
        })
        logger.info('Cached result for future reuse', {
          jobId: data.jobId,
          concept: data.concept.slice(0, 50) + '...'
        })
      } catch (cacheError) {
        logger.warn('Failed to cache result', {
          jobId: data.jobId,
          error: cacheError instanceof Error ? cacheError.message : String(cacheError)
        })
      }
    }
  } else {
    const data = parsedInput as z.infer<typeof videoFailedSchema>
    await storeJobResult(state, data.jobId, {
      status: 'failed',
      data: {
        error: data.error,
        details: data.details
      }
    })
    logger.info('Stored failed result', {
      jobId: data.jobId,
      error: data.error
    })
  }
}

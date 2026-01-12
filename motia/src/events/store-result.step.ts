/**
 * Store Result Step
 * Stores job results for later retrieval via the status API
 */

import { z } from 'zod'
import type { EventConfig, Handlers } from 'motia'
import { storeJobResult } from '../services/job-store'

// Input schemas for both success and failure events
const videoRenderedSchema = z.object({
  jobId: z.string(),
  concept: z.string(),
  manimCode: z.string(),
  usedAI: z.boolean(),
  generationType: z.string(),
  quality: z.string(),
  videoUrl: z.string(),
  videoPath: z.string()
})

const videoFailedSchema = z.object({
  jobId: z.string(),
  error: z.string(),
  details: z.string().optional()
})

export const config: EventConfig = {
  type: 'event',
  name: 'StoreResult',
  description: 'Store job results for polling',
  subscribes: ['video.rendered', 'video.failed'],
  emits: [],
  input: z.union([videoRenderedSchema, videoFailedSchema])
}

export const handler: Handlers['StoreResult'] = async (input, { logger }) => {
  // Determine if this is a success or failure based on presence of videoUrl
  const isSuccess = 'videoUrl' in input

  if (isSuccess) {
    const data = input as z.infer<typeof videoRenderedSchema>
    storeJobResult(data.jobId, {
      status: 'completed',
      data: {
        videoUrl: data.videoUrl,
        manimCode: data.manimCode,
        usedAI: data.usedAI,
        quality: data.quality,
        generationType: data.generationType
      }
    })
    logger.info(`Stored successful result for job ${data.jobId}`)
  } else {
    const data = input as z.infer<typeof videoFailedSchema>
    storeJobResult(data.jobId, {
      status: 'failed',
      data: {
        error: data.error,
        details: data.details
      }
    })
    logger.info(`Stored failed result for job ${data.jobId}`)
  }
}

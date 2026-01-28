/**
 * Job Status API Step
 * Returns the status of an animation generation job
 */

import { z } from 'zod'
import type { ApiRouteConfig, Handlers } from 'motia'
import { getJobResult } from '../services/job-store'
import { coreMiddleware } from '../middlewares/core.middleware'
import { NotFoundError } from '../errors/not-found.error'

// Response schemas
const responseSchema = {
  200: z.union([
    // Processing response
    z.object({
      jobId: z.string(),
      status: z.literal('processing'),
      message: z.string()
    }),
    // Completed response with NLU metadata
    z.object({
      jobId: z.string(),
      status: z.literal('completed'),
      success: z.literal(true),
      video_url: z.string(),
      code: z.string(),
      used_ai: z.boolean(),
      render_quality: z.string(),
      generation_type: z.string(),
      // NLU metadata (optional)
      skill: z.string().optional(),
      style: z.string().optional(),
      intent: z.string().optional()
    }),
    // Failed response
    z.object({
      jobId: z.string(),
      status: z.literal('failed'),
      success: z.literal(false),
      error: z.string(),
      details: z.string().optional()
    })
  ]),
  400: z.object({
    error: z.string()
  })
}

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'JobStatusApi',
  description: 'Check animation generation job status',
  method: 'GET',
  path: '/api/jobs/:jobId',
  responseSchema: responseSchema as any,
  emits: [],
  middleware: [coreMiddleware]
}

export const handler: Handlers['JobStatusApi'] = async (req, { logger, state }) => {
  const { jobId } = req.pathParams

  if (!jobId) {
    throw new NotFoundError('Job ID required')
  }

  logger.info('Checking status for job', { jobId })

  const result = await getJobResult(state, jobId)

  if (!result) {
    // Job is still processing or doesn't exist
    logger.info('Job still processing', { jobId })
    return {
      status: 200,
      body: {
        jobId,
        status: 'processing' as const,
        message: 'Animation is being generated...'
      }
    }
  }

  if (result.status === 'completed') {
    logger.info('Job completed successfully', { jobId, skill: result.data.skill, style: result.data.style })
    return {
      status: 200,
      body: {
        jobId,
        status: 'completed' as const,
        success: true as const,
        video_url: result.data.videoUrl,
        code: result.data.manimCode,
        used_ai: result.data.usedAI,
        render_quality: result.data.quality,
        generation_type: result.data.generationType,
        // NLU metadata
        skill: result.data.skill,
        style: result.data.style,
        intent: result.data.intent
      }
    }
  }

  // Job failed
  logger.info('Job failed', { jobId, error: result.data.error })
  return {
    status: 200,
    body: {
      jobId,
      status: 'failed' as const,
      success: false as const,
      error: result.data.error,
      details: result.data.details
    }
  }
}


/**
 * Generate API Step
 * Receives animation generation requests and emits to the processing pipeline
 */

import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import type { ApiRouteConfig, Handlers } from 'motia'
import { coreMiddleware } from '../middlewares/core.middleware'
import { ValidationError } from '../errors/validation.error'

// Request body schema with style support
const bodySchema = z.object({
  concept: z.string().min(1, 'Concept is required'),
  quality: z.enum(['low', 'medium', 'high']).optional().default('low'),
  forceRefresh: z.boolean().optional().default(false),
  style: z.enum(['3blue1brown', 'minimalist', 'playful', 'corporate', 'neon']).optional().default('3blue1brown'),
  useNLU: z.boolean().optional().default(true)
})

// Response schemas
const responseSchema = {
  202: z.object({
    success: z.boolean(),
    jobId: z.string(),
    message: z.string(),
    status: z.literal('processing')
  }),
  400: z.object({
    error: z.string()
  })
}

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'GenerateApi',
  description: 'Start animation generation',
  method: 'POST',
  path: '/api/generate',
  bodySchema: bodySchema as any,
  responseSchema: responseSchema as any,
  emits: ['animation.requested'],
  middleware: [coreMiddleware]
}

export const handler: Handlers['GenerateApi'] = async (req, { emit, logger }) => {
  // Validate body with Zod schema
  const { concept, quality, forceRefresh, style, useNLU } = bodySchema.parse(req.body)

  // Sanitize input
  const sanitizedConcept = concept.trim().replace(/\s+/g, ' ')

  if (sanitizedConcept.length === 0) {
    throw new ValidationError('Empty concept provided', { concept })
  }

  // Generate unique job ID
  const jobId = uuidv4()

  logger.info('Received animation request', {
    jobId,
    concept: sanitizedConcept,
    quality,
    style,
    useNLU,
    forceRefresh
  })

  // Emit event to start processing pipeline
  await emit({
    topic: 'animation.requested',
    data: {
      jobId,
      concept: sanitizedConcept,
      quality,
      style,
      useNLU,
      forceRefresh,
      timestamp: new Date().toISOString()
    }
  })

  logger.info('Animation request emitted', { jobId, style, useNLU })

  return {
    status: 202,
    body: {
      success: true,
      jobId,
      message: 'Animation generation started',
      status: 'processing' as const
    }
  }
}

/**
 * Generate API Step
 * Receives animation generation requests and emits to the processing pipeline
 */

import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import type { ApiRouteConfig, Handlers } from 'motia'

// Request body schema
const bodySchema = z.object({
  concept: z.string().min(1, 'Concept is required'),
  quality: z.enum(['low', 'medium', 'high']).optional().default('low')
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
  routing: {
    method: 'POST',
    path: '/api/generate'
  },
  bodySchema,
  responseSchema,
  emits: ['animation.requested']
}

export const handler: Handlers['GenerateApi'] = async (req, { emit, logger }) => {
  const { concept, quality } = req.body

  // Sanitize input
  const sanitizedConcept = concept.trim().replace(/\s+/g, ' ')

  if (sanitizedConcept.length === 0) {
    return {
      status: 400,
      body: { error: 'Empty concept provided' }
    }
  }

  // Generate unique job ID
  const jobId = uuidv4()

  logger.info(`Received animation request: jobId=${jobId}, concept="${sanitizedConcept}", quality=${quality}`)

  // Emit event to start processing pipeline
  await emit({
    topic: 'animation.requested',
    data: {
      jobId,
      concept: sanitizedConcept,
      quality: quality || 'low',
      timestamp: new Date().toISOString()
    }
  })

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

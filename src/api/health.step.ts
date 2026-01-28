/**
 * Health Check API Step
 * Returns the health status of the service
 */

import { z } from 'zod'
import type { ApiRouteConfig, Handlers } from 'motia'

// Response schema
const responseSchema = {
  200: z.object({
    status: z.literal('ok'),
    timestamp: z.string(),
    version: z.string()
  })
}

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'HealthCheck',
  description: 'Health check endpoint for monitoring',
  method: 'GET',
  path: '/health',
  responseSchema: responseSchema as any,
  emits: []
}

export const handler: Handlers['HealthCheck'] = async () => {
  return {
    status: 200,
    body: {
      status: 'ok' as const,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
  }
}

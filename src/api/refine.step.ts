/**
 * Refinement API Step
 * Allows iterative refinement of generated animations
 *
 * POST /api/refine
 * Body: { jobId, refinement, preserveElements }
 */

import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import type { ApiRouteConfig, Handlers } from 'motia'
import OpenAI from 'openai'
import { getJobResult } from '../services/job-store'
import type { StylePreset } from '../types/nlu.types'

// Input validation
const inputSchema = z.object({
  /** Original job ID to refine */
  jobId: z.string().uuid(),

  /** Natural language refinement instruction */
  refinement: z.string().min(1).max(500),

  /** Whether to preserve existing elements (vs replace) */
  preserveElements: z.boolean().optional().default(true),

  /** Optional new style to apply */
  newStyle: z.enum(['3blue1brown', 'minimalist', 'playful', 'corporate', 'neon']).optional(),
})

// Initialize OpenAI
let openaiClient: OpenAI | null = null
try {
  openaiClient = new OpenAI()
} catch {
  console.warn('OpenAI not available for refinement')
}

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'RefineAnimation',
  description: 'Refine an existing animation with natural language instructions',
  path: '/api/refine',
  method: 'POST',
  emits: ['animation.requested'],
}

export const handler: Handlers['RefineAnimation'] = async (req, { emit, logger, state }) => {
  try {
    const body = inputSchema.parse(req.body)
    const { jobId, refinement, preserveElements, newStyle } = body

    logger.info('Refinement request received', {
      jobId,
      refinement,
      preserveElements,
    })

    // Get the original job result
    const originalJob = await getJobResult(state, jobId)

    if (!originalJob || originalJob.status !== 'completed') {
      return {
        status: 404,
        body: {
          error: 'Job not found or not completed',
          message: 'Cannot refine a job that does not exist or has not completed',
        },
      }
    }

    if (!originalJob.data.manimCode) {
      return {
        status: 400,
        body: {
          error: 'No code to refine',
          message: 'The original job does not have Manim code to refine',
        },
      }
    }

    // Generate new job ID for the refined version
    const newJobId = uuidv4()

    // Apply refinement using AI
    let refinedCode: string
    let refinedConcept: string

    if (openaiClient) {
      try {
        const response = await openaiClient.chat.completions.create({
          model: process.env.OPENAI_MODEL || 'gpt-4.1-nano',
          messages: [
            {
              role: 'system',
              content: `You are a Manim code modifier. Apply the user's refinement to the existing code.
${preserveElements ? 'Preserve the existing structure and elements, only modify what is necessary.' : 'You may restructure the code as needed.'}
Output ONLY the modified Python code, no explanations.`,
            },
            {
              role: 'user',
              content: `Original Manim code:
\`\`\`python
${originalJob.data.manimCode}
\`\`\`

Refinement request: "${refinement}"

${newStyle ? `Also apply this visual style: ${newStyle}` : ''}

Output the modified code:`,
            },
          ],
          temperature: 0.5,
          max_tokens: 2000,
        })

        const content = response.choices[0]?.message?.content || ''
        // Extract code from potential markdown
        const match = content.match(/```(?:python)?\n?([\s\S]*?)```/i)
        refinedCode = match ? match[1].trim() : content.trim()

        // Create a new concept description
        refinedConcept = `Refined animation - ${refinement}`
      } catch (error) {
        logger.error('AI refinement failed', { error: String(error) })
        return {
          status: 500,
          body: {
            error: 'Refinement failed',
            message: 'Failed to apply refinement to the animation',
          },
        }
      }
    } else {
      return {
        status: 503,
        body: {
          error: 'Service unavailable',
          message: 'AI service is not available for refinement',
        },
      }
    }

    // Store the refinement relationship
    const refinementData = {
      originalJobId: jobId,
      refinement,
      preserveElements,
      newStyle,
      timestamp: new Date().toISOString(),
    }

    // Emit event to process the refined animation
    await emit({
      topic: 'animation.requested',
      data: {
        jobId: newJobId,
        concept: refinedConcept,
        quality: originalJob.data.quality || 'medium',
        timestamp: new Date().toISOString(),
        style: newStyle || originalJob.data.style || '3blue1brown',
        useNLU: false, // Skip NLU for refinements, use direct code
        refinementData,
        preGeneratedCode: refinedCode,
      },
    })

    logger.info('Refinement job created', {
      newJobId,
      originalJobId: jobId,
      refinement,
    })

    return {
      status: 202,
      body: {
        success: true,
        message: 'Refinement request accepted',
        newJobId,
        originalJobId: jobId,
        refinement,
        changes: [
          `Applied refinement: "${refinement}"`,
          newStyle ? `Changed style to: ${newStyle}` : null,
        ].filter(Boolean),
      },
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        status: 400,
        body: {
          error: 'Validation error',
          details: error.errors,
        },
      }
    }

    logger.error('Refinement request failed', { error: String(error) })

    return {
      status: 500,
      body: {
        error: 'Internal server error',
        message: 'An unexpected error occurred',
      },
    }
  }
}

/**
 * Common refinement suggestions
 */
export const REFINEMENT_SUGGESTIONS = [
  'Make the colors warmer',
  'Slow down the animations',
  'Add a title at the beginning',
  'Make it more playful with bouncy animations',
  'Add more emphasis on the key points',
  'Use a minimalist style',
  'Add smooth transitions between sections',
  'Make the text larger',
  'Add a conclusion at the end',
  'Use neon colors with dark background',
]

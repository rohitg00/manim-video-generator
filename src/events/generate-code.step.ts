/**
 * Generate Code Step
 * Generates Manim code using AI if needed
 */

import { z } from 'zod'
import type { EventConfig, Handlers } from 'motia'
import { generateAIManimCode } from '../services/openai-client'
import { generateBasicVisualizationCode } from '../services/manim-templates'

// Input schema - includes 'nlu' for NLU pipeline generated code
const inputSchema = z.object({
  jobId: z.string(),
  concept: z.string(),
  quality: z.enum(['low', 'medium', 'high']),
  analysisType: z.enum(['latex', 'template', 'ai', 'fallback', 'nlu']),
  manimCode: z.string().nullable(),
  needsAI: z.boolean(),
  // NLU pipeline metadata (optional)
  skill: z.string().optional(),
  style: z.string().optional(),
  intent: z.string().optional()
})

export const config: EventConfig = {
  type: 'event',
  name: 'GenerateCode',
  description: 'Generate Manim code using templates or AI',
  subscribes: ['concept.analyzed'],
  emits: ['code.generated'],
  input: inputSchema as any
}

export const handler: Handlers['GenerateCode'] = async (input, { emit, logger }) => {
  const { jobId, concept, quality, analysisType, manimCode, needsAI, skill, style, intent } = inputSchema.parse(input)

  logger.info('Generating code for job', { jobId, needsAI, analysisType, skill, style })

  let finalCode: string
  let usedAI = false
  let generationType = analysisType

  if (needsAI) {
    // Use AI to generate code
    logger.info('Calling OpenAI for code generation', { jobId })

    try {
      const aiCode = await generateAIManimCode(concept)

      if (aiCode && aiCode.length > 0) {
        finalCode = aiCode
        usedAI = true
        generationType = 'ai'
        logger.info('AI code generation successful', {
          jobId,
          codeLength: aiCode.length
        })
      } else {
        // AI failed, use fallback
        logger.warn('AI returned empty code, using fallback', { jobId })
        finalCode = generateBasicVisualizationCode()
        generationType = 'fallback'
      }
    } catch (error) {
      logger.error('AI generation failed', {
        jobId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
      finalCode = generateBasicVisualizationCode()
      generationType = 'fallback'
    }
  } else if (manimCode) {
    // Use pre-generated code (from template or LaTeX)
    finalCode = manimCode
    logger.info('Using pre-generated code', {
      jobId,
      analysisType,
      codeLength: manimCode.length
    })
  } else {
    // Fallback
    logger.warn('No code available, using fallback', { jobId })
    finalCode = generateBasicVisualizationCode()
    generationType = 'fallback'
  }

  await emit({
    topic: 'code.generated',
    data: {
      jobId,
      concept,
      quality,
      manimCode: finalCode,
      usedAI,
      generationType,
      // Pass through NLU metadata
      skill,
      style,
      intent
    }
  })

  logger.info('Code generation complete', {
    jobId,
    generationType,
    usedAI
  })
}

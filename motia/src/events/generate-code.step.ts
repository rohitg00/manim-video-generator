/**
 * Generate Code Step
 * Generates Manim code using AI if needed
 */

import { z } from 'zod'
import type { EventConfig, Handlers } from 'motia'
import { generateAIManimCode } from '../services/openai-client'
import { generateBasicVisualizationCode } from '../services/manim-templates'

// Input schema
const inputSchema = z.object({
  jobId: z.string(),
  concept: z.string(),
  quality: z.enum(['low', 'medium', 'high']),
  analysisType: z.enum(['latex', 'template', 'ai', 'fallback']),
  manimCode: z.string().nullable(),
  needsAI: z.boolean()
})

export const config: EventConfig = {
  type: 'event',
  name: 'GenerateCode',
  description: 'Generate Manim code using templates or AI',
  subscribes: ['concept.analyzed'],
  emits: ['code.generated'],
  input: inputSchema
}

export const handler: Handlers['GenerateCode'] = async (input, { emit, logger }) => {
  const { jobId, concept, quality, analysisType, manimCode, needsAI } = input

  logger.info(`Generating code for job ${jobId}, needsAI=${needsAI}`)

  let finalCode: string
  let usedAI = false
  let generationType = analysisType

  if (needsAI) {
    // Use AI to generate code
    logger.info(`Job ${jobId}: Calling OpenAI for code generation`)

    try {
      const aiCode = await generateAIManimCode(concept)

      if (aiCode && aiCode.length > 0) {
        finalCode = aiCode
        usedAI = true
        generationType = 'ai'
        logger.info(`Job ${jobId}: AI code generation successful`)
      } else {
        // AI failed, use fallback
        logger.warn(`Job ${jobId}: AI returned empty code, using fallback`)
        finalCode = generateBasicVisualizationCode()
        generationType = 'fallback'
      }
    } catch (error) {
      logger.error(`Job ${jobId}: AI generation failed`, error)
      finalCode = generateBasicVisualizationCode()
      generationType = 'fallback'
    }
  } else if (manimCode) {
    // Use pre-generated code (from template or LaTeX)
    finalCode = manimCode
    logger.info(`Job ${jobId}: Using pre-generated ${analysisType} code`)
  } else {
    // Fallback
    logger.warn(`Job ${jobId}: No code available, using fallback`)
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
      generationType
    }
  })

  logger.info(`Job ${jobId}: Code generation complete, type=${generationType}, usedAI=${usedAI}`)
}

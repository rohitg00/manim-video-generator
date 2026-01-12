/**
 * Analyze Concept Step
 * Analyzes the concept to determine generation strategy
 */

import { z } from 'zod'
import type { EventConfig, Handlers } from 'motia'
import {
  isLikelyLatex,
  selectTemplate,
  generateLatexSceneCode
} from '../services/manim-templates'

// Input schema
const inputSchema = z.object({
  jobId: z.string(),
  concept: z.string(),
  quality: z.enum(['low', 'medium', 'high']),
  timestamp: z.string()
})

export const config: EventConfig = {
  type: 'event',
  name: 'AnalyzeConcept',
  description: 'Analyze concept and determine generation strategy',
  subscribes: ['animation.requested'],
  emits: ['concept.analyzed'],
  input: inputSchema
}

export const handler: Handlers['AnalyzeConcept'] = async (input, { emit, logger }) => {
  const { jobId, concept, quality } = input

  logger.info(`Analyzing concept for job ${jobId}: "${concept}"`)

  let analysisType: 'latex' | 'template' | 'ai' | 'fallback'
  let manimCode: string | null = null
  let needsAI = false

  // Step 1: Check if it's a LaTeX expression
  if (isLikelyLatex(concept)) {
    logger.info(`Job ${jobId}: Detected LaTeX expression`)
    analysisType = 'latex'
    manimCode = generateLatexSceneCode(concept)
  } else {
    // Step 2: Try to match a pre-built template
    const templateCode = selectTemplate(concept)

    if (templateCode) {
      logger.info(`Job ${jobId}: Matched template`)
      analysisType = 'template'
      manimCode = templateCode
    } else {
      // Step 3: Need AI generation
      logger.info(`Job ${jobId}: No template match, will use AI`)
      analysisType = 'ai'
      needsAI = true
    }
  }

  await emit({
    topic: 'concept.analyzed',
    data: {
      jobId,
      concept,
      quality,
      analysisType,
      manimCode,
      needsAI
    }
  })

  logger.info(`Job ${jobId}: Analysis complete - type=${analysisType}, needsAI=${needsAI}`)
}

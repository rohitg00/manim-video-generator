/**
 * Analyze Concept Step
 * Analyzes the concept to determine generation strategy
 */

import { z } from 'zod'
import type { EventConfig, Handlers } from 'motia'
import {
  isLikelyLatex,
  selectTemplate,
  generateLatexSceneCode,
  templateMappings,
  calculateMatchScore
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
  input: inputSchema as any
}

export const handler: Handlers['AnalyzeConcept'] = async (input, { emit, logger }) => {
  const { jobId, concept, quality } = inputSchema.parse(input)

  logger.info('Analyzing concept for job', { jobId, concept })

  let analysisType: 'latex' | 'template' | 'ai' | 'fallback'
  let manimCode: string | null = null
  let needsAI = false

  // Step 1: Check if it's a LaTeX expression
  if (isLikelyLatex(concept)) {
    logger.info('Detected LaTeX expression', { jobId })
    analysisType = 'latex'
    manimCode = generateLatexSceneCode(concept)
  } else {
    // Step 2: Try to match a pre-built template
    // Calculate and log confidence scores for all templates
    const scores: Record<string, number> = {}
    let bestTemplate = ''
    let bestScore = 0

    for (const [templateName, templateInfo] of Object.entries(templateMappings)) {
      const score = calculateMatchScore(concept, templateInfo.keywords)
      scores[templateName] = score
      if (score > bestScore) {
        bestScore = score
        bestTemplate = templateName
      }
    }

    logger.info('Template matching scores', {
      jobId,
      bestTemplate,
      bestScore: bestScore.toFixed(3),
      threshold: '0.500',
      willUseTemplate: bestScore > 0.5,
      topScores: Object.entries(scores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([name, score]) => `${name}: ${score.toFixed(3)}`)
    })

    const templateCode = selectTemplate(concept)

    if (templateCode) {
      logger.info('Matched template', { jobId, template: bestTemplate, confidence: bestScore.toFixed(3) })
      analysisType = 'template'
      manimCode = templateCode
    } else {
      // Step 3: Need AI generation
      logger.info('No template match, will use AI', { jobId, bestScore: bestScore.toFixed(3), reason: 'confidence below threshold (0.5)' })
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

  logger.info('Analysis complete', {
    jobId,
    analysisType,
    needsAI
  })
}

/**
 * Analyze Concept Step
 * Analyzes the concept using NLU to determine generation strategy
 * Supports natural language to animation conversion
 */

import { z } from 'zod'
import type { EventConfig, Handlers } from 'motia'
import {
  isLikelyLatex,
  selectTemplate,
  generateLatexSceneCode,
  templateMappings,
  calculateMatchScore,
  TEMPLATE_MATCH_THRESHOLD
} from '../services/manim-templates'
import { classifyIntent, isNLUAvailable, type NLUResult, type StylePreset } from '../services/nlu-classifier'
import { composeScene } from '../services/scene-composer'
import { generateManimCode, isPromptEngineAvailable } from '../services/prompt-engine'
import { getStyleConfig } from '../services/style-presets'

// Input schema with style support
const inputSchema = z.object({
  jobId: z.string(),
  concept: z.string(),
  quality: z.enum(['low', 'medium', 'high']),
  timestamp: z.string(),
  style: z.enum(['3blue1brown', 'minimalist', 'playful', 'corporate', 'neon']).optional(),
  useNLU: z.boolean().optional().default(true)
})

export const config: EventConfig = {
  type: 'event',
  name: 'AnalyzeConcept',
  description: 'Analyze concept and determine generation strategy',
  subscribes: ['cache.miss'],
  emits: ['concept.analyzed'],
  input: inputSchema as any
}

export const handler: Handlers['AnalyzeConcept'] = async (input, { emit, logger }) => {
  const parsed = inputSchema.parse(input)
  const { jobId, concept, quality, style, useNLU } = parsed

  logger.info('Analyzing concept for job', { jobId, concept, useNLU })

  let analysisType: 'latex' | 'template' | 'ai' | 'nlu' | 'fallback'
  let manimCode: string | null = null
  let needsAI = false
  let nluResult: NLUResult | null = null
  let selectedSkill: string | null = null
  let selectedStyle: StylePreset = style || '3blue1brown'

  // NEW: Try NLU-based analysis first if enabled and available
  if (useNLU && isNLUAvailable() && isPromptEngineAvailable()) {
    try {
      logger.info('Using NLU for natural language understanding', { jobId })

      // Classify intent and extract entities
      nluResult = await classifyIntent({
        input: concept,
        forceStyle: style,
      })

      logger.info('NLU classification result', {
        jobId,
        intent: nluResult.intent,
        confidence: nluResult.confidence.toFixed(3),
        skill: nluResult.suggestedSkill,
        style: nluResult.style,
        hasLatex: nluResult.hasLatex,
        needs3D: nluResult.needs3D,
        estimatedDuration: nluResult.estimatedDuration,
      })

      // If NLU has high confidence, use the full pipeline
      if (nluResult.confidence >= 0.6) {
        selectedSkill = nluResult.suggestedSkill
        selectedStyle = nluResult.style

        // Compose scene graph
        const sceneGraph = await composeScene(nluResult, {
          maxDuration: 30,
          includeComments: true,
        })

        logger.info('Scene graph composed', {
          jobId,
          acts: sceneGraph.acts.length,
          totalDuration: sceneGraph.totalDuration,
          is3D: sceneGraph.is3D,
        })

        // Generate code using multi-stage prompt engine
        const generationResult = await generateManimCode(sceneGraph, nluResult)

        if (generationResult.success && generationResult.code) {
          logger.info('NLU-based code generation successful', {
            jobId,
            stages: generationResult.stages.map(s => `${s.stage}: ${s.success}`),
            totalTime: generationResult.totalTime,
          })

          analysisType = 'nlu'
          manimCode = generationResult.code
          needsAI = false

          // Emit with enhanced data
          await emit({
            topic: 'concept.analyzed',
            data: {
              jobId,
              concept,
              quality,
              analysisType,
              manimCode,
              needsAI,
              skill: selectedSkill,
              style: selectedStyle,
              intent: nluResult.intent,
              sceneGraph: {
                id: sceneGraph.id,
                title: sceneGraph.title,
                acts: sceneGraph.acts.length,
                totalDuration: sceneGraph.totalDuration,
              },
            }
          })

          logger.info('Analysis complete via NLU pipeline', {
            jobId,
            analysisType,
            skill: selectedSkill,
            style: selectedStyle,
          })

          return
        }
      }

      logger.info('NLU confidence low, falling back to legacy pipeline', {
        jobId,
        confidence: nluResult.confidence.toFixed(3),
      })
    } catch (error) {
      logger.warn('NLU analysis failed, falling back to legacy pipeline', {
        jobId,
        error: String(error),
      })
    }
  }

  // LEGACY: Fall back to original analysis flow
  // Step 1: Check if it's a LaTeX expression
  if (isLikelyLatex(concept)) {
    logger.info('Detected LaTeX expression', { jobId })
    analysisType = 'latex'
    manimCode = generateLatexSceneCode(concept)
  } else {
    // Step 2: Try to match a pre-built template
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
      threshold: TEMPLATE_MATCH_THRESHOLD.toFixed(3),
      willUseTemplate: bestScore > TEMPLATE_MATCH_THRESHOLD,
      topScores: Object.entries(scores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([name, score]) => `${name}: ${score.toFixed(3)}`)
    })

    const templateResult = selectTemplate(concept)

    if (templateResult) {
      logger.info('Matched template', { jobId, template: templateResult.templateName, confidence: bestScore.toFixed(3) })
      analysisType = 'template'
      manimCode = templateResult.code
    } else {
      // Step 3: Need AI generation
      logger.info('No template match, will use AI for unique output', {
        jobId,
        bestScore: bestScore.toFixed(3),
        threshold: TEMPLATE_MATCH_THRESHOLD.toFixed(3),
        reason: `confidence ${bestScore.toFixed(3)} below threshold ${TEMPLATE_MATCH_THRESHOLD.toFixed(3)}`
      })
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
      needsAI,
      skill: selectedSkill,
      style: selectedStyle,
      intent: nluResult?.intent || null,
    }
  })

  logger.info('Analysis complete', {
    jobId,
    analysisType,
    needsAI
  })
}

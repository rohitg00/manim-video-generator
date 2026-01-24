/**
 * Natural Language Understanding Classifier
 * Classifies user intent and extracts entities for animation generation
 */

import OpenAI from 'openai'
import type {
  Intent,
  NLUResult,
  ExtractedEntities,
  StylePreset,
  ClassifyRequest,
  INTENT_TO_SKILL,
  ENTITY_PATTERNS,
  NLU_DEFAULTS,
} from '../types/nlu.types'

// Re-export for convenience
export * from '../types/nlu.types'

const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-nano'

let openaiClient: OpenAI | null = null

try {
  openaiClient = new OpenAI()
} catch (error) {
  console.warn('OpenAI client initialization failed for NLU:', error)
}

/**
 * Intent patterns for rule-based classification (fallback)
 */
const INTENT_PATTERNS: Array<{
  intent: Intent
  keywords: string[]
  patterns: RegExp[]
  weight: number
}> = [
  {
    intent: 'VISUALIZE_MATH',
    keywords: ['equation', 'formula', 'math', 'calculate', 'solve', 'integral', 'derivative', 'sum', 'function'],
    patterns: [/\$[^$]+\$/, /\\frac/, /\\int/, /\\sum/, /\\lim/, /f\(x\)/, /y\s*=/, /x\^/],
    weight: 1.5,
  },
  {
    intent: 'EXPLAIN_CONCEPT',
    keywords: ['explain', 'show', 'demonstrate', 'how', 'why', 'understand', 'learn', 'teach', 'visualize'],
    patterns: [/how\s+(does|do|to)/i, /what\s+is/i, /explain\s+\w+/i, /show\s+me/i],
    weight: 1.2,
  },
  {
    intent: 'TELL_STORY',
    keywords: ['story', 'narrative', 'journey', 'timeline', 'history', 'evolution', 'progression'],
    patterns: [/tell\s+(me\s+)?a?\s*story/i, /create\s+a\s+story/i, /narrative/i],
    weight: 1.3,
  },
  {
    intent: 'TRANSFORM_OBJECT',
    keywords: ['transform', 'morph', 'change', 'convert', 'turn', 'into', 'become'],
    patterns: [/morph\s+\w+\s+into/i, /transform\s+\w+\s+to/i, /turn\s+\w+\s+into/i],
    weight: 1.4,
  },
  {
    intent: 'DEMONSTRATE_PROCESS',
    keywords: ['process', 'step', 'algorithm', 'procedure', 'workflow', 'stages', 'phases'],
    patterns: [/step\s*by\s*step/i, /walk\s+through/i, /how\s+\w+\s+works/i],
    weight: 1.3,
  },
  {
    intent: 'CREATE_SCENE',
    keywords: ['scene', 'create', 'make', 'build', 'compose', 'design', 'animation'],
    patterns: [/create\s+(a|an)\s+\w+\s+scene/i, /make\s+(a|an)\s+animation/i],
    weight: 1.0,
  },
  {
    intent: 'KINETIC_TEXT',
    keywords: ['title', 'text', 'typography', 'kinetic', 'intro', 'logo', 'words', 'letters'],
    patterns: [/title\s+animation/i, /kinetic\s+text/i, /text\s+effect/i, /logo\s+reveal/i, /intro\s+animation/i],
    weight: 1.4,
  },
  {
    intent: 'COMPARE_CONTRAST',
    keywords: ['compare', 'contrast', 'versus', 'vs', 'difference', 'between', 'similar'],
    patterns: [/compare\s+\w+\s+(and|with|to)/i, /difference\s+between/i, /\w+\s+vs\.?\s+\w+/i],
    weight: 1.3,
  },
  {
    intent: 'GRAPH_FUNCTION',
    keywords: ['graph', 'plot', 'chart', 'curve', 'axis', 'coordinate'],
    patterns: [/graph\s+(of\s+)?f?\(x\)/i, /plot\s+\w+/i, /draw\s+(a\s+)?graph/i],
    weight: 1.4,
  },
  {
    intent: 'GEOMETRIC_PROOF',
    keywords: ['proof', 'theorem', 'prove', 'geometric', 'geometry', 'pythagorean', 'euclid'],
    patterns: [/prove\s+that/i, /proof\s+of/i, /theorem/i, /pythagorean/i],
    weight: 1.5,
  },
]

/**
 * Map intents to skills
 */
const intentToSkill: Record<Intent, string> = {
  EXPLAIN_CONCEPT: 'visual-storyteller',
  VISUALIZE_MATH: 'math-visualizer',
  TELL_STORY: 'visual-storyteller',
  TRANSFORM_OBJECT: 'animation-composer',
  DEMONSTRATE_PROCESS: 'visual-storyteller',
  CREATE_SCENE: 'animation-composer',
  KINETIC_TEXT: 'motion-graphics',
  COMPARE_CONTRAST: 'visual-storyteller',
  GRAPH_FUNCTION: 'math-visualizer',
  GEOMETRIC_PROOF: 'math-visualizer',
}

/**
 * Extract entities from input using pattern matching
 */
function extractEntitiesWithPatterns(input: string): ExtractedEntities {
  const entities: ExtractedEntities = {
    mathExpressions: [],
    objects: [],
    colors: [],
    actions: [],
    concepts: [],
    numbers: [],
    textContent: [],
  }

  // Extract math expressions
  const latexMatches = input.match(/\$([^$]+)\$|\\\(([^)]+)\\\)|\\\[([^\]]+)\\\]/g)
  if (latexMatches) {
    entities.mathExpressions.push(...latexMatches)
  }

  // Extract colors
  const colorMatches = input.match(/\b(red|blue|green|yellow|orange|purple|pink|cyan|white|black|gold|gray|grey)\b/gi)
  if (colorMatches) {
    entities.colors = [...new Set(colorMatches.map(c => c.toLowerCase()))]
  }

  // Extract shapes/objects
  const shapeMatches = input.match(/\b(circle|square|triangle|rectangle|polygon|line|arrow|dot|sphere|cube|cylinder|cone|torus|graph|axes|plane)\b/gi)
  if (shapeMatches) {
    entities.objects = [...new Set(shapeMatches.map(s => s.toLowerCase()))]
  }

  // Extract actions
  const actionMatches = input.match(/\b(move|rotate|scale|fade|transform|morph|grow|shrink|appear|disappear|highlight|emphasize|animate|show|reveal|bounce|slide|spin|zoom|write|draw|create)\b/gi)
  if (actionMatches) {
    entities.actions = [...new Set(actionMatches.map(a => a.toLowerCase()))]
  }

  // Extract duration
  const durationMatch = input.match(/(\d+)\s*(seconds?|secs?|s\b)/i)
  if (durationMatch) {
    entities.duration = parseInt(durationMatch[1], 10)
  }

  // Extract style hints
  if (/3blue1brown|3b1b|grant|sanderson/i.test(input)) {
    entities.style = '3blue1brown'
  } else if (/minimal|clean|simple|white\s*background/i.test(input)) {
    entities.style = 'minimalist'
  } else if (/playful|fun|bouncy|colorful/i.test(input)) {
    entities.style = 'playful'
  } else if (/corporate|professional|business/i.test(input)) {
    entities.style = 'corporate'
  } else if (/neon|cyber|glow|dark/i.test(input)) {
    entities.style = 'neon'
  }

  // Extract complexity hints
  if (/simple|basic|easy|quick/i.test(input)) {
    entities.complexity = 'simple'
  } else if (/complex|detailed|elaborate|comprehensive/i.test(input)) {
    entities.complexity = 'complex'
  } else {
    entities.complexity = 'medium'
  }

  // Extract numbers
  const numberMatches = input.match(/\b\d+\.?\d*\b/g)
  if (numberMatches) {
    entities.numbers = numberMatches.map(n => parseFloat(n))
  }

  // Extract quoted text (for kinetic typography)
  const quotedText = input.match(/["']([^"']+)["']/g)
  if (quotedText) {
    entities.textContent = quotedText.map(t => t.slice(1, -1))
  }

  return entities
}

/**
 * Rule-based intent classification (fallback)
 */
function classifyIntentRuleBased(input: string): { intent: Intent; confidence: number } {
  const normalizedInput = input.toLowerCase()
  const scores: Record<Intent, number> = {} as Record<Intent, number>

  for (const pattern of INTENT_PATTERNS) {
    let score = 0

    // Keyword matching
    for (const keyword of pattern.keywords) {
      if (normalizedInput.includes(keyword)) {
        score += pattern.weight
      }
    }

    // Pattern matching
    for (const regex of pattern.patterns) {
      if (regex.test(input)) {
        score += pattern.weight * 1.5
      }
    }

    scores[pattern.intent] = score
  }

  // Find best match
  let bestIntent: Intent = 'EXPLAIN_CONCEPT'
  let bestScore = 0

  for (const [intent, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score
      bestIntent = intent as Intent
    }
  }

  // Normalize confidence
  const maxPossibleScore = Math.max(...INTENT_PATTERNS.map(p => p.keywords.length * p.weight + p.patterns.length * p.weight * 1.5))
  const confidence = Math.min(bestScore / maxPossibleScore, 1)

  return { intent: bestIntent, confidence: Math.max(confidence, 0.3) }
}

/**
 * Check if input contains LaTeX
 */
function detectLatex(input: string): boolean {
  return /\$[^$]+\$|\\frac|\\int|\\sum|\\lim|\\sqrt|\\begin\{|\\end\{/.test(input)
}

/**
 * Check if input suggests 3D content
 */
function detect3D(input: string): boolean {
  return /3d|three\s*dimension|sphere|cube|cylinder|surface|rotation|orbit|torus|cone/i.test(input)
}

/**
 * Estimate animation duration based on complexity
 */
function estimateDuration(entities: ExtractedEntities, intent: Intent): number {
  let baseDuration = 5

  // Add time for math expressions
  baseDuration += entities.mathExpressions.length * 2

  // Add time for objects
  baseDuration += entities.objects.length * 1

  // Add time for actions
  baseDuration += entities.actions.length * 0.5

  // Intent-based adjustments
  if (intent === 'DEMONSTRATE_PROCESS' || intent === 'TELL_STORY') {
    baseDuration *= 1.5
  } else if (intent === 'KINETIC_TEXT') {
    baseDuration *= 0.8
  }

  // Complexity adjustment
  if (entities.complexity === 'simple') {
    baseDuration *= 0.7
  } else if (entities.complexity === 'complex') {
    baseDuration *= 1.5
  }

  // Respect user-specified duration
  if (entities.duration) {
    return entities.duration
  }

  return Math.min(Math.max(baseDuration, 3), 30)
}

/**
 * Classify intent using OpenAI function calling
 */
async function classifyWithAI(input: string): Promise<{ intent: Intent; confidence: number; reasoning?: string } | null> {
  if (!openaiClient) return null

  try {
    const response = await openaiClient.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are an intent classifier for a Manim animation generator.
Classify the user's request into one of these intents:
- EXPLAIN_CONCEPT: Educational explanations of ideas/concepts
- VISUALIZE_MATH: Mathematical formulas, equations, proofs
- TELL_STORY: Narrative-driven, sequential content
- TRANSFORM_OBJECT: Shape morphing, object transformations
- DEMONSTRATE_PROCESS: Step-by-step procedures, algorithms
- CREATE_SCENE: Custom scene composition
- KINETIC_TEXT: Typography, text animations, titles
- COMPARE_CONTRAST: Side-by-side comparisons
- GRAPH_FUNCTION: Function plotting, charts
- GEOMETRIC_PROOF: Mathematical proofs, theorems

Return a JSON object with: { "intent": "...", "confidence": 0.0-1.0, "reasoning": "..." }`
        },
        {
          role: 'user',
          content: input
        }
      ],
      temperature: 0.3,
      max_tokens: 200,
      response_format: { type: 'json_object' }
    })

    const content = response.choices[0]?.message?.content
    if (!content) return null

    const result = JSON.parse(content)
    return {
      intent: result.intent as Intent,
      confidence: Math.min(Math.max(result.confidence || 0.8, 0), 1),
      reasoning: result.reasoning
    }
  } catch (error) {
    console.warn('AI classification failed, using rule-based:', error)
    return null
  }
}

/**
 * Main classification function
 * Combines AI classification with rule-based fallback
 */
export async function classifyIntent(request: ClassifyRequest): Promise<NLUResult> {
  const { input, context, forceStyle } = request

  // Extract entities first (always rule-based for speed)
  const entities = extractEntitiesWithPatterns(input)

  // Try AI classification first
  let intentResult = await classifyWithAI(input)

  // Fall back to rule-based if AI fails
  if (!intentResult) {
    intentResult = classifyIntentRuleBased(input)
  }

  const { intent, confidence } = intentResult

  // Detect special cases
  const hasLatex = detectLatex(input)
  const needs3D = detect3D(input)

  // Override intent for obvious cases
  let finalIntent = intent
  if (hasLatex && confidence < 0.8) {
    finalIntent = 'VISUALIZE_MATH'
  }

  // Determine style
  const style: StylePreset = forceStyle || entities.style || '3blue1brown'

  // Get suggested skill
  const suggestedSkill = intentToSkill[finalIntent]

  // Estimate duration
  const estimatedDuration = estimateDuration(entities, finalIntent)

  // Build alternative intents
  const alternativeIntents: Array<{ intent: Intent; confidence: number }> = []
  const ruleBasedResult = classifyIntentRuleBased(input)
  if (ruleBasedResult.intent !== finalIntent) {
    alternativeIntents.push(ruleBasedResult)
  }

  return {
    intent: finalIntent,
    confidence,
    entities,
    suggestedSkill,
    style,
    hasLatex,
    needs3D,
    estimatedDuration,
    alternativeIntents,
    rawInterpretation: intentResult.reasoning,
  }
}

/**
 * Quick intent check without full entity extraction
 */
export function quickClassify(input: string): Intent {
  const result = classifyIntentRuleBased(input)
  return result.intent
}

/**
 * Check if NLU service is available
 */
export function isNLUAvailable(): boolean {
  return openaiClient !== null
}

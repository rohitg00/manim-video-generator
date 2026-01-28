
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import type { EventConfig, Handlers } from 'motia'
import OpenAI from 'openai'
import type {
  KnowledgeTree,
  KnowledgeNode,
  MathEnrichmentResult,
  LatexEquation,
  Theorem,
  MathDefinition,
  VisualizationSuggestion,
  MathEnrichedEvent,
  MathCategory,
} from './types'
import {
  LATEX_EQUATIONS,
  THEOREMS,
  DEFINITIONS,
  findEquationsForConcept,
  searchEquations,
  getRelatedEquations,
  getTheoremById,
  getDefinitionByTerm,
} from './latex-library'
import { flattenTree } from './knowledge-tree'

const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-nano'

let openaiClient: OpenAI | null = null

try {
  openaiClient = new OpenAI()
} catch (error) {
  console.warn('OpenAI client initialization failed for math enricher:', error)
}

const inputSchema = z.object({
  jobId: z.string(),
  concept: z.string(),
  quality: z.enum(['low', 'medium', 'high']),
  style: z.enum(['3blue1brown', 'minimalist', 'playful', 'corporate', 'neon']),
  intent: z.string().nullable(),
  knowledgeTree: z.any(),
  learningPath: z.array(z.string()),
  estimatedTotalTime: z.number(),
})

export const config: EventConfig = {
  type: 'event',
  name: 'MathEnricher',
  description: 'Enriches the knowledge tree with mathematical content',
  subscribes: ['prerequisites.resolved'],
  emits: ['math.enriched'],
  input: inputSchema as any,
}

async function extractMathContent(concept: string): Promise<{
  equations: Array<{ name: string; latex: string; description: string }>;
  definitions: Array<{ term: string; definition: string; intuition: string }>;
  visualizations: Array<{ type: string; description: string }>;
}> {
  if (!openaiClient) {
    return { equations: [], definitions: [], visualizations: [] }
  }

  try {
    const response = await openaiClient.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a mathematics content expert. For a given concept, provide:
1. Key equations (1-3) with LaTeX notation
2. Important definitions
3. Visualization suggestions for animation

Return JSON with:
{
  "equations": [{ "name": string, "latex": string, "description": string }],
  "definitions": [{ "term": string, "definition": string, "intuition": string }],
  "visualizations": [{ "type": "graph"|"diagram"|"animation"|"transformation", "description": string }]
}`,
        },
        {
          role: 'user',
          content: `Provide mathematical content for: "${concept}"`,
        },
      ],
      temperature: 0.3,
      max_tokens: 800,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      return { equations: [], definitions: [], visualizations: [] }
    }

    const parsed = JSON.parse(content)
    return {
      equations: Array.isArray(parsed.equations) ? parsed.equations : [],
      definitions: Array.isArray(parsed.definitions) ? parsed.definitions : [],
      visualizations: Array.isArray(parsed.visualizations) ? parsed.visualizations : [],
    }
  } catch (error) {
    console.warn('Failed to extract math content:', error)
    return { equations: [], definitions: [], visualizations: [] }
  }
}

function findLibraryEquations(concept: string): LatexEquation[] {
  const equations = findEquationsForConcept(concept)

  return equations.slice(0, 5)
}

function findRelatedTheorems(concept: string): Theorem[] {
  const conceptLower = concept.toLowerCase()

  return THEOREMS.filter(theorem => {
    const nameMatch = theorem.name.toLowerCase().includes(conceptLower)
    const statementMatch = theorem.statement.toLowerCase().includes(conceptLower)
    const prereqMatch = theorem.prerequisites.some(p => p.toLowerCase().includes(conceptLower))

    return nameMatch || statementMatch || prereqMatch
  })
}

function findRelatedDefinitions(concept: string): MathDefinition[] {
  const conceptLower = concept.toLowerCase()

  const exact = getDefinitionByTerm(concept)
  if (exact) return [exact]

  return DEFINITIONS.filter(def => {
    const termMatch = def.term.toLowerCase().includes(conceptLower)
    const defMatch = def.formalDefinition.toLowerCase().includes(conceptLower)
    const intuitionMatch = def.intuition.toLowerCase().includes(conceptLower)

    return termMatch || defMatch || intuitionMatch
  })
}

function generateColorCoding(equations: LatexEquation[], style: string): Record<string, string> {
  const colorCoding: Record<string, string> = {}

  const palettes: Record<string, string[]> = {
    '3blue1brown': ['#58c4dd', '#83c167', '#ffff00', '#fc6255', '#9a72ac'],
    'minimalist': ['#3498db', '#27ae60', '#e74c3c', '#f39c12', '#9b59b6'],
    'playful': ['#e17055', '#00cec9', '#6c5ce7', '#fd79a8', '#55efc4'],
    'corporate': ['#3498db', '#2ecc71', '#e74c3c', '#e67e22', '#34495e'],
    'neon': ['#00ffff', '#ff00ff', '#00ff00', '#ffff00', '#ff6600'],
  }

  const colors = palettes[style] || palettes['3blue1brown']

  const variables = new Set<string>()
  for (const eq of equations) {
    for (const varDef of eq.variables) {
      variables.add(varDef.symbol)
    }
  }

  let colorIndex = 0
  for (const variable of variables) {
    colorCoding[variable] = colors[colorIndex % colors.length]
    colorIndex++
  }

  return colorCoding
}

function generateVisualizationSuggestions(
  concept: string,
  equations: LatexEquation[]
): VisualizationSuggestion[] {
  const suggestions: VisualizationSuggestion[] = []
  const conceptLower = concept.toLowerCase()

  if (conceptLower.includes('function') || conceptLower.includes('graph') ||
      equations.some(e => e.tags.includes('function'))) {
    suggestions.push({
      type: 'graph',
      description: 'Plot the function on a coordinate plane',
      manimHints: ['Use Axes class', 'Create FunctionGraph', 'Animate with Create or ShowCreation'],
      duration: 5,
    })
  }

  if (conceptLower.includes('derivative') || conceptLower.includes('tangent')) {
    suggestions.push({
      type: 'animation',
      description: 'Show tangent line approaching the curve',
      manimHints: ['Draw secant line', 'Animate h approaching 0', 'Show tangent as limit'],
      duration: 8,
    })
  }

  if (conceptLower.includes('integral') || conceptLower.includes('area')) {
    suggestions.push({
      type: 'animation',
      description: 'Show Riemann rectangles accumulating',
      manimHints: ['Create rectangles under curve', 'Increase number of rectangles', 'Show area converging'],
      duration: 10,
    })
  }

  if (conceptLower.includes('triangle') || conceptLower.includes('circle') ||
      conceptLower.includes('geometry')) {
    suggestions.push({
      type: 'construction',
      description: 'Step-by-step geometric construction',
      manimHints: ['Use geometric primitives', 'Animate construction steps', 'Highlight key relationships'],
      duration: 8,
    })
  }

  if (conceptLower.includes('transform') || conceptLower.includes('matrix') ||
      conceptLower.includes('linear')) {
    suggestions.push({
      type: 'transformation',
      description: 'Show transformation of space or objects',
      manimHints: ['Use ApplyMatrix or similar', 'Show grid transformation', 'Highlight eigenvectors'],
      duration: 6,
    })
  }

  if (equations.length > 0) {
    suggestions.push({
      type: 'animation',
      description: 'Reveal equations with step-by-step derivation',
      manimHints: ['Use Write animation', 'Transform between steps', 'Color-code variables'],
      duration: equations.length * 3,
    })
  }

  return suggestions
}

function generateAnimationSequence(
  equations: LatexEquation[],
  learningPath: string[]
): string[] {
  const sequence: string[] = []

  sequence.push('fade_in_title')

  const sortedEquations = [...equations].sort((a, b) => a.difficulty - b.difficulty)

  for (const eq of sortedEquations) {
    sequence.push(`reveal_equation_${eq.id}`)
    sequence.push(`highlight_variables_${eq.id}`)
    sequence.push('wait_for_comprehension')
  }

  for (const eq of sortedEquations) {
    if (eq.relatedEquations.length > 0) {
      sequence.push(`show_relationship_${eq.id}`)
    }
  }

  sequence.push('summarize_key_points')
  sequence.push('fade_out')

  return sequence
}

function convertToLatexEquation(
  aiEquation: { name: string; latex: string; description: string },
  concept: string
): LatexEquation {
  return {
    id: `ai-${uuidv4().slice(0, 8)}`,
    category: 'general' as MathCategory,
    name: aiEquation.name,
    latex: aiEquation.latex,
    description: aiEquation.description,
    variables: [],
    relatedEquations: [],
    difficulty: 2,
    tags: [concept.toLowerCase(), 'ai-generated'],
  }
}

function convertToDefinition(
  aiDef: { term: string; definition: string; intuition: string }
): MathDefinition {
  return {
    term: aiDef.term,
    formalDefinition: aiDef.definition,
    intuition: aiDef.intuition,
    examples: [],
  }
}

function convertToVisualization(
  aiViz: { type: string; description: string }
): VisualizationSuggestion {
  const typeMap: Record<string, VisualizationSuggestion['type']> = {
    'graph': 'graph',
    'diagram': 'diagram',
    'animation': 'animation',
    'transformation': 'transformation',
    'construction': 'construction',
  }

  return {
    type: typeMap[aiViz.type] || 'animation',
    description: aiViz.description,
    manimHints: [],
    duration: 5,
  }
}

export const handler: Handlers['MathEnricher'] = async (input, { emit, logger }) => {
  const parsed = inputSchema.parse(input)
  const { jobId, concept, quality, style, intent, knowledgeTree, learningPath, estimatedTotalTime } = parsed

  logger.info('Starting mathematical enrichment', { jobId, concept })

  const allNodes = flattenTree(knowledgeTree as KnowledgeTree)
  const allConcepts = allNodes.map(node => node.concept)

  logger.info('Enriching concepts', { jobId, concepts: allConcepts })

  const libraryEquations: LatexEquation[] = []
  for (const c of allConcepts) {
    const eqs = findLibraryEquations(c)
    libraryEquations.push(...eqs)
  }

  const seenEquationIds = new Set<string>()
  const uniqueLibraryEquations = libraryEquations.filter(eq => {
    if (seenEquationIds.has(eq.id)) return false
    seenEquationIds.add(eq.id)
    return true
  })

  const libraryTheorems: Theorem[] = []
  for (const c of allConcepts) {
    const theorems = findRelatedTheorems(c)
    libraryTheorems.push(...theorems)
  }

  const seenTheoremIds = new Set<string>()
  const uniqueTheorems = libraryTheorems.filter(t => {
    if (seenTheoremIds.has(t.id)) return false
    seenTheoremIds.add(t.id)
    return true
  })

  const libraryDefinitions: MathDefinition[] = []
  for (const c of allConcepts) {
    const defs = findRelatedDefinitions(c)
    libraryDefinitions.push(...defs)
  }

  const seenTerms = new Set<string>()
  const uniqueDefinitions = libraryDefinitions.filter(d => {
    if (seenTerms.has(d.term.toLowerCase())) return false
    seenTerms.add(d.term.toLowerCase())
    return true
  })

  let aiEquations: LatexEquation[] = []
  let aiDefinitions: MathDefinition[] = []
  let aiVisualizations: VisualizationSuggestion[] = []

  if (openaiClient && quality !== 'low') {
    const aiContent = await extractMathContent(concept)

    aiEquations = aiContent.equations.map(eq => convertToLatexEquation(eq, concept))
    aiDefinitions = aiContent.definitions.map(def => convertToDefinition(def))
    aiVisualizations = aiContent.visualizations.map(viz => convertToVisualization(viz))

    logger.info('AI math content extracted', {
      jobId,
      aiEquationsCount: aiEquations.length,
      aiDefinitionsCount: aiDefinitions.length,
      aiVisualizationsCount: aiVisualizations.length,
    })
  }

  const allEquations = [...uniqueLibraryEquations, ...aiEquations]
  const allDefinitions = [...uniqueDefinitions, ...aiDefinitions]

  const generatedVisualizations = generateVisualizationSuggestions(concept, allEquations)
  const allVisualizations = [...generatedVisualizations, ...aiVisualizations]

  const colorCoding = generateColorCoding(allEquations, style)

  const animationSequence = generateAnimationSequence(allEquations, learningPath)

  const mathEnrichment: MathEnrichmentResult = {
    equations: allEquations.slice(0, 10),
    theorems: uniqueTheorems.slice(0, 3),
    definitions: allDefinitions.slice(0, 5),
    visualizations: allVisualizations.slice(0, 5),
    colorCoding,
    animationSequence,
  }

  const enrichedNodes = allConcepts.filter(c => {
    const hasEquations = allEquations.some(eq =>
      eq.tags.some(tag => c.toLowerCase().includes(tag)) ||
      eq.name.toLowerCase().includes(c.toLowerCase())
    )
    const hasDefinitions = allDefinitions.some(def =>
      def.term.toLowerCase().includes(c.toLowerCase())
    )
    return hasEquations || hasDefinitions
  })

  logger.info('Mathematical enrichment complete', {
    jobId,
    equationsCount: mathEnrichment.equations.length,
    theoremsCount: mathEnrichment.theorems.length,
    definitionsCount: mathEnrichment.definitions.length,
    visualizationsCount: mathEnrichment.visualizations.length,
    enrichedNodesCount: enrichedNodes.length,
  })

  const eventData: MathEnrichedEvent = {
    jobId,
    concept,
    quality,
    style,
    intent: intent as any,
    knowledgeTree: knowledgeTree as KnowledgeTree,
    mathEnrichment,
    enrichedNodes,
  }

  await emit({
    topic: 'math.enriched',
    data: eventData,
  })

  logger.info('Emitted math.enriched event', { jobId })
}

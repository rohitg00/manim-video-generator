
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import type { EventConfig, Handlers } from 'motia'
import OpenAI from 'openai'
import type { KnowledgeNode, KnowledgeTree, PrerequisiteExplorerInput, PrerequisitesResolvedEvent } from './types'
import {
  createKnowledgeTree,
  createKnowledgeNode,
  addPrerequisite,
  calculateTotalExplanationTime,
  generateLearningPath,
  updateTreeMetadata,
  pruneToDepth,
  flattenTree,
} from './knowledge-tree'

const MAX_DEPTH = 3
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-nano'

let openaiClient: OpenAI | null = null

try {
  openaiClient = new OpenAI()
} catch (error) {
  console.warn('OpenAI client initialization failed for prerequisite explorer:', error)
}

const inputSchema = z.object({
  jobId: z.string(),
  concept: z.string(),
  quality: z.enum(['low', 'medium', 'high']),
  analysisType: z.string(),
  manimCode: z.string().nullable(),
  needsAI: z.boolean(),
  skill: z.string().nullable(),
  style: z.enum(['3blue1brown', 'minimalist', 'playful', 'corporate', 'neon']),
  intent: z.string().nullable(),
  sceneGraph: z.object({
    id: z.string(),
    title: z.string(),
    acts: z.number(),
    totalDuration: z.number(),
  }).optional(),
})

export const config: EventConfig = {
  type: 'event',
  name: 'PrerequisiteExplorer',
  description: 'Explores prerequisite concepts needed to understand the main concept',
  subscribes: ['concept.analyzed'],
  emits: ['prerequisites.resolved'],
  input: inputSchema as any,
}

async function extractPrerequisites(
  concept: string,
  currentDepth: number,
  parentConcept?: string
): Promise<Array<{ concept: string; description: string; fundamentalScore: number; explanationTime: number }>> {
  if (!openaiClient || currentDepth >= MAX_DEPTH) {
    return []
  }

  try {
    const response = await openaiClient.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are an expert educator analyzing prerequisite knowledge.
Given a concept, identify 2-4 prerequisite concepts that must be understood BEFORE learning this concept.
Focus on foundational concepts, not related topics.

Return JSON array with objects containing:
- concept: string (short name, 2-4 words)
- description: string (one sentence explanation)
- fundamentalScore: number (0-1, how fundamental this is; 1 = very basic like "numbers")
- explanationTime: number (seconds to explain, 10-60)

Only include genuine prerequisites, not the concept itself or synonyms.`,
        },
        {
          role: 'user',
          content: parentConcept
            ? `What are the prerequisites for understanding "${concept}" in the context of learning "${parentConcept}"?`
            : `What are the prerequisites for understanding "${concept}"?`,
        },
      ],
      temperature: 0.5,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content
    if (!content) return []

    const parsed = JSON.parse(content)
    const prerequisites = parsed.prerequisites || parsed.concepts || parsed

    if (!Array.isArray(prerequisites)) {
      return []
    }

    return prerequisites.map((p: any) => ({
      concept: String(p.concept || '').slice(0, 50),
      description: String(p.description || '').slice(0, 200),
      fundamentalScore: Math.max(0, Math.min(1, Number(p.fundamentalScore) || 0.5)),
      explanationTime: Math.max(5, Math.min(120, Number(p.explanationTime) || 15)),
    }))
  } catch (error) {
    console.warn('Failed to extract prerequisites:', error)
    return []
  }
}

async function buildKnowledgeTree(
  concept: string,
  tree: KnowledgeTree,
  parentId: string,
  currentDepth: number,
  visitedConcepts: Set<string>
): Promise<KnowledgeTree> {
  const conceptLower = concept.toLowerCase()
  if (visitedConcepts.has(conceptLower) || currentDepth >= MAX_DEPTH) {
    return tree
  }

  visitedConcepts.add(conceptLower)

  const prerequisites = await extractPrerequisites(
    concept,
    currentDepth,
    currentDepth > 0 ? tree.root.concept : undefined
  )

  let updatedTree = tree
  for (const prereq of prerequisites) {
    if (visitedConcepts.has(prereq.concept.toLowerCase())) {
      continue
    }

    const prereqNode = createKnowledgeNode(prereq.concept, {
      description: prereq.description,
      fundamentalScore: prereq.fundamentalScore,
      explanationTime: prereq.explanationTime,
      depth: currentDepth + 1,
      explored: false,
    })

    updatedTree = addPrerequisite(updatedTree, parentId, prereqNode)

    if (currentDepth + 1 < MAX_DEPTH) {
      updatedTree = await buildKnowledgeTree(
        prereq.concept,
        updatedTree,
        prereqNode.id,
        currentDepth + 1,
        visitedConcepts
      )
    }
  }

  return updatedTree
}

function generateFallbackPrerequisites(concept: string): Array<{ concept: string; description: string; fundamentalScore: number; explanationTime: number }> {
  const conceptLower = concept.toLowerCase()

  if (conceptLower.includes('derivative') || conceptLower.includes('differentiation')) {
    return [
      { concept: 'Limits', description: 'Understanding limits as values approach a point', fundamentalScore: 0.7, explanationTime: 20 },
      { concept: 'Functions', description: 'Basic understanding of mathematical functions', fundamentalScore: 0.9, explanationTime: 15 },
      { concept: 'Slopes', description: 'Rate of change and linear slopes', fundamentalScore: 0.8, explanationTime: 15 },
    ]
  }

  if (conceptLower.includes('integral') || conceptLower.includes('integration')) {
    return [
      { concept: 'Derivatives', description: 'Understanding derivatives as rates of change', fundamentalScore: 0.6, explanationTime: 20 },
      { concept: 'Area', description: 'Concept of area under curves', fundamentalScore: 0.8, explanationTime: 15 },
      { concept: 'Summation', description: 'Adding up many small quantities', fundamentalScore: 0.8, explanationTime: 10 },
    ]
  }

  if (conceptLower.includes('quadratic') || conceptLower.includes('parabola')) {
    return [
      { concept: 'Linear Equations', description: 'Solving first-degree equations', fundamentalScore: 0.9, explanationTime: 10 },
      { concept: 'Exponents', description: 'Understanding powers and squared terms', fundamentalScore: 0.9, explanationTime: 10 },
      { concept: 'Factoring', description: 'Breaking expressions into products', fundamentalScore: 0.8, explanationTime: 15 },
    ]
  }

  if (conceptLower.includes('matrix') || conceptLower.includes('matrices')) {
    return [
      { concept: 'Vectors', description: 'Understanding vector quantities', fundamentalScore: 0.7, explanationTime: 15 },
      { concept: 'Linear Systems', description: 'Systems of linear equations', fundamentalScore: 0.8, explanationTime: 15 },
      { concept: 'Array Notation', description: 'Organizing numbers in grids', fundamentalScore: 0.9, explanationTime: 10 },
    ]
  }

  if (conceptLower.includes('probability')) {
    return [
      { concept: 'Fractions', description: 'Representing parts of a whole', fundamentalScore: 0.95, explanationTime: 10 },
      { concept: 'Sets', description: 'Collections of objects', fundamentalScore: 0.9, explanationTime: 10 },
      { concept: 'Counting', description: 'Combinatorial counting principles', fundamentalScore: 0.85, explanationTime: 15 },
    ]
  }

  return [
    { concept: 'Basic Arithmetic', description: 'Addition, subtraction, multiplication, division', fundamentalScore: 1.0, explanationTime: 5 },
    { concept: 'Logical Reasoning', description: 'Step-by-step logical thinking', fundamentalScore: 0.95, explanationTime: 10 },
  ]
}

export const handler: Handlers['PrerequisiteExplorer'] = async (input, { emit, logger }) => {
  const startTime = Date.now()
  const parsed = inputSchema.parse(input)
  const { jobId, concept, quality, style, intent } = parsed

  logger.info('Starting prerequisite exploration', { jobId, concept })

  let tree = createKnowledgeTree(concept)

  const visitedConcepts = new Set<string>([concept.toLowerCase()])

  if (openaiClient) {
    try {
      tree = await buildKnowledgeTree(
        concept,
        tree,
        tree.root.id,
        0,
        visitedConcepts
      )
    } catch (error) {
      logger.warn('AI prerequisite extraction failed, using fallbacks', { jobId, error: String(error) })

      const fallbacks = generateFallbackPrerequisites(concept)
      for (const prereq of fallbacks) {
        const prereqNode = createKnowledgeNode(prereq.concept, {
          description: prereq.description,
          fundamentalScore: prereq.fundamentalScore,
          explanationTime: prereq.explanationTime,
          depth: 1,
          explored: false,
        })
        tree = addPrerequisite(tree, tree.root.id, prereqNode)
      }
    }
  } else {
    logger.info('No AI available, using fallback prerequisites', { jobId })
    const fallbacks = generateFallbackPrerequisites(concept)
    for (const prereq of fallbacks) {
      const prereqNode = createKnowledgeNode(prereq.concept, {
        description: prereq.description,
        fundamentalScore: prereq.fundamentalScore,
        explanationTime: prereq.explanationTime,
        depth: 1,
        explored: false,
      })
      tree = addPrerequisite(tree, tree.root.id, prereqNode)
    }
  }

  tree = pruneToDepth(tree, MAX_DEPTH)

  const processingTime = Date.now() - startTime
  tree = updateTreeMetadata(tree, processingTime)

  const learningPath = generateLearningPath(tree.root)
  tree = { ...tree, learningPath }

  const estimatedTotalTime = calculateTotalExplanationTime(tree)

  const allNodes = flattenTree(tree)
  logger.info('Prerequisite exploration complete', {
    jobId,
    totalNodes: tree.totalNodes,
    maxDepth: tree.maxDepth,
    learningPathLength: learningPath.length,
    estimatedTotalTime,
    processingTime,
    concepts: allNodes.map(n => n.concept),
  })

  const eventData: PrerequisitesResolvedEvent = {
    jobId,
    concept,
    quality,
    style,
    intent: intent as any,
    knowledgeTree: tree,
    learningPath,
    estimatedTotalTime,
  }

  await emit({
    topic: 'prerequisites.resolved',
    data: eventData,
  })

  logger.info('Emitted prerequisites.resolved event', { jobId })
}

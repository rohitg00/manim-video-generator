
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import type { EventConfig, Handlers } from 'motia'
import OpenAI from 'openai'
import type {
  KnowledgeTree,
  KnowledgeNode,
  MathEnrichmentResult,
  VisualDesignSpec,
  NarrativeComposition,
  StoryArc,
  NarrativeSegment,
  EmotionalTone,
  NarrativeComposedEvent,
} from './types'
import { flattenTree, generateLearningPath } from './knowledge-tree'

const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-nano'
const MIN_PROMPT_TOKENS = 1500
const MAX_PROMPT_TOKENS = 2000

let openaiClient: OpenAI | null = null

try {
  openaiClient = new OpenAI()
} catch (error) {
  console.warn('OpenAI client initialization failed for narrative composer:', error)
}

const inputSchema = z.object({
  jobId: z.string(),
  concept: z.string(),
  quality: z.enum(['low', 'medium', 'high']),
  style: z.enum(['3blue1brown', 'minimalist', 'playful', 'corporate', 'neon']),
  intent: z.string().nullable(),
  knowledgeTree: z.any(),
  mathEnrichment: z.any(),
  visualDesign: z.any(),
})

export const config: EventConfig = {
  type: 'event',
  name: 'NarrativeComposer',
  description: 'Composes pedagogical narrative and generates verbose prompts',
  subscribes: ['visual.designed'],
  emits: ['narrative.composed'],
  input: inputSchema as any,
}

function generateHook(concept: string, knowledgeTree: KnowledgeTree): NarrativeSegment {
  const hooks: Array<{ template: string; tone: EmotionalTone }> = [
    {
      template: `What if I told you that ${concept} is the key to understanding how the universe works?`,
      tone: 'curious',
    },
    {
      template: `Have you ever wondered why ${concept} appears everywhere in nature?`,
      tone: 'curious',
    },
    {
      template: `Let me show you something beautiful about ${concept} that you may have never seen before.`,
      tone: 'excited',
    },
    {
      template: `Today we're going to unravel the mystery behind ${concept}.`,
      tone: 'contemplative',
    },
    {
      template: `${concept} might seem intimidating at first, but by the end of this video, you'll see it's actually quite elegant.`,
      tone: 'calm',
    },
  ]

  const selected = hooks[Math.floor(Math.random() * hooks.length)]

  return {
    id: uuidv4(),
    title: 'Opening Hook',
    narration: selected.template,
    keyPoints: [`Introduce ${concept}`, 'Capture viewer attention', 'Set up the journey'],
    visualCues: ['Fade in title', 'Show intriguing visual', 'Build anticipation'],
    duration: 5,
    knowledgeNodeIds: [knowledgeTree.root.id],
    emotionalBeat: selected.tone,
    rhetoricalQuestions: [`What makes ${concept} so fundamental?`],
  }
}

function generateRisingAction(
  knowledgeTree: KnowledgeTree,
  mathEnrichment: MathEnrichmentResult
): NarrativeSegment[] {
  const segments: NarrativeSegment[] = []
  const allNodes = flattenTree(knowledgeTree)
  const learningPath = knowledgeTree.learningPath

  const prerequisites = allNodes.filter(node =>
    node.depth > 0 && learningPath.includes(node.id)
  )

  prerequisites.sort((a, b) => b.depth - a.depth)

  for (const prereq of prerequisites.slice(0, 4)) {
    const relatedEquations = mathEnrichment.equations.filter(eq =>
      eq.name.toLowerCase().includes(prereq.concept.toLowerCase()) ||
      eq.tags.some(tag => prereq.concept.toLowerCase().includes(tag))
    )

    const segment: NarrativeSegment = {
      id: uuidv4(),
      title: `Understanding ${prereq.concept}`,
      narration: prereq.description || `Before we can understand the main concept, we need to grasp ${prereq.concept}. ${generateConceptExplanation(prereq.concept)}`,
      keyPoints: [
        `Define ${prereq.concept}`,
        'Show visual representation',
        `Connect to ${knowledgeTree.root.concept}`,
      ],
      visualCues: [
        `Create visual for ${prereq.concept}`,
        'Use color coding from palette',
        'Animate step by step',
      ],
      duration: Math.max(5, Math.min(15, prereq.explanationTime / 2)),
      knowledgeNodeIds: [prereq.id],
      emotionalBeat: 'contemplative',
    }

    if (relatedEquations.length > 0) {
      segment.keyPoints.push(`Equation: ${relatedEquations[0].latex}`)
      segment.visualCues.push('Write equation with animation')
    }

    segments.push(segment)
  }

  return segments
}

function generateConceptExplanation(concept: string): string {
  const conceptLower = concept.toLowerCase()

  const explanations: Record<string, string> = {
    'derivative': 'The derivative tells us how fast something is changing at any given moment. Think of it as the instantaneous speed of a function.',
    'integral': 'An integral is like adding up infinitely many tiny pieces. It gives us the total accumulation of a quantity.',
    'limit': 'A limit describes what value a function approaches as the input gets closer and closer to some point.',
    'function': 'A function is a relationship where each input has exactly one output. It\'s like a machine that transforms inputs into outputs.',
    'slope': 'Slope measures steepness - how much something rises compared to how far it runs horizontally.',
    'area': 'Area is the amount of space inside a shape. We can think of it as how many unit squares fit inside.',
    'vector': 'A vector has both magnitude and direction. It tells us not just how much, but which way.',
    'matrix': 'A matrix is a rectangular array of numbers that can represent transformations of space.',
    'probability': 'Probability measures how likely something is to happen, on a scale from 0 (impossible) to 1 (certain).',
    'equation': 'An equation is a statement that two expressions are equal. Solving it means finding what values make it true.',
  }

  for (const [key, explanation] of Object.entries(explanations)) {
    if (conceptLower.includes(key)) {
      return explanation
    }
  }

  return `This fundamental concept forms the building blocks for what comes next.`
}

function generateClimax(
  concept: string,
  knowledgeTree: KnowledgeTree,
  mathEnrichment: MathEnrichmentResult
): NarrativeSegment {
  const mainEquations = mathEnrichment.equations.slice(0, 2)

  return {
    id: uuidv4(),
    title: `The Heart of ${concept}`,
    narration: `Now that we have all the pieces, we can finally see ${concept} in its full glory. This is where everything comes together.`,
    keyPoints: [
      `Reveal the main concept: ${concept}`,
      'Show how prerequisites connect',
      'Present key equations',
      'Demonstrate the "aha!" moment',
    ],
    visualCues: [
      'Use dramatic reveal animation',
      'Highlight connections between concepts',
      'Apply emphasis animation to key elements',
      'Camera zoom for focus',
    ],
    duration: 10,
    knowledgeNodeIds: [knowledgeTree.root.id],
    emotionalBeat: 'excited',
    rhetoricalQuestions: [
      `Can you see how ${concept} ties everything together?`,
      `Isn't it beautiful how simple the underlying idea is?`,
    ],
  }
}

function generateResolution(
  concept: string,
  knowledgeTree: KnowledgeTree,
  mathEnrichment: MathEnrichmentResult
): NarrativeSegment[] {
  const segments: NarrativeSegment[] = []

  segments.push({
    id: uuidv4(),
    title: 'Bringing It All Together',
    narration: `Let's step back and appreciate what we've discovered about ${concept}.`,
    keyPoints: [
      'Summarize key insights',
      'Reinforce main connections',
      'Show the big picture',
    ],
    visualCues: [
      'Zoom out to show all elements',
      'Use fade transitions',
      'Highlight key takeaways',
    ],
    duration: 5,
    knowledgeNodeIds: knowledgeTree.learningPath,
    emotionalBeat: 'triumphant',
  })

  if (mathEnrichment.visualizations.length > 0) {
    segments.push({
      id: uuidv4(),
      title: 'Real-World Applications',
      narration: `${concept} isn't just abstract mathematics - it appears everywhere in the real world.`,
      keyPoints: [
        'Show practical applications',
        'Connect to everyday experiences',
        'Inspire further learning',
      ],
      visualCues: [
        'Show application examples',
        'Animate real-world scenarios',
      ],
      duration: 4,
      knowledgeNodeIds: [knowledgeTree.root.id],
      emotionalBeat: 'contemplative',
    })
  }

  return segments
}

function generateTakeaway(concept: string): string {
  const takeaways = [
    `${concept} is fundamentally about understanding patterns and relationships.`,
    `The key insight is that ${concept} connects seemingly different ideas into one elegant framework.`,
    `Remember: ${concept} is not just a formula to memorize, but a way of thinking about the world.`,
    `What makes ${concept} powerful is its ability to reveal hidden structure in complex problems.`,
  ]

  return takeaways[Math.floor(Math.random() * takeaways.length)]
}

function buildStoryArc(
  concept: string,
  knowledgeTree: KnowledgeTree,
  mathEnrichment: MathEnrichmentResult
): StoryArc {
  const hook = generateHook(concept, knowledgeTree)
  const risingAction = generateRisingAction(knowledgeTree, mathEnrichment)
  const climax = generateClimax(concept, knowledgeTree, mathEnrichment)
  const resolution = generateResolution(concept, knowledgeTree, mathEnrichment)
  const takeaway = generateTakeaway(concept)

  return {
    id: uuidv4(),
    title: `The Story of ${concept}`,
    hook,
    risingAction,
    climax,
    resolution,
    takeaway,
  }
}

function generateLearningObjectives(
  concept: string,
  knowledgeTree: KnowledgeTree,
  mathEnrichment: MathEnrichmentResult
): string[] {
  const objectives: string[] = []

  objectives.push(`Understand the fundamental concept of ${concept}`)

  const allNodes = flattenTree(knowledgeTree)
  const prerequisites = allNodes.filter(n => n.depth > 0)
  for (const prereq of prerequisites.slice(0, 3)) {
    objectives.push(`Grasp the role of ${prereq.concept} in understanding ${concept}`)
  }

  if (mathEnrichment.equations.length > 0) {
    objectives.push(`Recognize and interpret the key equation: ${mathEnrichment.equations[0].name}`)
  }

  objectives.push(`Apply ${concept} to solve related problems`)

  return objectives
}

function generateVerbosePrompt(
  concept: string,
  narrative: NarrativeComposition,
  knowledgeTree: KnowledgeTree,
  mathEnrichment: MathEnrichmentResult,
  visualDesign: VisualDesignSpec
): string {
  const sections: string[] = []

  sections.push(`=== MANIM ANIMATION GENERATION PROMPT ===`)
  sections.push(``)
  sections.push(`CONCEPT: ${concept}`)
  sections.push(`STYLE: ${visualDesign.colorPalette.background === '#1a1a2e' ? '3Blue1Brown' : 'Custom'} style`)
  sections.push(`DURATION: ${narrative.totalDuration} seconds`)
  sections.push(`3D REQUIRED: ${visualDesign.is3D ? 'Yes' : 'No'}`)
  sections.push(``)

  sections.push(`=== NARRATIVE STRUCTURE ===`)
  sections.push(``)
  sections.push(`SUMMARY: ${narrative.summary}`)
  sections.push(``)
  sections.push(`LEARNING OBJECTIVES:`)
  for (const obj of narrative.learningObjectives) {
    sections.push(`- ${obj}`)
  }
  sections.push(``)

  const arc = narrative.arcs[0]
  sections.push(`=== STORY ARC ===`)
  sections.push(``)
  sections.push(`1. HOOK (${arc.hook.duration}s):`)
  sections.push(`   "${arc.hook.narration}"`)
  sections.push(`   Visual: ${arc.hook.visualCues.join(', ')}`)
  sections.push(`   Tone: ${arc.hook.emotionalBeat}`)
  sections.push(``)

  sections.push(`2. RISING ACTION (Prerequisites):`)
  for (let i = 0; i < arc.risingAction.length; i++) {
    const segment = arc.risingAction[i]
    sections.push(`   ${i + 1}. ${segment.title} (${segment.duration}s):`)
    sections.push(`      - ${segment.narration.slice(0, 100)}...`)
    sections.push(`      - Key points: ${segment.keyPoints.join(', ')}`)
    sections.push(`      - Visual cues: ${segment.visualCues.join(', ')}`)
  }
  sections.push(``)

  sections.push(`3. CLIMAX (${arc.climax.duration}s):`)
  sections.push(`   "${arc.climax.narration}"`)
  sections.push(`   Key points: ${arc.climax.keyPoints.join(', ')}`)
  sections.push(`   Visual: ${arc.climax.visualCues.join(', ')}`)
  sections.push(``)

  sections.push(`4. RESOLUTION:`)
  for (const segment of arc.resolution) {
    sections.push(`   - ${segment.title} (${segment.duration}s): ${segment.narration.slice(0, 80)}...`)
  }
  sections.push(``)

  sections.push(`KEY TAKEAWAY: "${arc.takeaway}"`)
  sections.push(``)

  sections.push(`=== VISUAL DESIGN ===`)
  sections.push(``)
  sections.push(`COLOR PALETTE:`)
  sections.push(`  - Background: ${visualDesign.colorPalette.background}`)
  sections.push(`  - Primary: ${visualDesign.colorPalette.primary}`)
  sections.push(`  - Secondary: ${visualDesign.colorPalette.secondary}`)
  sections.push(`  - Accent: ${visualDesign.colorPalette.tertiary}`)
  sections.push(`  - Text: ${visualDesign.colorPalette.text}`)
  sections.push(``)

  sections.push(`TYPOGRAPHY:`)
  sections.push(`  - Title font: ${visualDesign.typography.titleFont}`)
  sections.push(`  - Base size: ${visualDesign.typography.baseFontSize}`)
  sections.push(``)

  sections.push(`CAMERA MOVEMENTS:`)
  for (const kf of visualDesign.cameraKeyframes.slice(0, 5)) {
    sections.push(`  - Time ${kf.time.toFixed(1)}s: zoom=${kf.zoom.toFixed(2)}, pos=(${kf.position.x.toFixed(2)}, ${kf.position.y.toFixed(2)}), easing=${kf.easing}`)
  }
  sections.push(``)

  sections.push(`TIMING BEATS:`)
  for (const beat of visualDesign.timingBeats.slice(0, 8)) {
    sections.push(`  - ${beat.time.toFixed(1)}s [${beat.type}] (${beat.duration.toFixed(1)}s): ${beat.description}`)
    sections.push(`    Animations: ${beat.animations.join(', ')}`)
  }
  sections.push(``)

  sections.push(`=== MATHEMATICAL CONTENT ===`)
  sections.push(``)

  if (mathEnrichment.equations.length > 0) {
    sections.push(`KEY EQUATIONS:`)
    for (const eq of mathEnrichment.equations.slice(0, 5)) {
      sections.push(`  ${eq.name}:`)
      sections.push(`    LaTeX: $${eq.latex}$`)
      sections.push(`    Description: ${eq.description}`)
      if (eq.variables.length > 0) {
        sections.push(`    Variables: ${eq.variables.map(v => `${v.symbol} (${v.name})`).join(', ')}`)
      }
    }
    sections.push(``)
  }

  if (mathEnrichment.definitions.length > 0) {
    sections.push(`DEFINITIONS:`)
    for (const def of mathEnrichment.definitions.slice(0, 3)) {
      sections.push(`  ${def.term}: ${def.intuition}`)
    }
    sections.push(``)
  }

  if (mathEnrichment.colorCoding && Object.keys(mathEnrichment.colorCoding).length > 0) {
    sections.push(`VARIABLE COLOR CODING:`)
    for (const [variable, color] of Object.entries(mathEnrichment.colorCoding)) {
      sections.push(`  ${variable}: ${color}`)
    }
    sections.push(``)
  }

  sections.push(`=== KNOWLEDGE STRUCTURE ===`)
  sections.push(``)
  sections.push(`LEARNING PATH (in order):`)
  const allNodes = flattenTree(knowledgeTree)
  for (const nodeId of knowledgeTree.learningPath) {
    const node = allNodes.find(n => n.id === nodeId)
    if (node) {
      const indent = '  '.repeat(node.depth + 1)
      sections.push(`${indent}${node.depth === 0 ? 'MAIN' : `Prereq ${node.depth}`}: ${node.concept}`)
    }
  }
  sections.push(``)

  sections.push(`=== IMPLEMENTATION INSTRUCTIONS ===`)
  sections.push(``)
  sections.push(`REQUIRED STRUCTURE:`)
  sections.push(`- Class name: MainScene`)
  sections.push(`- Base class: ${visualDesign.is3D ? 'ThreeDScene' : 'Scene'}`)
  sections.push(`- Method: construct(self)`)
  sections.push(``)

  sections.push(`ANIMATION SEQUENCE:`)
  sections.push(`1. Set background color to ${visualDesign.colorPalette.background}`)
  sections.push(`2. Create title with Write animation`)
  sections.push(`3. For each prerequisite concept:`)
  sections.push(`   - Create visual representation`)
  sections.push(`   - Animate with appropriate animation (Create, Write, FadeIn)`)
  sections.push(`   - Add self.wait() for comprehension`)
  sections.push(`4. Build up to main concept reveal`)
  sections.push(`5. Show key equations with Write animation`)
  sections.push(`6. Apply emphasis (Indicate, Circumscribe) to key elements`)
  sections.push(`7. Summarize with fade out`)
  sections.push(``)

  sections.push(`STYLE NOTES:`)
  for (const note of visualDesign.styleNotes) {
    sections.push(`- ${note}`)
  }
  sections.push(``)

  sections.push(`QUALITY REQUIREMENTS:`)
  sections.push(`- Smooth animations with appropriate run_time`)
  sections.push(`- Proper spacing between animations`)
  sections.push(`- Color consistency throughout`)
  sections.push(`- Clear visual hierarchy`)
  sections.push(`- Mathematical accuracy in equations`)
  sections.push(``)

  sections.push(`=== END PROMPT ===`)

  return sections.join('\n')
}

export const handler: Handlers['NarrativeComposer'] = async (input, { emit, logger }) => {
  const parsed = inputSchema.parse(input)
  const { jobId, concept, quality, style, intent, knowledgeTree, mathEnrichment, visualDesign } = parsed

  logger.info('Starting narrative composition', { jobId, concept })

  const storyArc = buildStoryArc(
    concept,
    knowledgeTree as KnowledgeTree,
    mathEnrichment as MathEnrichmentResult
  )

  const learningObjectives = generateLearningObjectives(
    concept,
    knowledgeTree as KnowledgeTree,
    mathEnrichment as MathEnrichmentResult
  )

  const hookDuration = storyArc.hook.duration
  const risingDuration = storyArc.risingAction.reduce((sum, s) => sum + s.duration, 0)
  const climaxDuration = storyArc.climax.duration
  const resolutionDuration = storyArc.resolution.reduce((sum, s) => sum + s.duration, 0)
  const totalDuration = hookDuration + risingDuration + climaxDuration + resolutionDuration

  const narrative: NarrativeComposition = {
    jobId,
    title: `Understanding ${concept}`,
    summary: `A visual journey through ${concept}, building from fundamental prerequisites to a complete understanding.`,
    arcs: [storyArc],
    totalDuration,
    learningObjectives,
    targetAudience: 'Students and enthusiasts interested in understanding mathematical concepts visually',
    verbosePrompt: '',
    metadata: {
      generatedAt: new Date().toISOString(),
      concept,
      style,
      wordCount: 0,
    },
  }

  const verbosePrompt = generateVerbosePrompt(
    concept,
    narrative,
    knowledgeTree as KnowledgeTree,
    mathEnrichment as MathEnrichmentResult,
    visualDesign as VisualDesignSpec
  )

  narrative.verbosePrompt = verbosePrompt
  narrative.metadata.wordCount = verbosePrompt.split(/\s+/).length

  logger.info('Narrative composition complete', {
    jobId,
    totalDuration,
    arcsCount: narrative.arcs.length,
    learningObjectivesCount: learningObjectives.length,
    promptWordCount: narrative.metadata.wordCount,
  })

  const eventData: NarrativeComposedEvent = {
    jobId,
    concept,
    quality,
    style,
    intent: intent as any,
    knowledgeTree: knowledgeTree as KnowledgeTree,
    mathEnrichment: mathEnrichment as MathEnrichmentResult,
    visualDesign: visualDesign as VisualDesignSpec,
    narrative,
    verbosePrompt,
  }

  await emit({
    topic: 'narrative.composed',
    data: eventData,
  })

  logger.info('Emitted narrative.composed event', {
    jobId,
    promptLength: verbosePrompt.length,
  })
}

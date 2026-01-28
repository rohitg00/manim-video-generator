
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import type { EventConfig, Handlers } from 'motia'
import OpenAI from 'openai'
import type {
  KnowledgeTree,
  MathEnrichmentResult,
  VisualDesignSpec,
  ColorPalette,
  CameraKeyframe,
  TimingBeat,
  TransitionSpec,
  TypographySpec,
  BeatType,
  EmotionalTone,
  EasingFunction,
  VisualDesignedEvent,
} from './types'
import { flattenTree, generateLearningPath } from './knowledge-tree'
import { STYLE_PRESETS } from '../services/style-presets'

const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-nano'

let openaiClient: OpenAI | null = null

try {
  openaiClient = new OpenAI()
} catch (error) {
  console.warn('OpenAI client initialization failed for visual designer:', error)
}

const inputSchema = z.object({
  jobId: z.string(),
  concept: z.string(),
  quality: z.enum(['low', 'medium', 'high']),
  style: z.enum(['3blue1brown', 'minimalist', 'playful', 'corporate', 'neon']),
  intent: z.string().nullable(),
  knowledgeTree: z.any(),
  mathEnrichment: z.any(),
  enrichedNodes: z.array(z.string()),
})

export const config: EventConfig = {
  type: 'event',
  name: 'VisualDesigner',
  description: 'Designs visual elements including camera movements, colors, and timing',
  subscribes: ['math.enriched'],
  emits: ['visual.designed'],
  input: inputSchema as any,
}

function generateColorPalette(style: string): ColorPalette {
  const preset = STYLE_PRESETS[style as keyof typeof STYLE_PRESETS] || STYLE_PRESETS['3blue1brown']

  return {
    primary: preset.primaryColor,
    secondary: preset.secondaryColor,
    tertiary: preset.accentColor,
    background: preset.backgroundColor,
    text: preset.textColor,
    success: preset.customColors?.GREEN || '#27ae60',
    warning: preset.customColors?.YELLOW || '#f39c12',
    error: preset.customColors?.RED || '#e74c3c',
    math: preset.primaryColor,
    axes: preset.secondaryColor,
    custom: preset.customColors || {},
  }
}

function generateTypography(style: string): TypographySpec {
  const typographySettings: Record<string, TypographySpec> = {
    '3blue1brown': {
      titleFont: 'sans-serif',
      bodyFont: 'sans-serif',
      mathFont: 'Computer Modern',
      baseFontSize: 48,
      titleScale: 1.5,
      lineHeight: 1.4,
    },
    'minimalist': {
      titleFont: 'Helvetica',
      bodyFont: 'Helvetica',
      mathFont: 'Computer Modern',
      baseFontSize: 42,
      titleScale: 1.3,
      lineHeight: 1.5,
    },
    'playful': {
      titleFont: 'Comic Sans MS, cursive',
      bodyFont: 'sans-serif',
      mathFont: 'Computer Modern',
      baseFontSize: 44,
      titleScale: 1.6,
      lineHeight: 1.3,
    },
    'corporate': {
      titleFont: 'Arial',
      bodyFont: 'Arial',
      mathFont: 'Computer Modern',
      baseFontSize: 40,
      titleScale: 1.4,
      lineHeight: 1.5,
    },
    'neon': {
      titleFont: 'Orbitron, sans-serif',
      bodyFont: 'sans-serif',
      mathFont: 'Computer Modern',
      baseFontSize: 46,
      titleScale: 1.5,
      lineHeight: 1.4,
    },
  }

  return typographySettings[style] || typographySettings['3blue1brown']
}

function calculateTimingBeats(
  knowledgeTree: KnowledgeTree,
  mathEnrichment: MathEnrichmentResult,
  style: string
): TimingBeat[] {
  const beats: TimingBeat[] = []
  let currentTime = 0

  const allNodes = flattenTree(knowledgeTree)
  const learningPath = knowledgeTree.learningPath

  const pacingMultiplier: Record<string, number> = {
    '3blue1brown': 1.0,
    'minimalist': 1.2,
    'playful': 0.9,
    'corporate': 1.1,
    'neon': 0.85,
  }
  const pacing = pacingMultiplier[style] || 1.0

  beats.push({
    id: uuidv4(),
    time: currentTime,
    duration: 3 * pacing,
    type: 'introduction',
    description: `Introduce "${knowledgeTree.root.concept}"`,
    contentIds: [knowledgeTree.root.id],
    tone: 'curious',
    animations: ['FadeIn', 'Write'],
  })
  currentTime += 3 * pacing

  if (allNodes.length > 1) {
    beats.push({
      id: uuidv4(),
      time: currentTime,
      duration: 2 * pacing,
      type: 'setup',
      description: 'Overview of prerequisite concepts',
      contentIds: learningPath.slice(0, Math.min(3, learningPath.length)),
      tone: 'calm',
      animations: ['LaggedStart', 'FadeIn'],
    })
    currentTime += 2 * pacing
  }

  for (let i = 0; i < learningPath.length; i++) {
    const nodeId = learningPath[i]
    const node = allNodes.find(n => n.id === nodeId)
    if (!node) continue

    const isLast = i === learningPath.length - 1
    const duration = (node.explanationTime / 4) * pacing

    beats.push({
      id: uuidv4(),
      time: currentTime,
      duration: Math.max(2, Math.min(8, duration)),
      type: isLast ? 'climax' : 'explanation',
      description: `Explain: ${node.concept}`,
      contentIds: [nodeId],
      tone: isLast ? 'excited' : 'contemplative',
      animations: isLast ? ['Indicate', 'Circumscribe'] : ['Write', 'Create'],
    })
    currentTime += Math.max(2, Math.min(8, duration))

    if (!isLast) {
      beats.push({
        id: uuidv4(),
        time: currentTime,
        duration: 0.5 * pacing,
        type: 'transition',
        description: 'Transition to next concept',
        contentIds: [],
        tone: 'neutral',
        animations: ['FadeOut'],
      })
      currentTime += 0.5 * pacing
    }
  }

  if (mathEnrichment.equations.length > 0) {
    beats.push({
      id: uuidv4(),
      time: currentTime,
      duration: 2 * pacing,
      type: 'reveal',
      description: 'Reveal key equations',
      contentIds: mathEnrichment.equations.map(eq => eq.id),
      tone: 'excited',
      animations: ['Write', 'Transform'],
    })
    currentTime += 2 * pacing

    beats.push({
      id: uuidv4(),
      time: currentTime,
      duration: 4 * pacing,
      type: 'demonstration',
      description: 'Demonstrate equations visually',
      contentIds: mathEnrichment.equations.slice(0, 3).map(eq => eq.id),
      tone: 'contemplative',
      animations: ['Transform', 'Indicate'],
    })
    currentTime += 4 * pacing
  }

  beats.push({
    id: uuidv4(),
    time: currentTime,
    duration: 2 * pacing,
    type: 'resolution',
    description: 'Summarize key insights',
    contentIds: [knowledgeTree.root.id],
    tone: 'triumphant',
    animations: ['FadeIn', 'Circumscribe'],
  })
  currentTime += 2 * pacing

  beats.push({
    id: uuidv4(),
    time: currentTime,
    duration: 1.5 * pacing,
    type: 'conclusion',
    description: 'Concluding thoughts',
    contentIds: [],
    tone: 'calm',
    animations: ['FadeOut'],
  })

  return beats
}

function generateCameraKeyframes(
  timingBeats: TimingBeat[],
  is3D: boolean,
  style: string
): CameraKeyframe[] {
  const keyframes: CameraKeyframe[] = []

  const cameraStyles: Record<string, { maxZoom: number; allowRotation: boolean }> = {
    '3blue1brown': { maxZoom: 1.5, allowRotation: false },
    'minimalist': { maxZoom: 1.2, allowRotation: false },
    'playful': { maxZoom: 1.8, allowRotation: true },
    'corporate': { maxZoom: 1.3, allowRotation: false },
    'neon': { maxZoom: 2.0, allowRotation: true },
  }
  const cameraStyle = cameraStyles[style] || cameraStyles['3blue1brown']

  keyframes.push({
    time: 0,
    position: { x: 0, y: 0, z: is3D ? 10 : undefined },
    zoom: 1,
    rotation: 0,
    phi: is3D ? 60 : undefined,
    theta: is3D ? -45 : undefined,
    easing: 'smooth',
    duration: 0,
  })

  for (const beat of timingBeats) {
    let zoom = 1
    let x = 0
    let y = 0
    let rotation = 0
    let easing: EasingFunction = 'smooth'

    switch (beat.type) {
      case 'introduction':
        zoom = 0.9
        easing = 'ease-out'
        break

      case 'setup':
        zoom = 0.8
        y = -0.5
        break

      case 'explanation':
        zoom = 1.1
        x = (Math.random() - 0.5) * 0.5
        y = (Math.random() - 0.5) * 0.5
        break

      case 'reveal':
        zoom = 1.3
        easing = 'ease-out-back'
        break

      case 'demonstration':
        zoom = 1.2
        x = Math.random() * 0.3
        break

      case 'climax':
        zoom = Math.min(1.5, cameraStyle.maxZoom)
        if (cameraStyle.allowRotation) {
          rotation = (Math.random() - 0.5) * 10
        }
        easing = 'ease-in-out'
        break

      case 'resolution':
        zoom = 1.1
        rotation = 0
        break

      case 'conclusion':
        zoom = 1
        x = 0
        y = 0
        rotation = 0
        easing = 'ease-out'
        break

      case 'transition':
      case 'pause':
        continue
    }

    keyframes.push({
      time: beat.time,
      position: { x, y, z: is3D ? 10 : undefined },
      zoom: Math.min(zoom, cameraStyle.maxZoom),
      rotation: cameraStyle.allowRotation ? rotation : 0,
      phi: is3D ? 60 + (beat.type === 'climax' ? 15 : 0) : undefined,
      theta: is3D ? -45 + (beat.type === 'demonstration' ? 30 : 0) : undefined,
      easing,
      duration: beat.duration,
    })
  }

  return keyframes
}

function generateTransitions(timingBeats: TimingBeat[], style: string): TransitionSpec[] {
  const transitions: TransitionSpec[] = []

  const transitionStyles: Record<string, TransitionSpec['type'][]> = {
    '3blue1brown': ['fade', 'fade'],
    'minimalist': ['fade', 'dissolve'],
    'playful': ['slide', 'zoom', 'wipe'],
    'corporate': ['fade', 'slide'],
    'neon': ['dissolve', 'zoom', 'wipe'],
  }
  const preferredTransitions = transitionStyles[style] || transitionStyles['3blue1brown']

  const transitionBeats = timingBeats.filter(b => b.type === 'transition')

  for (const beat of transitionBeats) {
    const transitionType = preferredTransitions[Math.floor(Math.random() * preferredTransitions.length)]

    transitions.push({
      type: transitionType,
      direction: transitionType === 'slide' || transitionType === 'wipe'
        ? ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)] as any
        : undefined,
      duration: beat.duration,
      startTime: beat.time,
    })
  }

  return transitions
}

function needs3D(
  knowledgeTree: KnowledgeTree,
  mathEnrichment: MathEnrichmentResult
): boolean {
  const allNodes = flattenTree(knowledgeTree)
  const allConcepts = allNodes.map(n => n.concept.toLowerCase())

  const keywords3D = ['sphere', 'cube', '3d', 'surface', 'volume', 'solid', 'rotation', 'orbit', 'cylinder', 'cone', 'torus']
  if (allConcepts.some(c => keywords3D.some(k => c.includes(k)))) {
    return true
  }

  for (const eq of mathEnrichment.equations) {
    if (eq.tags.includes('3d') || eq.category === 'physics') {
      return true
    }
  }

  for (const viz of mathEnrichment.visualizations) {
    if (viz.description.toLowerCase().includes('3d') ||
        viz.type === 'transformation') {
      return true
    }
  }

  return false
}

function generateStyleNotes(
  style: string,
  colorPalette: ColorPalette,
  mathEnrichment: MathEnrichmentResult
): string[] {
  const notes: string[] = []

  const styleDescriptions: Record<string, string> = {
    '3blue1brown': 'Use smooth animations, mathematical elegance, dark background with cyan accents',
    'minimalist': 'Clean and simple, white background, subtle animations, focus on clarity',
    'playful': 'Bouncy animations, bright colors, fun transitions, engaging pace',
    'corporate': 'Professional, structured, moderate animation speed, clear hierarchy',
    'neon': 'Vibrant colors on dark background, glowing effects, dynamic movement',
  }
  notes.push(styleDescriptions[style] || styleDescriptions['3blue1brown'])

  notes.push(`Primary color: ${colorPalette.primary}`)
  notes.push(`Background: ${colorPalette.background}`)
  notes.push(`Use accent color ${colorPalette.tertiary} for emphasis`)

  if (mathEnrichment.equations.length > 0) {
    notes.push('Use Write animation for equations')
    notes.push('Color-code variables for clarity')
  }

  if (mathEnrichment.theorems.length > 0) {
    notes.push('Present proof steps sequentially')
    notes.push('Use Transform for derivation steps')
  }

  notes.push('Include self.wait() pauses between major animations')
  notes.push('Use LaggedStart for grouped elements')

  return notes
}

export const handler: Handlers['VisualDesigner'] = async (input, { emit, logger }) => {
  const parsed = inputSchema.parse(input)
  const { jobId, concept, quality, style, intent, knowledgeTree, mathEnrichment, enrichedNodes } = parsed

  logger.info('Starting visual design', { jobId, concept, style })

  const colorPalette = generateColorPalette(style)
  logger.info('Generated color palette', { jobId, primary: colorPalette.primary })

  const typography = generateTypography(style)

  const is3D = needs3D(knowledgeTree as KnowledgeTree, mathEnrichment as MathEnrichmentResult)
  logger.info('3D determination', { jobId, is3D })

  const timingBeats = calculateTimingBeats(
    knowledgeTree as KnowledgeTree,
    mathEnrichment as MathEnrichmentResult,
    style
  )
  logger.info('Generated timing beats', { jobId, beatsCount: timingBeats.length })

  const lastBeat = timingBeats[timingBeats.length - 1]
  const totalDuration = lastBeat ? lastBeat.time + lastBeat.duration : 10

  const cameraKeyframes = generateCameraKeyframes(timingBeats, is3D, style)
  logger.info('Generated camera keyframes', { jobId, keyframesCount: cameraKeyframes.length })

  const transitions = generateTransitions(timingBeats, style)

  const styleNotes = generateStyleNotes(
    style,
    colorPalette,
    mathEnrichment as MathEnrichmentResult
  )

  for (const beat of timingBeats) {
    const matchingKeyframe = cameraKeyframes.find(kf =>
      Math.abs(kf.time - beat.time) < 0.5
    )
    if (matchingKeyframe) {
      beat.cameraKeyframe = matchingKeyframe
    }
  }

  const visualDesign: VisualDesignSpec = {
    jobId,
    colorPalette,
    cameraKeyframes,
    timingBeats,
    totalDuration,
    is3D,
    transitions,
    typography,
    styleNotes,
  }

  logger.info('Visual design complete', {
    jobId,
    totalDuration,
    is3D,
    beatsCount: timingBeats.length,
    transitionsCount: transitions.length,
    keyframesCount: cameraKeyframes.length,
  })

  const eventData: VisualDesignedEvent = {
    jobId,
    concept,
    quality,
    style,
    intent: intent as any,
    knowledgeTree: knowledgeTree as KnowledgeTree,
    mathEnrichment: mathEnrichment as MathEnrichmentResult,
    visualDesign,
  }

  await emit({
    topic: 'visual.designed',
    data: eventData,
  })

  logger.info('Emitted visual.designed event', { jobId })
}


import type { Intent, StylePreset } from '../types/nlu.types'


export interface KnowledgeNode {
  id: string

  concept: string

  description: string

  fundamentalScore: number

  explanationTime: number

  depth: number

  prerequisites: KnowledgeNode[]

  relatedConcepts: string[]

  tags: string[]

  explored: boolean
}

export interface KnowledgeTree {
  root: KnowledgeNode

  totalNodes: number

  maxDepth: number

  learningPath: string[]

  metadata: {
    generatedAt: string
    originalConcept: string
    processingTime: number
  }
}


export interface LatexEquation {
  id: string

  category: MathCategory

  name: string

  latex: string

  description: string

  variables: VariableDefinition[]

  relatedEquations: string[]

  difficulty: number

  tags: string[]
}

export interface VariableDefinition {
  symbol: string
  name: string
  description: string
  unit?: string
  domain?: string
}

export type MathCategory =
  | 'calculus'
  | 'algebra'
  | 'geometry'
  | 'trigonometry'
  | 'linear-algebra'
  | 'probability'
  | 'statistics'
  | 'number-theory'
  | 'set-theory'
  | 'logic'
  | 'combinatorics'
  | 'physics'
  | 'general'

export interface Theorem {
  id: string

  name: string

  statement: string

  proofSteps: ProofStep[]

  prerequisites: string[]

  history?: string

  visualHints: string[]
}

export interface ProofStep {
  step: number

  description: string

  latex?: string

  justification: string

  animationHint?: 'highlight' | 'transform' | 'reveal' | 'emphasize'
}

export interface MathDefinition {
  term: string

  formalDefinition: string

  intuition: string

  examples: string[]

  notation?: string
}

export interface MathEnrichmentResult {
  equations: LatexEquation[]

  theorems: Theorem[]

  definitions: MathDefinition[]

  visualizations: VisualizationSuggestion[]

  colorCoding: Record<string, string>

  animationSequence: string[]
}

export interface VisualizationSuggestion {
  type: 'graph' | 'diagram' | 'animation' | 'transformation' | 'construction'
  description: string
  manimHints: string[]
  duration: number
}


export interface ColorPalette {
  primary: string

  secondary: string

  tertiary: string

  background: string

  text: string

  success: string

  warning: string

  error: string

  math: string

  axes: string

  custom: Record<string, string>
}

export interface CameraKeyframe {
  time: number

  position: {
    x: number
    y: number
    z?: number
  }

  zoom: number

  rotation: number

  phi?: number

  theta?: number

  easing: EasingFunction

  duration: number
}

export type EasingFunction =
  | 'linear'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'ease-in-quad'
  | 'ease-out-quad'
  | 'ease-in-cubic'
  | 'ease-out-cubic'
  | 'ease-in-expo'
  | 'ease-out-expo'
  | 'ease-out-back'
  | 'ease-out-bounce'
  | 'smooth'

export interface TimingBeat {
  id: string

  time: number

  duration: number

  type: BeatType

  description: string

  contentIds: string[]

  tone: EmotionalTone

  cameraKeyframe?: CameraKeyframe

  animations: string[]
}

export type BeatType =
  | 'introduction'
  | 'setup'
  | 'reveal'
  | 'explanation'
  | 'demonstration'
  | 'transition'
  | 'climax'
  | 'resolution'
  | 'conclusion'
  | 'pause'

export type EmotionalTone =
  | 'curious'
  | 'excited'
  | 'calm'
  | 'tense'
  | 'relieved'
  | 'triumphant'
  | 'contemplative'
  | 'neutral'

export interface VisualDesignSpec {
  jobId: string

  colorPalette: ColorPalette

  cameraKeyframes: CameraKeyframe[]

  timingBeats: TimingBeat[]

  totalDuration: number

  is3D: boolean

  transitions: TransitionSpec[]

  typography: TypographySpec

  styleNotes: string[]
}

export interface TransitionSpec {
  type: 'fade' | 'slide' | 'zoom' | 'wipe' | 'dissolve' | 'none'

  direction?: 'up' | 'down' | 'left' | 'right'

  duration: number

  startTime: number
}

export interface TypographySpec {
  titleFont: string

  bodyFont: string

  mathFont: string

  baseFontSize: number

  titleScale: number

  lineHeight: number
}


export interface StoryArc {
  id: string

  title: string

  hook: NarrativeSegment

  risingAction: NarrativeSegment[]

  climax: NarrativeSegment

  resolution: NarrativeSegment[]

  takeaway: string

  connectionToNext?: string
}

export interface NarrativeSegment {
  id: string

  title: string

  narration: string

  keyPoints: string[]

  visualCues: string[]

  duration: number

  knowledgeNodeIds: string[]

  emotionalBeat: EmotionalTone

  rhetoricalQuestions?: string[]
}

export interface NarrativeComposition {
  jobId: string

  title: string

  summary: string

  arcs: StoryArc[]

  totalDuration: number

  learningObjectives: string[]

  targetAudience: string

  verbosePrompt: string

  metadata: {
    generatedAt: string
    concept: string
    style: StylePreset
    wordCount: number
  }
}


export interface PrerequisiteExplorerInput {
  jobId: string
  concept: string
  quality: 'low' | 'medium' | 'high'
  analysisType: string
  manimCode: string | null
  needsAI: boolean
  skill: string | null
  style: StylePreset
  intent: Intent | null
  sceneGraph?: {
    id: string
    title: string
    acts: number
    totalDuration: number
  }
}

export interface PrerequisitesResolvedEvent {
  jobId: string
  concept: string
  quality: 'low' | 'medium' | 'high'
  style: StylePreset
  intent: Intent | null
  knowledgeTree: KnowledgeTree
  learningPath: string[]
  estimatedTotalTime: number
}

export interface MathEnrichedEvent {
  jobId: string
  concept: string
  quality: 'low' | 'medium' | 'high'
  style: StylePreset
  intent: Intent | null
  knowledgeTree: KnowledgeTree
  mathEnrichment: MathEnrichmentResult
  enrichedNodes: string[]
}

export interface VisualDesignedEvent {
  jobId: string
  concept: string
  quality: 'low' | 'medium' | 'high'
  style: StylePreset
  intent: Intent | null
  knowledgeTree: KnowledgeTree
  mathEnrichment: MathEnrichmentResult
  visualDesign: VisualDesignSpec
}

export interface NarrativeComposedEvent {
  jobId: string
  concept: string
  quality: 'low' | 'medium' | 'high'
  style: StylePreset
  intent: Intent | null
  knowledgeTree: KnowledgeTree
  mathEnrichment: MathEnrichmentResult
  visualDesign: VisualDesignSpec
  narrative: NarrativeComposition
  verbosePrompt: string
}

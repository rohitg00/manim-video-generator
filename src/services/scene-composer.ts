/**
 * Scene Composer Service
 * Builds scene graphs from NLU results for structured animation generation
 */

import { v4 as uuidv4 } from 'uuid'
import type { NLUResult, Intent, StylePreset } from '../types/nlu.types'
import type {
  SceneGraph,
  Act,
  MobjectSpec,
  AnimationSpec,
  StyleConfig,
  TransitionSpec,
  CameraSpec,
  SceneMetadata,
} from '../types/scene.types'
import { STYLE_CONFIGS } from '../types/scene.types'
import { getStyleConfig, getAnimationRecommendations } from './style-presets'

/**
 * Compose a scene graph from NLU result
 */
export async function composeScene(
  nluResult: NLUResult,
  options: {
    maxDuration?: number
    includeComments?: boolean
  } = {}
): Promise<SceneGraph> {
  const { intent, entities, style, estimatedDuration, needs3D } = nluResult
  const styleConfig = getStyleConfig(style)

  // Build metadata
  const metadata: SceneMetadata = {
    originalInput: nluResult.rawInterpretation || '',
    intent,
    skill: nluResult.suggestedSkill,
    createdAt: new Date().toISOString(),
    schemaVersion: '1.0.0',
  }

  // Build acts based on intent
  const acts = buildActs(nluResult, styleConfig)

  // Calculate total duration
  const totalDuration = Math.min(
    acts.reduce((sum, act) => sum + act.duration, 0),
    options.maxDuration || 60
  )

  return {
    id: uuidv4(),
    title: generateTitle(nluResult),
    style: styleConfig,
    acts,
    totalDuration,
    is3D: needs3D,
    useMovingCamera: shouldUseMovingCamera(intent, acts),
    metadata,
  }
}

/**
 * Generate a title from the NLU result
 */
function generateTitle(nluResult: NLUResult): string {
  const { entities, intent } = nluResult

  if (entities.concepts.length > 0) {
    return entities.concepts[0]
  }

  if (entities.mathExpressions.length > 0) {
    return `Visualizing ${entities.mathExpressions[0]}`
  }

  if (entities.textContent && entities.textContent.length > 0) {
    return entities.textContent[0]
  }

  // Default titles by intent
  const intentTitles: Record<Intent, string> = {
    EXPLAIN_CONCEPT: 'Concept Explanation',
    VISUALIZE_MATH: 'Mathematical Visualization',
    TELL_STORY: 'Visual Story',
    TRANSFORM_OBJECT: 'Transformation',
    DEMONSTRATE_PROCESS: 'Process Demonstration',
    CREATE_SCENE: 'Custom Animation',
    KINETIC_TEXT: 'Typography Animation',
    COMPARE_CONTRAST: 'Comparison',
    GRAPH_FUNCTION: 'Function Graph',
    GEOMETRIC_PROOF: 'Geometric Proof',
  }

  return intentTitles[intent] || 'Animation'
}

/**
 * Determine if moving camera should be used
 */
function shouldUseMovingCamera(intent: Intent, acts: Act[]): boolean {
  // Use moving camera for complex multi-act scenes
  if (acts.length > 3) return true

  // Use for comparison/contrast
  if (intent === 'COMPARE_CONTRAST') return true

  // Use if any act has camera specs
  return acts.some(act => act.camera !== undefined)
}

/**
 * Build acts based on intent type
 */
function buildActs(nluResult: NLUResult, styleConfig: StyleConfig): Act[] {
  const { intent, entities } = nluResult
  const animations = getAnimationRecommendations(styleConfig.preset)

  switch (intent) {
    case 'EXPLAIN_CONCEPT':
      return buildExplanationActs(nluResult, styleConfig, animations)

    case 'VISUALIZE_MATH':
      return buildMathVisualizationActs(nluResult, styleConfig, animations)

    case 'KINETIC_TEXT':
      return buildKineticTextActs(nluResult, styleConfig, animations)

    case 'DEMONSTRATE_PROCESS':
      return buildProcessActs(nluResult, styleConfig, animations)

    case 'TRANSFORM_OBJECT':
      return buildTransformationActs(nluResult, styleConfig, animations)

    case 'COMPARE_CONTRAST':
      return buildComparisonActs(nluResult, styleConfig, animations)

    case 'GRAPH_FUNCTION':
      return buildGraphActs(nluResult, styleConfig, animations)

    case 'GEOMETRIC_PROOF':
      return buildProofActs(nluResult, styleConfig, animations)

    case 'TELL_STORY':
      return buildStoryActs(nluResult, styleConfig, animations)

    case 'CREATE_SCENE':
    default:
      return buildGenericActs(nluResult, styleConfig, animations)
  }
}

/**
 * Build acts for concept explanation
 */
function buildExplanationActs(
  nluResult: NLUResult,
  styleConfig: StyleConfig,
  animations: ReturnType<typeof getAnimationRecommendations>
): Act[] {
  const { entities, estimatedDuration } = nluResult
  const acts: Act[] = []

  // Act 1: Introduction
  acts.push({
    id: uuidv4(),
    title: 'Introduction',
    intent: 'EXPLAIN_CONCEPT',
    mobjects: [
      {
        id: uuidv4(),
        type: 'Text',
        params: {
          text: entities.concepts[0] || 'Concept',
          font_size: 72,
          color: styleConfig.primaryColor,
        },
        ref: 'title',
      },
    ],
    animations: [
      {
        id: uuidv4(),
        type: animations.preferredCreate,
        targets: ['title'],
        runTime: 1.5,
      },
      {
        id: uuidv4(),
        type: 'Wait',
        targets: [],
        params: { duration: 1 },
      },
      {
        id: uuidv4(),
        type: 'FadeOut',
        targets: ['title'],
        runTime: 0.5,
      },
    ],
    duration: 3,
    transition: { type: 'fade', duration: 0.3 },
  })

  // Act 2: Main explanation
  acts.push({
    id: uuidv4(),
    title: 'Main Content',
    intent: 'EXPLAIN_CONCEPT',
    mobjects: buildMobjectsFromEntities(entities, styleConfig),
    animations: [
      {
        id: uuidv4(),
        type: 'LaggedStart',
        targets: ['content_group'],
        params: { lag_ratio: 0.2 },
        runTime: 2,
      },
    ],
    duration: estimatedDuration * 0.6,
  })

  // Act 3: Conclusion
  acts.push({
    id: uuidv4(),
    title: 'Summary',
    intent: 'EXPLAIN_CONCEPT',
    mobjects: [
      {
        id: uuidv4(),
        type: 'Text',
        params: {
          text: 'Key Takeaway',
          font_size: 48,
          color: styleConfig.accentColor,
        },
        ref: 'summary',
      },
    ],
    animations: [
      {
        id: uuidv4(),
        type: animations.preferredCreate,
        targets: ['summary'],
        runTime: 1,
      },
      {
        id: uuidv4(),
        type: animations.preferredEmphasis,
        targets: ['summary'],
        runTime: 0.5,
      },
    ],
    duration: estimatedDuration * 0.2,
  })

  return acts
}

/**
 * Build acts for mathematical visualization
 */
function buildMathVisualizationActs(
  nluResult: NLUResult,
  styleConfig: StyleConfig,
  animations: ReturnType<typeof getAnimationRecommendations>
): Act[] {
  const { entities, estimatedDuration } = nluResult
  const acts: Act[] = []

  // Act 1: Show equation
  if (entities.mathExpressions.length > 0) {
    acts.push({
      id: uuidv4(),
      title: 'Equation',
      intent: 'VISUALIZE_MATH',
      mobjects: entities.mathExpressions.map((expr, i) => ({
        id: uuidv4(),
        type: 'MathTex' as const,
        params: {
          tex_string: expr.replace(/\$/g, ''),
          font_size: 60,
        },
        position: { y: i * -1.5 },
        ref: `equation_${i}`,
      })),
      animations: [
        {
          id: uuidv4(),
          type: 'Write',
          targets: entities.mathExpressions.map((_, i) => `equation_${i}`),
          runTime: 2,
        },
      ],
      duration: estimatedDuration * 0.4,
    })
  }

  // Act 2: Visualization/Graph
  acts.push({
    id: uuidv4(),
    title: 'Visualization',
    intent: 'VISUALIZE_MATH',
    mobjects: [
      {
        id: uuidv4(),
        type: 'Axes',
        params: {
          x_range: [-5, 5, 1],
          y_range: [-3, 3, 1],
          x_length: 10,
          y_length: 6,
        },
        ref: 'axes',
      },
    ],
    animations: [
      {
        id: uuidv4(),
        type: 'Create',
        targets: ['axes'],
        runTime: 1.5,
      },
    ],
    duration: estimatedDuration * 0.4,
  })

  // Act 3: Highlight/conclusion
  acts.push({
    id: uuidv4(),
    title: 'Highlight',
    intent: 'VISUALIZE_MATH',
    mobjects: [],
    animations: [
      {
        id: uuidv4(),
        type: animations.preferredEmphasis,
        targets: ['axes'],
        params: { color: styleConfig.accentColor },
        runTime: 0.5,
      },
    ],
    duration: estimatedDuration * 0.2,
  })

  return acts
}

/**
 * Build acts for kinetic typography
 */
function buildKineticTextActs(
  nluResult: NLUResult,
  styleConfig: StyleConfig,
  animations: ReturnType<typeof getAnimationRecommendations>
): Act[] {
  const { entities, estimatedDuration } = nluResult
  const textContent = entities.textContent || ['Hello', 'World']
  const acts: Act[] = []

  // Create an act for each word/phrase
  textContent.forEach((text, i) => {
    acts.push({
      id: uuidv4(),
      title: `Text ${i + 1}`,
      intent: 'KINETIC_TEXT',
      mobjects: [
        {
          id: uuidv4(),
          type: 'Text',
          params: {
            text,
            font_size: 96,
            color: i % 2 === 0 ? styleConfig.primaryColor : styleConfig.accentColor,
            weight: 'BOLD',
          },
          ref: `text_${i}`,
        },
      ],
      animations: [
        {
          id: uuidv4(),
          type: 'GrowFromCenter',
          targets: [`text_${i}`],
          runTime: 0.4,
          rateFunc: 'ease_out_back',
        },
        {
          id: uuidv4(),
          type: 'Wait',
          targets: [],
          params: { duration: 0.5 },
        },
        {
          id: uuidv4(),
          type: 'FadeOut',
          targets: [`text_${i}`],
          params: { shift: [0, 2, 0] },
          runTime: 0.3,
        },
      ],
      duration: 1.2,
      transition: { type: 'none', duration: 0 },
    })
  })

  // Final combination act
  if (textContent.length > 1) {
    acts.push({
      id: uuidv4(),
      title: 'Finale',
      intent: 'KINETIC_TEXT',
      mobjects: [
        {
          id: uuidv4(),
          type: 'Text',
          params: {
            text: textContent.join(' '),
            font_size: 64,
            color: styleConfig.accentColor,
          },
          ref: 'finale',
        },
      ],
      animations: [
        {
          id: uuidv4(),
          type: 'Write',
          targets: ['finale'],
          runTime: 1.5,
        },
        {
          id: uuidv4(),
          type: animations.preferredEmphasis,
          targets: ['finale'],
          runTime: 0.5,
        },
      ],
      duration: 2.5,
    })
  }

  return acts
}

/**
 * Build acts for process demonstration
 */
function buildProcessActs(
  nluResult: NLUResult,
  styleConfig: StyleConfig,
  animations: ReturnType<typeof getAnimationRecommendations>
): Act[] {
  const { entities, estimatedDuration } = nluResult
  const steps = entities.actions.length > 0 ? entities.actions : ['Step 1', 'Step 2', 'Step 3']

  return steps.map((step, i) => ({
    id: uuidv4(),
    title: `Step ${i + 1}`,
    intent: 'DEMONSTRATE_PROCESS' as Intent,
    mobjects: [
      {
        id: uuidv4(),
        type: 'Text' as const,
        params: {
          text: `Step ${i + 1}: ${step}`,
          font_size: 48,
          color: styleConfig.textColor,
        },
        position: { y: 2 },
        ref: `step_label_${i}`,
      },
      {
        id: uuidv4(),
        type: 'Rectangle' as const,
        params: {
          width: 4,
          height: 2,
          color: styleConfig.primaryColor,
        },
        ref: `step_box_${i}`,
      },
    ],
    animations: [
      {
        id: uuidv4(),
        type: 'FadeIn',
        targets: [`step_label_${i}`],
        runTime: 0.5,
      },
      {
        id: uuidv4(),
        type: animations.preferredCreate,
        targets: [`step_box_${i}`],
        runTime: 1,
      },
      {
        id: uuidv4(),
        type: animations.preferredEmphasis,
        targets: [`step_box_${i}`],
        runTime: 0.5,
      },
    ],
    duration: estimatedDuration / steps.length,
    transition: { type: 'slide', direction: 'left', duration: 0.3 },
  }))
}

/**
 * Build acts for object transformation
 */
function buildTransformationActs(
  nluResult: NLUResult,
  styleConfig: StyleConfig,
  animations: ReturnType<typeof getAnimationRecommendations>
): Act[] {
  const { entities, estimatedDuration } = nluResult
  const objects = entities.objects.length >= 2 ? entities.objects : ['circle', 'square']

  return [
    {
      id: uuidv4(),
      title: 'Initial State',
      intent: 'TRANSFORM_OBJECT',
      mobjects: [
        {
          id: uuidv4(),
          type: capitalizeFirst(objects[0]) as any,
          params: { color: styleConfig.primaryColor },
          ref: 'object_start',
        },
      ],
      animations: [
        {
          id: uuidv4(),
          type: animations.preferredCreate,
          targets: ['object_start'],
          runTime: 1,
        },
      ],
      duration: estimatedDuration * 0.3,
    },
    {
      id: uuidv4(),
      title: 'Transformation',
      intent: 'TRANSFORM_OBJECT',
      mobjects: [
        {
          id: uuidv4(),
          type: capitalizeFirst(objects[1]) as any,
          params: { color: styleConfig.secondaryColor },
          ref: 'object_end',
        },
      ],
      animations: [
        {
          id: uuidv4(),
          type: 'Transform',
          targets: ['object_start', 'object_end'],
          runTime: 2,
          rateFunc: 'smooth',
        },
      ],
      duration: estimatedDuration * 0.5,
    },
    {
      id: uuidv4(),
      title: 'Final State',
      intent: 'TRANSFORM_OBJECT',
      mobjects: [],
      animations: [
        {
          id: uuidv4(),
          type: animations.preferredEmphasis,
          targets: ['object_end'],
          runTime: 0.5,
        },
      ],
      duration: estimatedDuration * 0.2,
    },
  ]
}

/**
 * Build acts for comparison
 */
function buildComparisonActs(
  nluResult: NLUResult,
  styleConfig: StyleConfig,
  animations: ReturnType<typeof getAnimationRecommendations>
): Act[] {
  const { entities, estimatedDuration } = nluResult

  return [
    {
      id: uuidv4(),
      title: 'Setup',
      intent: 'COMPARE_CONTRAST',
      mobjects: [
        {
          id: uuidv4(),
          type: 'Line',
          params: { start: [0, 3, 0], end: [0, -3, 0], color: styleConfig.secondaryColor },
          ref: 'divider',
        },
        {
          id: uuidv4(),
          type: 'Text',
          params: { text: 'Option A', font_size: 36 },
          position: { x: -3, y: 2.5 },
          ref: 'label_a',
        },
        {
          id: uuidv4(),
          type: 'Text',
          params: { text: 'Option B', font_size: 36 },
          position: { x: 3, y: 2.5 },
          ref: 'label_b',
        },
      ],
      animations: [
        {
          id: uuidv4(),
          type: 'Create',
          targets: ['divider'],
          runTime: 0.5,
        },
        {
          id: uuidv4(),
          type: 'Write',
          targets: ['label_a', 'label_b'],
          runTime: 0.5,
        },
      ],
      duration: estimatedDuration * 0.2,
      camera: { zoom: 0.9 },
    },
    {
      id: uuidv4(),
      title: 'Compare',
      intent: 'COMPARE_CONTRAST',
      mobjects: [],
      animations: [],
      duration: estimatedDuration * 0.6,
    },
    {
      id: uuidv4(),
      title: 'Conclusion',
      intent: 'COMPARE_CONTRAST',
      mobjects: [],
      animations: [
        {
          id: uuidv4(),
          type: 'FadeOut',
          targets: ['divider', 'label_a'],
          runTime: 0.5,
        },
      ],
      duration: estimatedDuration * 0.2,
    },
  ]
}

/**
 * Build acts for function graphing
 */
function buildGraphActs(
  nluResult: NLUResult,
  styleConfig: StyleConfig,
  animations: ReturnType<typeof getAnimationRecommendations>
): Act[] {
  const { entities, estimatedDuration } = nluResult

  return [
    {
      id: uuidv4(),
      title: 'Axes',
      intent: 'GRAPH_FUNCTION',
      mobjects: [
        {
          id: uuidv4(),
          type: 'Axes',
          params: {
            x_range: [-5, 5, 1],
            y_range: [-3, 3, 1],
            x_length: 10,
            y_length: 6,
            axis_config: { include_tip: true },
          },
          ref: 'axes',
        },
      ],
      animations: [
        {
          id: uuidv4(),
          type: 'Create',
          targets: ['axes'],
          runTime: 1.5,
        },
      ],
      duration: estimatedDuration * 0.3,
    },
    {
      id: uuidv4(),
      title: 'Plot Function',
      intent: 'GRAPH_FUNCTION',
      mobjects: [
        {
          id: uuidv4(),
          type: 'FunctionGraph',
          params: { color: styleConfig.primaryColor },
          ref: 'graph',
        },
      ],
      animations: [
        {
          id: uuidv4(),
          type: 'Create',
          targets: ['graph'],
          runTime: 2,
        },
      ],
      duration: estimatedDuration * 0.5,
    },
    {
      id: uuidv4(),
      title: 'Label',
      intent: 'GRAPH_FUNCTION',
      mobjects: [],
      animations: [],
      duration: estimatedDuration * 0.2,
    },
  ]
}

/**
 * Build acts for geometric proof
 */
function buildProofActs(
  nluResult: NLUResult,
  styleConfig: StyleConfig,
  animations: ReturnType<typeof getAnimationRecommendations>
): Act[] {
  const { entities, estimatedDuration } = nluResult

  return [
    {
      id: uuidv4(),
      title: 'Given',
      intent: 'GEOMETRIC_PROOF',
      mobjects: [
        {
          id: uuidv4(),
          type: 'Text',
          params: { text: 'Given:', font_size: 36 },
          position: { x: -5, y: 3 },
          ref: 'given_label',
        },
      ],
      animations: [
        {
          id: uuidv4(),
          type: 'Write',
          targets: ['given_label'],
          runTime: 0.5,
        },
      ],
      duration: estimatedDuration * 0.2,
    },
    {
      id: uuidv4(),
      title: 'Construction',
      intent: 'GEOMETRIC_PROOF',
      mobjects: [],
      animations: [],
      duration: estimatedDuration * 0.4,
    },
    {
      id: uuidv4(),
      title: 'Proof',
      intent: 'GEOMETRIC_PROOF',
      mobjects: [],
      animations: [],
      duration: estimatedDuration * 0.3,
    },
    {
      id: uuidv4(),
      title: 'QED',
      intent: 'GEOMETRIC_PROOF',
      mobjects: [
        {
          id: uuidv4(),
          type: 'Text',
          params: { text: 'Q.E.D.', font_size: 48, color: styleConfig.accentColor },
          ref: 'qed',
        },
      ],
      animations: [
        {
          id: uuidv4(),
          type: animations.preferredCreate,
          targets: ['qed'],
          runTime: 1,
        },
      ],
      duration: estimatedDuration * 0.1,
    },
  ]
}

/**
 * Build acts for storytelling
 */
function buildStoryActs(
  nluResult: NLUResult,
  styleConfig: StyleConfig,
  animations: ReturnType<typeof getAnimationRecommendations>
): Act[] {
  const { entities, estimatedDuration } = nluResult

  return [
    {
      id: uuidv4(),
      title: 'Once Upon a Time',
      intent: 'TELL_STORY',
      mobjects: [
        {
          id: uuidv4(),
          type: 'Text',
          params: { text: 'Once upon a time...', font_size: 48, slant: 'ITALIC' },
          ref: 'opening',
        },
      ],
      animations: [
        {
          id: uuidv4(),
          type: 'Write',
          targets: ['opening'],
          runTime: 2,
        },
      ],
      duration: estimatedDuration * 0.2,
    },
    {
      id: uuidv4(),
      title: 'The Journey',
      intent: 'TELL_STORY',
      mobjects: [],
      animations: [],
      duration: estimatedDuration * 0.6,
    },
    {
      id: uuidv4(),
      title: 'The End',
      intent: 'TELL_STORY',
      mobjects: [
        {
          id: uuidv4(),
          type: 'Text',
          params: { text: 'The End', font_size: 72, color: styleConfig.accentColor },
          ref: 'ending',
        },
      ],
      animations: [
        {
          id: uuidv4(),
          type: 'FadeIn',
          targets: ['ending'],
          runTime: 1,
        },
      ],
      duration: estimatedDuration * 0.2,
    },
  ]
}

/**
 * Build generic acts for custom scenes
 */
function buildGenericActs(
  nluResult: NLUResult,
  styleConfig: StyleConfig,
  animations: ReturnType<typeof getAnimationRecommendations>
): Act[] {
  const { entities, estimatedDuration } = nluResult

  return [
    {
      id: uuidv4(),
      title: 'Setup',
      intent: 'CREATE_SCENE',
      mobjects: buildMobjectsFromEntities(entities, styleConfig),
      animations: [
        {
          id: uuidv4(),
          type: 'LaggedStart',
          targets: ['content_group'],
          params: { lag_ratio: 0.1 },
          runTime: 2,
        },
      ],
      duration: estimatedDuration * 0.4,
    },
    {
      id: uuidv4(),
      title: 'Main',
      intent: 'CREATE_SCENE',
      mobjects: [],
      animations: [],
      duration: estimatedDuration * 0.4,
    },
    {
      id: uuidv4(),
      title: 'Finale',
      intent: 'CREATE_SCENE',
      mobjects: [],
      animations: [
        {
          id: uuidv4(),
          type: 'FadeOut',
          targets: ['content_group'],
          runTime: 1,
        },
      ],
      duration: estimatedDuration * 0.2,
    },
  ]
}

/**
 * Build mobjects from extracted entities
 */
function buildMobjectsFromEntities(
  entities: NLUResult['entities'],
  styleConfig: StyleConfig
): MobjectSpec[] {
  const mobjects: MobjectSpec[] = []

  // Add shapes
  entities.objects.forEach((obj, i) => {
    const type = capitalizeFirst(obj) as any
    if (['Circle', 'Square', 'Triangle', 'Rectangle', 'Line', 'Arrow', 'Dot'].includes(type)) {
      mobjects.push({
        id: uuidv4(),
        type,
        params: {
          color: i % 2 === 0 ? styleConfig.primaryColor : styleConfig.secondaryColor,
        },
        position: { x: (i - entities.objects.length / 2) * 2 },
        ref: `shape_${i}`,
      })
    }
  })

  // Add math expressions
  entities.mathExpressions.forEach((expr, i) => {
    mobjects.push({
      id: uuidv4(),
      type: 'MathTex',
      params: { tex_string: expr.replace(/\$/g, '') },
      position: { y: -i * 1.5 },
      ref: `math_${i}`,
    })
  })

  // Group everything
  if (mobjects.length > 0) {
    return [
      {
        id: uuidv4(),
        type: 'VGroup',
        params: {},
        children: mobjects,
        ref: 'content_group',
      },
    ]
  }

  return mobjects
}

/**
 * Capitalize first letter
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Export scene graph to JSON
 */
export function serializeSceneGraph(sceneGraph: SceneGraph): string {
  return JSON.stringify(sceneGraph, null, 2)
}

/**
 * Import scene graph from JSON
 */
export function deserializeSceneGraph(json: string): SceneGraph {
  return JSON.parse(json) as SceneGraph
}

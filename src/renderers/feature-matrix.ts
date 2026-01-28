
import type { RendererType, RendererCapabilities } from './renderer-base'

export interface FeatureFlags {
  gpuShaders: boolean

  interactive: boolean

  realTimePreview: boolean

  dockerSupport: boolean

  webglRendering: boolean

  surface3D: boolean

  customShaders: boolean

  sceneCaching: boolean

  videoExport: boolean

  gifExport: boolean

  pngSequence: boolean

  latexSupport: boolean

  svgSupport: boolean

  pointCloud: boolean

  parametricSurfaces: boolean

  cameraAnimation: boolean

  ambientRotation: boolean

  ttsSync: boolean
}

export const FEATURE_MATRIX: Record<RendererType, FeatureFlags> = {
  'manim-ce': {
    gpuShaders: false,
    interactive: false,
    realTimePreview: false,
    dockerSupport: true,
    webglRendering: false,
    surface3D: true,
    customShaders: false,
    sceneCaching: true,
    videoExport: true,
    gifExport: true,
    pngSequence: true,
    latexSupport: true,
    svgSupport: true,
    pointCloud: false,
    parametricSurfaces: true,
    cameraAnimation: true,
    ambientRotation: true,
    ttsSync: false
  },
  'manimgl': {
    gpuShaders: true,
    interactive: true,
    realTimePreview: true,
    dockerSupport: false,
    webglRendering: true,
    surface3D: true,
    customShaders: true,
    sceneCaching: true,
    videoExport: true,
    gifExport: true,
    pngSequence: true,
    latexSupport: true,
    svgSupport: true,
    pointCloud: true,
    parametricSurfaces: true,
    cameraAnimation: true,
    ambientRotation: true,
    ttsSync: false
  }
}

export function getCapabilities(renderer: RendererType): RendererCapabilities {
  const features = FEATURE_MATRIX[renderer]

  return {
    gpuShaders: features.gpuShaders,
    interactive: features.interactive,
    realTimePreview: features.realTimePreview,
    dockerSupport: features.dockerSupport,
    support3D: features.surface3D,
    supportLatex: features.latexSupport,
    maxQuality: 'high',
    exportFormats: getExportFormats(features)
  }
}

function getExportFormats(features: FeatureFlags): string[] {
  const formats: string[] = []

  if (features.videoExport) formats.push('mp4', 'mov', 'webm')
  if (features.gifExport) formats.push('gif')
  if (features.pngSequence) formats.push('png')
  if (features.svgSupport) formats.push('svg')

  return formats
}

export function hasFeature(renderer: RendererType, feature: keyof FeatureFlags): boolean {
  return FEATURE_MATRIX[renderer][feature]
}

export function getDifferingFeatures(): (keyof FeatureFlags)[] {
  const ceFeatures = FEATURE_MATRIX['manim-ce']
  const glFeatures = FEATURE_MATRIX['manimgl']

  return (Object.keys(ceFeatures) as (keyof FeatureFlags)[]).filter(
    (key) => ceFeatures[key] !== glFeatures[key]
  )
}

export function getRecommendedRenderer(
  requiredFeatures: (keyof FeatureFlags)[]
): RendererType | null {
  const glSatisfies = requiredFeatures.every((f) => FEATURE_MATRIX['manimgl'][f])
  const ceSatisfies = requiredFeatures.every((f) => FEATURE_MATRIX['manim-ce'][f])

  if (glSatisfies && !ceSatisfies) return 'manimgl'
  if (ceSatisfies && !glSatisfies) return 'manim-ce'
  if (glSatisfies && ceSatisfies) {
    return 'manim-ce'
  }

  return null
}

export interface FeatureComparison {
  feature: keyof FeatureFlags
  'manim-ce': boolean
  'manimgl': boolean
  advantage: RendererType | 'both' | 'neither'
}

export function getFeatureComparison(): FeatureComparison[] {
  const features = Object.keys(FEATURE_MATRIX['manim-ce']) as (keyof FeatureFlags)[]

  return features.map((feature) => {
    const ce = FEATURE_MATRIX['manim-ce'][feature]
    const gl = FEATURE_MATRIX['manimgl'][feature]

    let advantage: FeatureComparison['advantage']
    if (ce && gl) advantage = 'both'
    else if (ce) advantage = 'manim-ce'
    else if (gl) advantage = 'manimgl'
    else advantage = 'neither'

    return {
      feature,
      'manim-ce': ce,
      'manimgl': gl,
      advantage
    }
  })
}

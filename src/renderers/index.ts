
export {
  RendererBase,
  type RendererType,
  type RenderQuality,
  type RenderOptions,
  type RenderResult,
  type RendererCapabilities,
  type RendererFactory
} from './renderer-base'

export {
  FEATURE_MATRIX,
  type FeatureFlags,
  getCapabilities,
  hasFeature,
  getDifferingFeatures,
  getRecommendedRenderer,
  getFeatureComparison,
  type FeatureComparison
} from './feature-matrix'

export {
  ManimCERenderer,
  createManimCERenderer
} from './manim-ce-renderer'

export {
  ManimGLRenderer,
  createManimGLRenderer
} from './manimgl-renderer'

export {
  RendererSelector,
  getRendererSelector,
  selectRenderer,
  selectForUseCase,
  type SelectionCriteria,
  type EnvironmentInfo,
  type SelectionResult
} from './renderer-selector'

export {
  MANIMGL_TEMPLATES,
  getManimGLTemplate,
  getTemplatesByFeature,
  getAvailableTemplates,
  generateMobiusStripCode,
  generateKleinBottleCode,
  generateParametricSurfaceCode,
  generateShaderEffectCode,
  generateInteractiveSceneCode,
  generateTorusKnotCode,
  generateWaveInterferenceCode,
  type ManimGLTemplate
} from './manimgl-templates'

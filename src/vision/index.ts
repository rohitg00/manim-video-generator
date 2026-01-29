
export * from './types';

export {
  getVisionProvider,
  getAvailableProviders,
  isVisionAvailable,
  openaiVisionProvider,
  anthropicVisionProvider,
  googleVisionProvider,
} from './providers/index';

export {
  parseDiagram,
  isDiagramParsingAvailable,
  generateEnhancedPrompt,
} from './diagram-parser';

export {
  extractText,
  isOCRAvailable,
  detectMathExpressions,
} from './ocr-engine';

export {
  normalizeShapeType,
  calculateShapeArea,
  calculateDistance,
  shapesOverlap,
  isShapeInside,
  sortShapesByPosition,
  groupShapesByProximity,
  createShape,
  shapeToManimCode,
  findClosestManimColor,
  MANIM_COLORS,
} from './shape-detector';

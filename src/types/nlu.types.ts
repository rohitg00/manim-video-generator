/**
 * Natural Language Understanding Types
 * Defines the structure for intent classification and entity extraction
 */

/**
 * Supported animation intents
 */
export type Intent =
  | 'EXPLAIN_CONCEPT'      // Educational explanations
  | 'VISUALIZE_MATH'       // Mathematical formulas and equations
  | 'TELL_STORY'           // Narrative-driven animations
  | 'TRANSFORM_OBJECT'     // Shape morphing and transformations
  | 'DEMONSTRATE_PROCESS'  // Step-by-step process visualization
  | 'CREATE_SCENE'         // Custom scene creation
  | 'KINETIC_TEXT'         // Typography and text animations
  | 'COMPARE_CONTRAST'     // Side-by-side comparisons
  | 'GRAPH_FUNCTION'       // Function plotting
  | 'GEOMETRIC_PROOF';     // Mathematical proofs

/**
 * Mapping of intents to their recommended skills
 */
export const INTENT_TO_SKILL: Record<Intent, string> = {
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
};

/**
 * Available visual style presets
 */
export type StylePreset =
  | '3blue1brown'  // Classic mathematical animation style
  | 'minimalist'   // Clean, white background
  | 'playful'      // Bright colors, bouncy animations
  | 'corporate'    // Professional, muted colors
  | 'neon';        // Dark background with vibrant colors

/**
 * Entities extracted from natural language input
 */
export interface ExtractedEntities {
  /** Mathematical expressions (LaTeX, Unicode, plain text) */
  mathExpressions: string[];

  /** Objects mentioned (shapes, graphs, etc.) */
  objects: string[];

  /** Colors mentioned or implied */
  colors: string[];

  /** Actions/verbs describing desired animations */
  actions: string[];

  /** Concepts to explain */
  concepts: string[];

  /** Requested duration in seconds (if specified) */
  duration?: number;

  /** Requested style (if specified) */
  style?: StylePreset;

  /** Complexity level (simple, medium, complex) */
  complexity?: 'simple' | 'medium' | 'complex';

  /** Specific Manim classes mentioned */
  manimClasses?: string[];

  /** Numbers and quantities mentioned */
  numbers?: number[];

  /** Text content for kinetic typography */
  textContent?: string[];
}

/**
 * Result of natural language understanding
 */
export interface NLUResult {
  /** Primary detected intent */
  intent: Intent;

  /** Confidence score (0-1) */
  confidence: number;

  /** Extracted entities */
  entities: ExtractedEntities;

  /** Recommended skill for this intent */
  suggestedSkill: string;

  /** Detected or default style */
  style: StylePreset;

  /** Raw interpretation for debugging */
  rawInterpretation?: string;

  /** Alternative intents with lower confidence */
  alternativeIntents?: Array<{ intent: Intent; confidence: number }>;

  /** Whether the input contains LaTeX */
  hasLatex: boolean;

  /** Whether this needs 3D rendering */
  needs3D: boolean;

  /** Estimated animation complexity */
  estimatedDuration: number;
}

/**
 * Intent classification patterns
 */
export interface IntentPattern {
  intent: Intent;
  keywords: string[];
  patterns: RegExp[];
  weight: number;
}

/**
 * NLU classification request
 */
export interface ClassifyRequest {
  /** User's natural language input */
  input: string;

  /** Optional context from previous interactions */
  context?: {
    previousIntent?: Intent;
    previousEntities?: ExtractedEntities;
  };

  /** Force a specific style */
  forceStyle?: StylePreset;
}

/**
 * Entity extraction patterns for different entity types
 */
export const ENTITY_PATTERNS = {
  // Mathematical expressions
  math: {
    latex: /\$([^$]+)\$|\\\(([^)]+)\\\)|\\\[([^\]]+)\\\]/g,
    fraction: /(\d+)\s*\/\s*(\d+)/g,
    exponent: /(\w+)\^(\d+|\{[^}]+\})/g,
    sqrt: /sqrt\(([^)]+)\)|√(\d+)/g,
    integral: /∫|integral|integrate/gi,
    derivative: /d\/d[xyz]|derivative|differentiate/gi,
    limit: /lim|limit/gi,
    sum: /∑|sum|sigma/gi,
  },

  // Colors
  colors: /\b(red|blue|green|yellow|orange|purple|pink|cyan|white|black|gold|gray|grey)\b/gi,

  // Shapes
  shapes: /\b(circle|square|triangle|rectangle|polygon|line|arrow|dot|sphere|cube|cylinder|cone|torus)\b/gi,

  // Actions
  actions: /\b(move|rotate|scale|fade|transform|morph|grow|shrink|appear|disappear|highlight|emphasize|animate|show|reveal|bounce|slide|spin|zoom)\b/gi,

  // Duration hints
  duration: /(\d+)\s*(seconds?|secs?|s\b)/gi,

  // Style hints
  styleHints: {
    '3blue1brown': /3blue1brown|3b1b|grant|sanderson|dark\s*background/gi,
    minimalist: /minimal|clean|simple|white\s*background/gi,
    playful: /playful|fun|bouncy|colorful|vibrant/gi,
    corporate: /corporate|professional|business|formal/gi,
    neon: /neon|cyber|glow|dark|vibrant/gi,
  },

  // Complexity hints
  complexity: {
    simple: /simple|basic|easy|quick/gi,
    medium: /medium|moderate|standard/gi,
    complex: /complex|detailed|elaborate|comprehensive/gi,
  },
} as const;

/**
 * Default values for NLU
 */
export const NLU_DEFAULTS = {
  style: '3blue1brown' as StylePreset,
  duration: 5,
  confidence_threshold: 0.6,
} as const;

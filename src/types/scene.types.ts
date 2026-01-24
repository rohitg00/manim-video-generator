/**
 * Scene Graph Types
 * Defines the structure for composing complex animations
 */

import type { Intent, StylePreset } from './nlu.types';

/**
 * Complete scene graph for an animation
 */
export interface SceneGraph {
  /** Unique identifier */
  id: string;

  /** Optional title for the animation */
  title?: string;

  /** Visual style configuration */
  style: StyleConfig;

  /** Acts composing the animation */
  acts: Act[];

  /** Global mobjects that persist across acts */
  globalMobjects?: MobjectSpec[];

  /** Total estimated duration in seconds */
  totalDuration: number;

  /** Whether this needs 3D scene */
  is3D: boolean;

  /** Whether to use moving camera */
  useMovingCamera: boolean;

  /** Metadata for generation */
  metadata: SceneMetadata;
}

/**
 * Metadata about the scene generation
 */
export interface SceneMetadata {
  /** Original user input */
  originalInput: string;

  /** Detected intent */
  intent: Intent;

  /** Skill used for generation */
  skill: string;

  /** Generation timestamp */
  createdAt: string;

  /** Version of the scene schema */
  schemaVersion: string;
}

/**
 * Visual style configuration
 */
export interface StyleConfig {
  /** Style preset name */
  preset: StylePreset;

  /** Background color (hex) */
  backgroundColor: string;

  /** Primary color for main elements */
  primaryColor: string;

  /** Secondary color for accents */
  secondaryColor: string;

  /** Accent color for highlights */
  accentColor: string;

  /** Text color */
  textColor: string;

  /** Default font for text */
  font?: string;

  /** Default animation speed multiplier */
  animationSpeed: number;

  /** Custom colors map */
  customColors?: Record<string, string>;
}

/**
 * Style preset configurations
 */
export const STYLE_CONFIGS: Record<StylePreset, StyleConfig> = {
  '3blue1brown': {
    preset: '3blue1brown',
    backgroundColor: '#1a1a2e',
    primaryColor: '#58c4dd',
    secondaryColor: '#83c167',
    accentColor: '#ffff00',
    textColor: '#ffffff',
    animationSpeed: 1,
  },
  minimalist: {
    preset: 'minimalist',
    backgroundColor: '#ffffff',
    primaryColor: '#333333',
    secondaryColor: '#666666',
    accentColor: '#0066cc',
    textColor: '#1a1a1a',
    animationSpeed: 1.2,
  },
  playful: {
    preset: 'playful',
    backgroundColor: '#ffeaa7',
    primaryColor: '#e17055',
    secondaryColor: '#00cec9',
    accentColor: '#6c5ce7',
    textColor: '#2d3436',
    animationSpeed: 0.9,
  },
  corporate: {
    preset: 'corporate',
    backgroundColor: '#2c3e50',
    primaryColor: '#3498db',
    secondaryColor: '#95a5a6',
    accentColor: '#e74c3c',
    textColor: '#ecf0f1',
    animationSpeed: 1.1,
  },
  neon: {
    preset: 'neon',
    backgroundColor: '#0a0a0a',
    primaryColor: '#00ffff',
    secondaryColor: '#ff00ff',
    accentColor: '#00ff00',
    textColor: '#ffffff',
    animationSpeed: 0.85,
  },
};

/**
 * A single act (logical section) of the animation
 */
export interface Act {
  /** Unique identifier */
  id: string;

  /** Act title/description */
  title: string;

  /** Primary intent of this act */
  intent: Intent;

  /** Mobjects in this act */
  mobjects: MobjectSpec[];

  /** Animations to perform */
  animations: AnimationSpec[];

  /** Duration of this act in seconds */
  duration: number;

  /** Transition to next act */
  transition?: TransitionSpec;

  /** Camera configuration for this act */
  camera?: CameraSpec;

  /** Optional narration text */
  narration?: string;
}

/**
 * Specification for a Manim mobject
 */
export interface MobjectSpec {
  /** Unique identifier */
  id: string;

  /** Manim class name (Circle, Text, MathTex, etc.) */
  type: MobjectType;

  /** Constructor parameters */
  params: Record<string, unknown>;

  /** Initial position */
  position?: PositionSpec;

  /** Styling */
  style?: MobjectStyle;

  /** Child mobjects (for groups) */
  children?: MobjectSpec[];

  /** Reference name for use in animations */
  ref?: string;
}

/**
 * Supported Manim mobject types
 */
export type MobjectType =
  // Basic shapes
  | 'Circle'
  | 'Square'
  | 'Rectangle'
  | 'Triangle'
  | 'Polygon'
  | 'Dot'
  | 'Line'
  | 'Arrow'
  | 'DashedLine'
  | 'Arc'
  | 'Ellipse'
  // Text
  | 'Text'
  | 'MathTex'
  | 'Tex'
  | 'Paragraph'
  // Graphs
  | 'Axes'
  | 'NumberPlane'
  | 'FunctionGraph'
  | 'ParametricFunction'
  // Groups
  | 'VGroup'
  | 'Group'
  // 3D
  | 'Sphere'
  | 'Cube'
  | 'Cylinder'
  | 'Cone'
  | 'Torus'
  | 'Surface'
  | 'ThreeDAxes'
  // Other
  | 'NumberLine'
  | 'Table'
  | 'BarChart'
  | 'SurroundingRectangle'
  | 'Brace'
  | 'BraceBetweenPoints';

/**
 * Position specification
 */
export interface PositionSpec {
  /** X coordinate or named position */
  x?: number | 'LEFT' | 'RIGHT' | 'ORIGIN';

  /** Y coordinate or named position */
  y?: number | 'UP' | 'DOWN' | 'ORIGIN';

  /** Z coordinate (for 3D) */
  z?: number;

  /** Relative to another mobject */
  relativeTo?: {
    ref: string;
    direction: 'next_to' | 'align_to' | 'move_to';
    side?: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
    buff?: number;
  };
}

/**
 * Mobject styling
 */
export interface MobjectStyle {
  /** Fill color */
  fillColor?: string;

  /** Fill opacity (0-1) */
  fillOpacity?: number;

  /** Stroke color */
  strokeColor?: string;

  /** Stroke width */
  strokeWidth?: number;

  /** Scale factor */
  scale?: number;

  /** Rotation in degrees */
  rotation?: number;
}

/**
 * Animation specification
 */
export interface AnimationSpec {
  /** Unique identifier */
  id: string;

  /** Animation type */
  type: AnimationType;

  /** Target mobject reference(s) */
  targets: string[];

  /** Animation parameters */
  params?: Record<string, unknown>;

  /** Duration in seconds */
  runTime?: number;

  /** Rate function (easing) */
  rateFunc?: RateFuncType;

  /** Delay before starting (for sequencing) */
  delay?: number;

  /** Run with other animations */
  runWith?: string[];
}

/**
 * Supported animation types
 */
export type AnimationType =
  // Creation
  | 'Create'
  | 'Write'
  | 'FadeIn'
  | 'FadeOut'
  | 'DrawBorderThenFill'
  | 'ShowCreation'
  | 'Uncreate'
  // Transformation
  | 'Transform'
  | 'ReplacementTransform'
  | 'TransformMatchingTex'
  | 'MorphTransform'
  // Movement
  | 'Shift'
  | 'MoveTo'
  | 'Rotate'
  | 'Scale'
  // Emphasis
  | 'Indicate'
  | 'Circumscribe'
  | 'Flash'
  | 'Wiggle'
  | 'FocusOn'
  // Groups
  | 'AnimationGroup'
  | 'LaggedStart'
  | 'Succession'
  // Special
  | 'Wait'
  | 'ApplyMethod';

/**
 * Rate function types (easing)
 */
export type RateFuncType =
  | 'linear'
  | 'smooth'
  | 'ease_in_quad'
  | 'ease_out_quad'
  | 'ease_in_out_quad'
  | 'ease_in_cubic'
  | 'ease_out_cubic'
  | 'ease_in_out_cubic'
  | 'ease_in_expo'
  | 'ease_out_expo'
  | 'ease_out_back'
  | 'ease_out_bounce'
  | 'there_and_back';

/**
 * Transition between acts
 */
export interface TransitionSpec {
  /** Transition type */
  type: 'fade' | 'slide' | 'zoom' | 'wipe' | 'none';

  /** Direction for slide/wipe */
  direction?: 'up' | 'down' | 'left' | 'right';

  /** Duration of transition */
  duration: number;
}

/**
 * Camera specification (for MovingCameraScene)
 */
export interface CameraSpec {
  /** Camera position */
  position?: { x: number; y: number; z?: number };

  /** Zoom level (1 = default) */
  zoom?: number;

  /** Rotation in degrees */
  rotation?: number;

  /** For 3D: phi angle */
  phi?: number;

  /** For 3D: theta angle */
  theta?: number;

  /** Animation to camera position */
  animate?: boolean;
}

/**
 * Scene generation options
 */
export interface SceneGenerationOptions {
  /** Force a specific style */
  style?: StylePreset;

  /** Maximum duration */
  maxDuration?: number;

  /** Quality level */
  quality?: 'low' | 'medium' | 'high';

  /** Include code comments */
  includeComments?: boolean;

  /** Generate verbose code */
  verbose?: boolean;
}

/**
 * Result of scene generation
 */
export interface GeneratedScene {
  /** The scene graph */
  sceneGraph: SceneGraph;

  /** Generated Manim Python code */
  code: string;

  /** Skill used */
  skill: string;

  /** Generation metadata */
  generationTime: number;

  /** Estimated render time */
  estimatedRenderTime: number;
}

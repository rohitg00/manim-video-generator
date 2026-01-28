
import type { StylePreset, Intent } from '../types/nlu.types';

export type VisionProvider = 'openai' | 'anthropic' | 'google';

export interface Shape {
  type: 'circle' | 'square' | 'rectangle' | 'triangle' | 'ellipse' | 'polygon' | 'line' | 'arrow' | 'arc' | 'curve';
  id: string;
  boundingBox: { x: number; y: number; width: number; height: number };
  center: { x: number; y: number };
  color?: string;
  fillColor?: string;
  confidence: number;
  vertices?: number;
  direction?: { from: { x: number; y: number }; to: { x: number; y: number } };
  rotation?: number;
  scale?: number;
  label?: string;
}

export interface TextElement {
  text: string;
  id: string;
  boundingBox: { x: number; y: number; width: number; height: number };
  center: { x: number; y: number };
  confidence: number;
  fontSize?: 'small' | 'medium' | 'large';
  isLabel?: boolean;
  labelFor?: string;
  isMath?: boolean;
  latex?: string;
}

export interface Relationship {
  id: string;
  type: 'connected' | 'inside' | 'above' | 'below' | 'left_of' | 'right_of' | 'overlaps' | 'points_to' | 'parallel' | 'perpendicular';
  sourceId: string;
  targetId: string;
  confidence: number;
  metadata?: { distance?: number; angle?: number; connectionPoint?: string };
}

export interface DiagramAnalysis {
  shapes: Shape[];
  text: TextElement[];
  equations: string[];
  relationships: Relationship[];
  suggestedAnimation: string;
  suggestedIntent: Intent;
  suggestedStyle: StylePreset;
  confidence: number;
  description: string;
  animationSequence?: AnimationSuggestion[];
  rawResponse?: string;
  metadata: {
    provider: VisionProvider;
    processingTime: number;
    imageDimensions?: { width: number; height: number };
    usedOCR: boolean;
    timestamp: string;
  };
}

export interface AnimationSuggestion {
  step: number;
  action: 'create' | 'transform' | 'move' | 'highlight' | 'fade_in' | 'fade_out' | 'draw' | 'write';
  targetIds: string[];
  description: string;
  duration: number;
}

export interface ImageUploadedEvent {
  jobId: string;
  imageData: string;
  mimeType: 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp';
  filename?: string;
  prompt?: string;
  quality: 'low' | 'medium' | 'high';
  style?: StylePreset;
  provider?: VisionProvider;
  timestamp: string;
}

export interface ImageAnalyzedEvent {
  jobId: string;
  analysis: DiagramAnalysis;
  originalPrompt?: string;
  enhancedPrompt: string;
  quality: 'low' | 'medium' | 'high';
  style: StylePreset;
  timestamp: string;
}

export interface VisionProviderInterface {
  name: VisionProvider;
  isAvailable(): boolean;
  analyzeImage(imageData: string, mimeType: string, prompt?: string): Promise<{
    description: string;
    shapes: Shape[];
    text: TextElement[];
    equations: string[];
    relationships: Relationship[];
    suggestedAnimation: string;
    confidence: number;
  }>;
}

export interface OCRResult {
  elements: TextElement[];
  fullText: string;
  mathExpressions: string[];
  confidence: number;
  processingTime: number;
}

export interface ShapeDetectionResult {
  shapes: Shape[];
  confidence: number;
  processingTime: number;
}

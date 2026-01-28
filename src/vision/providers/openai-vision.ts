
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import type { Shape, TextElement, Relationship, VisionProviderInterface } from '../types';

let openaiClient: OpenAI | null = null;

try {
  openaiClient = new OpenAI();
} catch (error) {
  console.warn('OpenAI client initialization failed for vision:', error);
}

const VISION_MODEL = process.env.OPENAI_VISION_MODEL || 'gpt-4o';

const ANALYSIS_PROMPT = `Analyze this diagram/image for creating a mathematical animation. Extract:

1. SHAPES: Identify all geometric shapes (circles, squares, triangles, rectangles, lines, arrows, etc.)
   - For each shape, estimate its position (as % from top-left), size, and color

2. TEXT: Extract all visible text, especially:
   - Labels on shapes
   - Mathematical expressions (convert to LaTeX if possible)
   - Titles or descriptions

3. EQUATIONS: Identify any mathematical formulas or equations (provide LaTeX)

4. RELATIONSHIPS: Describe how elements relate spatially:
   - What connects to what
   - Arrows pointing from X to Y
   - Elements inside other elements

5. SUGGESTED_ANIMATION: Based on the content, suggest the best animation approach:
   - "step_by_step" for processes/proofs
   - "transform" for shape morphing
   - "graph" for function visualization
   - "kinetic_text" for text-heavy content
   - "scene" for complex compositions

Return as JSON with this exact structure:
{
  "description": "Brief description of the diagram",
  "shapes": [{"type": "circle|square|...", "position": {"x": 0.5, "y": 0.3}, "size": "small|medium|large", "color": "#hex", "label": "optional label"}],
  "text": [{"content": "text", "position": {"x": 0.5, "y": 0.3}, "isMath": false, "latex": "if math"}],
  "equations": ["\\\\frac{a}{b}", ...],
  "relationships": [{"from": "element1", "to": "element2", "type": "points_to|inside|..."}],
  "suggestedAnimation": "step_by_step",
  "confidence": 0.85
}`;

export const openaiVisionProvider: VisionProviderInterface = {
  name: 'openai',

  isAvailable(): boolean {
    return openaiClient !== null;
  },

  async analyzeImage(imageData: string, mimeType: string, userPrompt?: string) {
    if (!openaiClient) {
      throw new Error('OpenAI client not available');
    }

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${imageData}`,
              detail: 'high',
            },
          },
          {
            type: 'text',
            text: userPrompt
              ? `${ANALYSIS_PROMPT}\n\nAdditional context from user: ${userPrompt}`
              : ANALYSIS_PROMPT,
          },
        ],
      },
    ];

    const response = await openaiClient.chat.completions.create({
      model: VISION_MODEL,
      messages,
      max_tokens: 2000,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from vision model');
    }

    const parsed = JSON.parse(content);

    const shapes: Shape[] = (parsed.shapes || []).map((s: any) => ({
      id: `shape_${uuidv4().slice(0, 8)}`,
      type: normalizeShapeType(s.type),
      boundingBox: {
        x: (s.position?.x || 0.5) - 0.05,
        y: (s.position?.y || 0.5) - 0.05,
        width: sizeToWidth(s.size),
        height: sizeToWidth(s.size),
      },
      center: { x: s.position?.x || 0.5, y: s.position?.y || 0.5 },
      color: s.color || '#58c4dd',
      confidence: parsed.confidence || 0.8,
      label: s.label,
    }));

    const text: TextElement[] = (parsed.text || []).map((t: any) => ({
      id: `text_${uuidv4().slice(0, 8)}`,
      text: t.content,
      boundingBox: {
        x: (t.position?.x || 0.5) - 0.05,
        y: (t.position?.y || 0.5) - 0.02,
        width: 0.1,
        height: 0.04,
      },
      center: { x: t.position?.x || 0.5, y: t.position?.y || 0.5 },
      confidence: 0.9,
      isMath: t.isMath || false,
      latex: t.latex,
    }));

    const relationships: Relationship[] = (parsed.relationships || []).map((r: any) => ({
      id: `rel_${uuidv4().slice(0, 8)}`,
      type: r.type || 'connected',
      sourceId: r.from,
      targetId: r.to,
      confidence: 0.8,
    }));

    return {
      description: parsed.description || 'Diagram analysis',
      shapes,
      text,
      equations: parsed.equations || [],
      relationships,
      suggestedAnimation: parsed.suggestedAnimation || 'scene',
      confidence: parsed.confidence || 0.8,
    };
  },
};

function normalizeShapeType(type: string): Shape['type'] {
  const typeMap: Record<string, Shape['type']> = {
    circle: 'circle',
    square: 'square',
    rectangle: 'rectangle',
    triangle: 'triangle',
    ellipse: 'ellipse',
    polygon: 'polygon',
    line: 'line',
    arrow: 'arrow',
    arc: 'arc',
    curve: 'curve',
  };
  return typeMap[type?.toLowerCase()] || 'rectangle';
}

function sizeToWidth(size: string): number {
  const sizeMap: Record<string, number> = {
    small: 0.08,
    medium: 0.15,
    large: 0.25,
  };
  return sizeMap[size] || 0.1;
}

export function isOpenAIVisionAvailable(): boolean {
  return openaiVisionProvider.isAvailable();
}

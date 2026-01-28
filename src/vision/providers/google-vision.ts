
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
import type { Shape, TextElement, Relationship, VisionProviderInterface } from '../types';

let geminiClient: GoogleGenerativeAI | null = null;

try {
  if (process.env.GOOGLE_API_KEY) {
    geminiClient = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  }
} catch (error) {
  console.warn('Google AI client initialization failed:', error);
}

const GEMINI_MODEL = process.env.GOOGLE_VISION_MODEL || 'gemini-2.0-flash';

const ANALYSIS_PROMPT = `Analyze this diagram for animation generation. Return valid JSON only:
{
  "description": "Brief description",
  "shapes": [{"type": "circle|square|rectangle|triangle|line|arrow", "position": {"x": 0-1, "y": 0-1}, "size": "small|medium|large", "color": "#hex", "label": "optional"}],
  "text": [{"content": "text", "position": {"x": 0-1, "y": 0-1}, "isMath": boolean, "latex": "LaTeX if math"}],
  "equations": ["\\\\frac{a}{b}"],
  "relationships": [{"from": "element", "to": "element", "type": "points_to|inside|connected"}],
  "suggestedAnimation": "step_by_step|transform|graph|scene",
  "confidence": 0.0-1.0
}
Return ONLY the JSON object, no other text.`;

export const googleVisionProvider: VisionProviderInterface = {
  name: 'google',

  isAvailable(): boolean {
    return geminiClient !== null;
  },

  async analyzeImage(imageData: string, mimeType: string, userPrompt?: string) {
    if (!geminiClient) {
      throw new Error('Google AI client not available');
    }

    const model = geminiClient.getGenerativeModel({ model: GEMINI_MODEL });

    const prompt = userPrompt
      ? `${ANALYSIS_PROMPT}\n\nUser context: ${userPrompt}`
      : ANALYSIS_PROMPT;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: imageData,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Gemini response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    const shapes: Shape[] = (parsed.shapes || []).map((s: any) => ({
      id: `shape_${uuidv4().slice(0, 8)}`,
      type: s.type || 'rectangle',
      boundingBox: {
        x: (s.position?.x || 0.5) - 0.05,
        y: (s.position?.y || 0.5) - 0.05,
        width: 0.1,
        height: 0.1,
      },
      center: { x: s.position?.x || 0.5, y: s.position?.y || 0.5 },
      color: s.color || '#58c4dd',
      confidence: parsed.confidence || 0.75,
      label: s.label,
    }));

    const textElements: TextElement[] = (parsed.text || []).map((t: any) => ({
      id: `text_${uuidv4().slice(0, 8)}`,
      text: t.content,
      boundingBox: {
        x: (t.position?.x || 0.5) - 0.05,
        y: (t.position?.y || 0.5) - 0.02,
        width: 0.1,
        height: 0.04,
      },
      center: { x: t.position?.x || 0.5, y: t.position?.y || 0.5 },
      confidence: 0.85,
      isMath: t.isMath || false,
      latex: t.latex,
    }));

    const relationships: Relationship[] = (parsed.relationships || []).map((r: any) => ({
      id: `rel_${uuidv4().slice(0, 8)}`,
      type: r.type || 'connected',
      sourceId: r.from,
      targetId: r.to,
      confidence: 0.75,
    }));

    return {
      description: parsed.description || 'Diagram analysis',
      shapes,
      text: textElements,
      equations: parsed.equations || [],
      relationships,
      suggestedAnimation: parsed.suggestedAnimation || 'scene',
      confidence: parsed.confidence || 0.75,
    };
  },
};

export function isGoogleVisionAvailable(): boolean {
  return googleVisionProvider.isAvailable();
}

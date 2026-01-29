
import { v4 as uuidv4 } from 'uuid';
import type { Shape, TextElement, Relationship, VisionProviderInterface } from '../types';

// Dynamic import type for Anthropic SDK
type AnthropicType = import('@anthropic-ai/sdk').default;
let anthropicClient: AnthropicType | null = null;
let initPromise: Promise<AnthropicType | null> | null = null;

async function getAnthropicClient(): Promise<AnthropicType | null> {
  // Return cached client if already initialized
  if (anthropicClient) {
    return anthropicClient;
  }

  // Return existing initialization promise if in progress (prevents race condition)
  if (initPromise) {
    return initPromise;
  }

  // Start initialization and cache the promise
  initPromise = (async () => {
    if (!process.env.ANTHROPIC_API_KEY) {
      return null;
    }

    try {
      const { default: Anthropic } = await import('@anthropic-ai/sdk');
      anthropicClient = new Anthropic();
      return anthropicClient;
    } catch (error) {
      console.warn('Anthropic SDK not available:', error);
      return null;
    }
  })();

  return initPromise;
}

const CLAUDE_MODEL = process.env.ANTHROPIC_VISION_MODEL || 'claude-sonnet-4-20250514';

const ANALYSIS_PROMPT = `Analyze this diagram for creating a mathematical animation. Return JSON with:
{
  "description": "Brief description",
  "shapes": [{"type": "circle|square|...", "position": {"x": 0-1, "y": 0-1}, "size": "small|medium|large", "color": "#hex", "label": "optional"}],
  "text": [{"content": "text", "position": {"x": 0-1, "y": 0-1}, "isMath": bool, "latex": "if math"}],
  "equations": ["LaTeX expressions"],
  "relationships": [{"from": "element", "to": "element", "type": "points_to|inside|..."}],
  "suggestedAnimation": "step_by_step|transform|graph|kinetic_text|scene",
  "confidence": 0.0-1.0
}`;

export const anthropicVisionProvider: VisionProviderInterface = {
  name: 'anthropic',

  isAvailable(): boolean {
    // Check synchronously if API key exists - actual client check happens async
    return !!process.env.ANTHROPIC_API_KEY;
  },

  async analyzeImage(imageData: string, mimeType: string, userPrompt?: string) {
    const client = await getAnthropicClient();
    if (!client) {
      throw new Error('Anthropic client not available');
    }

    const mediaType = mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: imageData,
              },
            },
            {
              type: 'text',
              text: userPrompt
                ? `${ANALYSIS_PROMPT}\n\nUser context: ${userPrompt}`
                : ANALYSIS_PROMPT,
            },
          ],
        },
      ],
    });

    const textContent = response.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
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

export function isAnthropicVisionAvailable(): boolean {
  return anthropicVisionProvider.isAvailable();
}

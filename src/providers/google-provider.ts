
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  BaseLLMProvider,
  GenerationContext,
  CodeResult,
  IntentResult,
  MathEnrichment,
  ProviderCapability,
  ProviderConfig,
} from './base-provider';

const DEFAULT_MODEL = process.env.GOOGLE_MODEL || 'gemini-2.0-flash';

export class GoogleProvider extends BaseLLMProvider {
  name = 'google';
  displayName = 'Gemini';
  supportedCapabilities: ProviderCapability[] = [
    'code_generation',
    'intent_analysis',
    'math_enrichment',
    'vision',
    'streaming',
  ];

  private client: GoogleGenerativeAI | null = null;

  constructor(config: ProviderConfig = {}) {
    super(config);
    try {
      const apiKey = config.apiKey || process.env.GOOGLE_API_KEY;
      if (apiKey) {
        this.client = new GoogleGenerativeAI(apiKey);
      }
    } catch (error) {
      console.warn('Google AI client initialization failed:', error);
    }
  }

  isAvailable(): boolean {
    return this.client !== null && !!process.env.GOOGLE_API_KEY;
  }

  async generateCode(prompt: string, context: GenerationContext): Promise<CodeResult> {
    if (!this.client) throw new Error('Google AI client not available');

    const model = this.client.getGenerativeModel({ model: this.config.model || DEFAULT_MODEL });

    const systemPrompt = `You are an expert Manim animation developer. Generate clean, working Manim Community Edition code.
Style: ${context.style || '3blue1brown'}
Complexity: ${context.complexity || 'medium'}
${context.prerequisites ? `Prerequisites: ${context.prerequisites.join(', ')}` : ''}

Return ONLY the Python code, no explanations.

User request: ${prompt}`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const code = response.text();

    return {
      code: this.extractPythonCode(code),
      confidence: 0.8,
      usedTemplate: false,
    };
  }

  async analyzeIntent(text: string): Promise<IntentResult> {
    if (!this.client) throw new Error('Google AI client not available');

    const model = this.client.getGenerativeModel({ model: this.config.model || DEFAULT_MODEL });

    const prompt = `Analyze the user's intent for creating a mathematical animation. Return ONLY valid JSON:
{
  "intent": "VISUALIZE_MATH|EXPLAIN_CONCEPT|TRANSFORM_OBJECT|GRAPH_FUNCTION|GEOMETRIC_PROOF|KINETIC_TEXT|CREATE_SCENE",
  "confidence": 0.0-1.0,
  "entities": {
    "objects": ["circle", "square"],
    "actions": ["rotate", "transform"],
    "colors": ["blue", "red"],
    "mathExpressions": ["x^2", "\\\\frac{a}{b}"]
  },
  "suggestedSkill": "math-visualizer|animation-composer|visual-storyteller|motion-graphics"
}

User input: ${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    return {
      intent: parsed.intent || 'CREATE_SCENE',
      confidence: parsed.confidence || 0.75,
      entities: parsed.entities || { objects: [], actions: [], colors: [], mathExpressions: [] },
      suggestedSkill: parsed.suggestedSkill,
    };
  }

  async enrichMath(concept: string): Promise<MathEnrichment> {
    if (!this.client) throw new Error('Google AI client not available');

    const model = this.client.getGenerativeModel({ model: this.config.model || DEFAULT_MODEL });

    const prompt = `You are a mathematics expert. Enrich the given concept with mathematical content. Return ONLY valid JSON:
{
  "equations": ["Primary equations in LaTeX"],
  "theorems": ["Relevant theorem names"],
  "definitions": ["Key definitions"],
  "proofSteps": ["Step-by-step proof if applicable"],
  "latex": ["All LaTeX expressions needed for visualization"]
}

Concept: ${concept}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    return {
      equations: parsed.equations || [],
      theorems: parsed.theorems || [],
      definitions: parsed.definitions || [],
      proofSteps: parsed.proofSteps,
      latex: parsed.latex || [],
    };
  }

  private extractPythonCode(text: string): string {
    const codeMatch = text.match(/```python\n([\s\S]*?)```/);
    if (codeMatch) return codeMatch[1].trim();

    const pyMatch = text.match(/```\n([\s\S]*?)```/);
    if (pyMatch) return pyMatch[1].trim();

    return text.trim();
  }
}

export const googleProvider = new GoogleProvider();

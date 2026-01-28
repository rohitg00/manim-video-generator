
import OpenAI from 'openai';
import {
  BaseLLMProvider,
  GenerationContext,
  CodeResult,
  IntentResult,
  MathEnrichment,
  ProviderCapability,
  ProviderConfig,
} from './base-provider';

const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';

export class OpenAIProvider extends BaseLLMProvider {
  name = 'openai';
  displayName = 'OpenAI GPT-4';
  supportedCapabilities: ProviderCapability[] = [
    'code_generation',
    'intent_analysis',
    'math_enrichment',
    'vision',
    'streaming',
    'function_calling',
  ];

  private client: OpenAI | null = null;
  private hasApiKey: boolean;

  constructor(config: ProviderConfig = {}) {
    super(config);
    this.hasApiKey = !!(config.apiKey || process.env.OPENAI_API_KEY);
    try {
      this.client = new OpenAI({
        apiKey: config.apiKey || process.env.OPENAI_API_KEY,
        baseURL: config.baseUrl,
      });
    } catch (error) {
      console.warn('OpenAI client initialization failed:', error);
    }
  }

  isAvailable(): boolean {
    return this.client !== null && this.hasApiKey;
  }

  async generateCode(prompt: string, context: GenerationContext): Promise<CodeResult> {
    if (!this.client) throw new Error('OpenAI client not available');

    const systemPrompt = `You are an expert Manim animation developer. Generate clean, working Manim Community Edition code.
Style: ${context.style || '3blue1brown'}
Complexity: ${context.complexity || 'medium'}
${context.prerequisites ? `Prerequisites: ${context.prerequisites.join(', ')}` : ''}

Return ONLY the Python code, no explanations.`;

    const response = await this.client.chat.completions.create({
      model: this.config.model || DEFAULT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
    });

    const code = response.choices[0]?.message?.content || '';

    return {
      code: this.extractPythonCode(code),
      confidence: 0.85,
      usedTemplate: false,
    };
  }

  async analyzeIntent(text: string): Promise<IntentResult> {
    if (!this.client) throw new Error('OpenAI client not available');

    const response = await this.client.chat.completions.create({
      model: this.config.model || DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: `Analyze the user's intent for creating a mathematical animation. Return JSON:
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
}`,
        },
        { role: 'user', content: text },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '{}';
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(content);
    } catch (error) {
      console.warn('Failed to parse analyzeIntent response:', error);
      parsed = {};
    }

    return {
      intent: (parsed.intent as string) || 'CREATE_SCENE',
      confidence: (parsed.confidence as number) || 0.7,
      entities: (parsed.entities as IntentResult['entities']) || { objects: [], actions: [], colors: [], mathExpressions: [] },
      suggestedSkill: parsed.suggestedSkill as string | undefined,
    };
  }

  async enrichMath(concept: string): Promise<MathEnrichment> {
    if (!this.client) throw new Error('OpenAI client not available');

    const response = await this.client.chat.completions.create({
      model: this.config.model || DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a mathematics expert. Enrich the given concept with mathematical content. Return JSON:
{
  "equations": ["Primary equations in LaTeX"],
  "theorems": ["Relevant theorem names"],
  "definitions": ["Key definitions"],
  "proofSteps": ["Step-by-step proof if applicable"],
  "latex": ["All LaTeX expressions needed for visualization"]
}`,
        },
        { role: 'user', content: concept },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '{}';
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(content);
    } catch (error) {
      console.warn('Failed to parse enrichMath response:', error);
      parsed = {};
    }

    return {
      equations: (parsed.equations as string[]) || [],
      theorems: (parsed.theorems as string[]) || [],
      definitions: (parsed.definitions as string[]) || [],
      proofSteps: parsed.proofSteps as string[] | undefined,
      latex: (parsed.latex as string[]) || [],
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

export const openaiProvider = new OpenAIProvider();

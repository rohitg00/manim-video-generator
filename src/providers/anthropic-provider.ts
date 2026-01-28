
import Anthropic from '@anthropic-ai/sdk';
import {
  BaseLLMProvider,
  GenerationContext,
  CodeResult,
  IntentResult,
  MathEnrichment,
  ProviderCapability,
  ProviderConfig,
} from './base-provider';

const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';

export class AnthropicProvider extends BaseLLMProvider {
  name = 'anthropic';
  displayName = 'Claude';
  supportedCapabilities: ProviderCapability[] = [
    'code_generation',
    'intent_analysis',
    'math_enrichment',
    'vision',
    'streaming',
  ];

  private client: Anthropic | null = null;
  private hasApiKey: boolean = false;

  constructor(config: ProviderConfig = {}) {
    super(config);
    try {
      const apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;
      if (apiKey) {
        this.hasApiKey = true;
        this.client = new Anthropic({ apiKey });
      }
    } catch (error) {
      console.warn('Anthropic client initialization failed:', error);
    }
  }

  isAvailable(): boolean {
    return this.client !== null && this.hasApiKey;
  }

  async generateCode(prompt: string, context: GenerationContext): Promise<CodeResult> {
    if (!this.client) throw new Error('Anthropic client not available');

    const systemPrompt = `You are an expert Manim animation developer. Generate clean, working Manim Community Edition code.
Style: ${context.style || '3blue1brown'}
Complexity: ${context.complexity || 'medium'}
${context.prerequisites ? `Prerequisites: ${context.prerequisites.join(', ')}` : ''}

Return ONLY the Python code, no explanations.`;

    const response = await this.client.messages.create({
      model: this.config.model || DEFAULT_MODEL,
      max_tokens: this.config.maxTokens || 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    });

    const textContent = response.content.find((c) => c.type === 'text');
    const code = textContent?.type === 'text' ? textContent.text : '';

    return {
      code: this.extractPythonCode(code),
      confidence: 0.9,
      usedTemplate: false,
    };
  }

  async analyzeIntent(text: string): Promise<IntentResult> {
    if (!this.client) throw new Error('Anthropic client not available');

    const response = await this.client.messages.create({
      model: this.config.model || DEFAULT_MODEL,
      max_tokens: 1000,
      system: `Analyze the user's intent for creating a mathematical animation. Return ONLY valid JSON:
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
      messages: [{ role: 'user', content: text }],
    });

    const textContent = response.content.find((c) => c.type === 'text');
    const content = textContent?.type === 'text' ? textContent.text : '{}';

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    let parsed: Record<string, unknown> = {};
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch {
        console.warn('Failed to parse JSON from Anthropic response');
      }
    }

    return {
      intent: (parsed.intent as string) || 'CREATE_SCENE',
      confidence: (parsed.confidence as number) || 0.8,
      entities: (parsed.entities as IntentResult['entities']) || { objects: [], actions: [], colors: [], mathExpressions: [] },
      suggestedSkill: parsed.suggestedSkill as string | undefined,
    };
  }

  async enrichMath(concept: string): Promise<MathEnrichment> {
    if (!this.client) throw new Error('Anthropic client not available');

    const response = await this.client.messages.create({
      model: this.config.model || DEFAULT_MODEL,
      max_tokens: 1500,
      system: `You are a mathematics expert. Enrich the given concept with mathematical content. Return ONLY valid JSON:
{
  "equations": ["Primary equations in LaTeX"],
  "theorems": ["Relevant theorem names"],
  "definitions": ["Key definitions"],
  "proofSteps": ["Step-by-step proof if applicable"],
  "latex": ["All LaTeX expressions needed for visualization"]
}`,
      messages: [{ role: 'user', content: concept }],
    });

    const textContent = response.content.find((c) => c.type === 'text');
    const content = textContent?.type === 'text' ? textContent.text : '{}';

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    let parsed: Record<string, unknown> = {};
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch {
        console.warn('Failed to parse JSON from Anthropic response');
      }
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

export const anthropicProvider = new AnthropicProvider();

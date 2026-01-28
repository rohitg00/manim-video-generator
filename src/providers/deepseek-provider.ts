
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

const DEFAULT_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-reasoner';
const DEFAULT_BASE_URL = 'https://api.deepseek.com/v1';

export class DeepSeekProvider extends BaseLLMProvider {
  name = 'deepseek';
  displayName = 'DeepSeek R1';
  supportedCapabilities: ProviderCapability[] = [
    'code_generation',
    'intent_analysis',
    'math_enrichment',
  ];

  private client: OpenAI | null = null;

  constructor(config: ProviderConfig = {}) {
    super(config);
    try {
      const apiKey = config.apiKey || process.env.DEEPSEEK_API_KEY;
      if (apiKey) {
        this.client = new OpenAI({
          apiKey,
          baseURL: config.baseUrl || DEFAULT_BASE_URL,
        });
      }
    } catch (error) {
      console.warn('DeepSeek client initialization failed:', error);
    }
  }

  isAvailable(): boolean {
    return this.client !== null && !!process.env.DEEPSEEK_API_KEY;
  }

  async generateCode(prompt: string, context: GenerationContext): Promise<CodeResult> {
    if (!this.client) throw new Error('DeepSeek client not available');

    const systemPrompt = `You are an expert Manim animation developer. Generate clean, working Manim Community Edition code.
Style: ${context.style || '3blue1brown'}
Complexity: ${context.complexity || 'medium'}

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
    if (!this.client) throw new Error('DeepSeek client not available');

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
    "objects": [],
    "actions": [],
    "colors": [],
    "mathExpressions": []
  },
  "suggestedSkill": "math-visualizer|animation-composer|visual-storyteller|motion-graphics"
}`,
        },
        { role: 'user', content: text },
      ],
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content || '{}';
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
    if (!this.client) throw new Error('DeepSeek client not available');

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
    });

    const content = response.choices[0]?.message?.content || '{}';
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

export const deepseekProvider = new DeepSeekProvider();


export interface GenerationContext {
  concept: string;
  intent?: string;
  style?: string;
  complexity?: 'simple' | 'medium' | 'complex';
  existingCode?: string;
  prerequisites?: string[];
  visualDesign?: {
    colorPalette?: string[];
    cameraMovements?: string[];
  };
}

export interface CodeResult {
  code: string;
  confidence: number;
  usedTemplate: boolean;
  templateName?: string;
  explanation?: string;
  suggestedAnimations?: string[];
}

export interface IntentResult {
  intent: string;
  confidence: number;
  entities: {
    objects: string[];
    actions: string[];
    colors: string[];
    mathExpressions: string[];
  };
  suggestedSkill?: string;
}

export interface MathEnrichment {
  equations: string[];
  theorems: string[];
  definitions: string[];
  proofSteps?: string[];
  latex: string[];
}

export type ProviderCapability =
  | 'code_generation'
  | 'intent_analysis'
  | 'math_enrichment'
  | 'vision'
  | 'streaming'
  | 'function_calling';

export interface LLMProvider {
  name: string;
  displayName: string;
  supportedCapabilities: ProviderCapability[];

  isAvailable(): boolean;

  generateCode(prompt: string, context: GenerationContext): Promise<CodeResult>;

  analyzeIntent(text: string): Promise<IntentResult>;

  enrichMath(concept: string): Promise<MathEnrichment>;

  healthCheck(): Promise<boolean>;
}

export interface ProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
}

export abstract class BaseLLMProvider implements LLMProvider {
  abstract name: string;
  abstract displayName: string;
  abstract supportedCapabilities: ProviderCapability[];

  protected config: ProviderConfig;

  constructor(config: ProviderConfig = {}) {
    this.config = {
      temperature: 0.7,
      maxTokens: 2000,
      timeout: 30000,
      ...config,
    };
  }

  abstract isAvailable(): boolean;
  abstract generateCode(prompt: string, context: GenerationContext): Promise<CodeResult>;
  abstract analyzeIntent(text: string): Promise<IntentResult>;
  abstract enrichMath(concept: string): Promise<MathEnrichment>;

  async healthCheck(): Promise<boolean> {
    try {
      if (!this.isAvailable()) return false;
      const result = await this.analyzeIntent('test');
      return result.intent !== undefined;
    } catch {
      return false;
    }
  }
}

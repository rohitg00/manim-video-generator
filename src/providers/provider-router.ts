
import type { LLMProvider, GenerationContext, CodeResult, IntentResult, MathEnrichment } from './base-provider';
import { openaiProvider } from './openai-provider';
import { anthropicProvider } from './anthropic-provider';
import { googleProvider } from './google-provider';
import { deepseekProvider } from './deepseek-provider';

export type TaskType = 'code_generation' | 'intent_analysis' | 'math_enrichment' | 'creative';
export type ProviderName = 'openai' | 'anthropic' | 'google' | 'deepseek';

interface RoutingConfig {
  default: ProviderName;
  taskRouting: Record<TaskType, ProviderName[]>;
  costOptimize: boolean;
}

const DEFAULT_ROUTING_CONFIG: RoutingConfig = {
  default: 'anthropic',
  taskRouting: {
    code_generation: ['anthropic', 'openai', 'deepseek'],
    intent_analysis: ['anthropic', 'openai', 'google'],
    math_enrichment: ['google', 'deepseek', 'anthropic'],
    creative: ['anthropic', 'openai'],
  },
  costOptimize: process.env.COST_OPTIMIZE === 'true',
};

const PROVIDERS: Record<ProviderName, LLMProvider> = {
  openai: openaiProvider,
  anthropic: anthropicProvider,
  google: googleProvider,
  deepseek: deepseekProvider,
};

export class ProviderRouter {
  private config: RoutingConfig;
  private healthStatus: Map<ProviderName, boolean> = new Map();

  constructor(config: Partial<RoutingConfig> = {}) {
    this.config = { ...DEFAULT_ROUTING_CONFIG, ...config };
    this.initHealthCheck();
  }

  private async initHealthCheck(): Promise<void> {
    for (const [name, provider] of Object.entries(PROVIDERS)) {
      this.healthStatus.set(name as ProviderName, provider.isAvailable());
    }
  }

  getProvider(taskType: TaskType): LLMProvider | null {
    const preferredProviders = this.config.taskRouting[taskType] || [this.config.default];

    for (const providerName of preferredProviders) {
      const provider = PROVIDERS[providerName];
      if (provider?.isAvailable()) {
        return provider;
      }
    }

    for (const [name, provider] of Object.entries(PROVIDERS)) {
      if (provider.isAvailable()) {
        return provider;
      }
    }

    return null;
  }

  getProviderByName(name: ProviderName): LLMProvider | null {
    const provider = PROVIDERS[name];
    return provider?.isAvailable() ? provider : null;
  }

  getAvailableProviders(): LLMProvider[] {
    return Object.values(PROVIDERS).filter((p) => p.isAvailable());
  }

  async generateCode(prompt: string, context: GenerationContext, preferredProvider?: ProviderName): Promise<CodeResult> {
    const provider = preferredProvider
      ? this.getProviderByName(preferredProvider)
      : this.getProvider('code_generation');

    if (!provider) {
      throw new Error('No provider available for code generation');
    }

    return provider.generateCode(prompt, context);
  }

  async analyzeIntent(text: string, preferredProvider?: ProviderName): Promise<IntentResult> {
    const provider = preferredProvider
      ? this.getProviderByName(preferredProvider)
      : this.getProvider('intent_analysis');

    if (!provider) {
      throw new Error('No provider available for intent analysis');
    }

    return provider.analyzeIntent(text);
  }

  async enrichMath(concept: string, preferredProvider?: ProviderName): Promise<MathEnrichment> {
    const provider = preferredProvider
      ? this.getProviderByName(preferredProvider)
      : this.getProvider('math_enrichment');

    if (!provider) {
      throw new Error('No provider available for math enrichment');
    }

    return provider.enrichMath(concept);
  }

  updateConfig(config: Partial<RoutingConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): RoutingConfig {
    return { ...this.config };
  }

  async checkHealth(): Promise<Record<ProviderName, boolean>> {
    const results: Record<string, boolean> = {};

    for (const [name, provider] of Object.entries(PROVIDERS)) {
      try {
        results[name] = await provider.healthCheck();
        this.healthStatus.set(name as ProviderName, results[name]);
      } catch {
        results[name] = false;
        this.healthStatus.set(name as ProviderName, false);
      }
    }

    return results as Record<ProviderName, boolean>;
  }
}

export const providerRouter = new ProviderRouter();

export function getDefaultProvider(): LLMProvider | null {
  return providerRouter.getProvider('code_generation');
}

export function isAnyProviderAvailable(): boolean {
  return providerRouter.getAvailableProviders().length > 0;
}

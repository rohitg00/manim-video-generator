
import type { LLMProvider, GenerationContext, CodeResult, IntentResult, MathEnrichment } from './base-provider';
import { providerRouter, ProviderName } from './provider-router';

interface FallbackConfig {
  chain: ProviderName[];
  maxRetries: number;
  retryDelayMs: number;
  onFallback?: (from: ProviderName, to: ProviderName, error: Error) => void;
}

const validProviders: ProviderName[] = ['openai', 'anthropic', 'google', 'deepseek'];

function getDefaultChain(): ProviderName[] {
  const envChain = process.env.FALLBACK_CHAIN;
  if (envChain) {
    const chain = envChain.split(',').filter(p => validProviders.includes(p as ProviderName)) as ProviderName[];
    if (chain.length > 0) {
      return chain;
    }
  }
  return ['anthropic', 'openai', 'google', 'deepseek'];
}

const DEFAULT_FALLBACK_CONFIG: FallbackConfig = {
  chain: getDefaultChain(),
  maxRetries: 3,
  retryDelayMs: 1000,
};

export class FallbackChain {
  private config: FallbackConfig;
  private failureCount: Map<ProviderName, number> = new Map();

  constructor(config: Partial<FallbackConfig> = {}) {
    this.config = { ...DEFAULT_FALLBACK_CONFIG, ...config };
  }

  async generateCode(prompt: string, context: GenerationContext): Promise<CodeResult & { provider: string }> {
    return this.executeWithFallback(
      async (provider) => {
        const result = await provider.generateCode(prompt, context);
        return { ...result, provider: provider.name };
      },
      'code_generation'
    );
  }

  async analyzeIntent(text: string): Promise<IntentResult & { provider: string }> {
    return this.executeWithFallback(
      async (provider) => {
        const result = await provider.analyzeIntent(text);
        return { ...result, provider: provider.name };
      },
      'intent_analysis'
    );
  }

  async enrichMath(concept: string): Promise<MathEnrichment & { provider: string }> {
    return this.executeWithFallback(
      async (provider) => {
        const result = await provider.enrichMath(concept);
        return { ...result, provider: provider.name };
      },
      'math_enrichment'
    );
  }

  private async executeWithFallback<T>(
    fn: (provider: LLMProvider) => Promise<T>,
    taskType: string
  ): Promise<T> {
    const errors: Error[] = [];

    for (const providerName of this.config.chain) {
      const provider = providerRouter.getProviderByName(providerName);
      if (!provider) continue;

      const failures = this.failureCount.get(providerName) || 0;
      if (failures >= this.config.maxRetries) {
        continue;
      }

      try {
        const result = await fn(provider);
        this.failureCount.set(providerName, 0);
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        errors.push(err);

        this.failureCount.set(providerName, failures + 1);

        const nextProvider = this.getNextAvailableProvider(providerName);
        if (nextProvider && this.config.onFallback) {
          this.config.onFallback(providerName, nextProvider, err);
        }

        if (this.config.retryDelayMs > 0) {
          await this.delay(this.config.retryDelayMs);
        }
      }
    }

    throw new Error(
      `All providers failed for ${taskType}. Errors: ${errors.map((e) => e.message).join('; ')}`
    );
  }

  private getNextAvailableProvider(current: ProviderName): ProviderName | null {
    const currentIndex = this.config.chain.indexOf(current);
    for (let i = currentIndex + 1; i < this.config.chain.length; i++) {
      const provider = providerRouter.getProviderByName(this.config.chain[i]);
      if (provider) {
        return this.config.chain[i];
      }
    }
    return null;
  }

  resetFailureCounts(): void {
    this.failureCount.clear();
  }

  getFailureCounts(): Record<ProviderName, number> {
    const result: Record<string, number> = {};
    for (const [name, count] of this.failureCount.entries()) {
      result[name] = count;
    }
    return result as Record<ProviderName, number>;
  }

  updateConfig(config: Partial<FallbackConfig>): void {
    this.config = { ...this.config, ...config };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const fallbackChain = new FallbackChain();

export async function generateCodeWithFallback(
  prompt: string,
  context: GenerationContext
): Promise<CodeResult & { provider: string }> {
  return fallbackChain.generateCode(prompt, context);
}

export async function analyzeIntentWithFallback(text: string): Promise<IntentResult & { provider: string }> {
  return fallbackChain.analyzeIntent(text);
}

export async function enrichMathWithFallback(concept: string): Promise<MathEnrichment & { provider: string }> {
  return fallbackChain.enrichMath(concept);
}

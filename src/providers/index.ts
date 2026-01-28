
export {
  LLMProvider,
  BaseLLMProvider,
  GenerationContext,
  CodeResult,
  IntentResult,
  MathEnrichment,
  ProviderCapability,
  ProviderConfig,
} from './base-provider';

export { OpenAIProvider, openaiProvider } from './openai-provider';
export { AnthropicProvider, anthropicProvider } from './anthropic-provider';
export { GoogleProvider, googleProvider } from './google-provider';
export { DeepSeekProvider, deepseekProvider } from './deepseek-provider';

export {
  ProviderRouter,
  providerRouter,
  getDefaultProvider,
  isAnyProviderAvailable,
  TaskType,
  ProviderName,
} from './provider-router';

export {
  FallbackChain,
  fallbackChain,
  generateCodeWithFallback,
  analyzeIntentWithFallback,
  enrichMathWithFallback,
} from './fallback-chain';

export function getProviderStatus(): Record<string, boolean> {
  return {
    openai: openaiProvider.isAvailable(),
    anthropic: anthropicProvider.isAvailable(),
    google: googleProvider.isAvailable(),
    deepseek: deepseekProvider.isAvailable(),
  };
}

export function getProviderSummary(): {
  available: string[];
  unavailable: string[];
  default: string | null;
} {
  const status = getProviderStatus();
  const available = Object.entries(status)
    .filter(([, v]) => v)
    .map(([k]) => k);
  const unavailable = Object.entries(status)
    .filter(([, v]) => !v)
    .map(([k]) => k);

  const defaultProvider = getDefaultProvider();

  return {
    available,
    unavailable,
    default: defaultProvider?.name || null,
  };
}

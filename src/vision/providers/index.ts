
export { openaiVisionProvider, isOpenAIVisionAvailable } from './openai-vision';
export { anthropicVisionProvider, isAnthropicVisionAvailable } from './anthropic-vision';
export { googleVisionProvider, isGoogleVisionAvailable } from './google-vision';

import { openaiVisionProvider } from './openai-vision';
import { anthropicVisionProvider } from './anthropic-vision';
import { googleVisionProvider } from './google-vision';
import type { VisionProvider, VisionProviderInterface } from '../types';

export function getVisionProvider(name?: VisionProvider): VisionProviderInterface | null {
  if (name) {
    switch (name) {
      case 'openai':
        return openaiVisionProvider.isAvailable() ? openaiVisionProvider : null;
      case 'anthropic':
        return anthropicVisionProvider.isAvailable() ? anthropicVisionProvider : null;
      case 'google':
        return googleVisionProvider.isAvailable() ? googleVisionProvider : null;
    }
  }

  if (openaiVisionProvider.isAvailable()) return openaiVisionProvider;
  if (anthropicVisionProvider.isAvailable()) return anthropicVisionProvider;
  if (googleVisionProvider.isAvailable()) return googleVisionProvider;

  return null;
}

export function getAvailableProviders(): VisionProviderInterface[] {
  const providers: VisionProviderInterface[] = [];

  if (openaiVisionProvider.isAvailable()) providers.push(openaiVisionProvider);
  if (anthropicVisionProvider.isAvailable()) providers.push(anthropicVisionProvider);
  if (googleVisionProvider.isAvailable()) providers.push(googleVisionProvider);

  return providers;
}

export function isVisionAvailable(): boolean {
  return getVisionProvider() !== null;
}

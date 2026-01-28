
import { z } from 'zod';
import type { EventConfig, Handlers } from 'motia';
import { parseDiagram, isDiagramParsingAvailable, generateEnhancedPrompt } from './diagram-parser';
import type { ImageUploadedEvent, ImageAnalyzedEvent } from './types';
import type { StylePreset } from '../types/nlu.types';

const inputSchema = z.object({
  jobId: z.string(),
  imageData: z.string(),
  mimeType: z.enum(['image/png', 'image/jpeg', 'image/gif', 'image/webp']),
  filename: z.string().optional(),
  prompt: z.string().optional(),
  quality: z.enum(['low', 'medium', 'high']).default('low'),
  style: z.enum(['3blue1brown', 'minimalist', 'playful', 'corporate', 'neon']).optional(),
  provider: z.enum(['openai', 'anthropic', 'google']).optional(),
  timestamp: z.string(),
});

export const config: EventConfig = {
  type: 'event',
  name: 'ImageAnalyzer',
  description: 'Analyze uploaded images for diagram-to-animation conversion',
  subscribes: ['image.uploaded'],
  emits: ['image.analyzed', 'animation.requested'],
  input: inputSchema as any,
};

export const handler: Handlers['ImageAnalyzer'] = async (input, { emit, logger }) => {
  const event = inputSchema.parse(input) as ImageUploadedEvent;
  const { jobId, imageData, mimeType, prompt, quality, style, provider } = event;

  logger.info('Starting image analysis', {
    jobId,
    mimeType,
    hasPrompt: !!prompt,
    provider: provider || 'auto',
    imageSize: Math.round(imageData.length / 1024) + 'KB',
  });

  if (!isDiagramParsingAvailable()) {
    logger.error('No vision provider available', { jobId });
    throw new Error('Image analysis is not available - no vision provider configured');
  }

  try {
    const analysis = await parseDiagram(event);

    logger.info('Image analysis complete', {
      jobId,
      shapesFound: analysis.shapes.length,
      textFound: analysis.text.length,
      equationsFound: analysis.equations.length,
      suggestedAnimation: analysis.suggestedAnimation,
      suggestedIntent: analysis.suggestedIntent,
      confidence: analysis.confidence.toFixed(2),
      processingTime: analysis.metadata.processingTime + 'ms',
    });

    const enhancedPrompt = generateEnhancedPrompt(analysis, prompt);

    const finalStyle: StylePreset = style || analysis.suggestedStyle;

    const analyzedEvent: ImageAnalyzedEvent = {
      jobId,
      analysis,
      originalPrompt: prompt,
      enhancedPrompt,
      quality,
      style: finalStyle,
      timestamp: new Date().toISOString(),
    };

    await emit({
      topic: 'image.analyzed',
      data: analyzedEvent,
    });

    await emit({
      topic: 'animation.requested',
      data: {
        jobId,
        concept: enhancedPrompt,
        quality,
        style: finalStyle,
        useNLU: true,
        forceRefresh: true,
        timestamp: new Date().toISOString(),
        imageAnalysis: {
          shapes: analysis.shapes.length,
          equations: analysis.equations.length,
          suggestedIntent: analysis.suggestedIntent,
          animationSequence: analysis.animationSequence,
        },
      },
    });

    logger.info('Image analysis events emitted', {
      jobId,
      enhancedPromptLength: enhancedPrompt.length,
      style: finalStyle,
    });
  } catch (error) {
    logger.error('Image analysis failed', {
      jobId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw error;
  }
};

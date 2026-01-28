
import { v4 as uuidv4 } from 'uuid';
import type {
  DiagramAnalysis,
  Shape,
  TextElement,
  Relationship,
  AnimationSuggestion,
  VisionProvider,
  ImageUploadedEvent,
} from './types';
import type { Intent, StylePreset } from '../types/nlu.types';
import { getVisionProvider, isVisionAvailable } from './providers';
import { extractText, isOCRAvailable } from './ocr-engine';
import {
  sortShapesByPosition,
  groupShapesByProximity,
  isShapeInside,
  calculateDistance,
} from './shape-detector';

const ANIMATION_TO_INTENT: Record<string, Intent> = {
  step_by_step: 'DEMONSTRATE_PROCESS',
  transform: 'TRANSFORM_OBJECT',
  graph: 'GRAPH_FUNCTION',
  kinetic_text: 'KINETIC_TEXT',
  scene: 'CREATE_SCENE',
  proof: 'GEOMETRIC_PROOF',
  explain: 'EXPLAIN_CONCEPT',
  compare: 'COMPARE_CONTRAST',
  math: 'VISUALIZE_MATH',
};

function inferRelationships(shapes: Shape[], text: TextElement[]): Relationship[] {
  const relationships: Relationship[] = [];

  for (let i = 0; i < shapes.length; i++) {
    for (let j = 0; j < shapes.length; j++) {
      if (i === j) continue;

      if (isShapeInside(shapes[i], shapes[j])) {
        relationships.push({
          id: `rel_${uuidv4().slice(0, 8)}`,
          type: 'inside',
          sourceId: shapes[i].id,
          targetId: shapes[j].id,
          confidence: 0.9,
        });
      }
    }
  }

  const arrows = shapes.filter((s) => s.type === 'arrow');
  const nonArrows = shapes.filter((s) => s.type !== 'arrow');

  for (const arrow of arrows) {
    if (!arrow.direction) continue;

    let closestTarget: Shape | null = null;
    let minDist = Infinity;

    for (const shape of nonArrows) {
      const dist = calculateDistance(
        { ...arrow, center: arrow.direction.to },
        shape
      );
      if (dist < minDist && dist < 0.15) {
        minDist = dist;
        closestTarget = shape;
      }
    }

    if (closestTarget) {
      relationships.push({
        id: `rel_${uuidv4().slice(0, 8)}`,
        type: 'points_to',
        sourceId: arrow.id,
        targetId: closestTarget.id,
        confidence: 0.85,
      });
    }
  }

  for (const textEl of text) {
    let closestShape: Shape | null = null;
    let minDist = Infinity;

    for (const shape of shapes) {
      const dist = calculateDistance(
        { ...textEl, boundingBox: textEl.boundingBox } as any,
        shape
      );
      if (dist < minDist && dist < 0.1) {
        minDist = dist;
        closestShape = shape;
      }
    }

    if (closestShape) {
      textEl.isLabel = true;
      textEl.labelFor = closestShape.id;
      closestShape.label = textEl.text;
    }
  }

  return relationships;
}

function generateAnimationSequence(
  shapes: Shape[],
  text: TextElement[],
  relationships: Relationship[],
  suggestedAnimation: string
): AnimationSuggestion[] {
  const sequence: AnimationSuggestion[] = [];
  let step = 1;

  const sortedShapes = sortShapesByPosition(shapes);
  const groups = groupShapesByProximity(sortedShapes);

  if (suggestedAnimation === 'step_by_step') {
    for (const group of groups) {
      sequence.push({
        step: step++,
        action: 'create',
        targetIds: group.map((s) => s.id),
        description: `Create ${group.map((s) => s.type).join(', ')}`,
        duration: 1,
      });

      const groupLabels = text.filter((t) =>
        group.some((s) => t.labelFor === s.id)
      );
      if (groupLabels.length > 0) {
        sequence.push({
          step: step++,
          action: 'write',
          targetIds: groupLabels.map((t) => t.id),
          description: `Show labels: ${groupLabels.map((t) => t.text).join(', ')}`,
          duration: 0.5,
        });
      }
    }
  } else if (suggestedAnimation === 'transform') {
    const transforms = relationships.filter((r) => r.type === 'points_to');

    for (const transform of transforms) {
      sequence.push({
        step: step++,
        action: 'create',
        targetIds: [transform.sourceId],
        description: 'Show source element',
        duration: 1,
      });
      sequence.push({
        step: step++,
        action: 'transform',
        targetIds: [transform.sourceId, transform.targetId],
        description: 'Transform to target',
        duration: 1.5,
      });
    }
  } else {
    if (shapes.length > 0) {
      sequence.push({
        step: step++,
        action: 'create',
        targetIds: shapes.map((s) => s.id),
        description: 'Create all shapes',
        duration: 1.5,
      });
    }

    if (text.length > 0) {
      sequence.push({
        step: step++,
        action: 'write',
        targetIds: text.map((t) => t.id),
        description: 'Write all text',
        duration: 1,
      });
    }
  }

  const importantShapes = shapes.filter((s) => s.label);
  if (importantShapes.length > 0) {
    sequence.push({
      step: step++,
      action: 'highlight',
      targetIds: importantShapes.map((s) => s.id),
      description: 'Highlight labeled elements',
      duration: 1,
    });
  }

  return sequence;
}

function suggestStyle(shapes: Shape[], equations: string[]): StylePreset {
  if (equations.length > 2) {
    return '3blue1brown';
  }

  const brightColors = shapes.filter(
    (s) => s.color && ['#ff', '#00ff', '#ffff'].some((c) => s.color!.toLowerCase().includes(c))
  );
  if (brightColors.length > shapes.length / 2) {
    return 'playful';
  }

  return '3blue1brown';
}

export async function parseDiagram(
  event: ImageUploadedEvent
): Promise<DiagramAnalysis> {
  const startTime = Date.now();
  const { imageData, mimeType, prompt, provider: preferredProvider, style } = event;

  const provider = getVisionProvider(preferredProvider);
  if (!provider) {
    throw new Error('No vision provider available');
  }

  const visionResult = await provider.analyzeImage(imageData, mimeType, prompt);

  let ocrResult = null;
  if (isOCRAvailable() && visionResult.text.length === 0) {
    try {
      ocrResult = await extractText(imageData);
      if (ocrResult.elements.length > 0) {
        visionResult.text.push(...ocrResult.elements);
        visionResult.equations.push(...ocrResult.mathExpressions);
      }
    } catch (error) {
      console.warn('OCR enhancement failed:', error);
    }
  }

  const additionalMath = visionResult.text
    .filter((t) => t.isMath && t.latex && !visionResult.equations.includes(t.latex))
    .map((t) => t.latex!);
  visionResult.equations.push(...additionalMath);

  const relationships = [
    ...visionResult.relationships,
    ...inferRelationships(visionResult.shapes, visionResult.text),
  ];

  const animationSequence = generateAnimationSequence(
    visionResult.shapes,
    visionResult.text,
    relationships,
    visionResult.suggestedAnimation
  );

  const suggestedIntent =
    ANIMATION_TO_INTENT[visionResult.suggestedAnimation] || 'CREATE_SCENE';

  const suggestedStyle = style || suggestStyle(visionResult.shapes, visionResult.equations);

  return {
    shapes: visionResult.shapes,
    text: visionResult.text,
    equations: visionResult.equations,
    relationships,
    suggestedAnimation: visionResult.suggestedAnimation,
    suggestedIntent,
    suggestedStyle,
    confidence: visionResult.confidence,
    description: visionResult.description,
    animationSequence,
    metadata: {
      provider: provider.name,
      processingTime: Date.now() - startTime,
      usedOCR: ocrResult !== null,
      timestamp: new Date().toISOString(),
    },
  };
}

export function isDiagramParsingAvailable(): boolean {
  return isVisionAvailable();
}

export function generateEnhancedPrompt(
  analysis: DiagramAnalysis,
  originalPrompt?: string
): string {
  const parts: string[] = [];

  if (originalPrompt) {
    parts.push(originalPrompt);
    parts.push('');
    parts.push('Based on the uploaded diagram:');
  } else {
    parts.push('Create an animation based on the following diagram:');
  }

  parts.push(`- ${analysis.description}`);

  if (analysis.shapes.length > 0) {
    const shapeList = analysis.shapes
      .map((s) => (s.label ? `${s.type} (${s.label})` : s.type))
      .join(', ');
    parts.push(`- Contains: ${shapeList}`);
  }

  if (analysis.equations.length > 0) {
    parts.push(`- Mathematical expressions: ${analysis.equations.join(', ')}`);
  }

  parts.push(`- Suggested animation style: ${analysis.suggestedAnimation}`);

  return parts.join('\n');
}

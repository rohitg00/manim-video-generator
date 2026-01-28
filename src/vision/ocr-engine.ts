
import type { TextElement, OCRResult } from './types';
import { v4 as uuidv4 } from 'uuid';

let Tesseract: any = null;

try {
  Tesseract = require('tesseract.js');
} catch {
  console.info('Tesseract.js not available, using vision model OCR');
}

const MATH_PATTERNS = [
  { pattern: /(\d+)\s*\/\s*(\d+)/g, latex: (m: RegExpMatchArray) => `\\frac{${m[1]}}{${m[2]}}` },
  { pattern: /(\w+)\^(\d+)/g, latex: (m: RegExpMatchArray) => `${m[1]}^{${m[2]}}` },
  { pattern: /sqrt\(([^)]+)\)/gi, latex: (m: RegExpMatchArray) => `\\sqrt{${m[1]}}` },
  { pattern: /\bpi\b/gi, latex: () => '\\pi' },
  { pattern: /\btheta\b/gi, latex: () => '\\theta' },
  { pattern: /\balpha\b/gi, latex: () => '\\alpha' },
  { pattern: /\bbeta\b/gi, latex: () => '\\beta' },
  { pattern: /\binfinity\b|\binf\b/gi, latex: () => '\\infty' },
  { pattern: /\bsum\b/gi, latex: () => '\\sum' },
  { pattern: /\bintegral\b/gi, latex: () => '\\int' },
  { pattern: />=|≥/g, latex: () => '\\geq' },
  { pattern: /<=|≤/g, latex: () => '\\leq' },
  { pattern: /!=/g, latex: () => '\\neq' },
  { pattern: /\+-|±/g, latex: () => '\\pm' },
];

function isMathematical(text: string): boolean {
  const mathIndicators = [
    /[+\-*/=<>^]/,
    /\d+\s*[+\-*/]\s*\d+/,
    /[a-z]\s*=\s*\d+/i,
    /f\(x\)/i,
    /\bsin\b|\bcos\b|\btan\b/i,
    /\blog\b|\bln\b/i,
    /\bsum\b|\bintegral\b/i,
    /\^2|\^3/,
    /sqrt/i,
    /[αβγδθπ∑∫∞≤≥±]/,
  ];
  return mathIndicators.some((p) => p.test(text));
}

function textToLatex(text: string): string | undefined {
  if (!isMathematical(text)) return undefined;

  let latex = text;
  for (const { pattern, latex: replacer } of MATH_PATTERNS) {
    latex = latex.replace(pattern, (...args) => {
      const match = args as unknown as RegExpMatchArray;
      return replacer(match);
    });
  }

  return latex !== text ? latex : undefined;
}

async function extractWithTesseract(imageData: string): Promise<OCRResult> {
  if (!Tesseract) {
    throw new Error('Tesseract not available');
  }

  const startTime = Date.now();
  const dataUrl = `data:image/png;base64,${imageData}`;

  const result = await Tesseract.recognize(dataUrl, 'eng', {
    logger: () => {},
  });

  const elements: TextElement[] = result.data.words
    .filter((word: any) => word.confidence > 50)
    .map((word: any) => {
      const text = word.text;
      const isMath = isMathematical(text);
      return {
        id: `text_${uuidv4().slice(0, 8)}`,
        text,
        boundingBox: {
          x: word.bbox.x0 / (result.data.width || 1),
          y: word.bbox.y0 / (result.data.height || 1),
          width: (word.bbox.x1 - word.bbox.x0) / (result.data.width || 1),
          height: (word.bbox.y1 - word.bbox.y0) / (result.data.height || 1),
        },
        center: {
          x: (word.bbox.x0 + word.bbox.x1) / 2 / (result.data.width || 1),
          y: (word.bbox.y0 + word.bbox.y1) / 2 / (result.data.height || 1),
        },
        confidence: word.confidence / 100,
        isMath,
        latex: textToLatex(text),
      };
    });

  const mathExpressions = elements
    .filter((e) => e.isMath && e.latex)
    .map((e) => e.latex!);

  return {
    elements,
    fullText: result.data.text,
    mathExpressions,
    confidence: result.data.confidence / 100,
    processingTime: Date.now() - startTime,
  };
}

export async function extractText(imageData: string): Promise<OCRResult> {
  const startTime = Date.now();

  if (Tesseract) {
    try {
      return await extractWithTesseract(imageData);
    } catch (error) {
      console.warn('Tesseract OCR failed, returning empty result:', error);
    }
  }

  return {
    elements: [],
    fullText: '',
    mathExpressions: [],
    confidence: 0,
    processingTime: Date.now() - startTime,
  };
}

export function isOCRAvailable(): boolean {
  return Tesseract !== null;
}

export function detectMathExpressions(text: string): string[] {
  const expressions: string[] = [];
  const lines = text.split('\n');

  for (const line of lines) {
    if (isMathematical(line)) {
      const latex = textToLatex(line.trim());
      if (latex) {
        expressions.push(latex);
      }
    }
  }

  return expressions;
}

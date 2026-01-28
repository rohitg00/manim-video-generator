/**
 * OpenAI Client Service
 * Handles AI-powered Manim code generation
 * Using GPT-4.1 nano - OpenAI's fastest model (95.9 tokens/sec, <5s to first token)
 */

import OpenAI from 'openai'
import crypto from 'crypto'

const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-nano'

/**
 * AI Temperature setting for code generation
 * 0.7 provides good balance between creativity and coherence
 * Higher values (0.7-0.9) produce more varied, unique outputs
 */
const AI_TEMPERATURE = parseFloat(process.env.AI_TEMPERATURE || '0.7')

/**
 * Max tokens for generation - allows for more complex animations
 */
const MAX_TOKENS = parseInt(process.env.AI_MAX_TOKENS || '1200', 10)

let openaiClient: OpenAI | null = null

try {
  openaiClient = new OpenAI()
} catch (error) {
  console.warn('OpenAI client initialization failed:', error)
}

/**
 * Generate a unique seed based on concept and timestamp
 * This helps ensure different outputs for similar concepts
 */
function generateUniqueSeed(concept: string): string {
  const timestamp = Date.now()
  const randomPart = crypto.randomBytes(4).toString('hex')
  return crypto.createHash('md5').update(`${concept}-${timestamp}-${randomPart}`).digest('hex').slice(0, 8)
}

/**
 * Generate an optimized prompt for unique Manim code generation
 * Includes variation instructions to avoid repetitive outputs
 */
function generateManimPrompt(concept: string, seed: string): string {
  return `Create a UNIQUE Manim animation for: ${concept}

Generation seed: ${seed} (use this to inspire creative variations)

Requirements:
- MainScene class (use ThreeDScene for 3D concepts)
- MathTex for equations with LaTeX
- Clear step-by-step visualization
- Color-coded elements with VARIED color choices
- Smooth animations with self.wait() pauses
- Creative positioning and animation timing
- Add unique visual elements that enhance understanding

IMPORTANT: Generate a FRESH, UNIQUE animation. Vary:
- Animation timings and sequences
- Color schemes (pick different colors each time)
- Object positions and arrangements
- Text labels and explanations
- Visual effects and transitions

Output ONLY valid Python code, no markdown.`
}

/**
 * Extract code from AI response (handles markdown code blocks)
 */
function extractCodeFromResponse(text: string): string {
  if (!text) return ''

  // Try fenced code blocks with language
  const match = text.match(/```(?:python)?\n([\s\S]*?)```/i)
  if (match) {
    return match[1].trim()
  }

  return text.trim()
}

/**
 * Generate Manim code using OpenAI
 * Uses higher temperature for varied outputs and unique seed for each request
 */
export async function generateAIManimCode(concept: string): Promise<string> {
  if (!openaiClient) {
    console.warn('OpenAI client not available')
    return ''
  }

  try {
    const seed = generateUniqueSeed(concept)

    const systemPrompt = `You are a Manim expert creating unique mathematical animations.
Each animation should be visually distinct with creative color choices, positioning, and timing.
Output only valid Python code, no markdown or explanations.
Always use the MainScene class name.`

    const userPrompt = generateManimPrompt(concept, seed)

    const response = await openaiClient.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: AI_TEMPERATURE,
      max_tokens: MAX_TOKENS
    })

    const content = response.choices[0]?.message?.content || ''
    return extractCodeFromResponse(content)
  } catch (error) {
    console.error('AI generation failed:', error)
    return ''
  }
}

/**
 * Check if OpenAI client is available
 */
export function isOpenAIAvailable(): boolean {
  return openaiClient !== null
}

/**
 * OpenAI Client Service
 * Handles AI-powered Manim code generation
 * Using GPT-4.1 nano - OpenAI's fastest model (95.9 tokens/sec, <5s to first token)
 */

import OpenAI from 'openai'

const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-nano'

let openaiClient: OpenAI | null = null

try {
  openaiClient = new OpenAI()
} catch (error) {
  console.warn('OpenAI client initialization failed:', error)
}

/**
 * Generate an optimized prompt for GPT-4.1 nano to create Manim code
 * Concise format optimized for speed while maintaining quality
 */
function generateManimPrompt(concept: string): string {
  return `Create Manim animation for: ${concept}

Requirements:
- MainScene class (use ThreeDScene for 3D concepts)
- MathTex for equations with LaTeX
- Clear step-by-step visualization
- Color-coded elements
- Smooth animations with self.wait() pauses

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
 */
export async function generateAIManimCode(concept: string): Promise<string> {
  if (!openaiClient) {
    console.warn('OpenAI client not available')
    return ''
  }

  try {
    const systemPrompt = `Manim expert. Output only valid Python code, no markdown.`

    const userPrompt = generateManimPrompt(concept)

    const response = await openaiClient.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
      max_tokens: 800
    })

    const content = response.choices[0]?.message?.content || ''
    return extractCodeFromResponse(content)
  } catch (error) {
    console.error('AI generation failed:', error)
    return ''
  }
}

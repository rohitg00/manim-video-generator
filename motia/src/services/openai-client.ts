/**
 * OpenAI Client Service
 * Handles AI-powered Manim code generation
 */

import OpenAI from 'openai'

const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'

let openaiClient: OpenAI | null = null

try {
  openaiClient = new OpenAI()
} catch (error) {
  console.warn('OpenAI client initialization failed:', error)
}

/**
 * Generate a detailed prompt for GPT to create Manim code
 */
function generateManimPrompt(concept: string): string {
  return `Create a detailed Manim animation to demonstrate and explain: ${concept}

Create a Scene class named MainScene that follows these requirements:

1. Scene Setup:
   - For 3D concepts: Use ThreeDScene with appropriate camera angles
   - For 2D concepts: Use Scene with NumberPlane when relevant
   - Add title and clear mathematical labels

2. Mathematical Elements:
   - Use MathTex for equations with proper LaTeX syntax
   - Include step-by-step derivations when showing formulas
   - Add mathematical annotations and explanations

3. Visual Elements:
   - Create clear geometric shapes and diagrams
   - Use color coding to highlight important parts
   - Add arrows or lines to show relationships

4. Animation Flow:
   - Break down complex concepts into simple steps
   - Use smooth transitions between steps
   - Add pauses (self.wait()) at key moments

5. Code Structure:
   - Import required Manim modules
   - Use proper class inheritance
   - Define clear animation sequences

Only output valid Manim Python code without any additional text or markdown.`
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
    const systemPrompt = `You are a senior Manim expert. Generate only valid Python code for Manim.
Create a scene class named MainScene (or ThreeDScene when appropriate).
Use MathTex for any mathematical expressions. Do not include markdown.`

    const userPrompt = generateManimPrompt(concept)

    const response = await openaiClient.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
      max_tokens: 1200
    })

    const content = response.choices[0]?.message?.content || ''
    return extractCodeFromResponse(content)
  } catch (error) {
    console.error('AI generation failed:', error)
    return ''
  }
}

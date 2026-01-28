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
 * Includes comprehensive ManimCE best practices to avoid common errors
 */
function generateManimPrompt(concept: string, seed: string): string {
  return `Create a Manim Community Edition animation for: ${concept}

Generation seed: ${seed}

═══════════════════════════════════════════════════════════════════════════════
STRICT REQUIREMENTS (Manim CE v0.18+)
═══════════════════════════════════════════════════════════════════════════════

IMPORTS & CLASS:
- Start with: from manim import *
- For 3D scenes add: import numpy as np
- Class MUST be: class MainScene(Scene):
- For 3D: class MainScene(ThreeDScene):
- For camera zoom/pan: class MainScene(MovingCameraScene):

ANIMATIONS (use these exact names):
- Create() - draw shapes/lines
- Write() - write text/equations
- FadeIn() / FadeOut() - fade objects
- Transform() - morph one object to another
- ReplacementTransform() - replace and morph
- Indicate() - highlight briefly
- MoveAlongPath() - move along a path

TEXT & MATH:
- Text("plain text") - for regular text
- MathTex(r"\\frac{a}{b}") - for LaTeX math (use raw strings with r"")
- Tex(r"Text with $math$") - for mixed text and math

POSITIONING:
- .to_edge(UP/DOWN/LEFT/RIGHT) - move to screen edge
- .to_corner(UL/UR/DL/DR) - move to corner
- .next_to(obj, direction) - position relative to another object
- .move_to(point) - move to specific point
- .shift(direction * amount) - shift by vector

COLORS (use constants, not hex):
- BLUE, RED, GREEN, YELLOW, WHITE, PURPLE, ORANGE, TEAL, PINK
- BLUE_A, BLUE_B, BLUE_C, BLUE_D, BLUE_E (color variants)

═══════════════════════════════════════════════════════════════════════════════
COMMON ERRORS TO AVOID
═══════════════════════════════════════════════════════════════════════════════

DEPRECATED (will break):
✗ ShowCreation() → ✓ Create()
✗ TextMobject() → ✓ Text()
✗ TexMobject() → ✓ MathTex()
✗ FadeInFrom() → ✓ FadeIn(obj, shift=direction)
✗ arrange_submobjects() → ✓ arrange()
✗ GrowFromCenter() → ✓ Create() or GrowFromPoint()

INVALID PATTERNS:
✗ self.camera.frame (requires MovingCameraScene, not Scene)
✗ to_edge(ORIGIN) → ✓ move_to(ORIGIN)
✗ dash_ratio=0.5 (parameter doesn't exist)
✗ run_time=0 (must be positive)
✗ rate_func=None (remove it if not needed)
✗ direction="UP" → ✓ direction=UP (no quotes)

3D REQUIREMENTS:
✗ Surface() in Scene → ✓ Surface() in ThreeDScene
✗ set_camera_orientation() in Scene → ✓ only in ThreeDScene
✗ phi=75 → ✓ phi=75 * DEGREES

═══════════════════════════════════════════════════════════════════════════════
EXAMPLE PATTERNS
═══════════════════════════════════════════════════════════════════════════════

Basic 2D Scene:
\`\`\`
from manim import *

class MainScene(Scene):
    def construct(self):
        circle = Circle(color=BLUE, fill_opacity=0.5)
        self.play(Create(circle))
        self.wait(1)
\`\`\`

Math Equation:
\`\`\`
from manim import *

class MainScene(Scene):
    def construct(self):
        eq = MathTex(r"E = mc^2", color=YELLOW)
        eq.scale(2)
        self.play(Write(eq))
        self.wait(1)
\`\`\`

3D Surface:
\`\`\`
from manim import *
import numpy as np

class MainScene(ThreeDScene):
    def construct(self):
        self.set_camera_orientation(phi=75 * DEGREES, theta=30 * DEGREES)
        axes = ThreeDAxes()
        surface = Surface(
            lambda u, v: axes.c2p(u, v, np.sin(u) * np.cos(v)),
            u_range=[-3, 3], v_range=[-3, 3]
        )
        self.play(Create(axes), Create(surface))
        self.wait(1)
\`\`\`

ValueTracker Animation:
\`\`\`
from manim import *

class MainScene(Scene):
    def construct(self):
        tracker = ValueTracker(0)
        dot = always_redraw(lambda: Dot(point=[tracker.get_value(), 0, 0]))
        self.add(dot)
        self.play(tracker.animate.set_value(3), run_time=2)
\`\`\`

═══════════════════════════════════════════════════════════════════════════════

Output ONLY the raw Python code. No markdown, no backticks, no explanations.`
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

    const systemPrompt = `You are a Manim Community Edition v0.18+ expert. You generate clean, working Python code for mathematical animations.

CRITICAL RULES:
1. Output ONLY raw Python code - no markdown, no backticks, no explanations
2. Always use 'class MainScene(Scene):' as the class name (or ThreeDScene for 3D)
3. Start with 'from manim import *'
4. Use only standard Manim CE features - NO ManimGL features
5. Never use self.camera.frame (requires MovingCameraScene)
6. Use Create() not ShowCreation(), MathTex() not TexMobject()
7. For 3D: use ThreeDScene, import numpy as np, angles need * DEGREES
8. Always include self.wait() pauses for readable animations
9. Use color constants (BLUE, RED) not hex strings ("#FF0000")`

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

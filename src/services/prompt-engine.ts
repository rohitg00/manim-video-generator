/**
 * Multi-Stage Prompt Engine
 * Generates high-quality Manim code through staged prompting
 *
 * Stages:
 * 1. Scene Planning - High-level structure
 * 2. Animation Choreography - Timing and transitions
 * 3. Code Generation - Full Manim Python code
 * 4. Validation - Syntax and API correctness
 */

import OpenAI from 'openai'
import type { SceneGraph, Act, StyleConfig } from '../types/scene.types'
import type { NLUResult, StylePreset } from '../types/nlu.types'
import { generateStylePreamble, getAnimationRecommendations } from './style-presets'

const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-nano'
const AI_TEMPERATURE = parseFloat(process.env.AI_TEMPERATURE || '0.7')

let openaiClient: OpenAI | null = null

try {
  openaiClient = new OpenAI()
} catch (error) {
  console.warn('OpenAI client initialization failed for prompt engine:', error)
}

/**
 * Generation result from each stage
 */
interface StageResult {
  stage: string
  output: string
  success: boolean
  error?: string
}

/**
 * Full generation result
 */
export interface GenerationResult {
  code: string
  stages: StageResult[]
  sceneGraph: SceneGraph
  totalTime: number
  success: boolean
}

/**
 * Main entry point: Generate Manim code from scene graph
 */
export async function generateManimCode(
  sceneGraph: SceneGraph,
  nluResult: NLUResult
): Promise<GenerationResult> {
  const startTime = Date.now()
  const stages: StageResult[] = []

  // Stage 1: Scene Planning
  const planResult = await planScene(sceneGraph, nluResult)
  stages.push(planResult)

  if (!planResult.success) {
    return {
      code: generateFallbackCode(sceneGraph),
      stages,
      sceneGraph,
      totalTime: Date.now() - startTime,
      success: false,
    }
  }

  // Stage 2: Animation Choreography
  const choreographyResult = await choreographAnimations(sceneGraph, planResult.output)
  stages.push(choreographyResult)

  // Stage 3: Code Generation
  const codeResult = await generateCode(sceneGraph, nluResult, planResult.output, choreographyResult.output)
  stages.push(codeResult)

  if (!codeResult.success || !codeResult.output) {
    return {
      code: generateFallbackCode(sceneGraph),
      stages,
      sceneGraph,
      totalTime: Date.now() - startTime,
      success: false,
    }
  }

  // Stage 4: Validation and Fixing
  const validatedCode = await validateAndFix(codeResult.output, sceneGraph)
  stages.push(validatedCode)

  return {
    code: validatedCode.output || codeResult.output,
    stages,
    sceneGraph,
    totalTime: Date.now() - startTime,
    success: validatedCode.success,
  }
}

/**
 * Stage 1: Plan the scene structure
 */
async function planScene(sceneGraph: SceneGraph, nluResult: NLUResult): Promise<StageResult> {
  if (!openaiClient) {
    return { stage: 'planning', output: '', success: false, error: 'OpenAI not available' }
  }

  try {
    const prompt = `You are planning a Manim animation. Create a high-level scene plan.

User Request: ${nluResult.rawInterpretation || 'Create an animation'}
Intent: ${nluResult.intent}
Skill: ${nluResult.suggestedSkill}
Style: ${sceneGraph.style.preset}
Duration: ~${sceneGraph.totalDuration} seconds
Is 3D: ${sceneGraph.is3D}

Acts to include:
${sceneGraph.acts.map((act, i) => `${i + 1}. ${act.title} (${act.duration}s)`).join('\n')}

Entities detected:
- Math: ${nluResult.entities.mathExpressions.join(', ') || 'none'}
- Objects: ${nluResult.entities.objects.join(', ') || 'none'}
- Colors: ${nluResult.entities.colors.join(', ') || 'use style defaults'}

Create a brief scene plan describing:
1. What visual elements to create
2. The flow of the animation
3. Key moments to emphasize
4. How to conclude

Keep it concise (150 words max).`

    const response = await openaiClient.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: 'You are a Manim animation planner. Be concise and specific.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 300,
    })

    return {
      stage: 'planning',
      output: response.choices[0]?.message?.content || '',
      success: true,
    }
  } catch (error) {
    return {
      stage: 'planning',
      output: '',
      success: false,
      error: String(error),
    }
  }
}

/**
 * Stage 2: Choreograph animations with timing
 */
async function choreographAnimations(sceneGraph: SceneGraph, scenePlan: string): Promise<StageResult> {
  if (!openaiClient) {
    return { stage: 'choreography', output: '', success: false, error: 'OpenAI not available' }
  }

  try {
    const animations = getAnimationRecommendations(sceneGraph.style.preset)

    const prompt = `Based on this scene plan, describe the animation choreography:

Scene Plan:
${scenePlan}

Style preferences:
- Preferred create animation: ${animations.preferredCreate}
- Preferred fade: ${animations.preferredFade}
- Preferred transform: ${animations.preferredTransform}
- Preferred emphasis: ${animations.preferredEmphasis}

For each act, specify:
1. When elements appear (timing)
2. What animations to use
3. Transition to next act

Format as a numbered list of animation steps with timing hints.
Keep it under 200 words.`

    const response = await openaiClient.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: 'You are a Manim animation choreographer. Specify precise animation sequences.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 400,
    })

    return {
      stage: 'choreography',
      output: response.choices[0]?.message?.content || '',
      success: true,
    }
  } catch (error) {
    return {
      stage: 'choreography',
      output: '',
      success: false,
      error: String(error),
    }
  }
}

/**
 * Stage 3: Generate full Manim code
 */
async function generateCode(
  sceneGraph: SceneGraph,
  nluResult: NLUResult,
  scenePlan: string,
  choreography: string
): Promise<StageResult> {
  if (!openaiClient) {
    return { stage: 'generation', output: '', success: false, error: 'OpenAI not available' }
  }

  try {
    const styleConfig = sceneGraph.style
    const sceneClass = sceneGraph.is3D ? 'ThreeDScene' : (sceneGraph.useMovingCamera ? 'MovingCameraScene' : 'Scene')

    const systemPrompt = `You are an expert Manim Community Edition v0.18+ programmer creating beautiful mathematical animations.

CRITICAL REQUIREMENTS:
- Output ONLY valid Python code, no markdown, no explanations
- Class MUST be named: class MainScene(Scene): (or ThreeDScene for 3D)
- Start with: from manim import *
- For 3D: add "import numpy as np" and use ThreeDScene
- Use ONLY these animation names: Create(), Write(), FadeIn(), FadeOut(), Transform(), ReplacementTransform()
- NEVER use: ShowCreation(), TextMobject(), TexMobject(), FadeInFrom(), GrowFromCenter()
- NEVER use self.camera.frame (requires MovingCameraScene)
- Use MathTex(r"\\frac{a}{b}") for math, Text("text") for plain text
- Use color constants (BLUE, RED, YELLOW) not hex strings
- For 3D cameras: phi=75 * DEGREES, theta=30 * DEGREES (include * DEGREES)
- Always add self.wait() pauses between animations`

    const userPrompt = `Create a complete Manim animation based on:

USER REQUEST: ${nluResult.rawInterpretation || 'Create animation'}

SCENE PLAN:
${scenePlan}

CHOREOGRAPHY:
${choreography}

TECHNICAL REQUIREMENTS:
- Scene class: ${sceneClass}
- Main class name: MainScene
- Background color: ${styleConfig.backgroundColor}
- Primary color: ${styleConfig.primaryColor}
- Secondary color: ${styleConfig.secondaryColor}
- Accent color: ${styleConfig.accentColor}
- Text color: ${styleConfig.textColor}
- Duration: ~${sceneGraph.totalDuration} seconds

${nluResult.hasLatex ? 'MATH CONTENT: ' + nluResult.entities.mathExpressions.join(', ') : ''}

IMPORTANT:
- Include all necessary imports from manim
- Set config.background_color at the start
- Use self.play() for all animations
- Add self.wait() pauses between major sections
- Use descriptive variable names
- Include color coding for visual clarity

Generate the complete Python code:`

    const response = await openaiClient.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: AI_TEMPERATURE,
      max_tokens: 2000,
    })

    const code = extractCode(response.choices[0]?.message?.content || '')

    return {
      stage: 'generation',
      output: code,
      success: code.length > 0,
    }
  } catch (error) {
    return {
      stage: 'generation',
      output: '',
      success: false,
      error: String(error),
    }
  }
}

/**
 * Stage 4: Validate and fix common issues
 * Enhanced with ManimCE best practices
 */
async function validateAndFix(code: string, sceneGraph: SceneGraph): Promise<StageResult> {
  let fixedCode = code

  // Fix 1: Ensure correct imports
  if (!fixedCode.includes('from manim import')) {
    fixedCode = 'from manim import *\n\n' + fixedCode
  }

  // Fix 2: Add numpy import for 3D scenes
  if (sceneGraph.is3D && !fixedCode.includes('import numpy')) {
    fixedCode = fixedCode.replace(
      /from manim import \*/,
      'from manim import *\nimport numpy as np'
    )
  }

  // Fix 3: Ensure correct scene class for 3D
  if (sceneGraph.is3D && !fixedCode.includes('ThreeDScene')) {
    fixedCode = fixedCode.replace(
      /class\s+(\w+)\s*\(\s*Scene\s*\)/g,
      'class $1(ThreeDScene)'
    )
  }

  // Fix 4: Ensure MainScene class exists
  if (!fixedCode.includes('class MainScene')) {
    fixedCode = fixedCode.replace(
      /class\s+(\w+)\s*\(\s*(Scene|ThreeDScene|MovingCameraScene)\s*\)/,
      'class MainScene($2)'
    )
  }

  // Fix 5: Ensure construct method exists
  if (!fixedCode.includes('def construct(self)')) {
    if (fixedCode.includes('class MainScene')) {
      fixedCode = fixedCode.replace(
        /class MainScene\([^)]+\):\s*\n/,
        'class MainScene(Scene):\n    def construct(self):\n'
      )
    }
  }

  // Fix 6: Replace deprecated methods
  fixedCode = fixedCode.replace(/ShowCreation\(/g, 'Create(')
  fixedCode = fixedCode.replace(/TextMobject\(/g, 'Text(')
  fixedCode = fixedCode.replace(/TexMobject\(/g, 'MathTex(')
  fixedCode = fixedCode.replace(/GrowFromCenter\(/g, 'Create(')
  fixedCode = fixedCode.replace(/arrange_submobjects\(/g, 'arrange(')

  // Fix 7: Fix camera.frame in non-MovingCameraScene
  if (fixedCode.includes('self.camera.frame') && !fixedCode.includes('MovingCameraScene')) {
    fixedCode = fixedCode.replace(
      /class MainScene\(\s*Scene\s*\)/g,
      'class MainScene(MovingCameraScene)'
    )
    if (!fixedCode.includes('from manim.scene.moving_camera_scene')) {
      fixedCode = fixedCode.replace(
        /from manim import \*/,
        'from manim import *\nfrom manim.scene.moving_camera_scene import MovingCameraScene'
      )
    }
  }

  // Fix 8: Fix 3D camera orientation angles
  fixedCode = fixedCode.replace(/phi\s*=\s*(\d+)([,\)])/g, (match, num, suffix) => {
    if (!match.includes('DEGREES')) {
      return `phi=${num} * DEGREES${suffix}`
    }
    return match
  })
  fixedCode = fixedCode.replace(/theta\s*=\s*(\d+)([,\)])/g, (match, num, suffix) => {
    if (!match.includes('DEGREES')) {
      return `theta=${num} * DEGREES${suffix}`
    }
    return match
  })

  // Fix 9: Set background color if specified
  if (!fixedCode.includes('background_color') && sceneGraph.style.backgroundColor !== '#1a1a2e') {
    const configLine = `config.background_color = "${sceneGraph.style.backgroundColor}"\n`
    const insertPoint = fixedCode.indexOf('class MainScene')
    if (insertPoint > 0) {
      fixedCode = fixedCode.slice(0, insertPoint) + configLine + '\n' + fixedCode.slice(insertPoint)
    }
  }

  // Fix 10: Check for common syntax issues
  const syntaxIssues = checkSyntax(fixedCode)

  return {
    stage: 'validation',
    output: fixedCode,
    success: syntaxIssues.length === 0,
    error: syntaxIssues.length > 0 ? syntaxIssues.join('; ') : undefined,
  }
}

/**
 * Check for common syntax issues
 */
function checkSyntax(code: string): string[] {
  const issues: string[] = []

  // Check for balanced parentheses
  let parenCount = 0
  for (const char of code) {
    if (char === '(') parenCount++
    if (char === ')') parenCount--
  }
  if (parenCount !== 0) {
    issues.push('Unbalanced parentheses')
  }

  // Check for balanced brackets
  let bracketCount = 0
  for (const char of code) {
    if (char === '[') bracketCount++
    if (char === ']') bracketCount--
  }
  if (bracketCount !== 0) {
    issues.push('Unbalanced brackets')
  }

  // Check for proper class definition
  if (!code.match(/class\s+\w+\s*\([^)]*\)\s*:/)) {
    issues.push('Missing or malformed class definition')
  }

  // Check for construct method
  if (!code.match(/def\s+construct\s*\(\s*self\s*\)\s*:/)) {
    issues.push('Missing construct method')
  }

  return issues
}

/**
 * Extract code from potential markdown
 */
function extractCode(text: string): string {
  if (!text) return ''

  // Try fenced code blocks
  const match = text.match(/```(?:python)?\n?([\s\S]*?)```/i)
  if (match) {
    return match[1].trim()
  }

  return text.trim()
}

/**
 * Generate fallback code when AI fails
 */
function generateFallbackCode(sceneGraph: SceneGraph): string {
  const styleConfig = sceneGraph.style
  const sceneClass = sceneGraph.is3D ? 'ThreeDScene' : 'Scene'

  return `from manim import *

config.background_color = "${styleConfig.backgroundColor}"

class MainScene(${sceneClass}):
    def construct(self):
        # Title
        title = Text("${sceneGraph.title || 'Animation'}", color="${styleConfig.primaryColor}")
        title.scale(1.5)

        self.play(Write(title))
        self.wait(1)
        self.play(FadeOut(title))

        # Main content
        circle = Circle(color="${styleConfig.primaryColor}")
        square = Square(color="${styleConfig.secondaryColor}")

        self.play(Create(circle))
        self.wait(0.5)
        self.play(Transform(circle, square))
        self.wait(0.5)

        # Conclusion
        text = Text("Thank you!", color="${styleConfig.accentColor}")
        self.play(ReplacementTransform(square, text))
        self.wait(1)
`
}

/**
 * Generate code for a single concept (simplified path)
 */
export async function generateSimpleCode(
  concept: string,
  style: StylePreset = '3blue1brown'
): Promise<string> {
  if (!openaiClient) {
    return generateFallbackCode({
      id: '',
      title: concept,
      style: {
        preset: style,
        backgroundColor: '#1a1a2e',
        primaryColor: '#58c4dd',
        secondaryColor: '#83c167',
        accentColor: '#ffff00',
        textColor: '#ffffff',
        animationSpeed: 1,
      },
      acts: [],
      totalDuration: 5,
      is3D: false,
      useMovingCamera: false,
      metadata: {
        originalInput: concept,
        intent: 'EXPLAIN_CONCEPT',
        skill: 'visual-storyteller',
        createdAt: new Date().toISOString(),
        schemaVersion: '1.0.0',
      },
    })
  }

  try {
    const response = await openaiClient.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are an expert Manim programmer. Create clean, beautiful animations.
Output ONLY valid Python code. Use MainScene as the class name.`,
        },
        {
          role: 'user',
          content: `Create a Manim animation for: "${concept}"

Requirements:
- Use MainScene class
- Include manim imports
- Use smooth animations with self.wait() pauses
- Add color coding for visual appeal
- Keep it under 50 lines

Output only Python code:`,
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    })

    const code = extractCode(response.choices[0]?.message?.content || '')
    return code || generateFallbackCode({
      id: '',
      title: concept,
      style: {
        preset: style,
        backgroundColor: '#1a1a2e',
        primaryColor: '#58c4dd',
        secondaryColor: '#83c167',
        accentColor: '#ffff00',
        textColor: '#ffffff',
        animationSpeed: 1,
      },
      acts: [],
      totalDuration: 5,
      is3D: false,
      useMovingCamera: false,
      metadata: {
        originalInput: concept,
        intent: 'EXPLAIN_CONCEPT',
        skill: 'visual-storyteller',
        createdAt: new Date().toISOString(),
        schemaVersion: '1.0.0',
      },
    })
  } catch (error) {
    console.error('Simple code generation failed:', error)
    return ''
  }
}

/**
 * Check if prompt engine is available
 */
export function isPromptEngineAvailable(): boolean {
  return openaiClient !== null
}

/**
 * Generate Code Step
 * Generates Manim code using AI if needed
 */

import { z } from 'zod'
import type { EventConfig, Handlers } from 'motia'
import { generateAIManimCode } from '../services/openai-client'
import { generateBasicVisualizationCode } from '../services/manim-templates'

/**
 * Comprehensive Manim CE code sanitization
 * Fixes common AI-generated errors based on ManimCE best practices
 */
function sanitizeManimCode(code: string): string {
  let sanitized = code

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 1: Extract code from markdown (if present)
  // ═══════════════════════════════════════════════════════════════════════════
  const codeBlockMatch = sanitized.match(/```(?:python)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) {
    sanitized = codeBlockMatch[1].trim()
  }
  sanitized = sanitized.replace(/```python\s*/g, '').replace(/```\s*/g, '')

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 2: Fix deprecated/renamed methods (Manim CE v0.18+)
  // ═══════════════════════════════════════════════════════════════════════════

  // ShowCreation → Create (deprecated in 0.15+)
  sanitized = sanitized.replace(/ShowCreation\(/g, 'Create(')

  // FadeInFrom → FadeIn with shift parameter (handle all variations)
  sanitized = sanitized.replace(/FadeInFrom\(\s*([^,)]+)\s*,\s*direction\s*=\s*([^,)]+)\s*\)/g, 'FadeIn($1, shift=$2)')
  sanitized = sanitized.replace(/FadeInFrom\(\s*([^,)]+)\s*,\s*([^,)]+)\s*\)/g, 'FadeIn($1, shift=$2)')
  // Fallback: simple FadeInFrom with just object → FadeIn
  sanitized = sanitized.replace(/FadeInFrom\(/g, 'FadeIn(')

  // FadeOutAndShift → FadeOut with shift parameter
  sanitized = sanitized.replace(/FadeOutAndShift\(\s*([^,)]+)\s*,\s*direction\s*=\s*([^,)]+)\s*\)/g, 'FadeOut($1, shift=$2)')
  sanitized = sanitized.replace(/FadeOutAndShift\(\s*([^,)]+)\s*,\s*([^,)]+)\s*\)/g, 'FadeOut($1, shift=$2)')
  // Fallback: simple FadeOutAndShift with just object → FadeOut
  sanitized = sanitized.replace(/FadeOutAndShift\(/g, 'FadeOut(')

  // GrowFromCenter → GrowFromPoint(obj, obj.get_center()) or just use Create
  sanitized = sanitized.replace(/GrowFromCenter\(/g, 'Create(')

  // DrawBorderThenFill for non-VMobjects → Create
  // (DrawBorderThenFill only works on VMobjects with stroke)

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 3: Fix Scene class issues
  // ═══════════════════════════════════════════════════════════════════════════

  // camera.frame requires MovingCameraScene - handle any Scene subclass name
  if (sanitized.includes('self.camera.frame') && !sanitized.includes('MovingCameraScene')) {
    sanitized = sanitized.replace(/class\s+(\w+)\s*\(\s*Scene\s*\)\s*:/g, 'class $1(MovingCameraScene):')
  }

  // self.camera.background_color → config.background_color (Scene doesn't have this attribute)
  sanitized = sanitized.replace(/self\.camera\.background_color\s*=/g, 'config.background_color =')

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 4: Fix invalid parameters
  // ═══════════════════════════════════════════════════════════════════════════

  // dash_ratio → dashed_ratio (or remove entirely)
  sanitized = sanitized.replace(/dash_ratio\s*=\s*[\d.]+,?\s*/g, '')

  // to_edge(ORIGIN) is invalid → move_to(ORIGIN)
  sanitized = sanitized.replace(/\.to_edge\s*\(\s*ORIGIN\s*\)/g, '.move_to(ORIGIN)')

  // scale_about_point → use .scale() with about_point parameter to preserve anchor
  sanitized = sanitized.replace(/\.scale_about_point\s*\(\s*([\d.]+)\s*,\s*([^)]+)\s*\)/g, '.scale($1, about_point=$2)')

  // get_graph_label with deprecated parameters
  sanitized = sanitized.replace(/\.get_graph_label\s*\([^)]*direction\s*=[^)]*\)/g, (match) => {
    // Remove the direction parameter
    return match.replace(/,?\s*direction\s*=\s*\w+/g, '')
  })

  // Remove buff from get_vertical_line/get_horizontal_line (not supported)
  sanitized = sanitized.replace(/(get_(?:vertical|horizontal)_line\([^)]*),\s*buff\s*=\s*[\d.]+/g, '$1')

  // Fix Square(side=...) → Square(side_length=...)
  sanitized = sanitized.replace(/Square\s*\(\s*side\s*=/g, 'Square(side_length=')

  // Remove invalid 'diagonal' parameter from next_to() - not a valid Manim parameter
  sanitized = sanitized.replace(/\.next_to\s*\(([^)]*),\s*diagonal\s*=\s*[\d.]+\s*,?/g, '.next_to($1,')
  sanitized = sanitized.replace(/\.next_to\s*\(([^)]*),\s*diagonal\s*=\s*[\d.]+\s*\)/g, '.next_to($1)')

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 5: Fix Tex/MathTex issues
  // ═══════════════════════════════════════════════════════════════════════════

  // TextMobject → Text (deprecated class name)
  sanitized = sanitized.replace(/TextMobject\s*\(/g, 'Text(')

  // TexMobject → MathTex (deprecated class name)
  sanitized = sanitized.replace(/TexMobject\s*\(/g, 'MathTex(')

  // Tex() with math → MathTex() (Tex is for text with some math, MathTex is pure math)
  // Only convert if it looks like pure math (starts with common math patterns)
  // Use lookahead to avoid consuming the math command
  sanitized = sanitized.replace(/Tex\s*\(\s*r?"(?=\\\\(?:frac|int|sum|sqrt|lim))/g, 'MathTex(r"')

  // Fix escaped backslashes in MathTex (AI sometimes double-escapes)
  sanitized = sanitized.replace(/MathTex\s*\(\s*r?"([^"]+)"\s*\)/g, (_match, content) => {
    // Fix common double-escape issues
    const fixed = content
      .replace(/\\\\frac/g, '\\frac')
      .replace(/\\\\int/g, '\\int')
      .replace(/\\\\sum/g, '\\sum')
      .replace(/\\\\sqrt/g, '\\sqrt')
      .replace(/\\\\pi/g, '\\pi')
      .replace(/\\\\theta/g, '\\theta')
      .replace(/\\\\alpha/g, '\\alpha')
      .replace(/\\\\beta/g, '\\beta')
      .replace(/\\\\gamma/g, '\\gamma')
      .replace(/\\\\lambda/g, '\\lambda')
      .replace(/\\\\cdot/g, '\\cdot')
      .replace(/\\\\times/g, '\\times')
      .replace(/\\\\left/g, '\\left')
      .replace(/\\\\right/g, '\\right')
      .replace(/\\\\infty/g, '\\infty')
    return `MathTex(r"${fixed}")`
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 6: Fix 3D scene requirements
  // ═══════════════════════════════════════════════════════════════════════════

  const uses3D = sanitized.includes('ThreeDScene') ||
    sanitized.includes('ThreeDAxes') ||
    sanitized.includes('Surface') ||
    sanitized.includes('Sphere') ||
    sanitized.includes('Cube') ||
    sanitized.includes('set_camera_orientation')

  if (uses3D) {
    // Ensure ThreeDScene is used
    if (!sanitized.includes('ThreeDScene') && sanitized.includes('class MainScene(Scene):')) {
      sanitized = sanitized.replace(/class\s+MainScene\s*\(\s*Scene\s*\)\s*:/g, 'class MainScene(ThreeDScene):')
    }

    // Ensure numpy is imported for 3D math
    if (!sanitized.includes('import numpy') && !sanitized.includes('from numpy')) {
      sanitized = sanitized.replace(
        /from manim import \*/,
        'from manim import *\nimport numpy as np'
      )
    }

    // Fix phi/theta without DEGREES
    sanitized = sanitized.replace(/phi\s*=\s*(\d+)\s*([,\)])/g, 'phi=$1 * DEGREES$2')
    sanitized = sanitized.replace(/theta\s*=\s*(\d+)\s*([,\)])/g, 'theta=$1 * DEGREES$2')
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 7: Fix color issues
  // ═══════════════════════════════════════════════════════════════════════════

  // Convert common hex colors to Manim constants
  const colorMap: Record<string, string> = {
    '"#FF0000"': 'RED',
    '"#00FF00"': 'GREEN',
    '"#0000FF"': 'BLUE',
    '"#FFFF00"': 'YELLOW',
    '"#FF00FF"': 'PURPLE',
    '"#00FFFF"': 'TEAL',
    '"#FFFFFF"': 'WHITE',
    '"#000000"': 'BLACK',
    '"#FFA500"': 'ORANGE',
    "'#FF0000'": 'RED',
    "'#00FF00'": 'GREEN',
    "'#0000FF'": 'BLUE',
    "'#FFFF00'": 'YELLOW',
    "'#FF00FF'": 'PURPLE',
    "'#00FFFF'": 'TEAL',
    "'#FFFFFF'": 'WHITE',
    "'#000000'": 'BLACK',
    "'#FFA500'": 'ORANGE',
  }

  for (const [hex, constant] of Object.entries(colorMap)) {
    sanitized = sanitized.replace(new RegExp(hex, 'gi'), constant)
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 8: Fix animation issues
  // ═══════════════════════════════════════════════════════════════════════════

  // run_time must be positive
  sanitized = sanitized.replace(/run_time\s*=\s*0([,\)])/g, 'run_time=0.5$1')

  // rate_func=None is invalid → remove it
  sanitized = sanitized.replace(/,?\s*rate_func\s*=\s*None/g, '')

  // Fix common rate_func typos
  sanitized = sanitized.replace(/rate_func\s*=\s*smooth\b/g, 'rate_func=smooth')
  sanitized = sanitized.replace(/rate_func\s*=\s*linear\b/g, 'rate_func=linear')
  sanitized = sanitized.replace(/rate_func\s*=\s*there_and_back\b/g, 'rate_func=there_and_back')

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 9: Fix positioning issues
  // ═══════════════════════════════════════════════════════════════════════════

  // arrange_submobjects is deprecated → use arrange
  sanitized = sanitized.replace(/\.arrange_submobjects\s*\(/g, '.arrange(')

  // Fix invalid direction/shift constants (remove quotes around direction vectors)
  sanitized = sanitized.replace(/direction\s*=\s*"UP"/g, 'direction=UP')
  sanitized = sanitized.replace(/direction\s*=\s*"DOWN"/g, 'direction=DOWN')
  sanitized = sanitized.replace(/direction\s*=\s*"LEFT"/g, 'direction=LEFT')
  sanitized = sanitized.replace(/direction\s*=\s*"RIGHT"/g, 'direction=RIGHT')
  sanitized = sanitized.replace(/shift\s*=\s*"UP"/g, 'shift=UP')
  sanitized = sanitized.replace(/shift\s*=\s*"DOWN"/g, 'shift=DOWN')
  sanitized = sanitized.replace(/shift\s*=\s*"LEFT"/g, 'shift=LEFT')
  sanitized = sanitized.replace(/shift\s*=\s*"RIGHT"/g, 'shift=RIGHT')

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 10: Ensure required imports
  // ═══════════════════════════════════════════════════════════════════════════

  const needsImports: string[] = []

  if (sanitized.includes('MovingCameraScene') && !sanitized.includes('from manim.scene.moving_camera_scene')) {
    needsImports.push('from manim.scene.moving_camera_scene import MovingCameraScene')
  }

  if (sanitized.includes('np.') && !sanitized.includes('import numpy')) {
    needsImports.push('import numpy as np')
  }

  // Ensure base import exists
  if (!sanitized.includes('from manim import')) {
    sanitized = 'from manim import *\n\n' + sanitized
  }

  if (needsImports.length > 0 && sanitized.includes('from manim import *')) {
    sanitized = sanitized.replace(
      /from manim import \*/,
      `from manim import *\n${needsImports.join('\n')}`
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 11: Ensure MainScene class exists
  // ═══════════════════════════════════════════════════════════════════════════

  if (!sanitized.includes('class MainScene')) {
    // Try to rename any existing Scene class to MainScene
    sanitized = sanitized.replace(
      /class\s+(\w+)\s*\(\s*(Scene|ThreeDScene|MovingCameraScene)\s*\)\s*:/,
      'class MainScene($2):'
    )
  }

  // If still no MainScene, check if there's a construct method floating around
  if (!sanitized.includes('class MainScene') && sanitized.includes('def construct(self)')) {
    // Wrap the code in a proper class
    const constructIndex = sanitized.indexOf('def construct(self)')
    if (constructIndex > 0) {
      const beforeConstruct = sanitized.slice(0, constructIndex)
      const fromConstruct = sanitized.slice(constructIndex)
      sanitized = beforeConstruct + '\nclass MainScene(Scene):\n    ' + fromConstruct.replace(/\n/g, '\n    ')
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 12: Fix indentation issues
  // ═══════════════════════════════════════════════════════════════════════════

  // Ensure consistent indentation (4 spaces)
  const lines = sanitized.split('\n')
  const fixedLines = lines.map(line => {
    // Convert tabs to 4 spaces
    return line.replace(/\t/g, '    ')
  })
  sanitized = fixedLines.join('\n')

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 13: Remove problematic patterns
  // ═══════════════════════════════════════════════════════════════════════════

  // Remove any print statements (can cause issues with manim CLI)
  sanitized = sanitized.replace(/^\s*print\s*\([^)]*\)\s*$/gm, '')

  // Remove if __name__ == "__main__" blocks (not needed, manim handles this)
  sanitized = sanitized.replace(/if\s+__name__\s*==\s*["']__main__["']:\s*[\s\S]*$/m, '')

  return sanitized
}

// Input schema - includes 'nlu' for NLU pipeline generated code
const inputSchema = z.object({
  jobId: z.string(),
  concept: z.string(),
  quality: z.enum(['low', 'medium', 'high']),
  analysisType: z.enum(['latex', 'template', 'ai', 'fallback', 'nlu']),
  manimCode: z.string().nullable(),
  needsAI: z.boolean(),
  // NLU pipeline metadata (optional)
  skill: z.string().optional(),
  style: z.string().optional(),
  intent: z.string().optional()
})

export const config: EventConfig = {
  type: 'event',
  name: 'GenerateCode',
  description: 'Generate Manim code using templates or AI',
  subscribes: ['concept.analyzed'],
  emits: ['code.generated'],
  input: inputSchema as any
}

export const handler: Handlers['GenerateCode'] = async (input, { emit, logger }) => {
  const { jobId, concept, quality, analysisType, manimCode, needsAI, skill, style, intent } = inputSchema.parse(input)

  logger.info('Generating code for job', { jobId, needsAI, analysisType, skill, style })

  let finalCode: string
  let usedAI = false
  let generationType = analysisType

  if (needsAI) {
    // Use AI to generate code
    logger.info('Calling OpenAI for code generation', { jobId })

    try {
      const aiCode = await generateAIManimCode(concept)

      if (aiCode && aiCode.length > 0) {
        finalCode = aiCode
        usedAI = true
        generationType = 'ai'
        logger.info('AI code generation successful', {
          jobId,
          codeLength: aiCode.length
        })
      } else {
        // AI failed, use fallback
        logger.warn('AI returned empty code, using fallback', { jobId })
        finalCode = generateBasicVisualizationCode()
        generationType = 'fallback'
      }
    } catch (error) {
      logger.error('AI generation failed', {
        jobId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
      finalCode = generateBasicVisualizationCode()
      generationType = 'fallback'
    }
  } else if (manimCode) {
    // Use pre-generated code (from template or LaTeX)
    finalCode = manimCode
    logger.info('Using pre-generated code', {
      jobId,
      analysisType,
      codeLength: manimCode.length
    })
  } else {
    // Fallback
    logger.warn('No code available, using fallback', { jobId })
    finalCode = generateBasicVisualizationCode()
    generationType = 'fallback'
  }

  // Sanitize the code to fix common AI-generated errors
  const sanitizedCode = sanitizeManimCode(finalCode)

  await emit({
    topic: 'code.generated',
    data: {
      jobId,
      concept,
      quality,
      manimCode: sanitizedCode,
      usedAI,
      generationType,
      // Pass through NLU metadata
      skill,
      style,
      intent
    }
  })

  logger.info('Code generation complete', {
    jobId,
    generationType,
    usedAI
  })
}

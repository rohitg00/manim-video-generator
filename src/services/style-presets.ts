/**
 * Visual Style Presets Service
 * Provides pre-configured visual styles for animations
 */

import type { StylePreset, StyleConfig } from '../types/scene.types'

/**
 * Complete style configurations for each preset
 */
export const STYLE_PRESETS: Record<StylePreset, StyleConfig> = {
  '3blue1brown': {
    preset: '3blue1brown',
    backgroundColor: '#1a1a2e',
    primaryColor: '#58c4dd',
    secondaryColor: '#83c167',
    accentColor: '#ffff00',
    textColor: '#ffffff',
    font: 'sans-serif',
    animationSpeed: 1.0,
    customColors: {
      BLUE: '#58c4dd',
      GREEN: '#83c167',
      YELLOW: '#ffff00',
      RED: '#fc6255',
      PURPLE: '#9a72ac',
      ORANGE: '#ff862f',
      TEAL: '#5cd0b3',
      PINK: '#ff6b9d',
      DARK_BLUE: '#1c758a',
      LIGHT_BROWN: '#cd853f',
    },
  },
  minimalist: {
    preset: 'minimalist',
    backgroundColor: '#ffffff',
    primaryColor: '#2c3e50',
    secondaryColor: '#7f8c8d',
    accentColor: '#3498db',
    textColor: '#1a1a1a',
    font: 'Helvetica',
    animationSpeed: 1.2,
    customColors: {
      BLUE: '#3498db',
      GREEN: '#27ae60',
      RED: '#e74c3c',
      YELLOW: '#f39c12',
      GRAY: '#95a5a6',
      DARK: '#2c3e50',
      LIGHT: '#ecf0f1',
      PURPLE: '#9b59b6',
    },
  },
  playful: {
    preset: 'playful',
    backgroundColor: '#ffeaa7',
    primaryColor: '#e17055',
    secondaryColor: '#00cec9',
    accentColor: '#6c5ce7',
    textColor: '#2d3436',
    font: 'Comic Sans MS, cursive',
    animationSpeed: 0.9,
    customColors: {
      CORAL: '#e17055',
      TEAL: '#00cec9',
      PURPLE: '#6c5ce7',
      PINK: '#fd79a8',
      MINT: '#55efc4',
      YELLOW: '#ffeaa7',
      ORANGE: '#fab1a0',
      BLUE: '#74b9ff',
    },
  },
  corporate: {
    preset: 'corporate',
    backgroundColor: '#2c3e50',
    primaryColor: '#3498db',
    secondaryColor: '#95a5a6',
    accentColor: '#e74c3c',
    textColor: '#ecf0f1',
    font: 'Arial',
    animationSpeed: 1.1,
    customColors: {
      BLUE: '#3498db',
      GRAY: '#95a5a6',
      RED: '#e74c3c',
      GREEN: '#2ecc71',
      ORANGE: '#e67e22',
      DARK_BLUE: '#2980b9',
      LIGHT_GRAY: '#bdc3c7',
      NAVY: '#34495e',
    },
  },
  neon: {
    preset: 'neon',
    backgroundColor: '#0a0a0a',
    primaryColor: '#00ffff',
    secondaryColor: '#ff00ff',
    accentColor: '#00ff00',
    textColor: '#ffffff',
    font: 'Orbitron, sans-serif',
    animationSpeed: 0.85,
    customColors: {
      CYAN: '#00ffff',
      MAGENTA: '#ff00ff',
      LIME: '#00ff00',
      YELLOW: '#ffff00',
      ORANGE: '#ff6600',
      PINK: '#ff0099',
      BLUE: '#0066ff',
      PURPLE: '#9900ff',
    },
  },
}

/**
 * Get style configuration by preset name
 */
export function getStyleConfig(preset: StylePreset): StyleConfig {
  return STYLE_PRESETS[preset] || STYLE_PRESETS['3blue1brown']
}

/**
 * Generate Manim color definitions for a style
 */
export function generateManimColorDefs(style: StyleConfig): string {
  const lines: string[] = ['# Custom colors for this style']

  if (style.customColors) {
    for (const [name, hex] of Object.entries(style.customColors)) {
      lines.push(`${name} = "${hex}"`)
    }
  }

  lines.push(`BACKGROUND = "${style.backgroundColor}"`)
  lines.push(`PRIMARY = "${style.primaryColor}"`)
  lines.push(`SECONDARY = "${style.secondaryColor}"`)
  lines.push(`ACCENT = "${style.accentColor}"`)
  lines.push(`TEXT_COLOR = "${style.textColor}"`)

  return lines.join('\n')
}

/**
 * Generate Manim config for a style
 */
export function generateManimConfig(style: StyleConfig): string {
  return `config.background_color = "${style.backgroundColor}"`
}

/**
 * Get rate function name based on animation speed
 */
export function getDefaultRateFunc(style: StyleConfig): string {
  if (style.animationSpeed < 0.9) {
    return 'smooth'  // Slower, smoother for playful/neon
  } else if (style.animationSpeed > 1.1) {
    return 'linear'  // Faster, more direct for minimalist/corporate
  }
  return 'smooth'
}

/**
 * Get recommended run_time multiplier for a style
 */
export function getRunTimeMultiplier(style: StyleConfig): number {
  return 1 / style.animationSpeed
}

/**
 * Style-specific animation recommendations
 */
export const STYLE_ANIMATIONS: Record<StylePreset, {
  preferredCreate: string
  preferredFade: string
  preferredTransform: string
  preferredEmphasis: string
}> = {
  '3blue1brown': {
    preferredCreate: 'Create',
    preferredFade: 'FadeIn',
    preferredTransform: 'Transform',
    preferredEmphasis: 'Indicate',
  },
  minimalist: {
    preferredCreate: 'FadeIn',
    preferredFade: 'FadeOut',
    preferredTransform: 'ReplacementTransform',
    preferredEmphasis: 'Circumscribe',
  },
  playful: {
    preferredCreate: 'GrowFromCenter',
    preferredFade: 'ShrinkToCenter',
    preferredTransform: 'Transform',
    preferredEmphasis: 'Wiggle',
  },
  corporate: {
    preferredCreate: 'Write',
    preferredFade: 'FadeOut',
    preferredTransform: 'ReplacementTransform',
    preferredEmphasis: 'Flash',
  },
  neon: {
    preferredCreate: 'DrawBorderThenFill',
    preferredFade: 'FadeOut',
    preferredTransform: 'Transform',
    preferredEmphasis: 'Indicate',
  },
}

/**
 * Get animation recommendations for a style
 */
export function getAnimationRecommendations(preset: StylePreset) {
  return STYLE_ANIMATIONS[preset] || STYLE_ANIMATIONS['3blue1brown']
}

/**
 * Generate style preamble for Manim code
 */
export function generateStylePreamble(style: StyleConfig): string {
  return `
# Style: ${style.preset}
from manim import *

${generateManimConfig(style)}

# Color palette
${generateManimColorDefs(style)}

`
}

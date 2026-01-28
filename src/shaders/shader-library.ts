
export type ShaderEffectType =
  | 'glow'
  | 'gradient-fill'
  | 'distortion'
  | 'blur'
  | 'outline'
  | 'wave'
  | 'ripple'
  | 'chromatic-aberration'
  | 'vignette'
  | 'pixelate'

export interface ShaderEffect {
  name: string

  type: ShaderEffectType

  description: string

  defaultParams: Record<string, number | string>

  code: string

  requiresGPU: boolean

  supportedTypes: string[]
}

const GLOW_SHADER: ShaderEffect = {
  name: 'Glow',
  type: 'glow',
  description: 'Adds a glowing outline effect around objects',
  defaultParams: {
    intensity: 0.8,
    color: '#FFFFFF',
    radius: 10,
    opacity: 0.6
  },
  code: `
# Glow effect for ManimGL
def apply_glow(mobject, intensity=0.8, color=WHITE, radius=10, opacity=0.6):
    """Apply glow effect to a mobject"""
    glow = mobject.copy()
    glow.set_stroke(color=color, width=radius, opacity=opacity * intensity)
    glow.scale(1 + 0.02 * radius)

    # Create multiple layers for smooth glow
    layers = VGroup()
    for i in range(3):
        layer = mobject.copy()
        scale = 1 + 0.02 * radius * (i + 1)
        layer.set_stroke(color=color, width=radius * (3 - i) / 3, opacity=opacity * intensity * (3 - i) / 3)
        layer.scale(scale)
        layers.add(layer)

    return VGroup(layers, mobject)
`,
  requiresGPU: false,
  supportedTypes: ['Circle', 'Square', 'Rectangle', 'Text', 'MathTex', 'Polygon']
}

const GRADIENT_FILL_SHADER: ShaderEffect = {
  name: 'Gradient Fill',
  type: 'gradient-fill',
  description: 'Applies a color gradient fill to objects',
  defaultParams: {
    colors: '#3498DB,#E74C3C',
    direction: 'vertical',
    opacity: 1.0
  },
  code: `
# Gradient fill for ManimGL
def apply_gradient_fill(mobject, colors, direction='vertical', opacity=1.0):
    """Apply gradient fill to a mobject"""
    if isinstance(colors, str):
        colors = [c.strip() for c in colors.split(',')]

    # Convert hex colors if needed
    color_list = []
    for c in colors:
        if isinstance(c, str) and c.startswith('#'):
            color_list.append(hex_to_rgb(c))
        else:
            color_list.append(c)

    # Apply gradient based on direction
    if direction == 'vertical':
        mobject.set_color_by_gradient(*color_list)
    elif direction == 'horizontal':
        mobject.set_color_by_gradient(*color_list)
        # Rotate color mapping
    elif direction == 'radial':
        # Radial gradient requires custom shader
        mobject.set_color_by_gradient(*color_list)

    mobject.set_fill(opacity=opacity)
    return mobject
`,
  requiresGPU: false,
  supportedTypes: ['Circle', 'Square', 'Rectangle', 'Polygon', 'Surface']
}

const DISTORTION_SHADER: ShaderEffect = {
  name: 'Distortion Wave',
  type: 'distortion',
  description: 'Applies a wave-like distortion effect',
  defaultParams: {
    amplitude: 0.1,
    frequency: 3,
    speed: 1.0,
    direction: 'horizontal'
  },
  code: `
# Distortion wave effect for ManimGL
def apply_distortion(mobject, amplitude=0.1, frequency=3, speed=1.0, direction='horizontal'):
    """Apply wave distortion to a mobject"""
    time_tracker = ValueTracker(0)

    def update_distortion(m, dt):
        t = time_tracker.get_value()
        time_tracker.increment_value(dt * speed)

        # Get points
        points = m.get_points()
        new_points = points.copy()

        for i, point in enumerate(points):
            if direction == 'horizontal':
                offset = amplitude * np.sin(frequency * point[1] + t)
                new_points[i][0] += offset
            else:  # vertical
                offset = amplitude * np.sin(frequency * point[0] + t)
                new_points[i][1] += offset

        m.set_points(new_points)

    mobject.add_updater(update_distortion)
    return mobject
`,
  requiresGPU: false,
  supportedTypes: ['VMobject', 'Text', 'MathTex']
}

const BLUR_SHADER: ShaderEffect = {
  name: 'Blur',
  type: 'blur',
  description: 'Applies a blur effect using multiple copies',
  defaultParams: {
    radius: 5,
    samples: 8,
    opacity: 0.3
  },
  code: `
# Blur effect for ManimGL (simulated with copies)
def apply_blur(mobject, radius=5, samples=8, opacity=0.3):
    """Apply blur effect to a mobject"""
    blur_group = VGroup()

    for i in range(samples):
        angle = i * TAU / samples
        offset = radius * np.array([np.cos(angle), np.sin(angle), 0]) * 0.02

        copy = mobject.copy()
        copy.shift(offset)
        copy.set_opacity(opacity / samples)
        blur_group.add(copy)

    blur_group.add(mobject.copy())  # Original on top
    return blur_group
`,
  requiresGPU: false,
  supportedTypes: ['VMobject', 'Text', 'Circle', 'Square']
}

const OUTLINE_SHADER: ShaderEffect = {
  name: 'Outline',
  type: 'outline',
  description: 'Adds a colored outline to objects',
  defaultParams: {
    color: '#FFFFFF',
    width: 4,
    opacity: 1.0
  },
  code: `
# Outline effect for ManimGL
def apply_outline(mobject, color=WHITE, width=4, opacity=1.0):
    """Apply outline effect to a mobject"""
    outline = mobject.copy()
    outline.set_stroke(color=color, width=width, opacity=opacity)
    outline.set_fill(opacity=0)

    # Scale slightly for offset effect
    outline.scale(1 + 0.01 * width)

    return VGroup(outline, mobject)
`,
  requiresGPU: false,
  supportedTypes: ['VMobject', 'Text', 'MathTex', 'Circle', 'Square', 'Polygon']
}

const WAVE_SHADER: ShaderEffect = {
  name: 'Wave',
  type: 'wave',
  description: 'Animated wave motion effect',
  defaultParams: {
    amplitude: 0.2,
    wavelength: 1.0,
    speed: 2.0
  },
  code: `
# Wave animation effect for ManimGL
def apply_wave(mobject, amplitude=0.2, wavelength=1.0, speed=2.0):
    """Apply wave animation to a mobject"""
    original_points = mobject.get_points().copy()
    time_tracker = ValueTracker(0)

    def wave_updater(m, dt):
        t = time_tracker.get_value()
        time_tracker.increment_value(dt * speed)

        new_points = original_points.copy()
        for i, point in enumerate(new_points):
            offset = amplitude * np.sin(2 * PI * point[0] / wavelength + t)
            new_points[i][1] += offset

        m.set_points(new_points)

    mobject.add_updater(wave_updater)
    return mobject
`,
  requiresGPU: false,
  supportedTypes: ['VMobject', 'FunctionGraph', 'ParametricFunction']
}

const RIPPLE_SHADER: ShaderEffect = {
  name: 'Ripple',
  type: 'ripple',
  description: 'Radial ripple distortion effect',
  defaultParams: {
    center: [0, 0],
    amplitude: 0.1,
    frequency: 5,
    speed: 2.0,
    decay: 0.5
  },
  code: `
# Ripple effect for ManimGL
def apply_ripple(mobject, center=ORIGIN, amplitude=0.1, frequency=5, speed=2.0, decay=0.5):
    """Apply ripple effect to a mobject"""
    original_points = mobject.get_points().copy()
    time_tracker = ValueTracker(0)
    center = np.array(center) if len(center) == 2 else np.array([center[0], center[1], 0])

    def ripple_updater(m, dt):
        t = time_tracker.get_value()
        time_tracker.increment_value(dt * speed)

        new_points = original_points.copy()
        for i, point in enumerate(new_points):
            # Distance from center
            dist = np.linalg.norm(point[:2] - center[:2])
            # Ripple calculation
            offset = amplitude * np.sin(frequency * dist - t) * np.exp(-decay * dist)
            # Direction away from center
            if dist > 0.001:
                direction = (point[:2] - center[:2]) / dist
                new_points[i][:2] += offset * direction

        m.set_points(new_points)

    mobject.add_updater(ripple_updater)
    return mobject
`,
  requiresGPU: false,
  supportedTypes: ['VMobject', 'Surface']
}

const CHROMATIC_ABERRATION_SHADER: ShaderEffect = {
  name: 'Chromatic Aberration',
  type: 'chromatic-aberration',
  description: 'RGB color split effect',
  defaultParams: {
    offset: 0.02,
    direction: [1, 0]
  },
  code: `
# Chromatic aberration effect for ManimGL
def apply_chromatic_aberration(mobject, offset=0.02, direction=[1, 0]):
    """Apply chromatic aberration effect"""
    direction = np.array([direction[0], direction[1], 0])
    direction = direction / np.linalg.norm(direction) if np.linalg.norm(direction) > 0 else direction

    # Create RGB layers
    red_layer = mobject.copy()
    red_layer.set_color(RED)
    red_layer.shift(-offset * direction)

    green_layer = mobject.copy()
    green_layer.set_color(GREEN)
    # Green stays centered

    blue_layer = mobject.copy()
    blue_layer.set_color(BLUE)
    blue_layer.shift(offset * direction)

    # Set opacity for blending
    for layer in [red_layer, blue_layer]:
        layer.set_opacity(0.5)

    return VGroup(red_layer, green_layer, blue_layer)
`,
  requiresGPU: false,
  supportedTypes: ['VMobject', 'Text', 'MathTex']
}

const VIGNETTE_SHADER: ShaderEffect = {
  name: 'Vignette',
  type: 'vignette',
  description: 'Darkening at edges of the frame',
  defaultParams: {
    intensity: 0.5,
    radius: 3.0,
    softness: 1.0
  },
  code: `
# Vignette effect for ManimGL (frame overlay)
def create_vignette(intensity=0.5, radius=3.0, softness=1.0):
    """Create a vignette overlay"""
    # Create radial gradient from center
    vignette = Circle(radius=radius * 2, fill_opacity=0)

    # Create multiple rings for gradient effect
    rings = VGroup()
    num_rings = 20
    for i in range(num_rings):
        r = radius + (radius * 2 - radius) * i / num_rings
        opacity = intensity * (i / num_rings) ** softness
        ring = Annulus(inner_radius=r, outer_radius=r + 0.2, fill_opacity=opacity, stroke_width=0)
        ring.set_fill(BLACK)
        rings.add(ring)

    return rings
`,
  requiresGPU: false,
  supportedTypes: ['frame']
}

const PIXELATE_SHADER: ShaderEffect = {
  name: 'Pixelate',
  type: 'pixelate',
  description: 'Pixelation/mosaic effect',
  defaultParams: {
    pixelSize: 0.1,
    animated: false
  },
  code: `
# Pixelate effect for ManimGL (approximation)
def apply_pixelate(mobject, pixel_size=0.1, animated=False):
    """Apply pixelation effect (approximation using squares)"""
    bounds = mobject.get_bounding_box()
    min_pt, max_pt = bounds[0], bounds[2]

    pixels = VGroup()
    x = min_pt[0]
    while x < max_pt[0]:
        y = min_pt[1]
        while y < max_pt[1]:
            center = np.array([x + pixel_size/2, y + pixel_size/2, 0])
            # Sample color from original at this point
            pixel = Square(side_length=pixel_size)
            pixel.move_to(center)
            pixel.set_fill(mobject.get_color(), opacity=0.8)
            pixel.set_stroke(width=0)
            pixels.add(pixel)
            y += pixel_size
        x += pixel_size

    if animated:
        # Add random jitter animation
        def jitter(m, dt):
            for pixel in m:
                pixel.shift(0.01 * np.random.randn(3))

        pixels.add_updater(jitter)

    return pixels
`,
  requiresGPU: false,
  supportedTypes: ['VMobject']
}

export const SHADER_LIBRARY: Record<ShaderEffectType, ShaderEffect> = {
  'glow': GLOW_SHADER,
  'gradient-fill': GRADIENT_FILL_SHADER,
  'distortion': DISTORTION_SHADER,
  'blur': BLUR_SHADER,
  'outline': OUTLINE_SHADER,
  'wave': WAVE_SHADER,
  'ripple': RIPPLE_SHADER,
  'chromatic-aberration': CHROMATIC_ABERRATION_SHADER,
  'vignette': VIGNETTE_SHADER,
  'pixelate': PIXELATE_SHADER
}

export function getShaderEffect(type: ShaderEffectType): ShaderEffect | null {
  return SHADER_LIBRARY[type] || null
}

export function getAvailableShaders(): ShaderEffectType[] {
  return Object.keys(SHADER_LIBRARY) as ShaderEffectType[]
}

export function getShadersForMobject(mobjectType: string): ShaderEffect[] {
  return Object.values(SHADER_LIBRARY).filter((shader) =>
    shader.supportedTypes.includes(mobjectType) || shader.supportedTypes.includes('VMobject')
  )
}

export function generateShaderCode(
  effects: { type: ShaderEffectType; params?: Record<string, unknown> }[]
): string {
  let code = '# Shader effects\n'

  for (const effect of effects) {
    const shader = SHADER_LIBRARY[effect.type]
    if (shader) {
      code += `\n${shader.code}\n`
    }
  }

  return code
}

export function generateShaderDemoCode(): string {
  return `from manimlib import *
import numpy as np

${Object.values(SHADER_LIBRARY).map((s) => s.code).join('\n')}

class MainScene(Scene):
    def construct(self):
        title = Text("GPU Shader Effects Demo", font_size=48)
        title.to_edge(UP)
        self.play(Write(title))

        # Create base shape
        circle = Circle(radius=1.5, fill_opacity=1, color=BLUE)

        # Demo each effect
        effects = [
            ("Glow", lambda m: apply_glow(m, intensity=0.8)),
            ("Gradient", lambda m: apply_gradient_fill(m, ['#3498DB', '#E74C3C'])),
            ("Outline", lambda m: apply_outline(m, color=YELLOW, width=6)),
            ("Blur", lambda m: apply_blur(m, radius=8)),
        ]

        current = circle.copy()
        self.play(ShowCreation(current))
        self.wait()

        for name, effect_func in effects:
            label = Text(name, font_size=36)
            label.next_to(title, DOWN)

            new_shape = effect_func(Circle(radius=1.5, fill_opacity=1, color=BLUE))

            self.play(
                Transform(current, new_shape),
                Write(label)
            )
            self.wait()
            self.play(FadeOut(label))

        self.play(FadeOut(current))
        self.wait()
`
}

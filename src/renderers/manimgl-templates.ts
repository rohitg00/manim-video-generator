
export interface ManimGLTemplate {
  name: string
  description: string
  features: string[]
  generator: (params?: Record<string, unknown>) => string
}

export function generateMobiusStripCode(): string {
  return `from manimlib import *
import numpy as np

class MainScene(Scene):
    def construct(self):
        # Configure camera for 3D view
        frame = self.camera.frame
        frame.set_euler_angles(phi=70 * DEGREES, theta=30 * DEGREES)

        # Create Mobius strip parametric surface
        def mobius_strip(u, v):
            # u: angle around the strip (0 to 2*PI)
            # v: position across the width (-0.5 to 0.5)
            half_width = 0.3
            radius = 1.5

            x = (radius + v * np.cos(u / 2)) * np.cos(u)
            y = (radius + v * np.cos(u / 2)) * np.sin(u)
            z = v * np.sin(u / 2)

            return np.array([x, y, z])

        # Create the surface
        surface = ParametricSurface(
            mobius_strip,
            u_range=[0, TAU],
            v_range=[-0.5, 0.5],
            resolution=(64, 16),
        )
        surface.set_color(BLUE_D, opacity=0.8)
        surface.set_sheen(0.5, direction=OUT)

        # Add edge highlighting
        edge1 = ParametricCurve(
            lambda t: mobius_strip(t, -0.5),
            t_range=[0, TAU],
            color=YELLOW,
        )
        edge2 = ParametricCurve(
            lambda t: mobius_strip(t, 0.5),
            t_range=[0, TAU],
            color=YELLOW,
        )

        # Title
        title = Text("Mobius Strip", font_size=48)
        title.to_edge(UP)
        title.fix_in_frame()

        # Animate
        self.play(Write(title))
        self.play(ShowCreation(surface), run_time=3)
        self.play(ShowCreation(edge1), ShowCreation(edge2))

        # Rotate camera to show the twist
        self.play(
            frame.animate.increment_theta(TAU),
            run_time=8,
            rate_func=smooth
        )

        self.wait()
`
}

export function generateKleinBottleCode(): string {
  return `from manimlib import *
import numpy as np

class MainScene(Scene):
    def construct(self):
        # Configure camera
        frame = self.camera.frame
        frame.set_euler_angles(phi=70 * DEGREES, theta=-30 * DEGREES)

        # Klein bottle parametric equations
        def klein_bottle(u, v):
            # Parametric Klein bottle
            half = (0 <= u) & (u < PI)

            r = 4 * (1 - np.cos(u) / 2)

            x = np.where(
                half,
                6 * np.cos(u) * (1 + np.sin(u)) + r * np.cos(u) * np.cos(v),
                6 * np.cos(u) * (1 + np.sin(u)) + r * np.cos(v + PI)
            )
            y = np.where(
                half,
                16 * np.sin(u) + r * np.sin(u) * np.cos(v),
                16 * np.sin(u)
            )
            z = r * np.sin(v)

            # Scale down
            return np.array([x, y, z]) * 0.08

        # Create surface
        surface = ParametricSurface(
            klein_bottle,
            u_range=[0, TAU],
            v_range=[0, TAU],
            resolution=(64, 32),
        )

        # Gradient coloring
        surface.set_color_by_gradient(BLUE, GREEN, YELLOW, RED)
        surface.set_sheen(0.3, direction=OUT)

        # Title
        title = Text("Klein Bottle", font_size=48)
        title.to_edge(UP)
        title.fix_in_frame()

        info = Text(
            "A non-orientable surface with no inside or outside",
            font_size=24
        )
        info.next_to(title, DOWN)
        info.fix_in_frame()

        # Animate
        self.play(Write(title), Write(info))
        self.play(ShowCreation(surface), run_time=4)

        # Rotate to show structure
        self.play(
            frame.animate.increment_theta(TAU),
            frame.animate.set_phi(50 * DEGREES),
            run_time=10,
            rate_func=smooth
        )

        self.wait()
`
}

export function generateParametricSurfaceCode(
  funcName: string = 'Custom Surface'
): string {
  return `from manimlib import *
import numpy as np

class MainScene(Scene):
    def construct(self):
        # Configure camera
        frame = self.camera.frame
        frame.set_euler_angles(phi=70 * DEGREES, theta=30 * DEGREES)

        # Custom parametric surface function
        def surface_func(u, v):
            x = u
            y = v
            z = np.sin(u**2 + v**2) * np.exp(-(u**2 + v**2) / 10)
            return np.array([x, y, z])

        # Create surface
        surface = ParametricSurface(
            surface_func,
            u_range=[-3, 3],
            v_range=[-3, 3],
            resolution=(64, 64),
        )

        # Color by height
        surface.set_color_by_gradient(BLUE_E, BLUE_D, TEAL, GREEN, YELLOW)
        surface.set_sheen(0.5, direction=OUT)

        # Create axes
        axes = ThreeDAxes(
            x_range=[-4, 4],
            y_range=[-4, 4],
            z_range=[-2, 2],
        )

        # Title
        title = Text("${funcName}", font_size=48)
        title.to_edge(UP)
        title.fix_in_frame()

        # Equation
        equation = Tex(r"z = \\sin(x^2 + y^2) \\cdot e^{-(x^2+y^2)/10}")
        equation.next_to(title, DOWN)
        equation.fix_in_frame()

        # Animate
        self.play(Write(title), Write(equation))
        self.play(ShowCreation(axes), run_time=2)
        self.play(ShowCreation(surface), run_time=3)

        # Continuous rotation
        frame.add_updater(lambda m, dt: m.increment_theta(0.1 * dt))
        self.wait(10)
        frame.clear_updaters()

        self.wait()
`
}

export function generateShaderEffectCode(): string {
  return `from manimlib import *
import numpy as np

class MainScene(Scene):
    def construct(self):
        # Create base shape
        circle = Circle(radius=2, fill_opacity=1)

        # Apply gradient shader effect
        circle.set_color_by_gradient(BLUE, PURPLE, RED, YELLOW)

        # Add glow effect using shader
        glow = circle.copy()
        glow.set_stroke(color=WHITE, width=20, opacity=0.3)
        glow.scale(1.1)

        # Title
        title = Text("GPU Shader Effects", font_size=48)
        title.to_edge(UP)

        # Create morphing animation with shader
        square = Square(side_length=3, fill_opacity=1)
        square.set_color_by_gradient(RED, ORANGE, YELLOW)

        triangle = Triangle(fill_opacity=1)
        triangle.scale(2)
        triangle.set_color_by_gradient(GREEN, TEAL, BLUE)

        # Animate
        self.play(Write(title))
        self.play(ShowCreation(glow), ShowCreation(circle))
        self.wait()

        # Morph with color transition
        self.play(
            Transform(circle, square),
            Transform(glow, square.copy().set_stroke(WHITE, 20, 0.3).scale(1.1)),
            run_time=2
        )
        self.wait()

        self.play(
            Transform(circle, triangle),
            Transform(glow, triangle.copy().set_stroke(WHITE, 20, 0.3).scale(1.1)),
            run_time=2
        )
        self.wait()

        # Pulsing effect
        for _ in range(3):
            self.play(
                circle.animate.scale(1.2),
                glow.animate.scale(1.3).set_opacity(0.5),
                rate_func=there_and_back,
                run_time=0.5
            )

        self.wait()
`
}

export function generateInteractiveSceneCode(): string {
  return `from manimlib import *
import numpy as np

class MainScene(Scene):
    def construct(self):
        # Instructions
        instructions = VGroup(
            Text("Interactive Controls:", font_size=36),
            Text("- Click and drag to rotate", font_size=24),
            Text("- Scroll to zoom", font_size=24),
            Text("- Press 'r' to reset view", font_size=24),
        ).arrange(DOWN, aligned_edge=LEFT)
        instructions.to_corner(UL)
        instructions.fix_in_frame()

        # Create interactive 3D scene
        frame = self.camera.frame
        frame.set_euler_angles(phi=70 * DEGREES, theta=30 * DEGREES)

        # Create objects
        sphere = Sphere(radius=1, color=BLUE_D)
        cube = Cube(side_length=1.5, color=GREEN_D)
        cube.next_to(sphere, RIGHT, buff=1)

        torus = Torus(r1=0.8, r2=0.3, color=RED_D)
        torus.next_to(sphere, LEFT, buff=1)

        # Add to scene
        self.add(instructions)
        self.play(
            ShowCreation(sphere),
            ShowCreation(cube),
            ShowCreation(torus),
            run_time=2
        )

        # Interactive exploration - the scene will respond to user input
        self.wait(20)  # Wait for user interaction

        # Clean up
        self.play(FadeOut(instructions))
        self.wait()

    def on_key_press(self, symbol, modifiers):
        # Handle keyboard input
        if chr(symbol) == 'r':
            # Reset camera
            self.camera.frame.set_euler_angles(
                phi=70 * DEGREES,
                theta=30 * DEGREES
            )
        super().on_key_press(symbol, modifiers)
`
}

export function generateTorusKnotCode(): string {
  return `from manimlib import *
import numpy as np

class MainScene(Scene):
    def construct(self):
        # Configure camera
        frame = self.camera.frame
        frame.set_euler_angles(phi=70 * DEGREES, theta=30 * DEGREES)

        # Torus knot parameters
        p, q = 3, 5  # (p, q) torus knot

        def torus_knot(t, p=3, q=5, R=2, r=0.8):
            phi = p * t
            theta = q * t

            x = (R + r * np.cos(theta)) * np.cos(phi)
            y = (R + r * np.cos(theta)) * np.sin(phi)
            z = r * np.sin(theta)

            return np.array([x, y, z])

        # Create the knot curve
        knot = ParametricCurve(
            lambda t: torus_knot(t, p, q),
            t_range=[0, TAU],
            color=BLUE,
        )
        knot.set_stroke(width=8)

        # Create tube around the knot
        def tube_surface(u, v):
            # Get point on knot
            point = torus_knot(u, p, q)

            # Get tangent
            dt = 0.01
            tangent = torus_knot(u + dt, p, q) - torus_knot(u - dt, p, q)
            tangent = tangent / np.linalg.norm(tangent)

            # Create normal and binormal
            up = np.array([0, 0, 1])
            normal = np.cross(tangent, up)
            if np.linalg.norm(normal) < 0.01:
                up = np.array([0, 1, 0])
                normal = np.cross(tangent, up)
            normal = normal / np.linalg.norm(normal)
            binormal = np.cross(tangent, normal)

            # Create tube
            tube_r = 0.15
            offset = tube_r * (np.cos(v) * normal + np.sin(v) * binormal)

            return point + offset

        tube = ParametricSurface(
            tube_surface,
            u_range=[0, TAU],
            v_range=[0, TAU],
            resolution=(128, 16),
        )
        tube.set_color_by_gradient(BLUE, PURPLE, RED, ORANGE, YELLOW, GREEN, BLUE)
        tube.set_sheen(0.5, direction=OUT)

        # Title
        title = Text(f"({p},{q}) Torus Knot", font_size=48)
        title.to_edge(UP)
        title.fix_in_frame()

        # Animate
        self.play(Write(title))
        self.play(ShowCreation(tube), run_time=4)

        # Rotate
        frame.add_updater(lambda m, dt: m.increment_theta(0.15 * dt))
        self.wait(12)
        frame.clear_updaters()

        self.wait()
`
}

export function generateWaveInterferenceCode(): string {
  return `from manimlib import *
import numpy as np

class MainScene(Scene):
    def construct(self):
        # Configure camera
        frame = self.camera.frame
        frame.set_euler_angles(phi=60 * DEGREES, theta=30 * DEGREES)

        # Wave parameters
        k1, k2 = 2, 2  # Wave numbers
        omega = 1  # Angular frequency

        # Time tracker
        time = ValueTracker(0)

        def wave_surface(u, v):
            t = time.get_value()
            # Two interfering waves
            z1 = np.sin(k1 * u - omega * t)
            z2 = np.sin(k2 * v - omega * t)
            z = (z1 + z2) / 2
            return np.array([u, v, z])

        # Create animated surface
        surface = always_redraw(
            lambda: ParametricSurface(
                wave_surface,
                u_range=[-PI, PI],
                v_range=[-PI, PI],
                resolution=(48, 48),
            ).set_color_by_gradient(BLUE_E, BLUE_D, TEAL, GREEN, YELLOW)
        )

        # Title
        title = Text("Wave Interference Pattern", font_size=48)
        title.to_edge(UP)
        title.fix_in_frame()

        equation = Tex(
            r"z = \\frac{1}{2}[\\sin(k_1 x - \\omega t) + \\sin(k_2 y - \\omega t)]"
        )
        equation.next_to(title, DOWN)
        equation.fix_in_frame()

        # Animate
        self.play(Write(title), Write(equation))
        self.add(surface)

        # Animate waves
        self.play(
            time.animate.set_value(4 * PI),
            run_time=8,
            rate_func=linear
        )

        self.wait()
`
}

export const MANIMGL_TEMPLATES: Record<string, ManimGLTemplate> = {
  mobius_strip: {
    name: 'Mobius Strip',
    description: 'Non-orientable surface with a single side',
    features: ['3D', 'parametric', 'topology'],
    generator: generateMobiusStripCode
  },
  klein_bottle: {
    name: 'Klein Bottle',
    description: 'Non-orientable surface that cannot exist in 3D without self-intersection',
    features: ['3D', 'parametric', 'topology', 'advanced'],
    generator: generateKleinBottleCode
  },
  parametric_surface: {
    name: 'Parametric Surface',
    description: 'Custom parametric surface with height coloring',
    features: ['3D', 'parametric', 'calculus'],
    generator: generateParametricSurfaceCode
  },
  shader_effects: {
    name: 'GPU Shader Effects',
    description: 'Demonstration of GPU shader capabilities',
    features: ['gpu', 'shaders', '2D'],
    generator: generateShaderEffectCode
  },
  interactive_scene: {
    name: 'Interactive Scene',
    description: 'Interactive 3D scene with user controls',
    features: ['interactive', '3D', 'controls'],
    generator: generateInteractiveSceneCode
  },
  torus_knot: {
    name: 'Torus Knot',
    description: 'Mathematical knot on the surface of a torus',
    features: ['3D', 'parametric', 'topology', 'advanced'],
    generator: generateTorusKnotCode
  },
  wave_interference: {
    name: 'Wave Interference',
    description: 'Animated wave interference pattern',
    features: ['3D', 'animation', 'physics'],
    generator: generateWaveInterferenceCode
  }
}

export function getManimGLTemplate(name: string): ManimGLTemplate | null {
  return MANIMGL_TEMPLATES[name] || null
}

export function getTemplatesByFeature(feature: string): ManimGLTemplate[] {
  return Object.values(MANIMGL_TEMPLATES).filter((t) =>
    t.features.includes(feature)
  )
}

export function getAvailableTemplates(): string[] {
  return Object.keys(MANIMGL_TEMPLATES)
}

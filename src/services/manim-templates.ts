/**
 * Manim Code Templates
 * Pre-built templates for common mathematical visualizations
 */

export interface TemplateMapping {
  keywords: string[];
  generator: () => string;
}

// LaTeX command patterns for detection
const LATEX_COMMAND_HINTS = [
  '\\frac', '\\sum', '\\int', '\\sqrt', '\\alpha', '\\beta',
  '\\pi', '\\sin', '\\cos', '\\tan', '\\left', '\\right',
];

/**
 * Check if text is likely a LaTeX expression
 */
export function isLikelyLatex(text: string): boolean {
  const t = text.trim();
  if (!t) return false;

  // Check for common LaTeX delimiters
  if (['$$', '$', '\\(', '\\)', '\\[', '\\]'].some(d => t.includes(d))) {
    return true;
  }

  // Check for LaTeX commands
  if (LATEX_COMMAND_HINTS.some(cmd => t.includes(cmd))) {
    return true;
  }

  // Check for superscript/subscript patterns
  if ((t.includes('^') || t.includes('_')) && !t.slice(0, 3).trim().includes(' ')) {
    return true;
  }

  return false;
}

/**
 * Clean LaTeX expression by removing delimiters
 */
export function cleanLatex(text: string): string {
  let t = text.trim();
  // Remove common delimiters
  t = t.replace(/^\$+|\$+$/g, '');
  t = t.replace(/^\\\(|\\\)$/g, '');
  t = t.replace(/^\\\[|\\\]$/g, '');
  return t.trim();
}

/**
 * Generate Manim code for a LaTeX expression
 */
export function generateLatexSceneCode(expr: string): string {
  const cleanedExpr = cleanLatex(expr);
  return `from manim import *

class MainScene(Scene):
    def construct(self):
        title = Title('LaTeX')
        eq = MathTex(r"${cleanedExpr}").scale(1.2)
        self.play(Write(title))
        self.play(Write(eq))
        self.wait()
`;
}

/**
 * Template mappings with keywords and generators
 */
export const templateMappings: Record<string, TemplateMapping> = {
  pythagorean: {
    keywords: ['pythagoras', 'pythagorean', 'right triangle', 'hypotenuse'],
    generator: generatePythagoreanCode
  },
  quadratic: {
    keywords: ['quadratic', 'parabola', 'x squared', 'x^2'],
    generator: generateQuadraticCode
  },
  trigonometry: {
    keywords: ['sine', 'cosine', 'trigonometry', 'trig', 'unit circle'],
    generator: generateTrigCode
  },
  '3d_surface': {
    keywords: ['3d surface', 'surface plot', '3d plot', 'three dimensional'],
    generator: generate3DSurfaceCode
  },
  sphere: {
    keywords: ['sphere', 'ball', 'spherical'],
    generator: generateSphereCode
  },
  cube: {
    keywords: ['cube', 'cubic', 'box'],
    generator: generateCubeCode
  },
  derivative: {
    keywords: ['derivative', 'differentiation', 'slope', 'rate of change'],
    generator: generateDerivativeCode
  },
  integral: {
    keywords: ['integration', 'integral', 'area under curve', 'antiderivative'],
    generator: generateIntegralCode
  },
  matrix: {
    keywords: ['matrix', 'matrices', 'linear transformation'],
    generator: generateMatrixCode
  },
  eigenvalue: {
    keywords: ['eigenvalue', 'eigenvector', 'characteristic'],
    generator: generateEigenvalueCode
  },
  complex: {
    keywords: ['complex', 'imaginary', 'complex plane'],
    generator: generateComplexCode
  },
  differential_equation: {
    keywords: ['differential equation', 'ode', 'pde'],
    generator: generateDiffEqCode
  }
};

/**
 * Calculate match score for a template
 * Returns a score between 0 and 1, with higher being better
 */
export function calculateMatchScore(concept: string, keywords: string[]): number {
  const lowerConcept = concept.toLowerCase().trim();
  const words = lowerConcept.split(/\s+/);

  let matchedKeywords = 0;
  let totalKeywordWords = 0;

  for (const keyword of keywords) {
    const keywordWords = keyword.toLowerCase().split(/\s+/);
    totalKeywordWords += keywordWords.length;

    const allWordsMatch = keywordWords.every(kw =>
      words.some(w => w.includes(kw) || kw.includes(w))
    );

    if (allWordsMatch) {
      matchedKeywords += keywordWords.length;
    }
  }

  // Calculate percentage of keyword words matched
  const keywordScore = totalKeywordWords > 0 ? matchedKeywords / totalKeywordWords : 0;

  // Strong penalty for complex queries that are likely more specific than template
  const conceptComplexity = words.length;
  let complexityPenalty = 1.0;

  if (conceptComplexity > 8) {
    complexityPenalty = 0.4;  // Very complex queries - 60% penalty
  } else if (conceptComplexity > 5) {
    complexityPenalty = 0.6;  // Moderately complex - 40% penalty
  }

  // Additional penalty if concept has words not in any keywords (likely specific requirements)
  const allKeywordWords = keywords.flatMap(k => k.toLowerCase().split(/\s+/));
  const unmatchedWords = words.filter(w => !allKeywordWords.some(kw => w.includes(kw) || kw.includes(w)));
  const specificityPenalty = unmatchedWords.length > 3 ? 0.8 : 1.0;

  return keywordScore * complexityPenalty * specificityPenalty;
}

/**
 * Template match threshold - set high to prefer AI generation for unique outputs
 * 0.75 requires very strong keyword match to use template
 */
export const TEMPLATE_MATCH_THRESHOLD = 0.75;

/**
 * Select appropriate template based on concept keywords
 * Only returns a template if confidence is very high (>0.75)
 * This ensures most queries go to AI for unique animations
 */
export function selectTemplate(concept: string): { code: string; templateName: string } | null {
  const lowerConcept = concept.toLowerCase().trim();

  let bestMatch: (() => string) | null = null;
  let bestTemplateName = '';
  let bestScore = 0;

  for (const [templateName, templateInfo] of Object.entries(templateMappings)) {
    const score = calculateMatchScore(lowerConcept, templateInfo.keywords);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = templateInfo.generator;
      bestTemplateName = templateName;
    }
  }

  // Only use template if confidence is very high (>75% match)
  // This ensures complex/specific queries go to AI for unique outputs
  if (bestMatch && bestScore > TEMPLATE_MATCH_THRESHOLD) {
    try {
      return { code: bestMatch(), templateName: bestTemplateName };
    } catch (error) {
      console.error('Error generating template:', error);
      return null;
    }
  }

  return null;
}

/**
 * Get template match info without generating code (for logging/debugging)
 */
export function getTemplateMatchInfo(concept: string): { bestTemplate: string; bestScore: number; threshold: number } {
  const lowerConcept = concept.toLowerCase().trim();
  let bestTemplate = '';
  let bestScore = 0;

  for (const [templateName, templateInfo] of Object.entries(templateMappings)) {
    const score = calculateMatchScore(lowerConcept, templateInfo.keywords);
    if (score > bestScore) {
      bestScore = score;
      bestTemplate = templateName;
    }
  }

  return { bestTemplate, bestScore, threshold: TEMPLATE_MATCH_THRESHOLD };
}

// --- Template Generators ---

export function generatePythagoreanCode(): string {
  return `from manim import *

class MainScene(Scene):
    def construct(self):
        # Create triangle
        triangle = Polygon(
            ORIGIN, RIGHT*3, UP*4,
            color=WHITE
        )

        # Add labels using Text instead of MathTex
        a = Text("a", font_size=36).next_to(triangle, DOWN)
        b = Text("b", font_size=36).next_to(triangle, RIGHT)
        c = Text("c", font_size=36).next_to(
            triangle.get_center() + UP + RIGHT,
            UP+RIGHT
        )

        # Add equation using MathTex
        equation = MathTex(r"a^2 + b^2 = c^2").scale(1.1)
        equation.to_edge(UP)

        # Create the animation
        self.play(Create(triangle))
        self.play(Write(a), Write(b), Write(c))
        self.play(Write(equation))
        self.wait()
`;
}

export function generateDerivativeCode(): string {
  return `from manim import *

class MainScene(Scene):
    def construct(self):
        # Create coordinate system
        axes = Axes(
            x_range=[-2, 2],
            y_range=[-1, 2],
            axis_config={"include_tip": True}
        )

        # Add custom labels
        x_label = Text("x").next_to(axes.x_axis.get_end(), RIGHT)
        y_label = Text("y").next_to(axes.y_axis.get_end(), UP)

        # Create function
        def func(x):
            return x**2

        graph = axes.plot(func, color=BLUE)

        # Create derivative function
        def deriv(x):
            return 2*x

        derivative = axes.plot(deriv, color=RED)

        # Create labels
        func_label = Text("f(x) = x^2").set_color(BLUE)
        deriv_label = Text("f'(x) = 2x").set_color(RED)

        # Position labels
        func_label.to_corner(UL)
        deriv_label.next_to(func_label, DOWN)

        # Create animations
        self.play(Create(axes), Write(x_label), Write(y_label))
        self.play(Create(graph), Write(func_label))
        self.wait()
        self.play(Create(derivative), Write(deriv_label))
        self.wait()
`;
}

export function generateIntegralCode(): string {
  return `from manim import *

class MainScene(Scene):
    def construct(self):
        # Create coordinate system
        axes = Axes(
            x_range=[-2, 2],
            y_range=[-1, 2],
            axis_config={"include_tip": True}
        )

        # Add custom labels
        x_label = Text("x").next_to(axes.x_axis.get_end(), RIGHT)
        y_label = Text("y").next_to(axes.y_axis.get_end(), UP)

        # Create function
        def func(x):
            return x**2

        graph = axes.plot(func, color=BLUE)

        # Create area
        area = axes.get_area(
            graph,
            x_range=[0, 1],
            color=YELLOW,
            opacity=0.3
        )

        # Create labels
        func_label = Text("f(x) = x^2").set_color(BLUE)
        integral_label = Text("Area = 1/3").set_color(YELLOW)

        # Position labels
        func_label.to_corner(UL)
        integral_label.next_to(func_label, DOWN)

        # Create animations
        self.play(Create(axes), Write(x_label), Write(y_label))
        self.play(Create(graph), Write(func_label))
        self.wait()
        self.play(FadeIn(area), Write(integral_label))
        self.wait()
`;
}

export function generate3DSurfaceCode(): string {
  return `from manim import *
import numpy as np

class MainScene(ThreeDScene):
    def construct(self):
        # Configure the camera
        self.set_camera_orientation(phi=75 * DEGREES, theta=30 * DEGREES)

        # Create 3D axes
        axes = ThreeDAxes(
            x_range=[-3, 3, 1],
            y_range=[-3, 3, 1],
            z_range=[-1.5, 1.5, 0.5],
            x_length=6,
            y_length=6,
            z_length=3
        )

        # Create surface z = sin(x) * cos(y)
        surface = Surface(
            lambda u, v: axes.c2p(u, v, np.sin(u) * np.cos(v)),
            u_range=[-3, 3],
            v_range=[-3, 3],
            resolution=(24, 24),
            fill_opacity=0.8,
            checkerboard_colors=[BLUE_D, BLUE_E],
            stroke_width=0.5,
            stroke_color=WHITE
        )

        # Title
        title = Text("z = sin(x) cos(y)", font_size=32)
        title.to_corner(UL)
        self.add_fixed_in_frame_mobjects(title)

        # Animations
        self.play(Create(axes), run_time=1.5)
        self.wait(0.3)
        self.play(Create(surface), run_time=2)
        self.wait(0.5)
        self.play(Write(title))

        # Rotate camera to show the surface from different angles
        self.begin_ambient_camera_rotation(rate=0.15)
        self.wait(4)
        self.stop_ambient_camera_rotation()
        self.wait()
`;
}

export function generateSphereCode(): string {
  return `from manim import *
import numpy as np

class MainScene(ThreeDScene):
    def construct(self):
        # Configure the scene
        self.set_camera_orientation(phi=75 * DEGREES, theta=30 * DEGREES)

        # Create axes
        axes = ThreeDAxes()

        # Create sphere
        sphere = Surface(
            lambda u, v: np.array([
                np.cos(u) * np.cos(v),
                np.cos(u) * np.sin(v),
                np.sin(u)
            ]),
            u_range=[-PI/2, PI/2],
            v_range=[0, TAU],
            checkerboard_colors=[BLUE_D, BLUE_E]
        )

        # Add custom labels
        x_label = Text("x").next_to(axes.x_axis.get_end(), RIGHT)
        y_label = Text("y").next_to(axes.y_axis.get_end(), UP)
        z_label = Text("z").next_to(axes.z_axis.get_end(), OUT)

        # Create animations
        self.begin_ambient_camera_rotation(rate=0.2)
        self.play(Create(axes), Write(x_label), Write(y_label), Write(z_label))
        self.play(Create(sphere))
        self.wait(2)
        self.stop_ambient_camera_rotation()
        self.wait()
`;
}

export function generateCubeCode(): string {
  return `from manim import *

class MainScene(ThreeDScene):
    def construct(self):
        # Set up the scene
        self.set_camera_orientation(phi=75 * DEGREES, theta=30 * DEGREES)
        axes = ThreeDAxes(
            x_range=[-3, 3],
            y_range=[-3, 3],
            z_range=[-3, 3]
        )

        # Create cube
        cube = Cube(side_length=2, fill_opacity=0.7, stroke_width=2)
        cube.set_color(BLUE)

        # Labels for sides
        a_label = Text("a", font_size=36).set_color(YELLOW)
        a_label.next_to(cube, RIGHT)

        # Surface area formula
        area_formula = Text(
            "A = 6a^2"
        ).to_corner(UL)

        # Add everything to scene
        self.add(axes)
        self.play(Create(cube))
        self.wait()
        self.play(Write(a_label))
        self.wait()
        self.play(Write(area_formula))
        self.wait()

        # Rotate camera for better view
        self.begin_ambient_camera_rotation(rate=0.2)
        self.wait(5)
        self.stop_ambient_camera_rotation()
`;
}

export function generateMatrixCode(): string {
  return `from manim import *

class MainScene(Scene):
    def construct(self):
        # Create matrices
        matrix_a = VGroup(
            Text("2  1"),
            Text("1  3")
        ).arrange(DOWN)
        matrix_a.add(SurroundingRectangle(matrix_a))

        matrix_b = VGroup(
            Text("1"),
            Text("2")
        ).arrange(DOWN)
        matrix_b.add(SurroundingRectangle(matrix_b))

        # Create multiplication symbol and equals sign
        times = Text("x")
        equals = Text("=")

        # Create result matrix
        result = VGroup(
            Text("4"),
            Text("7")
        ).arrange(DOWN)
        result.add(SurroundingRectangle(result))

        # Position everything
        equation = VGroup(
            matrix_a, times, matrix_b,
            equals, result
        ).arrange(RIGHT)

        # Create step-by-step calculations
        calc1 = Text("= [2(1) + 1(2)]")
        calc2 = Text("= [2 + 2]")
        calc3 = Text("= [4]")

        calcs = VGroup(calc1, calc2, calc3).arrange(DOWN)
        calcs.next_to(equation, DOWN, buff=1)

        # Create animations
        self.play(Create(matrix_a))
        self.play(Create(matrix_b))
        self.play(Write(times), Write(equals))
        self.play(Create(result))
        self.wait()

        self.play(Write(calc1))
        self.play(Write(calc2))
        self.play(Write(calc3))
        self.wait()
`;
}

export function generateEigenvalueCode(): string {
  return `from manim import *

class MainScene(Scene):
    def construct(self):
        # Create matrix and vector
        matrix = VGroup(
            Text("2  1"),
            Text("1  2")
        ).arrange(DOWN)
        matrix.add(SurroundingRectangle(matrix))

        vector = VGroup(
            Text("v1"),
            Text("v2")
        ).arrange(DOWN)
        vector.add(SurroundingRectangle(vector))

        # Create lambda and equation
        lambda_text = Text("lambda")
        equation = Text("Av = lambda v")

        # Position everything
        group = VGroup(matrix, vector, lambda_text, equation).arrange(RIGHT)
        group.to_edge(UP)

        # Create characteristic equation steps
        char_eq = Text("det(A - lambda I) = 0")
        expanded = Text("|2-lambda  1|")
        expanded2 = Text("|1  2-lambda|")
        solved = Text("(2-lambda)^2 - 1 = 0")
        result = Text("lambda = 1, 3")

        # Position steps
        steps = VGroup(
            char_eq, expanded, expanded2,
            solved, result
        ).arrange(DOWN)
        steps.next_to(group, DOWN, buff=1)

        # Create animations
        self.play(Create(matrix), Create(vector))
        self.play(Write(lambda_text), Write(equation))
        self.wait()

        self.play(Write(char_eq))
        self.play(Write(expanded), Write(expanded2))
        self.play(Write(solved))
        self.play(Write(result))
        self.wait()
`;
}

export function generateComplexCode(): string {
  return `from manim import *

class MainScene(Scene):
    def construct(self):
        # Set up plane
        plane = ComplexPlane()
        self.play(Create(plane))

        # Create complex number
        z = 3 + 2j
        dot = Dot([3, 2, 0], color=YELLOW)

        # Create vector and labels
        vector = Arrow(
            ORIGIN, dot.get_center(),
            buff=0, color=YELLOW
        )
        re_line = DashedLine(
            ORIGIN, [3, 0, 0], color=BLUE
        )
        im_line = DashedLine(
            [3, 0, 0], [3, 2, 0], color=RED
        )

        # Add labels
        z_label = Text("z = 3 + 2i", font_size=36)
        z_label.next_to(dot, UR)
        re_label = Text("Re(z) = 3", font_size=36)
        re_label.next_to(re_line, DOWN)
        im_label = Text("Im(z) = 2", font_size=36)
        im_label.next_to(im_line, RIGHT)

        # Animations
        self.play(Create(vector))
        self.play(Write(z_label))
        self.wait()
        self.play(
            Create(re_line),
            Create(im_line)
        )
        self.play(
            Write(re_label),
            Write(im_label)
        )
        self.wait()
`;
}

export function generateDiffEqCode(): string {
  return `from manim import *
import numpy as np

class MainScene(Scene):
    def construct(self):
        # Title
        title = Text("First Order Linear ODE", font_size=36).to_edge(UP)
        self.play(Write(title))

        # Create differential equation
        eq = MathTex(r"\\frac{dy}{dx} + 2y = e^x", font_size=36)
        eq.next_to(title, DOWN, buff=0.5)

        # Solution steps
        step1 = MathTex(r"\\text{Integrating factor: } \\mu = e^{2x}", font_size=32)
        step2 = MathTex(r"y = e^{-2x} \\int e^{3x} \\, dx", font_size=32)
        step3 = MathTex(r"y = \\frac{1}{3}e^x + Ce^{-2x}", font_size=32, color=YELLOW)

        # Arrange equations vertically
        steps = VGroup(step1, step2, step3).arrange(DOWN, buff=0.4)
        steps.next_to(eq, DOWN, buff=0.5)

        # Animations
        self.play(Write(eq))
        self.wait(0.5)
        self.play(Write(step1))
        self.wait(0.5)
        self.play(Write(step2))
        self.wait(0.5)
        self.play(Write(step3))
        self.wait()

        # Transition to graph
        self.play(FadeOut(VGroup(title, eq, steps)))
        self.wait(0.3)

        # Create graph
        axes = Axes(
            x_range=[-2, 2, 0.5],
            y_range=[-1, 4, 1],
            x_length=8,
            y_length=5,
            axis_config={"include_tip": True}
        )
        x_label = Text("x", font_size=24).next_to(axes.x_axis.get_end(), RIGHT)
        y_label = Text("y", font_size=24).next_to(axes.y_axis.get_end(), UP)

        # Plot particular solution (C=0)
        graph = axes.plot(
            lambda x: (1/3) * np.exp(x),
            x_range=[-2, 1.2],
            color=YELLOW
        )
        graph_label = MathTex(r"y = \\frac{1}{3}e^x", color=YELLOW, font_size=28)
        graph_label.next_to(graph.get_end(), RIGHT)

        # Show graph
        self.play(Create(axes), Write(x_label), Write(y_label))
        self.play(Create(graph), Write(graph_label))
        self.wait()
`;
}

export function generateTrigCode(): string {
  return `from manim import *

class MainScene(Scene):
    def construct(self):
        # Create coordinate plane
        plane = NumberPlane(
            x_range=[-4, 4],
            y_range=[-2, 2],
            axis_config={"include_tip": True}
        )

        # Add custom labels
        x_label = Text("x", font_size=24).next_to(plane.x_axis.get_end(), RIGHT)
        y_label = Text("y", font_size=24).next_to(plane.y_axis.get_end(), UP)

        # Create unit circle
        circle = Circle(radius=1, color=BLUE)

        # Create angle tracker
        theta = ValueTracker(0)

        # Create dot that moves around circle
        dot = always_redraw(
            lambda: Dot(
                point=circle.point_at_angle(theta.get_value()),
                color=YELLOW
            )
        )

        # Create lines to show sine and cosine
        sin_line = always_redraw(
            lambda: Line(
                start=circle.point_at_angle(theta.get_value()),
                end=[circle.point_at_angle(theta.get_value())[0], 0, 0],
                color=GREEN,
                stroke_width=3
            )
        )

        cos_line = always_redraw(
            lambda: Line(
                start=ORIGIN,
                end=[circle.point_at_angle(theta.get_value())[0], 0, 0],
                color=RED,
                stroke_width=3
            )
        )

        # Create static labels
        title = Text("Unit Circle Trigonometry", font_size=32).to_edge(UP)
        sin_label = MathTex(r"\\sin(\\theta)", color=GREEN, font_size=28).to_corner(UR)
        cos_label = MathTex(r"\\cos(\\theta)", color=RED, font_size=28).next_to(sin_label, DOWN)

        # Add everything to scene
        self.play(Write(title))
        self.play(Create(plane), Write(x_label), Write(y_label))
        self.play(Create(circle))
        self.wait(0.5)
        self.add(dot, sin_line, cos_line)
        self.play(Write(sin_label), Write(cos_label))

        # Animate angle around the circle
        self.play(
            theta.animate.set_value(2 * PI),
            run_time=4,
            rate_func=linear
        )
        self.wait()
`;
}

export function generateQuadraticCode(): string {
  return `from manim import *

class MainScene(Scene):
    def construct(self):
        # Create coordinate system
        axes = Axes(
            x_range=[-4, 4],
            y_range=[-2, 8],
            axis_config={"include_tip": True}
        )

        # Add custom labels
        x_label = Text("x").next_to(axes.x_axis.get_end(), RIGHT)
        y_label = Text("y").next_to(axes.y_axis.get_end(), UP)

        # Create quadratic function
        def func(x):
            return x**2

        graph = axes.plot(
            func,
            color=BLUE,
            x_range=[-3, 3]
        )

        # Create labels and equation
        equation = Text("f(x) = x^2").to_corner(UL)

        # Create dot and value tracker
        x = ValueTracker(-3)
        dot = always_redraw(
            lambda: Dot(
                axes.c2p(
                    x.get_value(),
                    func(x.get_value())
                ),
                color=YELLOW
            )
        )

        # Create lines to show x and y values
        v_line = always_redraw(
            lambda: axes.get_vertical_line(
                axes.input_to_graph_point(
                    x.get_value(),
                    graph
                ),
                color=RED
            )
        )
        h_line = always_redraw(
            lambda: axes.get_horizontal_line(
                axes.input_to_graph_point(
                    x.get_value(),
                    graph
                ),
                color=GREEN
            )
        )

        # Add everything to scene
        self.play(Create(axes), Write(x_label), Write(y_label))
        self.play(Create(graph))
        self.play(Write(equation))
        self.play(Create(dot), Create(v_line), Create(h_line))

        # Animate x value
        self.play(
            x.animate.set_value(3),
            run_time=6,
            rate_func=there_and_back
        )
        self.wait()
`;
}

export function generateBasicVisualizationCode(): string {
  return `from manim import *
import numpy as np

class MainScene(Scene):
    def construct(self):
        # Create title
        title = Text("Mathematical Visualization", font_size=36).to_edge(UP)

        # Create axes
        axes = Axes(
            x_range=[-5, 5, 1],
            y_range=[-3, 3, 1],
            axis_config={"include_tip": True},
            x_length=10,
            y_length=6
        )

        # Add labels
        x_label = Text("x", font_size=24).next_to(axes.x_axis.get_end(), RIGHT)
        y_label = Text("y", font_size=24).next_to(axes.y_axis.get_end(), UP)

        # Create function graphs
        sin_graph = axes.plot(lambda x: np.sin(x), color=BLUE)
        cos_graph = axes.plot(lambda x: np.cos(x), color=RED)

        # Create labels for functions
        sin_label = Text("sin(x)", font_size=24, color=BLUE).next_to(sin_graph, UP)
        cos_label = Text("cos(x)", font_size=24, color=RED).next_to(cos_graph, DOWN)

        # Create dot to track movement
        moving_dot = Dot(color=YELLOW)
        moving_dot.move_to(axes.c2p(-5, 0))

        # Create path for dot to follow
        path = VMobject()
        path.set_points_smoothly([
            axes.c2p(x, np.sin(x))
            for x in np.linspace(-5, 5, 100)
        ])

        # Animate everything
        self.play(Write(title))
        self.play(Create(axes), Write(x_label), Write(y_label))
        self.play(Create(sin_graph), Write(sin_label))
        self.play(Create(cos_graph), Write(cos_label))
        self.play(Create(moving_dot))

        # Animate dot following the sine curve
        self.play(
            MoveAlongPath(moving_dot, path),
            run_time=3,
            rate_func=linear
        )

        # Final pause
        self.wait()
`;
}

---
name: math-visualizer
version: "1.0.0"
description: |
  Mathematical visualization skill for equations, proofs, and geometric concepts.

  **Triggers when:**
  - User mentions equations, formulas, or mathematical expressions
  - Request involves mathematical proofs or derivations
  - Content includes geometric relationships
  - User mentions LaTeX, calculus, algebra, geometry, trigonometry
  - Patterns: "equation", "formula", "prove", "derive", "graph", "plot"

  **Capabilities:**
  - LaTeX equation rendering with color-coded components
  - Function graphing and transformations
  - Geometric constructions and proofs
  - 3D mathematical surfaces
  - Step-by-step derivations with highlights
author: manim-video-generator
license: MIT
---

# Math Visualizer Skill

The Math Visualizer brings mathematical concepts to life through precise, beautiful animations that reveal the structure and relationships within mathematics.

## Mathematical Domains

### Supported Areas
- **Algebra**: Equations, inequalities, polynomials
- **Calculus**: Derivatives, integrals, limits, series
- **Geometry**: Shapes, transformations, proofs
- **Trigonometry**: Functions, identities, unit circle
- **Linear Algebra**: Vectors, matrices, transformations
- **Complex Analysis**: Complex numbers, transformations
- **Number Theory**: Primes, sequences, patterns

## Rules

### [rules/equation-presentation.md](rules/equation-presentation.md)
How to present equations with proper pacing and emphasis.

### [rules/color-coding-math.md](rules/color-coding-math.md)
Consistent color schemes for mathematical elements.

### [rules/graphing-best-practices.md](rules/graphing-best-practices.md)
Creating clear, informative function graphs.

### [rules/proof-visualization.md](rules/proof-visualization.md)
Step-by-step proof animations that build understanding.

## Color Coding Standard

| Element | Color | Hex |
|---------|-------|-----|
| Variables (x, y) | BLUE | #58C4DD |
| Constants | YELLOW | #FFFF00 |
| Operators | WHITE | #FFFFFF |
| Key Terms | GREEN | #83C167 |
| Equals/Results | GOLD | #FFD700 |
| Negative/Subtract | RED | #FC6255 |

## Templates

### Equation Derivation
```python
from manim import *

class EquationDerivation(Scene):
    def construct(self):
        # Initial equation
        eq1 = MathTex(r"x^2 + 2x + 1 = 0")
        self.play(Write(eq1))
        self.wait()

        # Transform step by step
        eq2 = MathTex(r"(x + 1)^2 = 0")
        eq3 = MathTex(r"x + 1 = 0")
        eq4 = MathTex(r"x = -1")

        # Show each transformation
        for new_eq in [eq2, eq3, eq4]:
            self.play(TransformMatchingTex(eq1, new_eq))
            self.wait()
            eq1 = new_eq

        # Highlight final answer
        box = SurroundingRectangle(eq4, color=GREEN, buff=0.2)
        self.play(Create(box))
```

### Color-Coded Equation
```python
from manim import *

class ColorCodedEquation(Scene):
    def construct(self):
        # Equation with color-coded parts
        equation = MathTex(
            r"f(", r"x", r") = ", r"a", r"x^2", r" + ", r"b", r"x", r" + ", r"c"
        )

        # Color code
        equation[1].set_color(BLUE)   # x
        equation[3].set_color(YELLOW) # a
        equation[4].set_color(BLUE)   # x^2
        equation[6].set_color(YELLOW) # b
        equation[7].set_color(BLUE)   # x
        equation[9].set_color(YELLOW) # c

        self.play(Write(equation))

        # Explain each part
        labels = [
            (equation[3], "coefficient"),
            (equation[1], "variable"),
            (equation[9], "constant")
        ]

        for part, label_text in labels:
            self.play(Indicate(part))
            label = Text(label_text, font_size=24).next_to(part, DOWN)
            self.play(Write(label))
            self.wait()
            self.play(FadeOut(label))
```

### Function Graph with Animation
```python
from manim import *

class FunctionGraph(Scene):
    def construct(self):
        # Create axes
        axes = Axes(
            x_range=[-4, 4, 1],
            y_range=[-2, 8, 1],
            x_length=8,
            y_length=5,
            axis_config={"include_tip": True}
        )
        labels = axes.get_axis_labels(x_label="x", y_label="y")

        self.play(Create(axes), Write(labels))

        # Function
        func = axes.plot(lambda x: x**2, color=BLUE)
        func_label = MathTex(r"f(x) = x^2", color=BLUE).to_corner(UR)

        self.play(Create(func), Write(func_label))

        # Show derivative
        deriv = axes.plot(lambda x: 2*x, color=GREEN)
        deriv_label = MathTex(r"f'(x) = 2x", color=GREEN).next_to(func_label, DOWN)

        self.play(Create(deriv), Write(deriv_label))

        # Tangent line demonstration
        x_tracker = ValueTracker(-2)

        tangent = always_redraw(lambda: axes.get_secant_slope_group(
            x=x_tracker.get_value(),
            graph=func,
            dx=0.01,
            secant_line_color=YELLOW,
            secant_line_length=4
        ))

        dot = always_redraw(lambda: Dot(
            axes.c2p(x_tracker.get_value(), x_tracker.get_value()**2),
            color=RED
        ))

        self.play(Create(tangent), Create(dot))
        self.play(x_tracker.animate.set_value(2), run_time=4)
```

### 3D Mathematical Surface
```python
from manim import *

class Surface3D(ThreeDScene):
    def construct(self):
        # Set up camera
        self.set_camera_orientation(phi=75 * DEGREES, theta=-45 * DEGREES)

        # Create axes
        axes = ThreeDAxes(
            x_range=[-3, 3, 1],
            y_range=[-3, 3, 1],
            z_range=[-2, 2, 1]
        )

        # Create surface
        surface = Surface(
            lambda u, v: axes.c2p(u, v, np.sin(u) * np.cos(v)),
            u_range=[-PI, PI],
            v_range=[-PI, PI],
            resolution=(30, 30),
            fill_opacity=0.7
        )
        surface.set_fill_by_value(
            axes=axes,
            colorscale=[(RED, -1), (YELLOW, 0), (GREEN, 1)]
        )

        # Animate
        self.play(Create(axes))
        self.play(Create(surface), run_time=3)
        self.begin_ambient_camera_rotation(rate=0.2)
        self.wait(5)
```

### Geometric Proof
```python
from manim import *

class PythagoreanProof(Scene):
    def construct(self):
        # Create right triangle
        triangle = Polygon(
            ORIGIN, RIGHT * 3, RIGHT * 3 + UP * 4,
            color=WHITE, fill_opacity=0.3
        )

        # Labels
        a_label = MathTex("a").next_to(triangle, DOWN)
        b_label = MathTex("b").next_to(triangle, RIGHT)
        c_label = MathTex("c").move_to(
            (ORIGIN + RIGHT * 3 + UP * 4) / 2 + LEFT * 0.5 + UP * 0.3
        )

        self.play(Create(triangle))
        self.play(Write(a_label), Write(b_label), Write(c_label))

        # Show squares on each side
        sq_a = Square(side_length=3, color=BLUE, fill_opacity=0.5)
        sq_a.next_to(triangle, DOWN, buff=0)

        sq_b = Square(side_length=4, color=GREEN, fill_opacity=0.5)
        sq_b.next_to(triangle, RIGHT, buff=0)

        self.play(Create(sq_a), Create(sq_b))

        # Area labels
        area_a = MathTex(r"a^2", color=BLUE).move_to(sq_a)
        area_b = MathTex(r"b^2", color=GREEN).move_to(sq_b)

        self.play(Write(area_a), Write(area_b))

        # Conclusion
        theorem = MathTex(r"a^2 + b^2 = c^2").to_edge(UP)
        box = SurroundingRectangle(theorem, color=GOLD)

        self.play(Write(theorem), Create(box))
```

## LaTeX Quick Reference

### Common Expressions
```latex
% Fractions
\frac{a}{b}

% Square root
\sqrt{x}  \sqrt[n]{x}

% Summation
\sum_{i=1}^{n} x_i

% Integral
\int_{a}^{b} f(x) \, dx

% Limit
\lim_{x \to \infty} f(x)

% Matrix
\begin{pmatrix} a & b \\ c & d \end{pmatrix}

% Partial derivative
\frac{\partial f}{\partial x}
```

### Greek Letters
```latex
\alpha \beta \gamma \delta \epsilon
\theta \lambda \mu \pi \sigma \omega
\Gamma \Delta \Theta \Lambda \Sigma \Omega
```

## Best Practices

1. **Reveal equations gradually** - Build up complex equations piece by piece
2. **Use consistent notation** - Same symbol = same meaning throughout
3. **Annotate meaningfully** - Labels should clarify, not clutter
4. **Show, don't just state** - Animate the mathematical relationships
5. **Connect to intuition** - Bridge abstract math to visual understanding

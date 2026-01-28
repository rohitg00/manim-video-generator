
from manim import *
import numpy as np

class QuadraticFormula(Scene):
    def construct(self):
        title = Text("The Quadratic Formula", font_size=48)
        self.play(Write(title))
        self.wait(0.5)
        self.play(title.animate.to_edge(UP).scale(0.6))

        general = MathTex(r"ax^2 + bx + c = 0", font_size=36)
        self.play(Write(general))
        self.wait(0.5)
        self.play(general.animate.shift(UP * 1.5))

        steps = [
            MathTex(r"x^2 + \frac{b}{a}x + \frac{c}{a} = 0", font_size=32),
            MathTex(r"x^2 + \frac{b}{a}x = -\frac{c}{a}", font_size=32),
            MathTex(r"x^2 + \frac{b}{a}x + \frac{b^2}{4a^2} = \frac{b^2}{4a^2} - \frac{c}{a}", font_size=28),
            MathTex(r"\left(x + \frac{b}{2a}\right)^2 = \frac{b^2 - 4ac}{4a^2}", font_size=32),
            MathTex(r"x + \frac{b}{2a} = \pm\frac{\sqrt{b^2 - 4ac}}{2a}", font_size=32),
        ]

        step_labels = [
            Text("Divide by a", font_size=16, color=GRAY),
            Text("Move c/a to right", font_size=16, color=GRAY),
            Text("Complete the square", font_size=16, color=GRAY),
            Text("Factor left side", font_size=16, color=GRAY),
            Text("Take square root", font_size=16, color=GRAY),
        ]

        current_pos = general.get_center() + DOWN * 1.5

        for step, label in zip(steps, step_labels):
            step.move_to(current_pos)
            label.next_to(step, RIGHT, buff=0.5)
            self.play(Write(step), Write(label), run_time=0.8)
            self.wait(0.3)
            self.play(
                FadeOut(step), FadeOut(label),
                run_time=0.3
            )

        formula = MathTex(
            r"x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}",
            font_size=40
        )
        formula.move_to(ORIGIN)

        formula_box = SurroundingRectangle(formula, color=YELLOW, buff=0.3)

        self.play(Write(formula))
        self.play(Create(formula_box))

        discriminant = VGroup(
            Text("Discriminant:", font_size=20),
            MathTex(r"\Delta = b^2 - 4ac", font_size=24, color=YELLOW),
            Text("Delta > 0: Two real roots", font_size=16, color=GREEN),
            Text("Delta = 0: One real root", font_size=16, color=BLUE),
            Text("Delta < 0: No real roots", font_size=16, color=RED)
        ).arrange(DOWN, aligned_edge=LEFT)
        discriminant.to_corner(DL)

        self.play(Write(discriminant))

        example = VGroup(
            Text("Example:", font_size=20),
            MathTex(r"x^2 - 5x + 6 = 0", font_size=24),
            MathTex(r"a=1, b=-5, c=6", font_size=20, color=GRAY),
            MathTex(r"\Delta = 25 - 24 = 1", font_size=20),
            MathTex(r"x = \frac{5 \pm 1}{2}", font_size=24),
            MathTex(r"x = 3 \text{ or } x = 2", font_size=24, color=GREEN)
        ).arrange(DOWN)
        example.to_corner(DR)

        self.play(Write(example))
        self.wait(2)

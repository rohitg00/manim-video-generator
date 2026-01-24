"""
Template: Equation Transformation
Use for step-by-step algebraic manipulations
"""

from manim import *

class EquationTransform(Scene):
    def construct(self):
        # Define your equations
        equations = [
            MathTex("{{x^2}} + {{2x}} + {{1}} = 0"),
            MathTex("{{x^2}} + {{2x}} = {{-1}}"),
            MathTex("{{x^2}} + {{2x}} + {{1}} = {{-1}} + {{1}}"),
            MathTex("{{(x + 1)^2}} = {{0}}"),
            MathTex("{{x}} = {{-1}}"),
        ]

        # Position first equation
        equations[0].to_edge(UP, buff=1)
        self.play(Write(equations[0]))
        self.wait()

        # Transform through each step
        for i in range(1, len(equations)):
            equations[i].move_to(equations[i-1])
            self.play(TransformMatchingTex(
                equations[i-1], equations[i],
                key_map={
                    # Map parts that should transform into each other
                }
            ))
            self.wait(0.5)

        # Highlight final answer
        self.play(equations[-1].animate.set_color(YELLOW))
        self.wait(2)

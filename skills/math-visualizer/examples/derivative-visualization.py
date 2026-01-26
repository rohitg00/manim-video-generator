"""
Example: Derivative as Slope of Tangent Line
Shows the geometric interpretation of derivatives
"""

from manim import *

class DerivativeVisualization(Scene):
    def construct(self):
        # Setup axes
        axes = Axes(
            x_range=[-1, 5, 1],
            y_range=[-1, 10, 2],
            axis_config={"include_tip": True}
        )
        labels = axes.get_axis_labels(x_label="x", y_label="y")

        # Function
        func = lambda x: 0.5 * x**2
        graph = axes.plot(func, color=BLUE)
        graph_label = MathTex("f(x) = \\frac{1}{2}x^2").to_corner(UR)

        self.play(Create(axes), Write(labels))
        self.play(Create(graph), Write(graph_label))
        self.wait()

        # Tangent line at x=2
        x_val = 2
        slope = x_val  # derivative of 0.5x^2 is x

        dot = Dot(axes.c2p(x_val, func(x_val)), color=YELLOW)

        tangent = axes.plot(
            lambda x: slope * (x - x_val) + func(x_val),
            x_range=[0, 4],
            color=RED
        )

        slope_label = MathTex(f"f'({x_val}) = {slope}").next_to(dot, UR)

        self.play(Create(dot))
        self.play(Create(tangent), Write(slope_label))
        self.wait()

        # Show derivative formula
        formula = MathTex(
            "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}"
        ).to_edge(DOWN)

        self.play(Write(formula))
        self.wait(2)

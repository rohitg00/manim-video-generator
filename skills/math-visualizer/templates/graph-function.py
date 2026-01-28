"""
Template: Function Graph with Annotations
Use for visualizing mathematical functions
"""

from manim import *

class GraphFunction(Scene):
    def construct(self):
        # Configuration
        FUNC = lambda x: x**2 - 2*x - 3
        X_RANGE = [-2, 5]
        Y_RANGE = [-5, 10]
        FUNC_LABEL = "f(x) = x^2 - 2x - 3"

        # Create axes
        axes = Axes(
            x_range=[X_RANGE[0], X_RANGE[1], 1],
            y_range=[Y_RANGE[0], Y_RANGE[1], 2],
            axis_config={"include_numbers": True}
        )

        # Plot function
        graph = axes.plot(FUNC, color=BLUE)
        label = MathTex(FUNC_LABEL).to_corner(UR)

        self.play(Create(axes))
        self.play(Create(graph), Write(label))
        self.wait()

        # Mark special points (roots, vertex, etc.)
        roots = [(-1, 0), (3, 0)]
        vertex = (1, -4)

        root_dots = VGroup(*[
            Dot(axes.c2p(x, y), color=RED)
            for x, y in roots
        ])

        vertex_dot = Dot(axes.c2p(*vertex), color=GREEN)
        vertex_label = MathTex("\\text{vertex}").next_to(vertex_dot, DOWN)

        self.play(Create(root_dots))
        self.play(Create(vertex_dot), Write(vertex_label))
        self.wait(2)

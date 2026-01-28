"""
Example: Pythagorean Theorem Visualization
Demonstrates geometric proof with animated squares
"""

from manim import *

class PythagoreanTheorem(Scene):
    def construct(self):
        # Create right triangle
        triangle = Polygon(
            ORIGIN, 3*RIGHT, 3*RIGHT + 4*UP,
            color=WHITE, fill_opacity=0.3
        )

        # Labels for sides
        a_label = MathTex("a").next_to(triangle, DOWN)
        b_label = MathTex("b").next_to(triangle, RIGHT)
        c_label = MathTex("c").move_to(triangle.get_center() + LEFT + UP)

        # Squares on each side
        sq_a = Square(side_length=3, color=BLUE, fill_opacity=0.5)
        sq_a.next_to(triangle, DOWN, buff=0)

        sq_b = Square(side_length=4, color=GREEN, fill_opacity=0.5)
        sq_b.next_to(triangle, RIGHT, buff=0)

        sq_c = Square(side_length=5, color=RED, fill_opacity=0.5)
        sq_c.rotate(np.arctan(4/3))
        sq_c.move_to(triangle.get_center() + 2*LEFT + 2*UP)

        # Equation
        equation = MathTex("a^2", "+", "b^2", "=", "c^2")
        equation.to_edge(UP)
        equation[0].set_color(BLUE)
        equation[2].set_color(GREEN)
        equation[4].set_color(RED)

        # Animate
        self.play(Create(triangle))
        self.play(Write(a_label), Write(b_label), Write(c_label))
        self.wait()

        self.play(GrowFromCenter(sq_a))
        self.play(GrowFromCenter(sq_b))
        self.play(GrowFromCenter(sq_c))
        self.wait()

        self.play(Write(equation))
        self.wait(2)

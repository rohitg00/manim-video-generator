
from manim import *
import numpy as np

class LawOfCosines(Scene):
    def construct(self):
        title = Text("Law of Cosines", font_size=48)
        self.play(Write(title))
        self.wait(0.5)
        self.play(title.animate.to_edge(UP).scale(0.6))

        A = np.array([-3, -1.5, 0])
        B = np.array([3, -1.5, 0])
        C = np.array([1, 2, 0])

        triangle = Polygon(A, B, C, color=WHITE)
        self.play(Create(triangle))

        label_A = Text("A", font_size=24).next_to(A, DOWN + LEFT)
        label_B = Text("B", font_size=24).next_to(B, DOWN + RIGHT)
        label_C = Text("C", font_size=24).next_to(C, UP)

        self.play(Write(label_A), Write(label_B), Write(label_C))

        a = np.linalg.norm(B - C)
        b = np.linalg.norm(A - C)
        c = np.linalg.norm(A - B)

        side_a = Text("a", font_size=20, color=RED).move_to((B + C) / 2 + RIGHT * 0.3)
        side_b = Text("b", font_size=20, color=BLUE).move_to((A + C) / 2 + LEFT * 0.3)
        side_c = Text("c", font_size=20, color=GREEN).move_to((A + B) / 2 + DOWN * 0.3)

        self.play(Write(side_a), Write(side_b), Write(side_c))

        angle_C = np.arccos((a**2 + b**2 - c**2) / (2 * a * b))

        dir_CA = (A - C) / np.linalg.norm(A - C)
        dir_CB = (B - C) / np.linalg.norm(B - C)

        start_angle = np.arctan2(dir_CB[1], dir_CB[0])
        angle_arc = Arc(
            radius=0.5,
            start_angle=start_angle,
            angle=angle_C,
            arc_center=C,
            color=YELLOW
        )
        angle_label = MathTex(r"\gamma", font_size=24, color=YELLOW)
        angle_label.move_to(C + DOWN * 0.3 + LEFT * 0.3)

        self.play(Create(angle_arc), Write(angle_label))

        formula = MathTex(
            r"c^2 = a^2 + b^2 - 2ab\cos(\gamma)",
            font_size=32
        )
        formula.to_edge(RIGHT).shift(UP * 1)

        formula_box = SurroundingRectangle(formula, color=YELLOW, buff=0.2)

        self.play(Write(formula), Create(formula_box))

        other_forms = VGroup(
            MathTex(r"a^2 = b^2 + c^2 - 2bc\cos(\alpha)", font_size=24),
            MathTex(r"b^2 = a^2 + c^2 - 2ac\cos(\beta)", font_size=24)
        ).arrange(DOWN, aligned_edge=LEFT)
        other_forms.next_to(formula, DOWN, buff=0.5)

        self.play(Write(other_forms))

        special = VGroup(
            Text("When gamma = 90 degrees:", font_size=18, color=GRAY),
            MathTex(r"\cos(90°) = 0", font_size=20),
            MathTex(r"c^2 = a^2 + b^2", font_size=24, color=GREEN),
            Text("(Pythagorean Theorem!)", font_size=16, color=GREEN)
        ).arrange(DOWN)
        special.to_corner(DL)

        self.play(Write(special))

        example_values = VGroup(
            Text(f"a = {a:.2f}", font_size=16, color=RED),
            Text(f"b = {b:.2f}", font_size=16, color=BLUE),
            Text(f"c = {c:.2f}", font_size=16, color=GREEN),
            Text(f"gamma = {np.degrees(angle_C):.1f} degrees", font_size=16, color=YELLOW)
        ).arrange(DOWN, aligned_edge=LEFT)
        example_values.to_corner(DR)

        self.play(Write(example_values))
        self.wait(2)

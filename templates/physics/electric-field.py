
from manim import *
import numpy as np

class ElectricField(Scene):
    def construct(self):
        title = Text("Electric Field Lines", font_size=48)
        self.play(Write(title))
        self.wait(0.5)
        self.play(title.animate.to_edge(UP).scale(0.6))

        positive_charge_pos = LEFT * 2
        negative_charge_pos = RIGHT * 2

        positive_charge = VGroup(
            Circle(radius=0.3, color=RED, fill_opacity=1),
            Text("+", font_size=24, color=WHITE)
        ).move_to(positive_charge_pos)

        negative_charge = VGroup(
            Circle(radius=0.3, color=BLUE, fill_opacity=1),
            Text("-", font_size=24, color=WHITE)
        ).move_to(negative_charge_pos)

        self.play(FadeIn(positive_charge), FadeIn(negative_charge))

        field_lines = VGroup()
        num_lines = 12

        for i in range(num_lines):
            angle = i * 2 * PI / num_lines

            start = positive_charge_pos + 0.35 * np.array([
                np.cos(angle), np.sin(angle), 0
            ])

            control1 = start + np.array([
                np.cos(angle) * 1.5,
                np.sin(angle) * 2,
                0
            ])

            end_angle = PI - angle if i < num_lines // 2 else -PI - angle
            end = negative_charge_pos + 0.35 * np.array([
                np.cos(end_angle), np.sin(end_angle), 0
            ])

            control2 = end + np.array([
                np.cos(end_angle) * 1.5,
                np.sin(end_angle) * 2,
                0
            ])

            line = CubicBezier(start, control1, control2, end, color=YELLOW)
            field_lines.add(line)

            arrow_pos = line.point_from_proportion(0.5)
            arrow_dir = line.point_from_proportion(0.51) - line.point_from_proportion(0.49)
            arrow_dir = arrow_dir / np.linalg.norm(arrow_dir)

        self.play(
            LaggedStart(*[Create(line) for line in field_lines], lag_ratio=0.1),
            run_time=3
        )

        arrows = VGroup()
        for line in field_lines:
            mid_point = line.point_from_proportion(0.5)
            direction = line.point_from_proportion(0.52) - line.point_from_proportion(0.48)
            if np.linalg.norm(direction) > 0:
                direction = direction / np.linalg.norm(direction)
                arrow = Arrow(
                    mid_point - direction * 0.15,
                    mid_point + direction * 0.15,
                    buff=0,
                    color=YELLOW,
                    stroke_width=2
                )
                arrows.add(arrow)

        self.play(FadeIn(arrows))

        explanation = VGroup(
            Text("Field lines point from + to -", font_size=20),
            Text("Denser lines = stronger field", font_size=20)
        ).arrange(DOWN).to_edge(DOWN)

        self.play(Write(explanation))

        coulombs_law = MathTex(
            r"E = k\frac{q}{r^2}",
            font_size=32
        ).to_corner(DR)

        self.play(Write(coulombs_law))
        self.wait(2)

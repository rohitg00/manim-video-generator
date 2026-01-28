
from manim import *
import numpy as np

class SpringOscillation(Scene):
    def construct(self):
        title = Text("Spring Oscillation", font_size=48)
        subtitle = Text("Hooke's Law: F = -kx", font_size=28, color=GRAY)
        header = VGroup(title, subtitle).arrange(DOWN)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(0.5)
        self.play(header.animate.to_edge(UP).scale(0.6))

        k = 10
        m = 1
        omega = np.sqrt(k / m)
        amplitude = 1.5
        equilibrium_y = 0

        wall = Line(LEFT * 3 + UP * 2, LEFT * 3 + DOWN * 2, color=WHITE)
        wall_pattern = VGroup()
        for i in range(-4, 5):
            line = Line(
                LEFT * 3 + UP * i * 0.5,
                LEFT * 3.3 + UP * i * 0.5 + DOWN * 0.3,
                color=WHITE
            )
            wall_pattern.add(line)

        self.play(Create(wall), Create(wall_pattern))

        t = ValueTracker(0)

        def create_spring(start, end, num_coils=10):
            points = []
            direction = end - start
            length = np.linalg.norm(direction)
            unit_dir = direction / length if length > 0 else RIGHT

            perp = np.array([-unit_dir[1], unit_dir[0], 0])

            coil_width = 0.3
            for i in range(num_coils * 4 + 1):
                t_val = i / (num_coils * 4)
                pos = start + direction * t_val
                offset = coil_width * np.sin(i * PI / 2) * perp
                points.append(pos + offset)

            return VMobject().set_points_smoothly(points).set_color(BLUE)

        def get_mass_position():
            x = amplitude * np.cos(omega * t.get_value())
            return RIGHT * x

        mass = always_redraw(lambda: Square(
            side_length=0.6,
            color=RED,
            fill_opacity=0.8
        ).move_to(get_mass_position()))

        spring = always_redraw(lambda: create_spring(
            LEFT * 3,
            get_mass_position() + LEFT * 0.3
        ))

        eq_line = DashedLine(UP * 2, DOWN * 2, color=GRAY)
        eq_label = Text("x = 0", font_size=16, color=GRAY).next_to(eq_line, DOWN)

        self.play(Create(eq_line), Write(eq_label))
        self.play(Create(spring), FadeIn(mass))

        displacement_arrow = always_redraw(lambda: Arrow(
            ORIGIN,
            get_mass_position(),
            buff=0,
            color=YELLOW
        ) if abs(amplitude * np.cos(omega * t.get_value())) > 0.1 else VGroup())

        x_label = always_redraw(lambda: MathTex(
            "x",
            font_size=24,
            color=YELLOW
        ).next_to(displacement_arrow, DOWN) if abs(amplitude * np.cos(omega * t.get_value())) > 0.1 else VGroup())

        self.play(Create(displacement_arrow), Write(x_label))

        force_arrow = always_redraw(lambda: Arrow(
            get_mass_position(),
            get_mass_position() - RIGHT * amplitude * np.cos(omega * t.get_value()) * 0.5,
            buff=0,
            color=GREEN
        ) if abs(amplitude * np.cos(omega * t.get_value())) > 0.1 else VGroup())

        f_label = always_redraw(lambda: MathTex(
            "F",
            font_size=24,
            color=GREEN
        ).next_to(force_arrow, UP) if abs(amplitude * np.cos(omega * t.get_value())) > 0.1 else VGroup())

        self.play(Create(force_arrow), Write(f_label))

        formulas = VGroup(
            MathTex(r"F = -kx", font_size=28),
            MathTex(r"x(t) = A\cos(\omega t)", font_size=28),
            MathTex(r"\omega = \sqrt{\frac{k}{m}}", font_size=28),
            MathTex(r"T = 2\pi\sqrt{\frac{m}{k}}", font_size=28)
        ).arrange(DOWN, aligned_edge=LEFT).to_corner(DR)

        self.play(Write(formulas))

        self.play(
            t.animate.set_value(6),
            run_time=6,
            rate_func=linear
        )

        self.wait(1)

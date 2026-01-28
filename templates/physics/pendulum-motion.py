
from manim import *
import numpy as np

class PendulumMotion(Scene):
    def construct(self):
        title = Text("Simple Pendulum", font_size=48)
        self.play(Write(title))
        self.wait(0.5)
        self.play(title.animate.to_edge(UP).scale(0.6))

        length = 3
        pivot = UP * 2
        theta_max = PI / 6
        g = 9.8
        omega = np.sqrt(g / length)

        t = ValueTracker(0)

        pivot_dot = Dot(pivot, color=WHITE)

        bob = always_redraw(lambda: Dot(
            pivot + length * np.array([
                np.sin(theta_max * np.cos(omega * t.get_value())),
                -np.cos(theta_max * np.cos(omega * t.get_value())),
                0
            ]),
            color=BLUE,
            radius=0.2
        ))

        rod = always_redraw(lambda: Line(
            pivot,
            pivot + length * np.array([
                np.sin(theta_max * np.cos(omega * t.get_value())),
                -np.cos(theta_max * np.cos(omega * t.get_value())),
                0
            ]),
            color=WHITE
        ))

        vertical_ref = DashedLine(pivot, pivot + DOWN * length, color=GRAY)

        angle_arc = always_redraw(lambda: Arc(
            radius=0.8,
            start_angle=-PI/2,
            angle=theta_max * np.cos(omega * t.get_value()),
            arc_center=pivot,
            color=YELLOW
        ))

        angle_label = always_redraw(lambda: MathTex(
            r"\theta",
            font_size=24
        ).move_to(pivot + DOWN * 0.5 + RIGHT * 0.4))

        self.play(FadeIn(pivot_dot), Create(vertical_ref))
        self.play(Create(rod), FadeIn(bob))
        self.play(Create(angle_arc), Write(angle_label))

        formula_box = VGroup(
            MathTex(r"T = 2\pi\sqrt{\frac{L}{g}}", font_size=32),
            MathTex(r"\theta(t) = \theta_0 \cos(\omega t)", font_size=28),
            MathTex(r"\omega = \sqrt{\frac{g}{L}}", font_size=28)
        ).arrange(DOWN, aligned_edge=LEFT).to_corner(DR)

        self.play(Write(formula_box))

        self.play(
            t.animate.set_value(8),
            run_time=8,
            rate_func=linear
        )

        energy_text = Text(
            "Energy oscillates between kinetic and potential",
            font_size=20
        ).to_edge(DOWN)
        self.play(Write(energy_text))
        self.wait(2)

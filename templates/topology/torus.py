
from manim import *
import numpy as np

class Torus(ThreeDScene):
    def construct(self):
        title = Text("Torus", font_size=48)
        subtitle = Text("The Donut Surface", font_size=24, color=GRAY)
        header = VGroup(title, subtitle).arrange(DOWN)
        self.add_fixed_in_frame_mobjects(header)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(0.5)
        self.play(FadeOut(header))
        self.remove(header)

        self.set_camera_orientation(phi=60 * DEGREES, theta=30 * DEGREES)

        R = 2
        r = 0.8

        torus = Surface(
            lambda u, v: np.array([
                (R + r * np.cos(v)) * np.cos(u),
                (R + r * np.cos(v)) * np.sin(u),
                r * np.sin(v)
            ]),
            u_range=[0, TAU],
            v_range=[0, TAU],
            resolution=(50, 25),
            checkerboard_colors=[TEAL_D, TEAL_E]
        )

        self.play(Create(torus), run_time=2)

        self.move_camera(phi=90 * DEGREES, theta=0)
        self.wait(0.5)

        major_circle = Circle(radius=R, color=YELLOW)
        major_circle.rotate(PI/2, axis=RIGHT)
        self.play(Create(major_circle))

        minor_circle = Circle(radius=r, color=RED)
        minor_circle.shift(RIGHT * R)

        self.play(Create(minor_circle))

        construction = Text(
            "Rotate a circle around an axis",
            font_size=18
        ).to_edge(DOWN)
        self.add_fixed_in_frame_mobjects(construction)
        self.play(Write(construction))

        self.wait(1)

        self.play(FadeOut(major_circle), FadeOut(minor_circle))
        self.remove(construction)

        self.move_camera(phi=60 * DEGREES, theta=30 * DEGREES)

        properties = VGroup(
            Text("Torus Properties:", font_size=20),
            Text(f"Major radius R = {R}", font_size=16),
            Text(f"Minor radius r = {r}", font_size=16),
            Text("Euler characteristic = 0", font_size=16),
            Text("Genus = 1 (one hole)", font_size=16)
        ).arrange(DOWN, aligned_edge=LEFT)
        properties.to_corner(UL)
        self.add_fixed_in_frame_mobjects(properties)
        self.play(Write(properties))

        equations = VGroup(
            MathTex(r"x = (R + r\cos v)\cos u", font_size=24),
            MathTex(r"y = (R + r\cos v)\sin u", font_size=24),
            MathTex(r"z = r\sin v", font_size=24)
        ).arrange(DOWN)
        equations.to_corner(DR)
        self.add_fixed_in_frame_mobjects(equations)
        self.play(Write(equations))

        self.begin_ambient_camera_rotation(rate=0.3)
        self.wait(5)
        self.stop_ambient_camera_rotation()

        fun_fact = Text(
            "Used in: Video game worlds, Fusion reactors (tokamak)",
            font_size=16,
            color=GRAY
        ).to_edge(DOWN)
        self.add_fixed_in_frame_mobjects(fun_fact)
        self.play(Write(fun_fact))

        self.wait(2)


from manim import *
import numpy as np

class TrefoilKnot(ThreeDScene):
    def construct(self):
        title = Text("Trefoil Knot", font_size=48)
        subtitle = Text("The Simplest Non-Trivial Knot", font_size=24, color=GRAY)
        header = VGroup(title, subtitle).arrange(DOWN)
        self.add_fixed_in_frame_mobjects(header)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(0.5)
        self.play(FadeOut(header))
        self.remove(header)

        self.set_camera_orientation(phi=70 * DEGREES, theta=30 * DEGREES)

        def trefoil(t):
            x = np.sin(t) + 2 * np.sin(2 * t)
            y = np.cos(t) - 2 * np.cos(2 * t)
            z = -np.sin(3 * t)
            return np.array([x, y, z])

        trefoil_curve = ParametricFunction(
            trefoil,
            t_range=[0, TAU],
            color=ORANGE,
            stroke_width=8
        )

        self.play(Create(trefoil_curve), run_time=3)

        self.begin_ambient_camera_rotation(rate=0.3)
        self.wait(3)
        self.stop_ambient_camera_rotation()

        properties = VGroup(
            Text("Trefoil Knot:", font_size=20),
            Text("- Crossing number: 3", font_size=16),
            Text("- Cannot be untangled", font_size=16),
            Text("- Chiral (left/right versions)", font_size=16)
        ).arrange(DOWN, aligned_edge=LEFT)
        properties.to_corner(UL)
        self.add_fixed_in_frame_mobjects(properties)
        self.play(Write(properties))

        equations = VGroup(
            MathTex(r"x = \sin t + 2\sin 2t", font_size=20),
            MathTex(r"y = \cos t - 2\cos 2t", font_size=20),
            MathTex(r"z = -\sin 3t", font_size=20)
        ).arrange(DOWN)
        equations.to_corner(DR)
        self.add_fixed_in_frame_mobjects(equations)
        self.play(Write(equations))

        crossing_note = Text(
            "3 crossings - minimum for a non-trivial knot",
            font_size=18,
            color=YELLOW
        ).to_edge(DOWN)
        self.add_fixed_in_frame_mobjects(crossing_note)
        self.play(Write(crossing_note))

        crossing_times = [0.5, 2.6, 4.7]
        crossing_dots = VGroup()
        for t in crossing_times:
            pos = trefoil(t)
            dot = Dot3D(pos, color=RED, radius=0.15)
            crossing_dots.add(dot)

        self.play(FadeIn(crossing_dots))

        self.begin_ambient_camera_rotation(rate=0.25)
        self.wait(4)
        self.stop_ambient_camera_rotation()

        apps = Text(
            "Found in: DNA, Physics, Art",
            font_size=16,
            color=GRAY
        ).to_corner(DL)
        self.add_fixed_in_frame_mobjects(apps)
        self.play(Write(apps))

        self.wait(2)

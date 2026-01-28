
from manim import *
import numpy as np

class MobiusStrip(ThreeDScene):
    def construct(self):
        title = Text("Mobius Strip", font_size=48)
        subtitle = Text("A Non-Orientable Surface", font_size=24, color=GRAY)
        header = VGroup(title, subtitle).arrange(DOWN)
        self.add_fixed_in_frame_mobjects(header)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(0.5)
        self.play(FadeOut(header))
        self.remove(header)

        self.set_camera_orientation(phi=75 * DEGREES, theta=30 * DEGREES)

        mobius = Surface(
            lambda u, v: np.array([
                (1 + v/2 * np.cos(u/2)) * np.cos(u),
                (1 + v/2 * np.cos(u/2)) * np.sin(u),
                v/2 * np.sin(u/2)
            ]),
            u_range=[0, TAU],
            v_range=[-0.5, 0.5],
            resolution=(50, 10),
            checkerboard_colors=[BLUE_D, BLUE_E]
        )

        self.play(Create(mobius), run_time=2)

        self.begin_ambient_camera_rotation(rate=0.3)
        self.wait(3)
        self.stop_ambient_camera_rotation()

        explanation = Text(
            "One side, one edge - a topological marvel",
            font_size=20
        ).to_edge(DOWN)
        self.add_fixed_in_frame_mobjects(explanation)
        self.play(Write(explanation))

        edge_path = ParametricFunction(
            lambda t: np.array([
                (1 + 0.25 * np.cos(t/2)) * np.cos(t),
                (1 + 0.25 * np.cos(t/2)) * np.sin(t),
                0.25 * np.sin(t/2)
            ]),
            t_range=[0, 2 * TAU],
            color=YELLOW,
            stroke_width=4
        )

        self.play(Create(edge_path), run_time=3)

        properties = VGroup(
            Text("Properties:", font_size=20),
            Text("- Non-orientable", font_size=16),
            Text("- One continuous edge", font_size=16),
            Text("- Euler characteristic = 0", font_size=16)
        ).arrange(DOWN, aligned_edge=LEFT)
        properties.to_corner(UL)
        self.add_fixed_in_frame_mobjects(properties)
        self.play(Write(properties))

        self.begin_ambient_camera_rotation(rate=0.2)
        self.wait(4)
        self.stop_ambient_camera_rotation()

        self.wait(1)

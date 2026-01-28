
from manim import *
import numpy as np

class KleinBottle(ThreeDScene):
    def construct(self):
        title = Text("Klein Bottle", font_size=48)
        subtitle = Text("4D Surface in 3D Immersion", font_size=24, color=GRAY)
        header = VGroup(title, subtitle).arrange(DOWN)
        self.add_fixed_in_frame_mobjects(header)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(0.5)
        self.play(FadeOut(header))
        self.remove(header)

        self.set_camera_orientation(phi=70 * DEGREES, theta=45 * DEGREES)

        def klein_bottle(u, v):
            r = 4 * (1 - np.cos(u) / 2)

            if u < np.pi:
                x = 6 * np.cos(u) * (1 + np.sin(u)) + r * np.cos(u) * np.cos(v)
                y = 16 * np.sin(u) + r * np.sin(u) * np.cos(v)
            else:
                x = 6 * np.cos(u) * (1 + np.sin(u)) + r * np.cos(v + np.pi)
                y = 16 * np.sin(u)

            z = r * np.sin(v)

            return np.array([x, y, z]) / 10

        klein = Surface(
            lambda u, v: klein_bottle(u, v),
            u_range=[0, TAU],
            v_range=[0, TAU],
            resolution=(50, 25),
            checkerboard_colors=[PURPLE_D, PURPLE_E]
        )

        self.play(Create(klein), run_time=3)

        self.begin_ambient_camera_rotation(rate=0.25)
        self.wait(4)
        self.stop_ambient_camera_rotation()

        explanation = VGroup(
            Text("The Klein bottle:", font_size=20),
            Text("- No inside or outside", font_size=16),
            Text("- No boundary", font_size=16),
            Text("- Self-intersects in 3D", font_size=16),
            Text("- Requires 4D for true embedding", font_size=16)
        ).arrange(DOWN, aligned_edge=LEFT)
        explanation.to_corner(UL)
        self.add_fixed_in_frame_mobjects(explanation)
        self.play(Write(explanation))

        intersection_note = Text(
            "Self-intersection is an artifact of 3D projection",
            font_size=18,
            color=YELLOW
        ).to_edge(DOWN)
        self.add_fixed_in_frame_mobjects(intersection_note)
        self.play(Write(intersection_note))

        self.begin_ambient_camera_rotation(rate=0.2)
        self.wait(5)
        self.stop_ambient_camera_rotation()

        self.wait(1)

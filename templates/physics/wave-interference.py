
from manim import *
import numpy as np

class WaveInterference(Scene):
    def construct(self):
        title = Text("Wave Interference", font_size=48)
        self.play(Write(title))
        self.wait(0.5)
        self.play(title.animate.to_edge(UP).scale(0.6))

        axes = Axes(
            x_range=[-7, 7, 1],
            y_range=[-3, 3, 1],
            axis_config={"include_tip": False}
        ).scale(0.8)
        self.play(Create(axes))

        wavelength = 2
        k = 2 * np.pi / wavelength
        amplitude = 1

        t = ValueTracker(0)

        source1_pos = -3
        source2_pos = 3

        wave1 = always_redraw(lambda: axes.plot(
            lambda x: amplitude * np.sin(k * (x - source1_pos) - t.get_value()),
            x_range=[-7, 7],
            color=BLUE
        ))

        wave2 = always_redraw(lambda: axes.plot(
            lambda x: amplitude * np.sin(k * (x - source2_pos) - t.get_value()),
            x_range=[-7, 7],
            color=RED
        ))

        superposition = always_redraw(lambda: axes.plot(
            lambda x: amplitude * np.sin(k * (x - source1_pos) - t.get_value()) +
                     amplitude * np.sin(k * (x - source2_pos) - t.get_value()),
            x_range=[-7, 7],
            color=YELLOW,
            stroke_width=3
        ))

        label1 = Text("Wave 1", font_size=20, color=BLUE).to_corner(UL).shift(DOWN * 0.8)
        label2 = Text("Wave 2", font_size=20, color=RED).next_to(label1, DOWN)
        label_sum = Text("Superposition", font_size=20, color=YELLOW).next_to(label2, DOWN)

        source1_dot = Dot(axes.c2p(source1_pos, 0), color=BLUE)
        source2_dot = Dot(axes.c2p(source2_pos, 0), color=RED)
        source1_label = Text("S1", font_size=16).next_to(source1_dot, DOWN)
        source2_label = Text("S2", font_size=16).next_to(source2_dot, DOWN)

        self.play(
            Create(wave1), Write(label1),
            FadeIn(source1_dot), Write(source1_label)
        )
        self.play(
            Create(wave2), Write(label2),
            FadeIn(source2_dot), Write(source2_label)
        )
        self.wait(0.5)
        self.play(Create(superposition), Write(label_sum))

        self.play(t.animate.set_value(4 * np.pi), run_time=6, rate_func=linear)

        constructive = Text("Constructive interference", font_size=18, color=GREEN)
        destructive = Text("Destructive interference", font_size=18, color=RED)
        legend = VGroup(constructive, destructive).arrange(DOWN).to_edge(RIGHT)

        self.play(Write(legend))
        self.wait(2)

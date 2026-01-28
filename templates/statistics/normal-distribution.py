
from manim import *
import numpy as np

class NormalDistribution(Scene):
    def construct(self):
        title = Text("Normal Distribution", font_size=48)
        subtitle = Text("The Bell Curve", font_size=24, color=GRAY)
        header = VGroup(title, subtitle).arrange(DOWN)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(0.5)
        self.play(FadeOut(header))

        axes = Axes(
            x_range=[-4, 4, 1],
            y_range=[0, 0.5, 0.1],
            axis_config={"include_tip": True},
            x_length=10,
            y_length=5
        ).shift(DOWN * 0.5)

        x_label = MathTex("x", font_size=24).next_to(axes.x_axis, RIGHT)
        y_label = MathTex("f(x)", font_size=24).next_to(axes.y_axis, UP)

        self.play(Create(axes), Write(x_label), Write(y_label))

        mu = 0
        sigma = 1

        def normal_pdf(x):
            return (1 / (sigma * np.sqrt(2 * np.pi))) * np.exp(-0.5 * ((x - mu) / sigma) ** 2)

        bell_curve = axes.plot(
            normal_pdf,
            x_range=[-4, 4],
            color=BLUE
        )

        self.play(Create(bell_curve), run_time=2)

        formula = MathTex(
            r"f(x) = \frac{1}{\sigma\sqrt{2\pi}} e^{-\frac{(x-\mu)^2}{2\sigma^2}}",
            font_size=28
        ).to_corner(UL)

        params = VGroup(
            MathTex(r"\mu = 0", font_size=20, color=YELLOW),
            MathTex(r"\sigma = 1", font_size=20, color=YELLOW)
        ).arrange(RIGHT, buff=1).next_to(formula, DOWN)

        self.play(Write(formula), Write(params))

        mean_line = DashedLine(
            axes.c2p(0, 0),
            axes.c2p(0, normal_pdf(0)),
            color=YELLOW
        )
        mean_label = MathTex(r"\mu", font_size=24, color=YELLOW)
        mean_label.next_to(mean_line, DOWN)

        self.play(Create(mean_line), Write(mean_label))

        region_1sigma = axes.get_area(
            bell_curve,
            x_range=[-1, 1],
            color=GREEN,
            opacity=0.3
        )
        label_1sigma = Text("68%", font_size=18, color=GREEN)
        label_1sigma.move_to(axes.c2p(0, 0.15))

        self.play(FadeIn(region_1sigma), Write(label_1sigma))
        self.wait(0.5)

        region_2sigma = axes.get_area(
            bell_curve,
            x_range=[-2, 2],
            color=YELLOW,
            opacity=0.2
        )
        label_2sigma = Text("95%", font_size=16, color=YELLOW)
        label_2sigma.move_to(axes.c2p(1.5, 0.05))

        self.play(FadeIn(region_2sigma), Write(label_2sigma))
        self.wait(0.5)

        region_3sigma = axes.get_area(
            bell_curve,
            x_range=[-3, 3],
            color=RED,
            opacity=0.1
        )
        label_3sigma = Text("99.7%", font_size=14, color=RED)
        label_3sigma.move_to(axes.c2p(2.5, 0.02))

        self.play(FadeIn(region_3sigma), Write(label_3sigma))

        empirical = VGroup(
            Text("Empirical Rule:", font_size=20),
            Text("68% within 1 std", font_size=16, color=GREEN),
            Text("95% within 2 std", font_size=16, color=YELLOW),
            Text("99.7% within 3 std", font_size=16, color=RED)
        ).arrange(DOWN, aligned_edge=LEFT)
        empirical.to_corner(DR)

        self.play(Write(empirical))

        sigma_markers = VGroup()
        for i in [-3, -2, -1, 1, 2, 3]:
            marker = MathTex(f"{i}\\sigma", font_size=16)
            marker.next_to(axes.c2p(i, 0), DOWN, buff=0.5)
            sigma_markers.add(marker)

        self.play(Write(sigma_markers))

        apps = Text(
            "Applications: IQ scores, Heights, Measurement errors",
            font_size=16,
            color=GRAY
        ).to_edge(DOWN)

        self.play(Write(apps))
        self.wait(2)

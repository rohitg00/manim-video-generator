
from manim import *
import numpy as np

class ConfidenceInterval(Scene):
    def construct(self):
        title = Text("Confidence Intervals", font_size=48)
        subtitle = Text("Quantifying Uncertainty", font_size=24, color=GRAY)
        header = VGroup(title, subtitle).arrange(DOWN)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(0.5)
        self.play(FadeOut(header))

        explanation = Text(
            "A 95% CI: If we repeated this experiment many times,",
            font_size=20
        ).to_edge(UP)
        explanation2 = Text(
            "95% of intervals would contain the true parameter",
            font_size=20
        ).next_to(explanation, DOWN)

        self.play(Write(explanation), Write(explanation2))

        axes = Axes(
            x_range=[0, 10, 1],
            y_range=[0, 12, 2],
            axis_config={"include_tip": True},
            x_length=8,
            y_length=5
        ).shift(DOWN * 0.5)

        x_label = Text("Sample", font_size=18).next_to(axes.x_axis, RIGHT)
        y_label = Text("Value", font_size=18).next_to(axes.y_axis, UP)

        self.play(Create(axes), Write(x_label), Write(y_label))

        true_mean = 6
        true_line = DashedLine(
            axes.c2p(0, true_mean),
            axes.c2p(10, true_mean),
            color=GREEN,
            stroke_width=2
        )
        true_label = Text(f"True mean = {true_mean}", font_size=16, color=GREEN)
        true_label.next_to(true_line, RIGHT)

        self.play(Create(true_line), Write(true_label))

        np.random.seed(42)
        num_samples = 8
        sample_size = 30
        population_std = 2

        samples_data = []
        for i in range(num_samples):
            sample = np.random.normal(true_mean, population_std, sample_size)
            sample_mean = np.mean(sample)
            sample_std = np.std(sample, ddof=1)
            se = sample_std / np.sqrt(sample_size)

            margin = 1.96 * se
            ci_lower = sample_mean - margin
            ci_upper = sample_mean + margin

            samples_data.append((sample_mean, ci_lower, ci_upper))

        ci_objects = VGroup()
        captured_count = 0

        for i, (mean, lower, upper) in enumerate(samples_data):
            x_pos = i + 1

            captures = lower <= true_mean <= upper
            color = BLUE if captures else RED

            if captures:
                captured_count += 1

            ci_line = Line(
                axes.c2p(x_pos, lower),
                axes.c2p(x_pos, upper),
                color=color,
                stroke_width=3
            )

            lower_cap = Line(
                axes.c2p(x_pos - 0.1, lower),
                axes.c2p(x_pos + 0.1, lower),
                color=color,
                stroke_width=2
            )
            upper_cap = Line(
                axes.c2p(x_pos - 0.1, upper),
                axes.c2p(x_pos + 0.1, upper),
                color=color,
                stroke_width=2
            )

            mean_dot = Dot(axes.c2p(x_pos, mean), color=color, radius=0.08)

            ci_group = VGroup(ci_line, lower_cap, upper_cap, mean_dot)
            ci_objects.add(ci_group)

        for ci in ci_objects:
            self.play(FadeIn(ci), run_time=0.3)

        legend = VGroup(
            VGroup(
                Line(ORIGIN, RIGHT * 0.5, color=BLUE, stroke_width=3),
                Text("Contains true mean", font_size=14)
            ).arrange(RIGHT, buff=0.2),
            VGroup(
                Line(ORIGIN, RIGHT * 0.5, color=RED, stroke_width=3),
                Text("Misses true mean", font_size=14)
            ).arrange(RIGHT, buff=0.2)
        ).arrange(DOWN, aligned_edge=LEFT)
        legend.to_corner(DR)

        self.play(FadeIn(legend))

        capture_rate = captured_count / num_samples * 100
        rate_text = Text(
            f"Capture rate: {captured_count}/{num_samples} = {capture_rate:.0f}%",
            font_size=20,
            color=YELLOW
        ).to_corner(DL)

        self.play(Write(rate_text))

        formula = MathTex(
            r"CI = \bar{x} \pm z_{\alpha/2} \cdot \frac{s}{\sqrt{n}}",
            font_size=24
        ).to_corner(UL).shift(DOWN * 0.8)

        formula_desc = VGroup(
            Text("95% CI: z = 1.96", font_size=14),
            Text("99% CI: z = 2.58", font_size=14)
        ).arrange(DOWN, aligned_edge=LEFT).next_to(formula, DOWN, aligned_edge=LEFT)

        self.play(Write(formula), Write(formula_desc))

        insight = Text(
            "Wider CI = More certain, but less precise",
            font_size=16,
            color=GRAY
        ).to_edge(DOWN)

        self.play(Write(insight))
        self.wait(2)

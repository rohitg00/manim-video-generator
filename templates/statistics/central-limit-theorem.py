
from manim import *
import numpy as np

class CentralLimitTheorem(Scene):
    def construct(self):
        title = Text("Central Limit Theorem", font_size=48)
        subtitle = Text("The Foundation of Statistical Inference", font_size=24, color=GRAY)
        header = VGroup(title, subtitle).arrange(DOWN)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(0.5)
        self.play(FadeOut(header))

        statement = Text(
            "Sample means approach a normal distribution",
            font_size=22,
            color=YELLOW
        ).to_edge(UP)
        statement2 = Text(
            "regardless of the population distribution",
            font_size=22,
            color=YELLOW
        ).next_to(statement, DOWN)

        self.play(Write(statement), Write(statement2))

        axes1 = Axes(
            x_range=[0, 6, 1],
            y_range=[0, 0.4, 0.1],
            axis_config={"include_tip": False},
            x_length=5,
            y_length=2.5
        ).shift(LEFT * 3 + DOWN * 0.5)

        axes1_title = Text("Population Distribution", font_size=16)
        axes1_title.next_to(axes1, UP)

        axes2 = Axes(
            x_range=[0, 6, 1],
            y_range=[0, 1.5, 0.3],
            axis_config={"include_tip": False},
            x_length=5,
            y_length=2.5
        ).shift(RIGHT * 3 + DOWN * 0.5)

        axes2_title = Text("Distribution of Sample Means", font_size=16)
        axes2_title.next_to(axes2, UP)

        self.play(
            Create(axes1), Write(axes1_title),
            Create(axes2), Write(axes2_title)
        )

        uniform_dist = axes1.plot(
            lambda x: 1/6 if 0 <= x <= 6 else 0,
            x_range=[0, 6],
            color=RED,
            use_smoothing=False
        )
        uniform_label = Text("Uniform", font_size=14, color=RED)
        uniform_label.next_to(axes1, DOWN)

        self.play(Create(uniform_dist), Write(uniform_label))

        np.random.seed(42)

        sample_sizes = [1, 2, 5, 10, 30]
        sample_size_label = Text("n = 1", font_size=18, color=GREEN)
        sample_size_label.next_to(axes2, DOWN)
        self.play(Write(sample_size_label))

        num_samples = 1000

        for n in sample_sizes:
            sample_means = []
            for _ in range(num_samples):
                sample = np.random.uniform(0, 6, n)
                sample_means.append(np.mean(sample))

            hist_data, bin_edges = np.histogram(sample_means, bins=20, range=(0, 6), density=True)

            bars = VGroup()
            bar_width = (bin_edges[1] - bin_edges[0])

            for i, height in enumerate(hist_data):
                if height > 0:
                    bar = Rectangle(
                        width=bar_width * axes2.x_length / 6 * 0.9,
                        height=height * axes2.y_length / 1.5,
                        fill_color=BLUE,
                        fill_opacity=0.6,
                        stroke_width=0.5
                    )
                    bar_center_x = (bin_edges[i] + bin_edges[i+1]) / 2
                    bar.move_to(axes2.c2p(bar_center_x, height/2))
                    bars.add(bar)

            new_label = Text(f"n = {n}", font_size=18, color=GREEN)
            new_label.next_to(axes2, DOWN)

            self.play(
                Transform(sample_size_label, new_label),
                *[FadeIn(bar) for bar in bars],
                run_time=1
            )

            self.wait(0.5)

            if n < sample_sizes[-1]:
                self.play(*[FadeOut(bar) for bar in bars], run_time=0.3)

        pop_mean = 3
        pop_std = np.sqrt(6**2 / 12)
        n = sample_sizes[-1]
        se = pop_std / np.sqrt(n)

        def theoretical_normal(x):
            return (1 / (se * np.sqrt(2 * np.pi))) * np.exp(-0.5 * ((x - pop_mean) / se) ** 2)

        normal_curve = axes2.plot(
            theoretical_normal,
            x_range=[0, 6],
            color=YELLOW
        )
        normal_label = Text("Theoretical Normal", font_size=12, color=YELLOW)
        normal_label.next_to(normal_curve, UP)

        self.play(Create(normal_curve), Write(normal_label))

        formula = MathTex(
            r"\bar{X} \sim N\left(\mu, \frac{\sigma^2}{n}\right)",
            font_size=24
        ).to_corner(DR)

        self.play(Write(formula))

        insight = Text(
            "Larger n = narrower distribution of sample means",
            font_size=16,
            color=GRAY
        ).to_edge(DOWN)

        self.play(Write(insight))
        self.wait(2)


from manim import *
import numpy as np

class LinearRegression(Scene):
    def construct(self):
        title = Text("Linear Regression", font_size=48)
        subtitle = Text("Finding the Best Fit Line", font_size=24, color=GRAY)
        header = VGroup(title, subtitle).arrange(DOWN)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(0.5)
        self.play(FadeOut(header))

        axes = Axes(
            x_range=[0, 10, 1],
            y_range=[0, 10, 1],
            axis_config={"include_tip": True},
            x_length=8,
            y_length=6
        ).shift(LEFT * 0.5)

        x_label = Text("X", font_size=20).next_to(axes.x_axis, RIGHT)
        y_label = Text("Y", font_size=20).next_to(axes.y_axis, UP)

        self.play(Create(axes), Write(x_label), Write(y_label))

        np.random.seed(42)
        n_points = 15
        x_data = np.linspace(1, 9, n_points) + np.random.normal(0, 0.3, n_points)
        true_slope = 0.8
        true_intercept = 1
        y_data = true_slope * x_data + true_intercept + np.random.normal(0, 1, n_points)

        points = VGroup()
        for x, y in zip(x_data, y_data):
            dot = Dot(axes.c2p(x, y), color=BLUE, radius=0.08)
            points.add(dot)

        self.play(LaggedStart(*[FadeIn(p) for p in points], lag_ratio=0.05))

        x_mean = np.mean(x_data)
        y_mean = np.mean(y_data)

        numerator = np.sum((x_data - x_mean) * (y_data - y_mean))
        denominator = np.sum((x_data - x_mean) ** 2)

        slope = numerator / denominator
        intercept = y_mean - slope * x_mean

        mean_point = Dot(axes.c2p(x_mean, y_mean), color=YELLOW, radius=0.15)
        mean_label = MathTex(r"(\bar{x}, \bar{y})", font_size=20, color=YELLOW)
        mean_label.next_to(mean_point, UP + RIGHT)

        self.play(FadeIn(mean_point), Write(mean_label))

        def regression_line(x):
            return slope * x + intercept

        reg_line = axes.plot(
            regression_line,
            x_range=[0, 10],
            color=RED
        )

        line_label = Text("Best Fit Line", font_size=18, color=RED)
        line_label.next_to(reg_line.get_end(), UP)

        self.play(Create(reg_line), Write(line_label))

        equation = MathTex(
            f"\\hat{{y}} = {slope:.2f}x + {intercept:.2f}",
            font_size=24
        ).to_corner(UL)

        self.play(Write(equation))

        residuals = VGroup()
        for x, y in zip(x_data, y_data):
            y_pred = regression_line(x)
            residual_line = Line(
                axes.c2p(x, y),
                axes.c2p(x, y_pred),
                color=GREEN,
                stroke_width=2
            )
            residuals.add(residual_line)

        residual_label = Text("Residuals", font_size=16, color=GREEN)
        residual_label.to_corner(UR)

        self.play(
            LaggedStart(*[Create(r) for r in residuals], lag_ratio=0.05),
            Write(residual_label)
        )

        formula = MathTex(
            r"\min \sum_{i=1}^{n} (y_i - \hat{y}_i)^2",
            font_size=24
        ).next_to(equation, DOWN, aligned_edge=LEFT)

        self.play(Write(formula))

        ss_res = np.sum((y_data - (slope * x_data + intercept)) ** 2)
        ss_tot = np.sum((y_data - y_mean) ** 2)
        r_squared = 1 - (ss_res / ss_tot)

        r2_text = MathTex(
            f"R^2 = {r_squared:.3f}",
            font_size=24,
            color=YELLOW
        ).next_to(formula, DOWN, aligned_edge=LEFT)

        r2_explanation = Text(
            f"{r_squared*100:.1f}% of variance explained",
            font_size=16,
            color=GRAY
        ).next_to(r2_text, DOWN, aligned_edge=LEFT)

        self.play(Write(r2_text), Write(r2_explanation))

        interpretation = VGroup(
            Text("Interpretation:", font_size=18),
            Text(f"For each unit increase in X,", font_size=14),
            Text(f"Y increases by {slope:.2f} units", font_size=14, color=RED)
        ).arrange(DOWN, aligned_edge=LEFT)
        interpretation.to_corner(DR)

        self.play(Write(interpretation))
        self.wait(2)

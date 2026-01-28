
from manim import *
import numpy as np

class HypothesisTesting(Scene):
    def construct(self):
        title = Text("Hypothesis Testing", font_size=48)
        subtitle = Text("Making Decisions with Data", font_size=24, color=GRAY)
        header = VGroup(title, subtitle).arrange(DOWN)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(0.5)
        self.play(FadeOut(header))

        h0 = MathTex(r"H_0: \mu = 100", font_size=28)
        h1 = MathTex(r"H_1: \mu \neq 100", font_size=28)
        hypotheses = VGroup(
            Text("Null Hypothesis:", font_size=20),
            h0,
            Text("Alternative Hypothesis:", font_size=20),
            h1
        ).arrange(DOWN, aligned_edge=LEFT)
        hypotheses.to_corner(UL)

        self.play(Write(hypotheses))

        axes = Axes(
            x_range=[-4, 4, 1],
            y_range=[0, 0.5, 0.1],
            axis_config={"include_tip": False},
            x_length=10,
            y_length=4
        ).shift(DOWN * 1)

        def normal_pdf(x):
            return (1 / np.sqrt(2 * np.pi)) * np.exp(-0.5 * x ** 2)

        normal_curve = axes.plot(
            normal_pdf,
            x_range=[-4, 4],
            color=BLUE
        )

        self.play(Create(axes), Create(normal_curve))

        alpha = 0.05
        z_crit = 1.96

        left_region = axes.get_area(
            normal_curve,
            x_range=[-4, -z_crit],
            color=RED,
            opacity=0.5
        )
        right_region = axes.get_area(
            normal_curve,
            x_range=[z_crit, 4],
            color=RED,
            opacity=0.5
        )

        reject_label_left = Text("Reject H0", font_size=14, color=RED)
        reject_label_left.move_to(axes.c2p(-2.8, 0.08))
        reject_label_right = Text("Reject H0", font_size=14, color=RED)
        reject_label_right.move_to(axes.c2p(2.8, 0.08))

        self.play(FadeIn(left_region), FadeIn(right_region))
        self.play(Write(reject_label_left), Write(reject_label_right))

        crit_line_left = DashedLine(
            axes.c2p(-z_crit, 0),
            axes.c2p(-z_crit, normal_pdf(-z_crit)),
            color=WHITE
        )
        crit_line_right = DashedLine(
            axes.c2p(z_crit, 0),
            axes.c2p(z_crit, normal_pdf(z_crit)),
            color=WHITE
        )
        crit_label_left = MathTex(f"-{z_crit}", font_size=18).next_to(crit_line_left, DOWN)
        crit_label_right = MathTex(f"{z_crit}", font_size=18).next_to(crit_line_right, DOWN)

        self.play(
            Create(crit_line_left), Create(crit_line_right),
            Write(crit_label_left), Write(crit_label_right)
        )

        alpha_label = MathTex(r"\alpha/2 = 0.025", font_size=16, color=RED)
        alpha_label.move_to(axes.c2p(-3, 0.15))
        alpha_label2 = MathTex(r"\alpha/2 = 0.025", font_size=16, color=RED)
        alpha_label2.move_to(axes.c2p(3, 0.15))

        self.play(Write(alpha_label), Write(alpha_label2))

        test_stat = 2.5

        test_line = Line(
            axes.c2p(test_stat, 0),
            axes.c2p(test_stat, 0.35),
            color=YELLOW,
            stroke_width=3
        )
        test_label = MathTex(f"z = {test_stat}", font_size=20, color=YELLOW)
        test_label.next_to(test_line, UP)

        self.play(Create(test_line), Write(test_label))

        p_value = 2 * (1 - 0.9938)

        p_region_right = axes.get_area(
            normal_curve,
            x_range=[test_stat, 4],
            color=YELLOW,
            opacity=0.3
        )
        p_region_left = axes.get_area(
            normal_curve,
            x_range=[-4, -test_stat],
            color=YELLOW,
            opacity=0.3
        )

        self.play(FadeIn(p_region_right), FadeIn(p_region_left))

        p_label = MathTex(f"p\\text{{-value}} \\approx {p_value:.4f}", font_size=20, color=YELLOW)
        p_label.to_corner(UR)

        self.play(Write(p_label))

        decision_box = VGroup(
            Text("Decision:", font_size=20),
            MathTex(f"p = {p_value:.4f} < \\alpha = {alpha}", font_size=18),
            Text("Reject H0", font_size=24, color=RED)
        ).arrange(DOWN)
        decision_box.to_corner(DR)

        self.play(Write(decision_box))

        summary = VGroup(
            Text("Steps:", font_size=18),
            Text("1. State hypotheses", font_size=14),
            Text("2. Choose significance level (alpha)", font_size=14),
            Text("3. Calculate test statistic", font_size=14),
            Text("4. Find p-value", font_size=14),
            Text("5. Compare p-value to alpha", font_size=14),
            Text("6. Make decision", font_size=14)
        ).arrange(DOWN, aligned_edge=LEFT)
        summary.to_edge(DOWN).shift(LEFT * 4)

        self.play(Write(summary))
        self.wait(2)

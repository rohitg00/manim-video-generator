
from manim import *
import numpy as np

class CompoundInterest(Scene):
    def construct(self):
        title = Text("Compound Interest", font_size=48)
        subtitle = Text("The Power of Exponential Growth", font_size=24, color=GRAY)
        header = VGroup(title, subtitle).arrange(DOWN)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(0.5)
        self.play(FadeOut(header))

        principal = 1000
        rate = 0.08
        years = 30

        axes = Axes(
            x_range=[0, 30, 5],
            y_range=[0, 12000, 2000],
            axis_config={"include_tip": True},
            x_length=10,
            y_length=5
        ).shift(DOWN * 0.5)

        x_label = Text("Years", font_size=20).next_to(axes.x_axis, RIGHT)
        y_label = Text("Value ($)", font_size=20).next_to(axes.y_axis, UP)

        self.play(Create(axes), Write(x_label), Write(y_label))

        formula = MathTex(
            r"A = P(1 + r)^t",
            font_size=32
        ).to_corner(UL)
        formula_desc = VGroup(
            Text("P = Principal ($1000)", font_size=16),
            Text("r = Interest rate (8%)", font_size=16),
            Text("t = Time (years)", font_size=16)
        ).arrange(DOWN, aligned_edge=LEFT).next_to(formula, DOWN, aligned_edge=LEFT)

        self.play(Write(formula), Write(formula_desc))

        def simple_interest(t):
            return principal * (1 + rate * t)

        simple_curve = axes.plot(
            simple_interest,
            x_range=[0, 30],
            color=BLUE
        )
        simple_label = Text("Simple Interest", font_size=18, color=BLUE)
        simple_label.next_to(axes.c2p(25, simple_interest(25)), UP)

        def compound_interest(t):
            return principal * (1 + rate) ** t

        compound_curve = axes.plot(
            compound_interest,
            x_range=[0, 30],
            color=GREEN
        )
        compound_label = Text("Compound Interest", font_size=18, color=GREEN)
        compound_label.next_to(axes.c2p(25, min(compound_interest(25), 11000)), UP)

        self.play(Create(simple_curve), Write(simple_label))
        self.wait(0.5)

        self.play(Create(compound_curve), Write(compound_label))

        year_tracker = ValueTracker(0)

        dot = always_redraw(lambda: Dot(
            axes.c2p(
                year_tracker.get_value(),
                compound_interest(year_tracker.get_value())
            ),
            color=YELLOW
        ))

        value_display = always_redraw(lambda: VGroup(
            Text(f"Year: {int(year_tracker.get_value())}", font_size=18),
            Text(
                f"Value: ${compound_interest(year_tracker.get_value()):.2f}",
                font_size=18,
                color=GREEN
            )
        ).arrange(DOWN).to_corner(UR))

        self.play(FadeIn(dot), FadeIn(value_display))

        self.play(year_tracker.animate.set_value(30), run_time=5, rate_func=linear)

        final_simple = simple_interest(30)
        final_compound = compound_interest(30)
        difference = final_compound - final_simple

        comparison = VGroup(
            Text(f"After 30 years:", font_size=20),
            Text(f"Simple: ${final_simple:.2f}", font_size=18, color=BLUE),
            Text(f"Compound: ${final_compound:.2f}", font_size=18, color=GREEN),
            Text(f"Difference: ${difference:.2f}", font_size=18, color=YELLOW)
        ).arrange(DOWN, aligned_edge=LEFT)
        comparison.to_edge(RIGHT).shift(DOWN)

        self.play(Write(comparison))

        highlight_text = Text(
            "Compound interest: 'The eighth wonder of the world'",
            font_size=20,
            color=YELLOW
        ).to_edge(DOWN)

        self.play(Write(highlight_text))
        self.wait(2)

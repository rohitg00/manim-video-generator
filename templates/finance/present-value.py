
from manim import *
import numpy as np

class PresentValue(Scene):
    def construct(self):
        title = Text("Present Value", font_size=48)
        subtitle = Text("Time Value of Money", font_size=24, color=GRAY)
        header = VGroup(title, subtitle).arrange(DOWN)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(0.5)
        self.play(FadeOut(header))

        concept = Text(
            "A dollar today is worth more than a dollar tomorrow",
            font_size=24,
            color=YELLOW
        ).to_edge(UP)
        self.play(Write(concept))

        timeline = NumberLine(
            x_range=[0, 5, 1],
            length=10,
            include_numbers=True,
            label_direction=DOWN
        ).shift(UP * 0.5)

        timeline_label = Text("Years", font_size=18)
        timeline_label.next_to(timeline, DOWN, buff=0.8)

        self.play(Create(timeline), Write(timeline_label))

        future_value = 1000
        discount_rate = 0.10

        fv_arrow = Arrow(
            timeline.n2p(5) + DOWN * 0.3,
            timeline.n2p(5) + UP * 1,
            color=GREEN,
            buff=0
        )
        fv_label = Text(f"FV = ${future_value}", font_size=20, color=GREEN)
        fv_label.next_to(fv_arrow, UP)

        self.play(GrowArrow(fv_arrow), Write(fv_label))

        formula = MathTex(
            r"PV = \frac{FV}{(1 + r)^t}",
            font_size=32
        ).to_corner(UL).shift(DOWN * 0.5)

        params = VGroup(
            Text(f"FV = ${future_value}", font_size=16),
            Text(f"r = {int(discount_rate*100)}%", font_size=16),
            Text("t = years to discount", font_size=16)
        ).arrange(DOWN, aligned_edge=LEFT).next_to(formula, DOWN, aligned_edge=LEFT)

        self.play(Write(formula), Write(params))

        pv_values = []
        pv_arrows = VGroup()
        pv_labels = VGroup()

        for year in range(5, -1, -1):
            pv = future_value / ((1 + discount_rate) ** (5 - year))
            pv_values.append(pv)

            if year < 5:
                arrow = Arrow(
                    timeline.n2p(year) + DOWN * 0.3,
                    timeline.n2p(year) + UP * (0.5 + year * 0.1),
                    color=BLUE if year > 0 else YELLOW,
                    buff=0
                )

                label = Text(
                    f"${pv:.2f}",
                    font_size=16,
                    color=BLUE if year > 0 else YELLOW
                )
                label.next_to(arrow, UP)

                pv_arrows.add(arrow)
                pv_labels.add(label)

        self.wait(0.5)
        discount_text = Text("Discounting back to present...", font_size=20)
        discount_text.to_edge(DOWN)
        self.play(Write(discount_text))

        for i, (arrow, label) in enumerate(zip(pv_arrows, pv_labels)):
            year = 4 - i
            calc_text = MathTex(
                f"PV_{{t={year}}} = \\frac{{{future_value}}}{{(1.1)^{{{5-year}}}}} = {pv_values[i+1]:.2f}",
                font_size=20
            ).to_corner(DR)

            self.play(
                GrowArrow(arrow),
                Write(label),
                Write(calc_text),
                run_time=0.8
            )
            self.play(FadeOut(calc_text), run_time=0.3)

        self.play(FadeOut(discount_text))

        pv_highlight = SurroundingRectangle(pv_labels[-1], color=YELLOW)
        pv_text = Text(
            f"Present Value = ${pv_values[-1]:.2f}",
            font_size=24,
            color=YELLOW
        ).to_edge(DOWN)

        self.play(Create(pv_highlight), Write(pv_text))

        self.wait(1)

        comparison = VGroup(
            Text("$1000 in 5 years", font_size=18, color=GREEN),
            Text("=", font_size=24),
            Text(f"${pv_values[-1]:.2f} today", font_size=18, color=YELLOW)
        ).arrange(RIGHT, buff=0.5)
        comparison.next_to(pv_text, UP)

        self.play(Write(comparison))

        application = Text(
            "Used in: Bond pricing, Project valuation, Investment analysis",
            font_size=16,
            color=GRAY
        ).to_corner(DL)

        self.play(Write(application))
        self.wait(2)

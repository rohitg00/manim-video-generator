
from manim import *
import numpy as np

class PortfolioAllocation(Scene):
    def construct(self):
        title = Text("Portfolio Allocation", font_size=48)
        subtitle = Text("Diversification Strategy", font_size=24, color=GRAY)
        header = VGroup(title, subtitle).arrange(DOWN)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(0.5)
        self.play(FadeOut(header))

        aggressive_allocation = {
            "Stocks": (0.70, BLUE),
            "Bonds": (0.15, GREEN),
            "Real Estate": (0.10, ORANGE),
            "Cash": (0.05, GRAY)
        }

        conservative_allocation = {
            "Stocks": (0.40, BLUE),
            "Bonds": (0.40, GREEN),
            "Real Estate": (0.10, ORANGE),
            "Cash": (0.10, GRAY)
        }

        pie_chart, labels = self.create_pie_chart(aggressive_allocation, "Aggressive Portfolio")
        pie_chart.shift(LEFT * 2)

        self.play(
            LaggedStart(*[FadeIn(sector) for sector in pie_chart], lag_ratio=0.1),
            run_time=1.5
        )
        self.play(
            LaggedStart(*[Write(label) for label in labels], lag_ratio=0.1)
        )

        legend = self.create_legend(aggressive_allocation)
        legend.to_corner(UR)
        self.play(FadeIn(legend))

        self.wait(1)

        risk_bar = self.create_risk_indicator(0.8)
        risk_bar.to_edge(DOWN)
        self.play(FadeIn(risk_bar))

        self.wait(1)

        transition_text = Text("Transitioning to Conservative...", font_size=24, color=YELLOW)
        transition_text.to_edge(UP)
        self.play(Write(transition_text))

        new_pie_chart, new_labels = self.create_pie_chart(conservative_allocation, "Conservative Portfolio")
        new_pie_chart.shift(LEFT * 2)

        self.play(
            Transform(pie_chart, new_pie_chart),
            *[Transform(labels[i], new_labels[i]) for i in range(len(labels))],
            run_time=2
        )

        new_legend = self.create_legend(conservative_allocation)
        new_legend.to_corner(UR)
        self.play(Transform(legend, new_legend))

        new_risk_bar = self.create_risk_indicator(0.4)
        new_risk_bar.to_edge(DOWN)
        self.play(Transform(risk_bar, new_risk_bar))

        self.play(FadeOut(transition_text))

        comparison = VGroup(
            Text("Aggressive:", font_size=18),
            Text("Higher returns, higher risk", font_size=16, color=RED),
            Text("Conservative:", font_size=18),
            Text("Stable returns, lower risk", font_size=16, color=GREEN)
        ).arrange(DOWN, aligned_edge=LEFT)
        comparison.to_corner(DL)

        self.play(Write(comparison))
        self.wait(2)

    def create_pie_chart(self, allocation, title_text):
        sectors = VGroup()
        labels = VGroup()

        start_angle = PI / 2
        radius = 2

        for name, (percentage, color) in allocation.items():
            angle = percentage * TAU

            sector = Sector(
                outer_radius=radius,
                inner_radius=0,
                angle=angle,
                start_angle=start_angle,
                fill_color=color,
                fill_opacity=0.8,
                stroke_color=WHITE,
                stroke_width=2
            )
            sectors.add(sector)

            mid_angle = start_angle + angle / 2
            label_pos = np.array([
                np.cos(mid_angle) * (radius * 0.65),
                np.sin(mid_angle) * (radius * 0.65),
                0
            ])
            label = Text(f"{int(percentage * 100)}%", font_size=18, color=WHITE)
            label.move_to(label_pos)
            labels.add(label)

            start_angle += angle

        chart_title = Text(title_text, font_size=24)
        chart_title.next_to(sectors, UP, buff=0.5)

        return VGroup(sectors, chart_title), labels

    def create_legend(self, allocation):
        items = VGroup()
        for name, (percentage, color) in allocation.items():
            item = VGroup(
                Square(side_length=0.3, fill_color=color, fill_opacity=0.8, stroke_width=0),
                Text(f"{name}: {int(percentage * 100)}%", font_size=16)
            ).arrange(RIGHT, buff=0.2)
            items.add(item)

        items.arrange(DOWN, aligned_edge=LEFT, buff=0.2)
        return items

    def create_risk_indicator(self, risk_level):
        bar_bg = Rectangle(
            width=6,
            height=0.4,
            fill_color=GRAY,
            fill_opacity=0.3,
            stroke_color=WHITE
        )

        risk_fill = Rectangle(
            width=6 * risk_level,
            height=0.4,
            fill_opacity=0.8,
            stroke_width=0
        )

        if risk_level < 0.3:
            risk_fill.set_fill(GREEN)
        elif risk_level < 0.6:
            risk_fill.set_fill(YELLOW)
        else:
            risk_fill.set_fill(RED)

        risk_fill.align_to(bar_bg, LEFT)

        low_label = Text("Low Risk", font_size=14, color=GREEN)
        high_label = Text("High Risk", font_size=14, color=RED)
        low_label.next_to(bar_bg, LEFT)
        high_label.next_to(bar_bg, RIGHT)

        risk_text = Text(f"Risk Level: {int(risk_level * 100)}%", font_size=18)
        risk_text.next_to(bar_bg, UP)

        return VGroup(bar_bg, risk_fill, low_label, high_label, risk_text)

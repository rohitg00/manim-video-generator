
from manim import *
import numpy as np

class OptionPayoff(Scene):
    def construct(self):
        title = Text("Option Payoff Diagrams", font_size=48)
        self.play(Write(title))
        self.wait(0.5)
        self.play(title.animate.to_edge(UP).scale(0.6))

        strike_price = 100
        premium_call = 5
        premium_put = 4

        axes = Axes(
            x_range=[60, 140, 10],
            y_range=[-20, 40, 10],
            axis_config={"include_tip": True},
            x_length=10,
            y_length=5
        ).shift(DOWN * 0.5)

        x_label = Text("Stock Price at Expiry", font_size=16).next_to(axes.x_axis, DOWN)
        y_label = Text("Profit/Loss", font_size=16).next_to(axes.y_axis, LEFT).rotate(PI/2)

        self.play(Create(axes), Write(x_label))

        zero_line = axes.plot(lambda x: 0, x_range=[60, 140], color=GRAY)
        self.play(Create(zero_line))

        strike_line = DashedLine(
            axes.c2p(strike_price, -20),
            axes.c2p(strike_price, 40),
            color=WHITE,
            stroke_width=1
        )
        strike_label = Text(f"K = ${strike_price}", font_size=14)
        strike_label.next_to(strike_line, UP).shift(UP * 0.5)
        self.play(Create(strike_line), Write(strike_label))

        def long_call_payoff(s):
            return max(s - strike_price, 0) - premium_call

        call_curve = axes.plot(
            long_call_payoff,
            x_range=[60, 140],
            color=GREEN
        )
        call_label = Text("Long Call", font_size=18, color=GREEN)
        call_label.to_corner(UL).shift(DOWN * 1)

        def long_put_payoff(s):
            return max(strike_price - s, 0) - premium_put

        put_curve = axes.plot(
            long_put_payoff,
            x_range=[60, 140],
            color=RED
        )
        put_label = Text("Long Put", font_size=18, color=RED)
        put_label.next_to(call_label, DOWN)

        self.play(Create(call_curve), Write(call_label))

        call_annotations = VGroup(
            Text("Max Loss: Premium", font_size=14, color=GRAY),
            Text("Breakeven: K + Premium", font_size=14, color=GRAY),
            Text("Max Profit: Unlimited", font_size=14, color=GREEN)
        ).arrange(DOWN, aligned_edge=LEFT)
        call_annotations.next_to(call_label, DOWN, aligned_edge=LEFT)
        self.play(Write(call_annotations))

        self.wait(1)

        self.play(Create(put_curve), Write(put_label))

        put_annotations = VGroup(
            Text("Max Loss: Premium", font_size=14, color=GRAY),
            Text("Breakeven: K - Premium", font_size=14, color=GRAY),
            Text("Max Profit: K - Premium", font_size=14, color=RED)
        ).arrange(DOWN, aligned_edge=LEFT)
        put_annotations.next_to(put_label, DOWN, aligned_edge=LEFT)
        self.play(Write(put_annotations))

        price_tracker = ValueTracker(80)

        price_dot_call = always_redraw(lambda: Dot(
            axes.c2p(price_tracker.get_value(), long_call_payoff(price_tracker.get_value())),
            color=GREEN
        ))
        price_dot_put = always_redraw(lambda: Dot(
            axes.c2p(price_tracker.get_value(), long_put_payoff(price_tracker.get_value())),
            color=RED
        ))

        value_display = always_redraw(lambda: VGroup(
            Text(f"Stock: ${price_tracker.get_value():.0f}", font_size=16),
            Text(f"Call P/L: ${long_call_payoff(price_tracker.get_value()):.2f}",
                 font_size=14, color=GREEN if long_call_payoff(price_tracker.get_value()) > 0 else RED),
            Text(f"Put P/L: ${long_put_payoff(price_tracker.get_value()):.2f}",
                 font_size=14, color=GREEN if long_put_payoff(price_tracker.get_value()) > 0 else RED)
        ).arrange(DOWN).to_corner(DR))

        self.play(FadeIn(price_dot_call), FadeIn(price_dot_put), FadeIn(value_display))

        self.play(price_tracker.animate.set_value(140), run_time=4, rate_func=linear)
        self.play(price_tracker.animate.set_value(60), run_time=4, rate_func=linear)

        summary = VGroup(
            Text("Call: Bullish bet - profit when price rises", font_size=16, color=GREEN),
            Text("Put: Bearish bet - profit when price falls", font_size=16, color=RED)
        ).arrange(DOWN)
        summary.to_edge(DOWN)

        self.play(Write(summary))
        self.wait(2)

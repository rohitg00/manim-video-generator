
from manim import *
import numpy as np

class StockChart(Scene):
    def construct(self):
        title = Text("Stock Price Movement", font_size=48)
        subtitle = Text("Candlestick Chart", font_size=24, color=GRAY)
        header = VGroup(title, subtitle).arrange(DOWN)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(0.5)
        self.play(FadeOut(header))

        axes = Axes(
            x_range=[0, 20, 5],
            y_range=[90, 130, 10],
            axis_config={"include_tip": True},
            x_length=12,
            y_length=5
        ).shift(DOWN * 0.5)

        x_label = Text("Trading Days", font_size=18).next_to(axes.x_axis, RIGHT)
        y_label = Text("Price ($)", font_size=18).next_to(axes.y_axis, UP)

        self.play(Create(axes), Write(x_label), Write(y_label))

        np.random.seed(42)
        ohlc_data = self.generate_ohlc_data(20, start_price=100)

        candlesticks = VGroup()
        for i, (open_p, high, low, close) in enumerate(ohlc_data):
            candle = self.create_candlestick(axes, i, open_p, high, low, close)
            candlesticks.add(candle)

        for i, candle in enumerate(candlesticks):
            self.play(FadeIn(candle), run_time=0.15)

        self.wait(0.5)

        legend = VGroup(
            VGroup(
                Rectangle(width=0.3, height=0.3, fill_color=GREEN, fill_opacity=1),
                Text("Bullish (Close > Open)", font_size=14)
            ).arrange(RIGHT, buff=0.2),
            VGroup(
                Rectangle(width=0.3, height=0.3, fill_color=RED, fill_opacity=1),
                Text("Bearish (Close < Open)", font_size=14)
            ).arrange(RIGHT, buff=0.2)
        ).arrange(DOWN, aligned_edge=LEFT)
        legend.to_corner(UL)

        self.play(FadeIn(legend))

        ma_period = 5
        ma_values = self.calculate_ma(ohlc_data, ma_period)

        ma_points = [
            axes.c2p(i + ma_period - 1, ma)
            for i, ma in enumerate(ma_values)
        ]
        ma_line = VMobject()
        ma_line.set_points_smoothly(ma_points)
        ma_line.set_color(BLUE)
        ma_line.set_stroke(width=2)

        ma_label = Text(f"{ma_period}-day MA", font_size=14, color=BLUE)
        ma_label.next_to(ma_line.get_end(), RIGHT)

        self.play(Create(ma_line), Write(ma_label))

        support_level = min(d[2] for d in ohlc_data)
        resistance_level = max(d[1] for d in ohlc_data)

        support_line = DashedLine(
            axes.c2p(0, support_level),
            axes.c2p(20, support_level),
            color=GREEN,
            stroke_width=2
        )
        resistance_line = DashedLine(
            axes.c2p(0, resistance_level),
            axes.c2p(20, resistance_level),
            color=RED,
            stroke_width=2
        )

        support_label = Text("Support", font_size=14, color=GREEN)
        support_label.next_to(support_line, LEFT)
        resistance_label = Text("Resistance", font_size=14, color=RED)
        resistance_label.next_to(resistance_line, LEFT)

        self.play(
            Create(support_line), Write(support_label),
            Create(resistance_line), Write(resistance_label)
        )

        volume_text = Text("Volume analysis and technical indicators", font_size=16)
        volume_text.to_edge(DOWN)
        self.play(Write(volume_text))

        self.wait(2)

    def generate_ohlc_data(self, num_days, start_price):
        data = []
        price = start_price

        for _ in range(num_days):
            change = np.random.normal(0, 2)

            open_p = price
            close = price + change

            high = max(open_p, close) + abs(np.random.normal(0, 1))

            low = min(open_p, close) - abs(np.random.normal(0, 1))

            data.append((open_p, high, low, close))
            price = close

        return data

    def create_candlestick(self, axes, day, open_p, high, low, close):
        is_bullish = close >= open_p
        color = GREEN if is_bullish else RED

        body_top = max(open_p, close)
        body_bottom = min(open_p, close)

        body = Rectangle(
            width=0.4,
            height=max(0.05, abs(axes.c2p(0, body_top)[1] - axes.c2p(0, body_bottom)[1])),
            fill_color=color,
            fill_opacity=1 if not is_bullish else 0.3,
            stroke_color=color
        )
        body.move_to(axes.c2p(day, (body_top + body_bottom) / 2))

        upper_wick = Line(
            axes.c2p(day, body_top),
            axes.c2p(day, high),
            color=color,
            stroke_width=1
        )
        lower_wick = Line(
            axes.c2p(day, body_bottom),
            axes.c2p(day, low),
            color=color,
            stroke_width=1
        )

        return VGroup(lower_wick, body, upper_wick)

    def calculate_ma(self, ohlc_data, period):
        closes = [d[3] for d in ohlc_data]
        ma_values = []

        for i in range(len(closes) - period + 1):
            ma = sum(closes[i:i+period]) / period
            ma_values.append(ma)

        return ma_values

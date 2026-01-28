
from manim import *

class BubbleSort(Scene):
    def construct(self):
        title = Text("Bubble Sort Algorithm", font_size=48)
        subtitle = Text("O(n^2) time complexity", font_size=24, color=GRAY)
        header = VGroup(title, subtitle).arrange(DOWN)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(0.5)
        self.play(FadeOut(header))

        values = [5, 2, 8, 1, 9, 3, 7, 4]
        bars = self.create_bars(values)
        bars.move_to(ORIGIN)

        self.play(LaggedStart(*[GrowFromEdge(bar, DOWN) for bar in bars], lag_ratio=0.1))
        self.wait(0.5)

        explanation = Text("Compare adjacent elements, swap if out of order", font_size=22)
        explanation.to_edge(UP)
        self.play(Write(explanation))

        self.bubble_sort_animate(bars, values)

        self.play(FadeOut(explanation))
        success = Text("Sorted!", font_size=36, color=GREEN).to_edge(UP)
        self.play(Write(success))
        self.play(*[bar[0].animate.set_color(GREEN) for bar in bars], run_time=0.5)
        self.wait(2)

    def create_bars(self, values):
        bars = VGroup()
        max_val = max(values)
        colors = [BLUE, TEAL, GREEN, YELLOW, ORANGE, RED, PURPLE, PINK]

        for i, val in enumerate(values):
            height = val / max_val * 4
            bar = Rectangle(
                width=0.7,
                height=height,
                fill_opacity=0.8,
                fill_color=colors[i % len(colors)],
                stroke_color=WHITE
            )
            label = Text(str(val), font_size=24).next_to(bar, UP, buff=0.1)
            bar_group = VGroup(bar, label)
            bars.add(bar_group)

        bars.arrange(RIGHT, buff=0.2, aligned_edge=DOWN)
        return bars

    def bubble_sort_animate(self, bars, values):
        n = len(values)

        for i in range(n):
            pass_text = Text(f"Pass {i + 1}", font_size=20, color=YELLOW)
            pass_text.to_corner(UL).shift(DOWN * 0.8)
            self.play(Write(pass_text), run_time=0.3)

            for j in range(n - i - 1):
                self.play(
                    bars[j][0].animate.set_color(YELLOW),
                    bars[j + 1][0].animate.set_color(YELLOW),
                    run_time=0.2
                )

                compare_text = Text(
                    f"{values[j]} > {values[j+1]}?",
                    font_size=20
                ).to_corner(UR).shift(DOWN * 0.8)
                self.play(Write(compare_text), run_time=0.2)

                if values[j] > values[j + 1]:
                    result_text = Text("Yes, swap!", font_size=18, color=RED)
                    result_text.next_to(compare_text, DOWN)
                    self.play(Write(result_text), run_time=0.2)

                    values[j], values[j + 1] = values[j + 1], values[j]

                    bar_j = bars[j]
                    bar_j1 = bars[j + 1]
                    self.play(
                        bar_j.animate.shift(RIGHT * 0.9),
                        bar_j1.animate.shift(LEFT * 0.9),
                        run_time=0.3
                    )
                    bars[j], bars[j + 1] = bars[j + 1], bars[j]

                    self.play(FadeOut(result_text), run_time=0.1)
                else:
                    result_text = Text("No swap", font_size=18, color=GREEN)
                    result_text.next_to(compare_text, DOWN)
                    self.play(Write(result_text), run_time=0.2)
                    self.play(FadeOut(result_text), run_time=0.1)

                self.play(FadeOut(compare_text), run_time=0.1)

                self.play(
                    bars[j][0].animate.set_color(BLUE),
                    bars[j + 1][0].animate.set_color(BLUE),
                    run_time=0.15
                )

            self.play(bars[n - i - 1][0].animate.set_color(PURPLE), run_time=0.2)
            self.play(FadeOut(pass_text), run_time=0.1)

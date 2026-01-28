"""
Example: Bubble Sort Visual Explanation
Demonstrates step-by-step algorithm visualization
"""

from manim import *

class BubbleSortExplanation(Scene):
    def construct(self):
        # Title
        title = Text("Bubble Sort", font_size=48)
        subtitle = Text("The simplest sorting algorithm", font_size=24, color=GRAY)
        header = VGroup(title, subtitle).arrange(DOWN)

        self.play(Write(title))
        self.play(FadeIn(subtitle))
        self.wait(1)
        self.play(FadeOut(header))

        # Create bars representing numbers
        values = [5, 2, 8, 1, 9, 3]
        bars = self.create_bars(values)
        bars.move_to(ORIGIN)

        self.play(LaggedStart(*[GrowFromEdge(bar, DOWN) for bar in bars], lag_ratio=0.1))
        self.wait()

        # Explain the concept
        explanation = Text(
            "Compare adjacent pairs and swap if needed",
            font_size=24
        ).to_edge(UP)
        self.play(Write(explanation))

        # Perform bubble sort with visualization
        self.bubble_sort_animate(bars, values)

        # Conclusion
        self.play(FadeOut(explanation))
        success = Text("Sorted!", font_size=36, color=GREEN)
        self.play(Write(success))
        self.play(
            *[bar.animate.set_color(GREEN) for bar in bars],
            run_time=0.5
        )
        self.wait(2)

    def create_bars(self, values):
        bars = VGroup()
        max_val = max(values)
        for i, val in enumerate(values):
            height = val / max_val * 3
            bar = Rectangle(
                width=0.8,
                height=height,
                fill_opacity=0.8,
                fill_color=BLUE,
                stroke_color=WHITE
            )
            label = Text(str(val), font_size=20).next_to(bar, UP, buff=0.1)
            bar.add(label)
            bars.add(bar)
        bars.arrange(RIGHT, buff=0.2, aligned_edge=DOWN)
        return bars

    def bubble_sort_animate(self, bars, values):
        n = len(values)
        for i in range(n):
            for j in range(n - i - 1):
                # Highlight comparison
                self.play(
                    bars[j].animate.set_color(YELLOW),
                    bars[j + 1].animate.set_color(YELLOW),
                    run_time=0.3
                )

                if values[j] > values[j + 1]:
                    # Swap needed
                    values[j], values[j + 1] = values[j + 1], values[j]

                    # Animate swap
                    self.play(
                        bars[j].animate.shift(RIGHT * 1),
                        bars[j + 1].animate.shift(LEFT * 1),
                        run_time=0.5
                    )
                    bars[j], bars[j + 1] = bars[j + 1], bars[j]

                # Reset colors
                self.play(
                    bars[j].animate.set_color(BLUE),
                    bars[j + 1].animate.set_color(BLUE),
                    run_time=0.2
                )

"""
Template: Side-by-Side Comparison
Use for comparing two concepts, before/after, or alternatives
"""

from manim import *

class SideBySideComparison(Scene):
    def construct(self):
        # Title
        title = Text("Comparison", font_size=40).to_edge(UP)
        self.play(Write(title))

        # Divider line
        divider = Line(UP * 2, DOWN * 2, color=GRAY)
        self.play(Create(divider))

        # Left side
        left_title = Text("Option A", font_size=28, color=BLUE)
        left_title.move_to(LEFT * 3.5 + UP * 1.5)

        left_content = VGroup(
            Text("• Feature 1", font_size=20),
            Text("• Feature 2", font_size=20),
            Text("• Feature 3", font_size=20),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.3)
        left_content.next_to(left_title, DOWN, buff=0.5)

        # Right side
        right_title = Text("Option B", font_size=28, color=GREEN)
        right_title.move_to(RIGHT * 3.5 + UP * 1.5)

        right_content = VGroup(
            Text("• Feature 1", font_size=20),
            Text("• Feature 2", font_size=20),
            Text("• Feature 3", font_size=20),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.3)
        right_content.next_to(right_title, DOWN, buff=0.5)

        # Animate
        self.play(
            Write(left_title),
            Write(right_title)
        )

        self.play(
            LaggedStart(*[FadeIn(item) for item in left_content], lag_ratio=0.2),
            LaggedStart(*[FadeIn(item) for item in right_content], lag_ratio=0.2),
        )

        self.wait(2)

        # Highlight winner (optional)
        winner_box = SurroundingRectangle(
            VGroup(right_title, right_content),
            color=YELLOW,
            buff=0.2
        )
        self.play(Create(winner_box))
        self.wait(2)

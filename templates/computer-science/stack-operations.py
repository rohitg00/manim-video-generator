
from manim import *

class StackOperations(Scene):
    def construct(self):
        title = Text("Stack Data Structure", font_size=48)
        subtitle = Text("LIFO: Last In, First Out", font_size=24, color=GRAY)
        header = VGroup(title, subtitle).arrange(DOWN)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(0.5)
        self.play(FadeOut(header))

        stack_frame = Rectangle(width=2, height=5, color=WHITE)
        stack_frame.to_edge(LEFT).shift(RIGHT * 2)

        stack_label = Text("Stack", font_size=24)
        stack_label.next_to(stack_frame, UP)

        self.play(Create(stack_frame), Write(stack_label))

        top_pointer = VGroup(
            Arrow(ORIGIN, RIGHT * 0.5, color=YELLOW, buff=0),
            Text("top", font_size=18, color=YELLOW)
        ).arrange(LEFT)
        top_pointer.next_to(stack_frame, LEFT).shift(DOWN * 2.3)

        ops_panel = VGroup(
            Text("Operations", font_size=24),
            Line(LEFT * 1.5, RIGHT * 1.5, color=GRAY),
            VGroup(
                Text("push(x)", font_size=20, color=GREEN),
                Text("pop()", font_size=20, color=RED),
                Text("peek()", font_size=20, color=BLUE),
                Text("isEmpty()", font_size=20, color=PURPLE)
            ).arrange(DOWN, aligned_edge=LEFT)
        ).arrange(DOWN)
        ops_panel.to_edge(RIGHT).shift(LEFT * 1)

        self.play(Write(ops_panel))

        stack_items = VGroup()
        stack_base_y = stack_frame.get_bottom()[1] + 0.4

        values_to_push = [10, 20, 30, 40]

        for i, val in enumerate(values_to_push):
            op_text = Text(f"push({val})", font_size=24, color=GREEN)
            op_text.to_edge(UP)
            self.play(Write(op_text), run_time=0.3)

            item = self.create_stack_item(val)
            item_y = stack_base_y + len(stack_items) * 0.7
            item.move_to([stack_frame.get_center()[0], item_y, 0])

            item.shift(UP * 3)
            self.play(
                item.animate.shift(DOWN * 3),
                run_time=0.5
            )
            stack_items.add(item)

            if len(stack_items) == 1:
                self.play(FadeIn(top_pointer))
            else:
                self.play(top_pointer.animate.shift(UP * 0.7), run_time=0.3)

            self.play(FadeOut(op_text), run_time=0.2)

        self.wait(0.5)

        peek_text = Text("peek() -> 40", font_size=24, color=BLUE)
        peek_text.to_edge(UP)
        self.play(Write(peek_text))
        self.play(stack_items[-1].animate.set_color(BLUE), run_time=0.3)
        self.play(stack_items[-1].animate.set_color(WHITE), run_time=0.3)
        self.play(FadeOut(peek_text))

        for i in range(2):
            val = values_to_push[len(values_to_push) - 1 - i]
            op_text = Text(f"pop() -> {val}", font_size=24, color=RED)
            op_text.to_edge(UP)
            self.play(Write(op_text), run_time=0.3)

            top_item = stack_items[-1]

            self.play(top_item.animate.set_color(RED), run_time=0.2)
            self.play(
                top_item.animate.shift(RIGHT * 3),
                top_item.animate.set_opacity(0),
                run_time=0.5
            )

            stack_items.remove(top_item)
            self.remove(top_item)

            self.play(top_pointer.animate.shift(DOWN * 0.7), run_time=0.3)

            self.play(FadeOut(op_text), run_time=0.2)

        empty_text = Text("isEmpty() -> False", font_size=24, color=PURPLE)
        empty_text.to_edge(UP)
        self.play(Write(empty_text))
        self.wait(0.5)
        self.play(FadeOut(empty_text))

        complexity = VGroup(
            Text("Time Complexity:", font_size=22),
            Text("push: O(1)", font_size=18, color=GREEN),
            Text("pop: O(1)", font_size=18, color=RED),
            Text("peek: O(1)", font_size=18, color=BLUE)
        ).arrange(DOWN, aligned_edge=LEFT)
        complexity.to_corner(DR)

        self.play(Write(complexity))
        self.wait(2)

    def create_stack_item(self, value):
        rect = Rectangle(
            width=1.8,
            height=0.6,
            color=WHITE,
            fill_opacity=0.3,
            fill_color=BLUE
        )
        text = Text(str(value), font_size=24)
        return VGroup(rect, text)


from manim import *

class LinkedList(Scene):
    def construct(self):
        title = Text("Linked List", font_size=48)
        subtitle = Text("Dynamic data structure with nodes", font_size=24, color=GRAY)
        header = VGroup(title, subtitle).arrange(DOWN)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(0.5)
        self.play(FadeOut(header))

        values = [1, 2, 3]
        nodes = VGroup()
        arrows = VGroup()

        start_x = -4

        for i, val in enumerate(values):
            node = self.create_node(val)
            node.move_to(RIGHT * (start_x + i * 2.5))
            nodes.add(node)

        for i in range(len(nodes) - 1):
            arrow = Arrow(
                nodes[i].get_right(),
                nodes[i + 1].get_left(),
                buff=0.1,
                color=WHITE
            )
            arrows.add(arrow)

        null_text = Text("NULL", font_size=18, color=RED)
        null_arrow = Arrow(
            nodes[-1].get_right(),
            nodes[-1].get_right() + RIGHT * 1,
            buff=0.1,
            color=RED
        )
        null_text.next_to(null_arrow, RIGHT)

        head_pointer = VGroup(
            Text("head", font_size=18, color=GREEN),
            Arrow(UP * 0.3, DOWN * 0.3, color=GREEN, buff=0)
        ).arrange(UP, buff=0.05)
        head_pointer.next_to(nodes[0], UP)

        self.play(
            LaggedStart(*[FadeIn(node) for node in nodes], lag_ratio=0.2),
            LaggedStart(*[GrowArrow(arrow) for arrow in arrows], lag_ratio=0.2)
        )
        self.play(GrowArrow(null_arrow), Write(null_text))
        self.play(FadeIn(head_pointer))

        self.wait(0.5)

        op1_text = Text("Insert 0 at beginning", font_size=24, color=GREEN)
        op1_text.to_edge(UP)
        self.play(Write(op1_text))

        new_node = self.create_node(0)
        new_node.move_to(LEFT * 5.5 + UP * 2)
        self.play(FadeIn(new_node))

        self.play(new_node.animate.move_to(nodes[0].get_center() + LEFT * 2.5))

        new_arrow = Arrow(
            new_node.get_right(),
            nodes[0].get_left(),
            buff=0.1,
            color=YELLOW
        )
        self.play(GrowArrow(new_arrow))

        self.play(head_pointer.animate.next_to(new_node, UP))

        nodes.insert(0, new_node)
        arrows.insert(0, new_arrow)

        self.play(FadeOut(op1_text))
        self.wait(0.5)

        op2_text = Text("Insert 2.5 after 2", font_size=24, color=BLUE)
        op2_text.to_edge(UP)
        self.play(Write(op2_text))

        target_idx = 2

        self.play(nodes[target_idx][0].animate.set_color(BLUE))

        new_node2 = self.create_node(2.5)
        new_node2.move_to(nodes[target_idx].get_center() + UP * 1.5)
        self.play(FadeIn(new_node2))

        self.play(new_node2.animate.move_to(
            nodes[target_idx].get_center() + RIGHT * 1.25 + DOWN * 0.5
        ))

        old_arrow = arrows[target_idx]

        arrow_to_next = Arrow(
            new_node2.get_right(),
            nodes[target_idx + 1].get_left() + DOWN * 0.2,
            buff=0.1,
            color=YELLOW
        )

        arrow_from_target = Arrow(
            nodes[target_idx].get_right(),
            new_node2.get_left(),
            buff=0.1,
            color=YELLOW
        )

        self.play(
            GrowArrow(arrow_to_next),
            GrowArrow(arrow_from_target),
            FadeOut(old_arrow)
        )

        self.play(nodes[target_idx][0].animate.set_color(WHITE))

        self.play(FadeOut(op2_text))
        self.wait(0.5)

        op3_text = Text("Delete node with value 2", font_size=24, color=RED)
        op3_text.to_edge(UP)
        self.play(Write(op3_text))

        delete_idx = 2
        self.play(nodes[delete_idx][0].animate.set_color(RED))

        traverse_text = Text("Traverse to find node", font_size=18)
        traverse_text.to_corner(UR)
        self.play(Write(traverse_text))

        for i in range(delete_idx + 1):
            self.play(
                Flash(nodes[i], color=YELLOW, flash_radius=0.5),
                run_time=0.3
            )

        prev_node = nodes[delete_idx - 1]
        next_node = new_node2

        new_skip_arrow = Arrow(
            prev_node.get_right(),
            next_node.get_left(),
            buff=0.1,
            color=GREEN
        )

        self.play(
            GrowArrow(new_skip_arrow),
            FadeOut(arrow_from_target),
            FadeOut(arrows[delete_idx - 1])
        )

        self.play(
            nodes[delete_idx].animate.shift(UP * 2).set_opacity(0),
            run_time=0.5
        )

        self.play(FadeOut(op3_text), FadeOut(traverse_text))

        summary = VGroup(
            Text("Time Complexity:", font_size=22),
            Text("Insert at head: O(1)", font_size=18, color=GREEN),
            Text("Insert at position: O(n)", font_size=18, color=BLUE),
            Text("Delete: O(n)", font_size=18, color=RED),
            Text("Search: O(n)", font_size=18, color=YELLOW)
        ).arrange(DOWN, aligned_edge=LEFT)
        summary.to_corner(DR)

        self.play(Write(summary))
        self.wait(2)

    def create_node(self, value):
        data_rect = Rectangle(
            width=0.8,
            height=0.6,
            color=WHITE,
            fill_opacity=0.3,
            fill_color=BLUE
        )
        pointer_rect = Rectangle(
            width=0.4,
            height=0.6,
            color=WHITE,
            fill_opacity=0.3,
            fill_color=GRAY
        )

        data_text = Text(str(value), font_size=20)
        dot = Dot(radius=0.05, color=WHITE)

        data_rect.add(data_text)
        pointer_rect.add(dot)

        node = VGroup(data_rect, pointer_rect).arrange(RIGHT, buff=0)
        return node

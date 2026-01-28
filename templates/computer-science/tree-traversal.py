
from manim import *
import numpy as np

class TreeTraversal(Scene):
    def construct(self):
        title = Text("Tree Traversal", font_size=48)
        subtitle = Text("BFS vs DFS", font_size=24, color=GRAY)
        header = VGroup(title, subtitle).arrange(DOWN)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(0.5)
        self.play(FadeOut(header))


        positions = {
            1: UP * 2,
            2: UP * 0.5 + LEFT * 2,
            3: UP * 0.5 + RIGHT * 2,
            4: DOWN * 1 + LEFT * 3,
            5: DOWN * 1 + LEFT * 1,
            6: DOWN * 1 + RIGHT * 1,
            7: DOWN * 1 + RIGHT * 3
        }

        nodes = {}
        for val, pos in positions.items():
            node = self.create_node(val)
            node.move_to(pos)
            nodes[val] = node

        edges = [
            (1, 2), (1, 3),
            (2, 4), (2, 5),
            (3, 6), (3, 7)
        ]

        edge_lines = VGroup()
        for parent, child in edges:
            line = Line(
                positions[parent],
                positions[child],
                color=WHITE,
                stroke_width=2
            ).set_z_index(-1)
            edge_lines.add(line)

        self.play(LaggedStart(*[Create(line) for line in edge_lines], lag_ratio=0.1))
        self.play(LaggedStart(*[FadeIn(node) for node in nodes.values()], lag_ratio=0.1))
        self.wait(0.5)

        bfs_title = Text("Breadth-First Search (BFS)", font_size=28, color=BLUE)
        bfs_title.to_edge(UP)
        self.play(Write(bfs_title))

        bfs_order = [1, 2, 3, 4, 5, 6, 7]
        visited_text = Text("Visited: ", font_size=20).to_corner(DL)
        self.play(Write(visited_text))

        visited_nodes = VGroup()
        for val in bfs_order:
            self.play(nodes[val][0].animate.set_color(BLUE), run_time=0.3)
            self.play(Flash(nodes[val], color=BLUE), run_time=0.3)

            visited_label = Text(str(val), font_size=20, color=BLUE)
            if len(visited_nodes) > 0:
                comma = Text(", ", font_size=20)
                visited_nodes.add(comma)
            visited_nodes.add(visited_label)
            visited_nodes.arrange(RIGHT, buff=0.05)
            visited_nodes.next_to(visited_text, RIGHT)
            self.play(Write(visited_label), run_time=0.2)

        self.wait(1)

        self.play(
            FadeOut(visited_text), FadeOut(visited_nodes),
            *[nodes[val][0].animate.set_color(WHITE) for val in nodes]
        )
        self.play(FadeOut(bfs_title))

        dfs_title = Text("Depth-First Search (DFS - Pre-order)", font_size=28, color=GREEN)
        dfs_title.to_edge(UP)
        self.play(Write(dfs_title))

        dfs_order = [1, 2, 4, 5, 3, 6, 7]
        visited_text = Text("Visited: ", font_size=20).to_corner(DL)
        self.play(Write(visited_text))

        visited_nodes = VGroup()
        for val in dfs_order:
            self.play(nodes[val][0].animate.set_color(GREEN), run_time=0.3)
            self.play(Flash(nodes[val], color=GREEN), run_time=0.3)

            visited_label = Text(str(val), font_size=20, color=GREEN)
            if len(visited_nodes) > 0:
                comma = Text(", ", font_size=20)
                visited_nodes.add(comma)
            visited_nodes.add(visited_label)
            visited_nodes.arrange(RIGHT, buff=0.05)
            visited_nodes.next_to(visited_text, RIGHT)
            self.play(Write(visited_label), run_time=0.2)

        summary = VGroup(
            Text("BFS: Level by level", font_size=18, color=BLUE),
            Text("DFS: Branch by branch", font_size=18, color=GREEN)
        ).arrange(DOWN).to_corner(DR)

        self.play(Write(summary))
        self.wait(2)

    def create_node(self, value):
        circle = Circle(radius=0.4, color=WHITE, fill_opacity=0.2)
        text = Text(str(value), font_size=24)
        return VGroup(circle, text)

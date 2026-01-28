
from manim import *

class RecursionTree(Scene):
    def construct(self):
        title = Text("Recursion Tree: Fibonacci", font_size=48)
        subtitle = Text("fib(n) = fib(n-1) + fib(n-2)", font_size=24, color=GRAY)
        header = VGroup(title, subtitle).arrange(DOWN)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(0.5)
        self.play(FadeOut(header))


        root_pos = UP * 3
        self.node_objects = {}
        self.edge_objects = []

        tree_data = self.build_tree(5, root_pos, 0, 5.5)

        self.animate_tree_build(tree_data)

        stack_title = Text("Recursion visualizes as a tree", font_size=22)
        stack_title.to_edge(DOWN)
        self.play(Write(stack_title))

        base_cases = Text("Base cases: fib(0) = 0, fib(1) = 1", font_size=20, color=GREEN)
        base_cases.next_to(stack_title, UP)
        self.play(Write(base_cases))

        overlap_text = Text("Notice: fib(2), fib(3) are computed multiple times!", font_size=20, color=RED)
        overlap_text.next_to(base_cases, UP)
        self.play(Write(overlap_text))

        self.highlight_duplicates()

        self.wait(2)

    def build_tree(self, n, pos, depth, h_spacing):
        if depth > 4:
            return []

        tree = [(n, pos, depth)]

        if n > 1:
            left_pos = pos + DOWN * 0.9 + LEFT * h_spacing / 2
            tree.extend(self.build_tree(n - 1, left_pos, depth + 1, h_spacing / 2))

            right_pos = pos + DOWN * 0.9 + RIGHT * h_spacing / 2
            tree.extend(self.build_tree(n - 2, right_pos, depth + 1, h_spacing / 2))

        return tree

    def animate_tree_build(self, tree_data):
        tree_data.sort(key=lambda x: x[2])

        parent_map = {}

        for n, pos, depth in tree_data:
            node = self.create_node(n)
            node.move_to(pos)
            self.node_objects[str(pos)] = (n, node)

            if depth > 0:
                parent_pos = pos + UP * 0.9
                if pos[0] < parent_pos[0]:
                    for key, (pn, pnode) in self.node_objects.items():
                        if abs(pnode.get_center()[1] - (pos[1] + 0.9)) < 0.1:
                            parent_pos = pnode.get_center()
                            break
                else:
                    for key, (pn, pnode) in self.node_objects.items():
                        if abs(pnode.get_center()[1] - (pos[1] + 0.9)) < 0.1:
                            parent_pos = pnode.get_center()
                            break

                parent_found = False
                for key, (pn, pnode) in self.node_objects.items():
                    pdist = pnode.get_center() - pos
                    if abs(pdist[1] - 0.9) < 0.15 and (
                        (pn == n + 1) or (pn == n + 2)
                    ):
                        edge = Line(
                            pnode.get_center() + DOWN * 0.25,
                            pos + UP * 0.25,
                            color=WHITE,
                            stroke_width=2
                        ).set_z_index(-1)
                        self.edge_objects.append(edge)
                        parent_found = True
                        break

            if depth > 0 and len(self.edge_objects) > 0:
                self.play(
                    Create(self.edge_objects[-1]),
                    FadeIn(node),
                    run_time=0.3
                )
            else:
                self.play(FadeIn(node), run_time=0.3)

    def create_node(self, n):
        if n <= 1:
            color = GREEN
        else:
            color = WHITE

        circle = Circle(radius=0.25, color=color, fill_opacity=0.2)
        text = Text(f"f({n})", font_size=14)
        return VGroup(circle, text)

    def highlight_duplicates(self):
        call_counts = {}
        for key, (n, node) in self.node_objects.items():
            if n not in call_counts:
                call_counts[n] = []
            call_counts[n].append(node)

        for n, node_list in call_counts.items():
            if len(node_list) > 1:
                self.play(
                    *[node[0].animate.set_color(RED) for node in node_list],
                    run_time=0.5
                )

        self.wait(0.5)

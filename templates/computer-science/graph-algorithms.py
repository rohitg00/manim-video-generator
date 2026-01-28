
from manim import *
import heapq

class GraphAlgorithms(Scene):
    def construct(self):
        title = Text("Dijkstra's Algorithm", font_size=48)
        subtitle = Text("Finding Shortest Paths", font_size=24, color=GRAY)
        header = VGroup(title, subtitle).arrange(DOWN)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(0.5)
        self.play(FadeOut(header))

        positions = {
            'A': LEFT * 4 + UP * 1,
            'B': LEFT * 2 + UP * 2,
            'C': LEFT * 2 + DOWN * 1,
            'D': RIGHT * 0 + UP * 1,
            'E': RIGHT * 2 + UP * 2,
            'F': RIGHT * 2 + DOWN * 1,
            'G': RIGHT * 4 + UP * 0.5
        }

        edges = {
            ('A', 'B'): 4,
            ('A', 'C'): 2,
            ('B', 'D'): 3,
            ('B', 'E'): 1,
            ('C', 'D'): 5,
            ('C', 'F'): 4,
            ('D', 'E'): 1,
            ('D', 'F'): 2,
            ('E', 'G'): 3,
            ('F', 'G'): 1
        }

        nodes = {}
        for name, pos in positions.items():
            node = self.create_node(name)
            node.move_to(pos)
            nodes[name] = node

        edge_objects = {}
        weight_labels = {}
        for (u, v), weight in edges.items():
            line = Line(positions[u], positions[v], color=GRAY, stroke_width=2)
            line.set_z_index(-1)
            edge_objects[(u, v)] = line

            mid = (positions[u] + positions[v]) / 2
            label = Text(str(weight), font_size=16, color=YELLOW)
            label.move_to(mid + UP * 0.2 + RIGHT * 0.1)
            weight_labels[(u, v)] = label

        self.play(
            LaggedStart(*[Create(line) for line in edge_objects.values()], lag_ratio=0.05),
            LaggedStart(*[Write(label) for label in weight_labels.values()], lag_ratio=0.05)
        )
        self.play(LaggedStart(*[FadeIn(node) for node in nodes.values()], lag_ratio=0.1))

        self.dijkstra_animate(nodes, positions, edges, edge_objects, 'A', 'G')

        self.wait(2)

    def create_node(self, name):
        circle = Circle(radius=0.35, color=WHITE, fill_opacity=0.2)
        text = Text(name, font_size=24)
        return VGroup(circle, text)

    def dijkstra_animate(self, nodes, positions, edges, edge_objects, start, end):
        distances = {node: float('inf') for node in positions}
        distances[start] = 0
        previous = {node: None for node in positions}

        dist_labels = {}
        for name, pos in positions.items():
            label = Text("inf" if name != start else "0", font_size=14, color=GREEN)
            label.next_to(nodes[name], DOWN, buff=0.15)
            dist_labels[name] = label

        self.play(*[Write(label) for label in dist_labels.values()])

        pq = [(0, start)]
        visited = set()

        legend = VGroup(
            Text("Start: A", font_size=18, color=GREEN),
            Text("End: G", font_size=18, color=RED),
            Text("Current: Yellow", font_size=18, color=YELLOW),
            Text("Visited: Blue", font_size=18, color=BLUE)
        ).arrange(DOWN, aligned_edge=LEFT).to_corner(UL)
        self.play(Write(legend))

        self.play(nodes[start][0].animate.set_color(GREEN))

        while pq:
            current_dist, current = heapq.heappop(pq)

            if current in visited:
                continue

            self.play(nodes[current][0].animate.set_color(YELLOW), run_time=0.3)

            visited.add(current)

            for (u, v), weight in edges.items():
                neighbor = None
                if u == current:
                    neighbor = v
                elif v == current:
                    neighbor = u

                if neighbor and neighbor not in visited:
                    new_dist = current_dist + weight

                    edge_key = (u, v) if (u, v) in edge_objects else (v, u)
                    self.play(edge_objects[edge_key].animate.set_color(YELLOW), run_time=0.2)

                    if new_dist < distances[neighbor]:
                        distances[neighbor] = new_dist
                        previous[neighbor] = current
                        heapq.heappush(pq, (new_dist, neighbor))

                        new_label = Text(str(new_dist), font_size=14, color=GREEN)
                        new_label.next_to(nodes[neighbor], DOWN, buff=0.15)
                        self.play(Transform(dist_labels[neighbor], new_label), run_time=0.2)

                    self.play(edge_objects[edge_key].animate.set_color(GRAY), run_time=0.1)

            self.play(nodes[current][0].animate.set_color(BLUE), run_time=0.2)

        path = []
        current = end
        while current:
            path.append(current)
            current = previous[current]
        path.reverse()

        result_text = Text(f"Shortest path: {' -> '.join(path)}", font_size=22, color=GREEN)
        result_text.to_edge(DOWN)
        self.play(Write(result_text))

        for i in range(len(path) - 1):
            u, v = path[i], path[i + 1]
            edge_key = (u, v) if (u, v) in edge_objects else (v, u)
            self.play(edge_objects[edge_key].animate.set_color(GREEN).set_stroke(width=4), run_time=0.3)
            self.play(nodes[path[i+1]][0].animate.set_color(GREEN), run_time=0.2)

        distance_text = Text(f"Total distance: {distances[end]}", font_size=22, color=GREEN)
        distance_text.next_to(result_text, UP)
        self.play(Write(distance_text))

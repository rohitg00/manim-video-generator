"""
Template: Process Visualization
Use for algorithms, workflows, and step-by-step procedures
"""

from manim import *
import numpy as np


class ProcessVisualization(Scene):
    """
    Base template for visualizing processes and algorithms.
    Features: State highlighting, step counters, comparison indicators.
    """
    
    # Override in subclass
    PROCESS_NAME = "Process Name"
    STEPS = [
        {"name": "Step 1", "description": "First step description"},
        {"name": "Step 2", "description": "Second step description"},
        {"name": "Step 3", "description": "Third step description"},
    ]
    
    def construct(self):
        # Title
        self.show_title()
        
        # Process visualization
        self.setup_visualization()
        self.run_process()
        
        # Summary
        self.show_summary()
    
    def show_title(self):
        """Display process title."""
        title = Text(self.PROCESS_NAME, font_size=48)
        self.play(Write(title))
        self.wait(1)
        self.play(FadeOut(title))
    
    def setup_visualization(self):
        """Set up the visual elements. Override in subclass."""
        pass
    
    def run_process(self):
        """Run through the process steps. Override in subclass."""
        for i, step in enumerate(self.STEPS):
            self.show_step_indicator(i)
            self.execute_step(i, step)
    
    def show_step_indicator(self, step_index):
        """Show current step number and name."""
        step = self.STEPS[step_index]
        indicator = VGroup(
            Text(f"Step {step_index + 1}/{len(self.STEPS)}", font_size=24, color=BLUE),
            Text(step["name"], font_size=20, color=GREY_A)
        ).arrange(DOWN, buff=0.1)
        indicator.to_corner(UR)
        
        if hasattr(self, 'current_indicator'):
            self.play(
                FadeOut(self.current_indicator),
                FadeIn(indicator)
            )
        else:
            self.play(FadeIn(indicator))
        
        self.current_indicator = indicator
    
    def execute_step(self, index, step):
        """Execute a single step. Override in subclass."""
        # Default: show step description
        desc = Text(step["description"], font_size=28)
        self.play(Write(desc))
        self.wait(1)
        self.play(FadeOut(desc))
    
    def show_summary(self):
        """Show process summary."""
        if hasattr(self, 'current_indicator'):
            self.play(FadeOut(self.current_indicator))
        
        summary = Text("Process Complete!", font_size=36, color=GREEN)
        self.play(FadeIn(summary, scale=1.2))
        self.wait(2)


# =============================================================================
# SORTING ALGORITHM VISUALIZATION
# =============================================================================

class SortingVisualization(Scene):
    """Template for sorting algorithm visualization."""
    
    ALGORITHM_NAME = "Sorting Algorithm"
    INITIAL_ARRAY = [5, 2, 8, 1, 9, 3, 7, 4, 6]
    BAR_WIDTH = 0.6
    BAR_SPACING = 0.1
    
    def construct(self):
        self.comparisons = 0
        self.swaps = 0
        
        # Title
        title = Text(self.ALGORITHM_NAME, font_size=42)
        title.to_edge(UP)
        self.play(Write(title))
        
        # Create bars
        self.bars = self.create_bars(self.INITIAL_ARRAY)
        self.play(LaggedStart(
            *[GrowFromEdge(bar, DOWN) for bar in self.bars],
            lag_ratio=0.1
        ))
        
        # Stats display
        self.stats = self.create_stats_display()
        self.play(FadeIn(self.stats))
        
        # Run sorting
        self.sort()
        
        # Final state
        self.show_sorted()
    
    def create_bars(self, values):
        """Create bar chart from values."""
        bars = VGroup()
        max_val = max(values)
        
        for i, val in enumerate(values):
            height = (val / max_val) * 4  # Scale to max height of 4
            bar = Rectangle(
                width=self.BAR_WIDTH,
                height=height,
                fill_opacity=0.8,
                fill_color=BLUE,
                stroke_color=WHITE,
                stroke_width=1
            )
            bar.value = val
            bar.move_to(
                DOWN * 2 + 
                LEFT * (len(values) / 2 - i) * (self.BAR_WIDTH + self.BAR_SPACING)
            )
            bar.align_to(DOWN * 2, DOWN)
            
            # Value label
            label = Text(str(val), font_size=20)
            label.next_to(bar, DOWN, buff=0.1)
            bar.label = label
            
            bars.add(VGroup(bar, label))
        
        return bars
    
    def create_stats_display(self):
        """Create statistics display."""
        self.comp_text = Text(f"Comparisons: {self.comparisons}", font_size=20)
        self.swap_text = Text(f"Swaps: {self.swaps}", font_size=20)
        
        stats = VGroup(self.comp_text, self.swap_text)
        stats.arrange(RIGHT, buff=1)
        stats.to_edge(DOWN, buff=0.5)
        
        return stats
    
    def update_stats(self):
        """Update statistics display."""
        new_comp = Text(f"Comparisons: {self.comparisons}", font_size=20)
        new_swap = Text(f"Swaps: {self.swaps}", font_size=20)
        
        new_comp.move_to(self.comp_text)
        new_swap.move_to(self.swap_text)
        
        self.play(
            Transform(self.comp_text, new_comp),
            Transform(self.swap_text, new_swap),
            run_time=0.2
        )
    
    def compare(self, i, j):
        """Highlight comparison between two elements."""
        self.comparisons += 1
        
        bar_i = self.bars[i][0]
        bar_j = self.bars[j][0]
        
        # Highlight compared bars
        self.play(
            bar_i.animate.set_fill(YELLOW),
            bar_j.animate.set_fill(YELLOW),
            run_time=0.3
        )
        
        self.update_stats()
        
        result = bar_i.value > bar_j.value
        
        # Show comparison result
        if result:
            indicator = Text(">", font_size=36, color=RED)
        else:
            indicator = Text("≤", font_size=36, color=GREEN)
        
        indicator.move_to((bar_i.get_center() + bar_j.get_center()) / 2 + UP * 2.5)
        self.play(FadeIn(indicator), run_time=0.2)
        self.wait(0.3)
        self.play(FadeOut(indicator), run_time=0.2)
        
        # Reset colors
        self.play(
            bar_i.animate.set_fill(BLUE),
            bar_j.animate.set_fill(BLUE),
            run_time=0.2
        )
        
        return result
    
    def swap(self, i, j):
        """Swap two elements with animation."""
        self.swaps += 1
        
        bar_i = self.bars[i]
        bar_j = self.bars[j]
        
        # Get positions
        pos_i = bar_i.get_center()
        pos_j = bar_j.get_center()
        
        # Swap animation
        self.play(
            bar_i.animate.move_to(pos_j),
            bar_j.animate.move_to(pos_i),
            run_time=0.5
        )
        
        # Swap in list
        self.bars[i], self.bars[j] = self.bars[j], self.bars[i]
        
        self.update_stats()
    
    def mark_sorted(self, indices):
        """Mark elements as sorted."""
        for i in indices:
            bar = self.bars[i][0]
            self.play(bar.animate.set_fill(GREEN), run_time=0.2)
    
    def sort(self):
        """Override with specific sorting algorithm."""
        # Default: bubble sort
        n = len(self.bars)
        for i in range(n):
            for j in range(0, n - i - 1):
                if self.compare(j, j + 1):
                    self.swap(j, j + 1)
            self.mark_sorted([n - i - 1])
    
    def show_sorted(self):
        """Final sorted state."""
        self.wait(1)
        
        complete = Text("Sorted!", font_size=48, color=GREEN)
        complete.to_edge(UP, buff=1.5)
        
        final_stats = Text(
            f"Total: {self.comparisons} comparisons, {self.swaps} swaps",
            font_size=24
        )
        final_stats.next_to(complete, DOWN)
        
        self.play(
            Write(complete),
            Write(final_stats)
        )
        self.wait(2)


# =============================================================================
# FLOWCHART VISUALIZATION
# =============================================================================

class FlowchartVisualization(Scene):
    """Template for flowchart/decision process visualization."""
    
    def construct(self):
        # Build flowchart
        nodes, edges = self.create_flowchart()
        
        # Animate construction
        self.play(LaggedStart(
            *[Create(node) for node in nodes],
            lag_ratio=0.2
        ))
        self.play(LaggedStart(
            *[Create(edge) for edge in edges],
            lag_ratio=0.1
        ))
        
        # Walk through process
        self.walk_through_process(nodes)
    
    def create_flowchart(self):
        """Create flowchart nodes and edges. Override in subclass."""
        # Example flowchart
        nodes = VGroup()
        edges = VGroup()
        
        # Start node
        start = self.create_node("Start", "oval", UP * 3)
        nodes.add(start)
        
        # Process node
        process = self.create_node("Process", "rect", UP * 1)
        nodes.add(process)
        
        # Decision node
        decision = self.create_node("Decision?", "diamond", DOWN * 1)
        nodes.add(decision)
        
        # End nodes
        yes_end = self.create_node("Action A", "rect", DOWN * 3 + LEFT * 2)
        no_end = self.create_node("Action B", "rect", DOWN * 3 + RIGHT * 2)
        nodes.add(yes_end, no_end)
        
        # Edges
        edges.add(self.create_edge(start, process))
        edges.add(self.create_edge(process, decision))
        edges.add(self.create_edge(decision, yes_end, label="Yes"))
        edges.add(self.create_edge(decision, no_end, label="No"))
        
        return nodes, edges
    
    def create_node(self, text, shape, position):
        """Create a flowchart node."""
        label = Text(text, font_size=24)
        
        if shape == "oval":
            border = Ellipse(width=2.5, height=1, color=WHITE)
        elif shape == "rect":
            border = Rectangle(width=2.5, height=1, color=WHITE)
        elif shape == "diamond":
            border = Square(side_length=1.5, color=WHITE)
            border.rotate(PI / 4)
            border.scale([1.5, 1, 1])
        else:
            border = Rectangle(width=2.5, height=1, color=WHITE)
        
        node = VGroup(border, label)
        node.move_to(position)
        node.label_text = text
        
        return node
    
    def create_edge(self, from_node, to_node, label=None):
        """Create an edge between nodes."""
        start = from_node.get_bottom()
        end = to_node.get_top()
        
        arrow = Arrow(start, end, buff=0.1, color=GREY_A)
        
        if label:
            label_text = Text(label, font_size=18, color=YELLOW)
            label_text.next_to(arrow.get_center(), RIGHT, buff=0.1)
            return VGroup(arrow, label_text)
        
        return arrow
    
    def walk_through_process(self, nodes):
        """Animate walking through the flowchart."""
        for node in nodes:
            # Highlight current node
            self.play(
                node[0].animate.set_color(YELLOW),
                run_time=0.3
            )
            self.wait(1)
            self.play(
                node[0].animate.set_color(WHITE),
                run_time=0.3
            )


# =============================================================================
# STATE MACHINE VISUALIZATION
# =============================================================================

class StateMachineVisualization(Scene):
    """Template for state machine/finite automata visualization."""
    
    STATES = ["S0", "S1", "S2"]
    TRANSITIONS = [
        ("S0", "S1", "a"),
        ("S1", "S2", "b"),
        ("S2", "S0", "c"),
    ]
    INITIAL_STATE = "S0"
    INPUT_SEQUENCE = ["a", "b", "c", "a"]
    
    def construct(self):
        # Create state machine
        self.state_nodes = {}
        self.create_state_machine()
        
        # Run input sequence
        self.process_input(self.INPUT_SEQUENCE)
    
    def create_state_machine(self):
        """Create state machine visualization."""
        # Create states in a circle
        n_states = len(self.STATES)
        radius = 2.5
        
        for i, state in enumerate(self.STATES):
            angle = PI / 2 - (2 * PI * i / n_states)
            pos = radius * np.array([np.cos(angle), np.sin(angle), 0])
            
            circle = Circle(radius=0.5, color=WHITE)
            label = Text(state, font_size=24)
            node = VGroup(circle, label)
            node.move_to(pos)
            node.state_name = state
            
            self.state_nodes[state] = node
            self.play(Create(node), run_time=0.5)
        
        # Highlight initial state
        initial = self.state_nodes[self.INITIAL_STATE]
        self.play(initial[0].animate.set_color(GREEN))
        
        # Create transitions
        for from_state, to_state, symbol in self.TRANSITIONS:
            from_node = self.state_nodes[from_state]
            to_node = self.state_nodes[to_state]
            
            arrow = Arrow(
                from_node.get_center(),
                to_node.get_center(),
                buff=0.6,
                color=GREY_A
            )
            
            label = Text(symbol, font_size=20, color=YELLOW)
            label.move_to(arrow.get_center() + UP * 0.3)
            
            self.play(Create(arrow), Write(label), run_time=0.3)
    
    def process_input(self, inputs):
        """Process input sequence with visualization."""
        # Show input sequence
        input_display = Text(
            f"Input: {' '.join(inputs)}",
            font_size=28
        )
        input_display.to_edge(DOWN)
        self.play(Write(input_display))
        
        current_state = self.INITIAL_STATE
        
        for i, symbol in enumerate(inputs):
            # Highlight current input
            # (simplified - in practice, highlight specific character)
            
            # Find transition
            for from_s, to_s, sym in self.TRANSITIONS:
                if from_s == current_state and sym == symbol:
                    # Animate transition
                    from_node = self.state_nodes[from_s]
                    to_node = self.state_nodes[to_s]
                    
                    # Highlight path
                    self.play(
                        from_node[0].animate.set_color(YELLOW),
                        run_time=0.3
                    )
                    self.play(
                        to_node[0].animate.set_color(GREEN),
                        from_node[0].animate.set_color(WHITE),
                        run_time=0.3
                    )
                    
                    current_state = to_s
                    break
            
            self.wait(0.5)
        
        # Final state
        final = Text(f"Final State: {current_state}", font_size=24, color=GREEN)
        final.next_to(input_display, UP)
        self.play(Write(final))
        self.wait(2)


# =============================================================================
# COMPLEXITY ANNOTATION HELPERS
# =============================================================================

def create_complexity_badge(big_o, color=BLUE):
    """Create a complexity notation badge."""
    text = MathTex(f"O({big_o})", font_size=28)
    box = SurroundingRectangle(text, buff=0.15, color=color, corner_radius=0.1)
    return VGroup(box, text)


def create_comparison_table(data, headers=None):
    """
    Create a comparison table.
    
    Args:
        data: List of rows, each row is a list of cell values
        headers: Optional header row
    """
    table = VGroup()
    
    if headers:
        data = [headers] + data
    
    for row_idx, row in enumerate(data):
        row_group = VGroup()
        for col_idx, cell in enumerate(row):
            cell_text = Text(str(cell), font_size=20)
            cell_text.move_to(RIGHT * col_idx * 2)
            
            if row_idx == 0 and headers:
                cell_text.set_color(YELLOW)
            
            row_group.add(cell_text)
        
        row_group.move_to(DOWN * row_idx * 0.6)
        table.add(row_group)
    
    table.center()
    return table

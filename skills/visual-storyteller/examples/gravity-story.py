"""
Example: The Story of Gravity
Demonstrates narrative-driven educational animation
"""

from manim import *

class GravityStory(Scene):
    def construct(self):
        # Act 1: The Question
        self.act_question()

        # Transition
        self.play(*[FadeOut(m) for m in self.mobjects])

        # Act 2: Newton's Discovery
        self.act_newton()

        # Transition
        self.play(*[FadeOut(m) for m in self.mobjects])

        # Act 3: The Law
        self.act_law()

    def act_question(self):
        """Hook: Why do things fall?"""
        question = Text("Why do things fall?", font_size=40)
        self.play(Write(question))
        self.wait()

        # Show falling objects
        apple = Circle(radius=0.3, color=RED, fill_opacity=1)
        apple.move_to(UP * 3)

        ground = Line(LEFT * 5, RIGHT * 5, color=GREEN).to_edge(DOWN)

        self.play(FadeIn(apple), Create(ground))
        self.play(question.animate.to_edge(UP))

        # Apple falls
        self.play(apple.animate.next_to(ground, UP, buff=0), run_time=1.5)

        # More objects
        objects = VGroup(
            Square(side_length=0.4, color=BLUE, fill_opacity=1),
            Triangle(color=YELLOW, fill_opacity=1).scale(0.3),
        )
        for i, obj in enumerate(objects):
            obj.move_to(UP * 3 + RIGHT * (i + 1) * 1.5)
            self.play(FadeIn(obj), run_time=0.3)
            self.play(obj.animate.next_to(ground, UP, buff=0), run_time=1)

        self.wait()

    def act_newton(self):
        """The discovery moment"""
        # Newton under tree
        story = Text("1666 - Isaac Newton", font_size=30).to_edge(UP)
        self.play(Write(story))

        tree = self.create_tree()
        tree.to_edge(LEFT).shift(DOWN)
        self.play(FadeIn(tree))

        # Apple falls - the famous moment
        apple = Circle(radius=0.2, color=RED, fill_opacity=1)
        apple.next_to(tree, UP + RIGHT, buff=0)
        self.play(FadeIn(apple))
        self.wait(0.5)

        # Dramatic fall
        self.play(
            apple.animate.shift(DOWN * 3),
            run_time=1,
            rate_func=rate_functions.ease_in_quad
        )

        # Lightbulb moment
        idea = Text("💡", font_size=60).move_to(RIGHT * 2)
        insight = Text(
            "Everything attracts everything!",
            font_size=28
        ).next_to(idea, DOWN)

        self.play(FadeIn(idea, scale=2))
        self.play(Write(insight))
        self.wait(2)

    def act_law(self):
        """The universal law"""
        title = Text("Newton's Law of Gravitation", font_size=36)
        title.to_edge(UP)
        self.play(Write(title))

        # The famous equation
        equation = MathTex(
            "F", "=", "G", "\\frac{m_1 m_2}{r^2}"
        ).scale(1.5)

        self.play(Write(equation))
        self.wait()

        # Explain each part
        explanations = [
            ("F", "Gravitational Force", RED),
            ("G", "Universal Constant", BLUE),
            ("m_1 m_2", "Two Masses", GREEN),
            ("r^2", "Distance Squared", YELLOW),
        ]

        for i, (symbol, meaning, color) in enumerate(explanations):
            equation[0 if symbol == "F" else (2 if symbol == "G" else 3)].set_color(color)
            label = Text(f"{symbol}: {meaning}", font_size=20, color=color)
            label.to_edge(DOWN).shift(UP * (i * 0.5))
            self.play(FadeIn(label), run_time=0.5)
            self.wait(0.5)

        self.wait(2)

    def create_tree(self):
        trunk = Rectangle(width=0.3, height=1.5, color=DARK_BROWN, fill_opacity=1)
        leaves = Circle(radius=1, color=GREEN, fill_opacity=1)
        leaves.next_to(trunk, UP, buff=-0.2)
        return VGroup(trunk, leaves)

"""
Template: Multi-Act Scene Composition
Use for structured animations with clear sections
"""

from manim import *

class MultiActScene(Scene):
    def construct(self):
        # Act 1: Introduction
        self.act_introduction()

        # Transition
        self.clear_scene()

        # Act 2: Main Content
        self.act_main_content()

        # Transition
        self.clear_scene()

        # Act 3: Conclusion
        self.act_conclusion()

    def act_introduction(self):
        """Set up context and introduce the topic"""
        title = Text("Your Title Here", font_size=48)
        subtitle = Text("Subtitle or context", font_size=24, color=GRAY)
        header = VGroup(title, subtitle).arrange(DOWN, buff=0.3)

        self.play(Write(title))
        self.play(FadeIn(subtitle))
        self.wait(2)

    def act_main_content(self):
        """Present the core content"""
        # Example: Show a sequence of concepts
        concepts = [
            Text("Concept 1"),
            Text("Concept 2"),
            Text("Concept 3"),
        ]

        for i, concept in enumerate(concepts):
            concept.move_to(ORIGIN)
            self.play(FadeIn(concept))
            self.wait(1)
            if i < len(concepts) - 1:
                self.play(FadeOut(concept))

    def act_conclusion(self):
        """Summarize and conclude"""
        summary = Text("Key Takeaway", font_size=36)
        self.play(GrowFromCenter(summary))
        self.wait(2)

    def clear_scene(self):
        """Smooth transition between acts"""
        self.play(*[FadeOut(mob) for mob in self.mobjects])
        self.wait(0.5)

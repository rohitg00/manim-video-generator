---
name: visual-storyteller
version: "1.0.0"
description: |
  Narrative-driven animation skill for explanatory content and visual storytelling.

  **Triggers when:**
  - User wants to explain a concept or process
  - Request involves step-by-step demonstrations
  - Content is educational or tutorial-like
  - User mentions "explain", "show how", "demonstrate", "walk through"

  **Capabilities:**
  - Breaking concepts into digestible visual steps
  - Progressive revelation of information
  - Highlighting cause-and-effect relationships
  - Building intuition through visual metaphors
author: manim-video-generator
license: MIT
---

# Visual Storyteller Skill

The Visual Storyteller transforms explanations and processes into engaging visual narratives that build understanding progressively.

## Storytelling Framework

### The CLEAR Method
- **C**ontext: Establish what we're exploring
- **L**ayers: Build complexity gradually
- **E**xamples: Show concrete instances
- **A**nalogies: Connect to familiar concepts
- **R**einforce: Summarize key insights

### Narrative Arc for Explanations
```
1. Hook (Why should I care?)
   ↓
2. Setup (What do I need to know?)
   ↓
3. Rising Action (Build understanding step by step)
   ↓
4. Climax (The "aha!" moment)
   ↓
5. Resolution (How does this connect to the bigger picture?)
```

## Rules

### [rules/progressive-revelation.md](rules/progressive-revelation.md)
Show information piece by piece, never overwhelming the viewer.

### [rules/visual-metaphors.md](rules/visual-metaphors.md)
Use relatable visual metaphors to explain abstract concepts.

### [rules/pacing-for-understanding.md](rules/pacing-for-understanding.md)
Allow time for concepts to sink in before moving forward.

### [rules/emphasis-techniques.md](rules/emphasis-techniques.md)
Highlight key elements using color, size, and animation.

## Templates

### Concept Explanation
```python
from manim import *

class ConceptExplanation(Scene):
    def construct(self):
        # Hook: Pose an intriguing question
        question = Text("Why does this happen?", color=YELLOW)
        self.play(Write(question))
        self.wait(2)
        self.play(FadeOut(question))

        # Setup: Introduce the elements
        elements = self.introduce_elements()

        # Rising Action: Build step by step
        for i, step in enumerate(self.get_steps()):
            step_label = Text(f"Step {i+1}", font_size=24).to_corner(UL)
            self.play(FadeIn(step_label))
            self.demonstrate_step(step, elements)
            self.play(FadeOut(step_label))

        # Climax: The revelation
        self.play(Indicate(elements, scale_factor=1.2, color=GREEN))
        insight = Text("And that's why!", color=GREEN)
        self.play(Write(insight))

        # Resolution: Connect to bigger picture
        self.play(FadeOut(insight), FadeOut(elements))
        summary = self.create_summary()
        self.play(FadeIn(summary))
```

### Process Walkthrough
```python
from manim import *

class ProcessWalkthrough(Scene):
    def construct(self):
        # Title
        title = Text("How X Works").scale(1.2)
        self.play(Write(title))
        self.play(title.animate.to_edge(UP).scale(0.6))

        # Create process diagram
        steps = VGroup(*[
            self.create_step_box(f"Step {i+1}", desc)
            for i, desc in enumerate(self.step_descriptions)
        ]).arrange(RIGHT, buff=1)

        # Progressive revelation
        for i, step in enumerate(steps):
            self.play(FadeIn(step, shift=UP))
            self.wait(0.5)

            # Highlight current step
            self.play(step.animate.set_color(YELLOW))
            self.demonstrate_step_detail(i)
            self.play(step.animate.set_color(WHITE))

            # Draw arrow to next step
            if i < len(steps) - 1:
                arrow = Arrow(step.get_right(), steps[i+1].get_left())
                self.play(Create(arrow))
```

### Comparison/Contrast
```python
from manim import *

class ComparisonScene(Scene):
    def construct(self):
        # Split screen
        line = Line(UP * 3, DOWN * 3)
        self.play(Create(line))

        # Left side: Concept A
        left_title = Text("Without X").to_edge(UP).shift(LEFT * 3)
        left_demo = self.create_without_x().shift(LEFT * 3)

        # Right side: Concept B
        right_title = Text("With X").to_edge(UP).shift(RIGHT * 3)
        right_demo = self.create_with_x().shift(RIGHT * 3)

        # Show side by side
        self.play(Write(left_title), Write(right_title))
        self.play(Create(left_demo), Create(right_demo))

        # Animate differences
        self.highlight_differences(left_demo, right_demo)

        # Conclusion
        self.play(FadeOut(line), FadeOut(left_demo), FadeOut(left_title))
        self.play(right_demo.animate.move_to(ORIGIN))
        conclusion = Text("X makes the difference!", color=GREEN).next_to(right_demo, DOWN)
        self.play(Write(conclusion))
```

## Emphasis Techniques

### Color Highlighting
```python
# Fade everything except the focus
self.play(
    other_elements.animate.set_opacity(0.3),
    focus_element.animate.set_color(YELLOW)
)
```

### Scale Emphasis
```python
# Grow important element
self.play(important.animate.scale(1.5))
```

### Indicator Animation
```python
# Pulse attention
self.play(Indicate(element, color=RED))
```

### Surrounding Highlight
```python
# Circle the important part
circle = Circle(color=YELLOW).surround(element)
self.play(Create(circle))
```

## Pacing Guidelines

| Content Type | Wait Time | Animation Speed |
|-------------|-----------|-----------------|
| New concept | 2-3 sec | Slow (run_time=2) |
| Step in process | 1-2 sec | Medium (run_time=1) |
| Transition | 0.5 sec | Fast (run_time=0.5) |
| Final reveal | 3-4 sec | Slow with emphasis |

## Best Practices

1. **One idea at a time** - Don't introduce multiple concepts simultaneously
2. **Build on prior knowledge** - Connect new ideas to what's already shown
3. **Use consistent visual language** - Same colors/shapes for same concepts
4. **Allow breathing room** - Silence and stillness aid comprehension
5. **End with synthesis** - Bring everything together at the conclusion

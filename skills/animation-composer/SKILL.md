---
name: animation-composer
version: "1.0.0"
description: |
  Scene composition and orchestration skill for creating complex multi-part animations.

  **Triggers when:**
  - User wants to compose multi-element scenes
  - Request involves combining multiple visual elements
  - Scene requires act-based structure or transitions
  - User mentions "scene", "compose", "combine", "orchestrate"

  **Capabilities:**
  - Scene graph construction with acts and transitions
  - Multi-object coordination and timing
  - Camera movements and focus control
  - Layered animation sequences
author: manim-video-generator
license: MIT
---

# Animation Composer Skill

The Animation Composer orchestrates complex multi-part animations by breaking them into logical acts, coordinating timing, and managing transitions between scenes.

## Core Concepts

### Scene Graph Architecture
```
SceneGraph
├── GlobalStyle (colors, fonts, camera)
├── Acts[]
│   ├── Mobjects[] (visual elements)
│   ├── Animations[] (transformations)
│   └── Transitions (fade, slide, zoom)
└── Timeline (duration, pacing)
```

### Act Structure
Each animation is composed of one or more **Acts**:
- **Introduction Act**: Set the stage, introduce key elements
- **Development Acts**: Build complexity, show transformations
- **Conclusion Act**: Summarize, highlight key takeaways

## Rules

### [rules/scene-structure.md](rules/scene-structure.md)
Guidelines for structuring scenes with clear beginnings, middles, and ends.

### [rules/timing-coordination.md](rules/timing-coordination.md)
Best practices for coordinating multiple animations and avoiding visual clutter.

### [rules/transitions.md](rules/transitions.md)
Smooth transitions between acts using fades, slides, and morphs.

### [rules/camera-control.md](rules/camera-control.md)
Camera movements, zooms, and focus to guide viewer attention.

## Templates

### Basic Multi-Act Scene
```python
from manim import *

class ComposedScene(Scene):
    def construct(self):
        # Act 1: Introduction
        title = Text("Introduction").scale(1.5)
        self.play(Write(title))
        self.wait(1)
        self.play(FadeOut(title))

        # Act 2: Main Content
        content = self.create_main_content()
        self.play(Create(content))
        self.animate_content(content)

        # Act 3: Conclusion
        self.play(FadeOut(content))
        conclusion = Text("Key Takeaway").scale(1.2)
        self.play(FadeIn(conclusion))
```

### Camera-Controlled Scene
```python
from manim import *

class CameraComposedScene(MovingCameraScene):
    def construct(self):
        # Create elements at different positions
        left_group = self.create_left_section().shift(LEFT * 4)
        right_group = self.create_right_section().shift(RIGHT * 4)

        # Act 1: Overview
        self.camera.frame.scale(2)
        self.add(left_group, right_group)
        self.wait()

        # Act 2: Focus on left
        self.play(self.camera.frame.animate.scale(0.5).move_to(left_group))
        self.animate_left(left_group)

        # Act 3: Focus on right
        self.play(self.camera.frame.animate.move_to(right_group))
        self.animate_right(right_group)

        # Act 4: Zoom out for conclusion
        self.play(self.camera.frame.animate.scale(2).move_to(ORIGIN))
```

## Composition Patterns

### Sequential Composition
Elements appear one after another in a logical sequence.
```python
self.play(Create(element1))
self.play(Create(element2))
self.play(Create(element3))
```

### Parallel Composition
Multiple elements animate simultaneously for visual impact.
```python
self.play(
    Create(element1),
    Create(element2),
    Create(element3)
)
```

### Staggered Composition
Elements appear with slight delays for a cascading effect.
```python
self.play(LaggedStart(
    *[Create(e) for e in elements],
    lag_ratio=0.2
))
```

### Hierarchical Composition
Parent-child relationships for grouped animations.
```python
group = VGroup(child1, child2, child3)
self.play(Create(group))  # All children animate together
```

## Best Practices

1. **Start simple, build complexity** - Introduce elements gradually
2. **Use visual hierarchy** - Important elements should be larger/brighter
3. **Maintain rhythm** - Consistent timing creates professional feel
4. **Guide the eye** - Use camera and highlights to direct attention
5. **End with impact** - Conclusions should be memorable

## Anti-Patterns to Avoid

- Overwhelming the viewer with too many simultaneous elements
- Inconsistent timing that feels jarring
- Missing transitions between conceptually different sections
- Ignoring visual hierarchy (everything same size/color)

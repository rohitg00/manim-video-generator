# Community Edition Implementation Patterns

Best practices for implementing animations with the Manim Community Edition renderer.

## Import Patterns

```python
# Standard import (recommended)
from manim import *

# Selective imports for clarity
from manim import Scene, Circle, Square, Write, FadeIn, MathTex
```

## Scene Types

### Standard Scene
```python
class MyAnimation(Scene):
    def construct(self):
        circle = Circle()
        self.play(Create(circle))
        self.wait()
```

### 3D Scene
```python
class My3DAnimation(ThreeDScene):
    def construct(self):
        self.set_camera_orientation(phi=75 * DEGREES, theta=30 * DEGREES)
        sphere = Sphere()
        self.play(Create(sphere))
```

### Moving Camera Scene
```python
class CameraAnimation(MovingCameraScene):
    def construct(self):
        circle = Circle()
        self.play(Create(circle))
        self.play(self.camera.frame.animate.scale(0.5).move_to(circle))
```

## Core Animations

### Creation Animations
| Animation | Use Case |
|-----------|----------|
| `Create(mobject)` | Draw shapes stroke-first |
| `Write(text)` | Write text/equations |
| `FadeIn(mobject)` | Gentle appearance |
| `GrowFromCenter(mobject)` | Expand from center |
| `DrawBorderThenFill(mobject)` | Outline then fill |

### Transformation Animations
| Animation | Use Case |
|-----------|----------|
| `Transform(a, b)` | Morph a into b |
| `ReplacementTransform(a, b)` | Replace a with b |
| `TransformMatchingTex(a, b)` | Match LaTeX parts |
| `TransformMatchingShapes(a, b)` | Match shape components |

### Exit Animations
| Animation | Use Case |
|-----------|----------|
| `FadeOut(mobject)` | Gentle disappearance |
| `Uncreate(mobject)` | Reverse of Create |
| `ShrinkToCenter(mobject)` | Collapse to center |

## LaTeX Rendering

### Basic Math
```python
# Simple equation
eq = MathTex("E = mc^2")

# With color isolation
eq = MathTex("E", "=", "m", "c^2")
eq[0].set_color(YELLOW)  # E
eq[3].set_color(BLUE)    # c^2
```

### Using substrings_to_isolate
```python
eq = MathTex(
    "x^2 + 2x + 1 = 0",
    substrings_to_isolate=["x", "1", "0"]
)
eq.set_color_by_tex("x", BLUE)
eq.set_color_by_tex("1", GREEN)
```

### Text with Math
```python
text = Tex("The area is ", "$A = \\pi r^2$")
```

## CLI Usage

```bash
# Preview with low quality (fast)
manim -pql script.py SceneName

# Preview with medium quality
manim -pqm script.py SceneName

# High quality render
manim -pqh script.py SceneName

# 4K render
manim -pqk script.py SceneName

# Save last frame as image
manim -pql -s script.py SceneName

# Transparent background
manim -pql -t script.py SceneName
```

### Quality Presets
| Flag | Resolution | FPS | Use Case |
|------|------------|-----|----------|
| `-ql` | 480p | 15 | Quick preview |
| `-qm` | 720p | 30 | Development |
| `-qh` | 1080p | 60 | Production |
| `-qk` | 4K | 60 | High-end production |

## Debugging Techniques

### Visual Debugging
```python
# Add without animation (instant)
self.add(circle)

# Show bounding box
circle.add(SurroundingRectangle(circle))

# Add coordinate labels
self.add(NumberPlane())
```

### Print Debugging
```python
def construct(self):
    circle = Circle()
    print(f"Circle center: {circle.get_center()}")
    print(f"Circle radius: {circle.radius}")
    print(f"Circle color: {circle.get_color()}")
```

### Interactive Mode
```python
# Pause and inspect
self.wait()
self.interactive_embed()  # Opens interactive shell
```

## Animation Timing

### Run Time Control
```python
self.play(Create(circle), run_time=2)  # 2 seconds
self.play(FadeIn(square), run_time=0.5)  # Fast
```

### Simultaneous Animations
```python
# All at once
self.play(Create(circle), Write(text), FadeIn(square))

# With AnimationGroup
self.play(AnimationGroup(
    Create(circle),
    Write(text),
    lag_ratio=0.5  # Stagger start times
))
```

### Sequential with Succession
```python
self.play(Succession(
    Create(circle),
    circle.animate.shift(RIGHT),
    FadeOut(circle)
))
```

## Common Patterns

### Animate Method
```python
# Fluent animation syntax
self.play(circle.animate.shift(RIGHT).scale(2).set_color(RED))
```

### Value Tracking
```python
tracker = ValueTracker(0)
number = always_redraw(lambda: DecimalNumber(tracker.get_value()))
self.play(tracker.animate.set_value(100), run_time=3)
```

### Updaters
```python
dot = Dot()
label = always_redraw(lambda: Text(f"({dot.get_x():.1f}, {dot.get_y():.1f})").next_to(dot, UP))
self.add(dot, label)
self.play(dot.animate.shift(RIGHT * 3))
```

## Anti-Patterns

### Avoid
```python
# Don't modify mobjects during play
self.play(Create(circle))
circle.shift(RIGHT)  # Wrong - not animated

# Don't forget to add mobjects
text = Text("Hello")
self.play(text.animate.shift(UP))  # Error - text not added
```

### Prefer
```python
# Animate changes
self.play(Create(circle))
self.play(circle.animate.shift(RIGHT))  # Correct

# Add before animating
text = Text("Hello")
self.add(text)
self.play(text.animate.shift(UP))  # Or use FadeIn
```

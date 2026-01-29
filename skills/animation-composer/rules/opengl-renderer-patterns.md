# OpenGL Renderer Implementation Patterns

Best practices for implementing animations with the OpenGL-based renderer (alternative to Cairo).

## Key Differences from Community Edition

| Feature | Community Edition | OpenGL Renderer |
|---------|-------------------|-----------------|
| Creation animation | `Create()` | `ShowCreation()` |
| Color in LaTeX | `set_color_by_tex()` | `t2c` parameter |
| Camera control | `self.camera.frame` | `self.frame` |
| 3D Scene class | `ThreeDScene` | Standard `Scene` |
| Interactive mode | Limited | Full with `-se` flag |

## Import Patterns

```python
# Standard import for OpenGL renderer
from manimlib import *

# Note: Different package name
```

## Interactive Development

### Starting Interactive Mode
```bash
# Run with interactive embed
manimgl script.py SceneName -se

# The -se flag enables:
# - Pausing at self.embed() calls
# - Live code execution
# - Real-time mobject inspection
```

### Using embed()
```python
class InteractiveScene(Scene):
    def construct(self):
        circle = Circle()
        self.play(ShowCreation(circle))
        
        # Pause here for interactive exploration
        self.embed()
        
        # Continue after exiting embed
        self.play(circle.animate.shift(RIGHT))
```

### Checkpoint Workflow
```python
def construct(self):
    # Create initial state
    circle = Circle()
    self.play(ShowCreation(circle))
    
    # Save checkpoint
    self.checkpoint_paste()  # Copy current state
    
    # Experiment from here
    self.play(circle.animate.scale(2))
```

## LaTeX with Color Coding

### Using t2c Parameter
```python
# t2c = "tex to color" dictionary
equation = Tex(
    "E = mc^2",
    t2c={
        "E": YELLOW,
        "m": GREEN,
        "c": BLUE
    }
)
```

### Complex Color Mapping
```python
# Multiple characters with same color
formula = Tex(
    "\\frac{d}{dx}[x^n] = nx^{n-1}",
    t2c={
        "x": BLUE,
        "n": RED,
        "d": GREEN,
        "dx": GREEN
    }
)
```

### Isolating Substrings
```python
# For transformation matching
eq1 = Tex("x^2", " + ", "2x", " + ", "1")
eq2 = Tex("(x + 1)^2")

# Color individual parts
eq1[0].set_color(BLUE)   # x^2
eq1[2].set_color(GREEN)  # 2x
```

## Camera Control

### Frame-Based Control
```python
class CameraScene(Scene):
    def construct(self):
        circle = Circle()
        self.play(ShowCreation(circle))
        
        # Access frame directly (not self.camera.frame)
        self.play(self.frame.animate.scale(0.5))
        self.play(self.frame.animate.move_to(circle))
```

### 3D Camera Orientation
```python
class My3DScene(Scene):
    def construct(self):
        # No special 3D scene class needed
        surface = Surface(lambda u, v: [u, v, u*v])
        self.play(ShowCreation(surface))
        
        # Reorient camera
        self.play(self.frame.animate.reorient(45, 60))
        
        # Camera parameters: theta (rotation), phi (elevation)
```

### Camera Movements
```python
# Pan
self.play(self.frame.animate.shift(RIGHT * 2))

# Zoom
self.play(self.frame.animate.scale(0.5))  # Zoom in
self.play(self.frame.animate.scale(2))    # Zoom out

# Combined
self.play(
    self.frame.animate
        .move_to(target)
        .scale(0.3)
        .reorient(30, 45)
)
```

## Animation Syntax

### ShowCreation (not Create)
```python
# Correct for OpenGL renderer
self.play(ShowCreation(circle))

# NOT Create(circle) - that's Community Edition
```

### Other Animation Differences
```python
# These work the same
self.play(Write(text))
self.play(FadeIn(mobject))
self.play(Transform(a, b))

# Animate method works the same
self.play(circle.animate.shift(RIGHT).scale(2))
```

## 3D Without Special Classes

```python
class Simple3D(Scene):
    def construct(self):
        # 3D objects work in regular Scene
        axes = ThreeDAxes()
        sphere = Sphere(radius=1)
        
        self.play(ShowCreation(axes))
        self.play(ShowCreation(sphere))
        
        # Camera reorientation
        self.play(self.frame.animate.reorient(60, 70))
        
        # Continuous rotation
        self.frame.add_updater(lambda m, dt: m.increment_theta(0.1 * dt))
        self.wait(5)
```

## Debugging in Interactive Mode

### Inspecting Mobjects
```python
def construct(self):
    circle = Circle()
    self.add(circle)
    self.embed()
    
    # In interactive mode, you can:
    # >>> circle.get_center()
    # >>> circle.set_color(RED)
    # >>> self.play(circle.animate.scale(2))
```

### Real-Time Modifications
```python
# While in embed(), you can:
# - Create new mobjects
# - Run animations
# - Test transformations
# - Adjust colors and positions
```

## Performance Optimizations

### GPU Acceleration
```python
# OpenGL renderer leverages GPU for:
# - Shader-based rendering
# - Real-time preview
# - Smooth 3D rotations
```

### Efficient Updates
```python
# Use always_redraw for dynamic content
graph = always_redraw(lambda: FunctionGraph(
    lambda x: np.sin(x + tracker.get_value()),
    x_range=[-PI, PI]
))
```

## Common Patterns

### Interactive Workflow
```bash
# 1. Start with interactive flag
manimgl script.py MyScene -se

# 2. Scene runs until embed()
# 3. Test changes in Python shell
# 4. Type 'exit()' to continue
# 5. Iterate on code
```

### Rapid Prototyping
```python
class Prototype(Scene):
    def construct(self):
        # Quick setup
        self.play(ShowCreation(Circle()))
        
        # Pause to experiment
        self.embed()
        
        # Continue with refined version
```

## Anti-Patterns

### Avoid
```python
# Don't use Create() - use ShowCreation()
self.play(Create(circle))  # Wrong for OpenGL

# Don't use self.camera.frame
self.play(self.camera.frame.animate.scale(0.5))  # Wrong
```

### Prefer
```python
# Use ShowCreation()
self.play(ShowCreation(circle))  # Correct

# Use self.frame directly
self.play(self.frame.animate.scale(0.5))  # Correct
```

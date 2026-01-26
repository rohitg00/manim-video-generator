# Camera Control Rules

## Camera Scene Types

### MovingCameraScene
For 2D panning and zooming:
```python
class MyScene(MovingCameraScene):
    def construct(self):
        # Access camera frame
        self.camera.frame
```

### ThreeDScene
For 3D rotation and perspective:
```python
class MyScene(ThreeDScene):
    def construct(self):
        self.set_camera_orientation(phi=75*DEGREES, theta=-45*DEGREES)
```

## 2D Camera Operations

### Panning (Moving the View)
```python
# Pan to follow an object
self.play(self.camera.frame.animate.move_to(target_object))

# Pan to specific coordinates
self.play(self.camera.frame.animate.move_to(RIGHT * 3 + UP * 2))

# Smooth follow
self.camera.frame.add_updater(lambda m: m.move_to(moving_object))
```

### Zooming
```python
# Zoom in (scale down the frame = objects appear larger)
self.play(self.camera.frame.animate.scale(0.5))

# Zoom out (scale up the frame = see more)
self.play(self.camera.frame.animate.scale(2))

# Zoom to fit specific object
self.play(self.camera.frame.animate.set_width(target.width * 1.5))
```

### Combined Pan and Zoom
```python
# Focus on detail area
self.play(
    self.camera.frame.animate.scale(0.3).move_to(detail_area),
    run_time=2
)
```

## 3D Camera Operations

### Setting Initial View
```python
# Standard viewing angles
self.set_camera_orientation(
    phi=75 * DEGREES,     # Elevation angle (tilt)
    theta=-45 * DEGREES,  # Azimuth angle (rotation)
    gamma=0               # Roll angle
)
```

### Common Camera Angles
| View | phi | theta |
|------|-----|-------|
| Front | 90° | 0° |
| Top-down | 0° | 0° |
| Isometric | 60° | -45° |
| 3/4 View | 75° | -45° |
| Side | 90° | -90° |

### Animated Camera Movement
```python
# Rotate around the scene
self.move_camera(phi=60*DEGREES, theta=45*DEGREES, run_time=2)

# Continuous rotation
self.begin_ambient_camera_rotation(rate=0.2)  # radians per second
self.wait(5)
self.stop_ambient_camera_rotation()
```

### Zoom in 3D
```python
# Move camera closer
self.set_camera_orientation(zoom=2)

# Animated zoom
self.play(self.camera.animate.set_zoom(1.5), run_time=1)
```

## Focus Techniques

### Highlight with Camera
```python
# Zoom into important element
self.play(
    self.camera.frame.animate.scale(0.4).move_to(important_element),
    important_element.animate.set_color(YELLOW),
    run_time=1.5
)
```

### Depth of Field Effect (Simulated)
```python
# Blur background by reducing opacity
background_elements = VGroup(elem1, elem2, elem3)
self.play(
    self.camera.frame.animate.move_to(focus_object),
    background_elements.animate.set_opacity(0.2)
)
```

### Split Focus
```python
# Show two areas by zooming out enough to see both
both = VGroup(area1, area2)
self.play(
    self.camera.frame.animate.set_width(both.width * 1.5).move_to(both)
)
```

## Camera Movement Timing

### Smooth Camera Motion
```python
self.play(
    self.camera.frame.animate.move_to(target),
    rate_func=smooth,
    run_time=1.5
)
```

### Quick Cuts (Instant Change)
```python
# No animation, immediate change
self.camera.frame.move_to(new_position)
self.camera.frame.scale(0.5)
```

### Dramatic Zoom
```python
# Slow zoom for emphasis
self.play(
    self.camera.frame.animate.scale(0.3),
    rate_func=ease_in_out_cubic,
    run_time=3
)
```

## Best Practices

### 1. Establish Context First
```python
# Start zoomed out to show everything
self.camera.frame.scale(2)
self.wait(1)  # Let viewer see the whole scene
# Then zoom to detail
self.play(self.camera.frame.animate.scale(0.5).move_to(detail))
```

### 2. Don't Move Camera and Content Simultaneously
```python
# BAD - disorienting
self.play(
    self.camera.frame.animate.move_to(RIGHT * 3),
    object.animate.move_to(LEFT * 3)
)

# GOOD - one thing at a time
self.play(self.camera.frame.animate.move_to(RIGHT * 3))
self.play(object.animate.move_to(LEFT * 3))
```

### 3. Return to Overview
```python
# After zooming in, zoom back out
self.play(self.camera.frame.animate.scale(2).move_to(ORIGIN))
```

### 4. Match Camera Speed to Content
- Fast cuts for dynamic content
- Slow pans for detailed examination
- Medium speed for transitions

## Anti-Patterns

### DON'T: Constant camera movement
```python
# BAD - makes viewers dizzy
self.begin_ambient_camera_rotation(rate=1)  # Too fast, too long
self.wait(30)
```

### DON'T: Zoom too close
```python
# BAD - pixelation, lost context
self.play(self.camera.frame.animate.scale(0.01))
```

### DO: Purposeful camera movement
```python
# GOOD - camera moves to reveal or emphasize
self.play(self.camera.frame.animate.move_to(reveal_area))
self.play(FadeIn(newly_visible_content))
```

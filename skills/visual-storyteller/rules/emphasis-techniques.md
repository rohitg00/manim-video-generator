# Emphasis Techniques

## The Emphasis Hierarchy

From subtle to strong:
1. **Position** - Center stage = important
2. **Size** - Larger = more important
3. **Color** - Bright/contrast = attention
4. **Animation** - Movement catches eye
5. **Isolation** - Remove distractions

## Position-Based Emphasis

### Center Stage
```python
# Most important element at center
key_element.move_to(ORIGIN)
supporting.to_edge(LEFT)
context.to_edge(RIGHT)
```

### Golden Ratio Positioning
```python
# Professional composition
# Place key elements at 1/3 and 2/3 points
left_focus = LEFT * 2.5  # ~1/3 from left
right_focus = RIGHT * 2.5  # ~2/3 from left
```

### Foreground/Background
```python
# Foreground = emphasized
important.set_z_index(10)
background.set_z_index(0)
```

## Size-Based Emphasis

### Scale Animation
```python
# Draw attention by scaling
self.play(important.animate.scale(1.5))

# Pulse effect (scale up then back)
self.play(important.animate.scale(1.3))
self.play(important.animate.scale(1/1.3))
```

### Relative Size
```python
# Important elements larger from the start
main_point = Text("Key Concept", font_size=48)
sub_point = Text("Supporting detail", font_size=24)
```

## Color-Based Emphasis

### Highlight Colors
```python
# Standard highlight palette
EMPHASIS_PRIMARY = YELLOW
EMPHASIS_SECONDARY = GOLD
EMPHASIS_ALERT = RED
EMPHASIS_SUCCESS = GREEN
```

### Color Change Animation
```python
# Draw attention with color
self.play(element.animate.set_color(YELLOW))

# Gradient emphasis
element.set_color_by_gradient(BLUE, YELLOW)
```

### Dimming Others
```python
# Emphasize by reducing others
all_elements = VGroup(elem1, elem2, elem3, focus_elem)
others = VGroup(elem1, elem2, elem3)

self.play(
    others.animate.set_opacity(0.3),
    focus_elem.animate.set_color(YELLOW)
)
```

## Animation-Based Emphasis

### Indicate Animation
```python
# Built-in emphasis animation
self.play(Indicate(element, color=YELLOW, scale_factor=1.2))
```

### Circumscribe (Circle Attention)
```python
# Draw circle around important element
self.play(Circumscribe(element, color=RED, time_width=2))
```

### Flash
```python
# Quick bright flash
self.play(Flash(element.get_center(), color=WHITE))
```

### Wiggle
```python
# Attention-grabbing wiggle
self.play(Wiggle(element))
```

### Focus Frame
```python
# Box around important content
frame = SurroundingRectangle(element, color=YELLOW, buff=0.2)
self.play(Create(frame))
```

### Underline
```python
# Underline key text
underline = Underline(text_element, color=RED)
self.play(Create(underline))
```

## Isolation Emphasis

### Clear Everything Else
```python
# Remove distractions
other_elements = [e for e in self.mobjects if e != focus_element]
self.play(*[FadeOut(e) for e in other_elements])
self.wait(2)  # Focus time
self.play(*[FadeIn(e) for e in other_elements])  # Restore
```

### Spotlight Effect
```python
# Dim surroundings, spotlight on focus
def spotlight(scene, focus, others):
    scene.play(
        focus.animate.set_opacity(1),
        *[o.animate.set_opacity(0.2) for o in others]
    )
```

### Zoom Isolation
```python
# Zoom camera to focus element
self.play(
    self.camera.frame.animate.scale(0.5).move_to(focus_element)
)
```

## Combining Techniques

### Weak Emphasis (Subtle)
```python
# Just position or small color change
self.play(element.animate.move_to(UP * 0.5))
```

### Medium Emphasis (Notice)
```python
# Position + color
self.play(
    element.animate.move_to(UP * 0.5).set_color(YELLOW)
)
```

### Strong Emphasis (Critical)
```python
# Position + color + size + frame
frame = SurroundingRectangle(element, color=YELLOW)
self.play(
    element.animate.move_to(ORIGIN).scale(1.5).set_color(YELLOW),
    Create(frame)
)
```

### Maximum Emphasis (Climax)
```python
# Everything: isolation + position + color + size + animation
self.play(*[FadeOut(m) for m in self.mobjects if m != element])
self.play(
    element.animate.move_to(ORIGIN).scale(2).set_color(GOLD)
)
self.play(Flash(element.get_center(), color=WHITE, num_lines=12))
self.play(Indicate(element))
```

## When to Use Each Level

| Situation | Emphasis Level |
|-----------|---------------|
| Minor detail | None or weak |
| Step in process | Weak |
| Important point | Medium |
| Key concept | Strong |
| Main takeaway | Strong |
| Climax/aha moment | Maximum |

## Anti-Patterns

### DON'T: Emphasize everything
```python
# BAD - Nothing stands out
for elem in all_elements:
    self.play(Indicate(elem))  # Everything is "important"
```

### DON'T: Inconsistent emphasis
```python
# BAD - Confusing signals
self.play(important.animate.scale(0.5))  # Shrinking = less important??
self.play(minor.animate.scale(2))  # Growing = important??
```

### DO: Reserve strong emphasis for key moments
```python
# GOOD - Clear hierarchy
for elem in supporting_elements:
    self.play(FadeIn(elem))  # Normal

self.play(Indicate(key_element, scale_factor=1.5, color=GOLD))  # Emphasis
```

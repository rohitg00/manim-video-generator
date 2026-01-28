# Scene Structure Rules

## The Three-Act Framework

Every well-composed animation follows a three-act structure:

### Act 1: Introduction (10-20% of duration)
**Purpose**: Set context and introduce key elements

```python
def act_introduction(self):
    # Title/header
    title = Text("Understanding Recursion")
    self.play(Write(title))
    self.wait(1)

    # Move to make room for content
    self.play(title.animate.to_edge(UP).scale(0.7))

    # Introduce the core concept
    concept = Text("A function that calls itself", font_size=28)
    self.play(FadeIn(concept))
```

### Act 2: Development (60-80% of duration)
**Purpose**: Build complexity, demonstrate, explain

```python
def act_development(self):
    # Multiple sub-sections
    for section in self.sections:
        self.present_section(section)
        self.transition_to_next()
```

### Act 3: Conclusion (10-20% of duration)
**Purpose**: Summarize, reinforce key points

```python
def act_conclusion(self):
    # Clear previous content
    self.clear_with_transition()

    # Summary
    key_points = BulletedList(
        "Point 1: ...",
        "Point 2: ...",
        "Point 3: ..."
    )
    self.play(Write(key_points))

    # Final emphasis
    self.play(Indicate(key_points[0]))
```

## Screen Layout Zones

```
┌──────────────────────────────────────────┐
│               TITLE ZONE                 │  buff=0.5 from top
│            (headers, labels)             │
├──────────────────────────────────────────┤
│                                          │
│                                          │
│              PRIMARY ZONE                │  Main content area
│            (main content)                │
│                                          │
│                                          │
├──────────────────────────────────────────┤
│              CAPTION ZONE                │  buff=0.5 from bottom
│        (explanations, formulas)          │
└──────────────────────────────────────────┘
```

### Zone Positioning
```python
# Title zone
title.to_edge(UP, buff=0.5)

# Primary zone
content.move_to(ORIGIN)

# Caption zone
caption.to_edge(DOWN, buff=0.5)
```

## Scene Transitions

### Fade Transition (Default)
```python
def clear_with_fade(self):
    self.play(*[FadeOut(m) for m in self.mobjects])
```

### Slide Transition
```python
def slide_out_left(self):
    self.play(*[m.animate.shift(LEFT * 15) for m in self.mobjects])
```

### Zoom Transition
```python
def zoom_out_transition(self):
    all_objects = VGroup(*self.mobjects)
    self.play(all_objects.animate.scale(0).set_opacity(0))
```

## Grouping Guidelines

### Logical Groups
```python
# Group related elements
equation_group = VGroup(equation, label, box)
graph_group = VGroup(axes, function, dots)

# Animate groups together
self.play(
    equation_group.animate.shift(LEFT * 3),
    graph_group.animate.shift(RIGHT * 3)
)
```

### Spatial Groups
```python
# Elements that move together
header = VGroup(title, subtitle, underline)
header.arrange(DOWN, buff=0.2)
```

## Anti-Patterns

### DON'T: Start with complex scene
```python
# BAD
self.add(element1, element2, element3, element4, element5)
# All appear at once - overwhelming
```

### DO: Build up gradually
```python
# GOOD
for element in [element1, element2, element3, element4, element5]:
    self.play(FadeIn(element))
    self.wait(0.3)
```

### DON'T: Abrupt endings
```python
# BAD
self.wait(1)
# Scene just stops
```

### DO: Proper conclusion
```python
# GOOD
self.play(FadeOut(*self.mobjects))
self.wait(0.5)
```

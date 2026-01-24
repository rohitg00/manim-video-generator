# Visual Metaphors Rules

## Why Use Visual Metaphors?

Abstract concepts become tangible when connected to familiar visuals:
- **Numbers** → Physical objects (5 apples, not "5")
- **Growth** → Expanding shapes, rising graphs
- **Connection** → Lines, arrows, bridges
- **Transformation** → Morphing shapes
- **Time** → Left-to-right movement, timeline

## Common Metaphor Mappings

### Size = Importance/Quantity
```python
# Larger = more important
important = Circle(radius=1.5, color=YELLOW)
normal = Circle(radius=0.5, color=WHITE)

# Growing = increasing
self.play(circle.animate.scale(2))  # "Value doubled"
```

### Color = Category/Emotion
```python
# Consistent color coding
POSITIVE = GREEN
NEGATIVE = RED
NEUTRAL = WHITE

# Emotional mapping
CALM = BLUE
ENERGY = YELLOW
DANGER = RED
```

### Position = Time/Sequence/Hierarchy
```python
# Left to right = past to future
past.to_edge(LEFT)
present.move_to(ORIGIN)
future.to_edge(RIGHT)

# Top to bottom = hierarchy
boss.to_edge(UP)
employee.to_edge(DOWN)

# Center = focus/importance
main_topic.move_to(ORIGIN)
```

### Movement = Change/Process
```python
# Moving right = progress
self.play(progress_bar.animate.shift(RIGHT * 5))

# Moving up = improvement
self.play(value.animate.shift(UP * 2))

# Rotation = cycle/repetition
self.play(Rotate(cycle_diagram, angle=2*PI))
```

### Opacity = Relevance/Focus
```python
# Dim = less important now
self.play(background_info.animate.set_opacity(0.3))

# Full opacity = current focus
self.play(current_topic.animate.set_opacity(1))
```

## Creating Effective Metaphors

### Rule 1: Use Familiar Objects
```python
# GOOD - Everyone knows these
apple = Circle(color=RED)  # Fruit
house = Rectangle()  # Building
person = SVGMobject("stick_figure.svg")

# BAD - Obscure or abstract
complex_symbol = MathTex(r"\aleph_0")  # Not universally known
```

### Rule 2: Maintain Consistency
```python
# If "x" is a blue circle in Scene 1, it must be blue circle throughout
x_visual = Circle(color=BLUE)
# NEVER change to square or different color mid-explanation
```

### Rule 3: Match Metaphor to Concept
```python
# Concept: Division
# Metaphor: Cutting a pie
pie = Circle(fill_opacity=0.8)
slice_line = Line(ORIGIN, UP)
self.play(Create(slice_line))  # "Dividing"

# Concept: Multiplication
# Metaphor: Grid/array of objects
objects = VGroup(*[Square() for _ in range(12)])
objects.arrange_in_grid(rows=3, cols=4)  # "3 × 4 = 12"
```

## Domain-Specific Metaphors

### Mathematics
| Concept | Metaphor |
|---------|----------|
| Addition | Combining groups |
| Subtraction | Removing from group |
| Functions | Machine with input/output |
| Limits | Approaching a barrier |
| Derivatives | Slope of hill |
| Integrals | Area under curve |

### Computer Science
| Concept | Metaphor |
|---------|----------|
| Variables | Labeled boxes |
| Arrays | Row of boxes |
| Recursion | Russian nesting dolls |
| Stack | Stack of plates |
| Queue | Line of people |
| Tree | Family tree / actual tree |

### Physics
| Concept | Metaphor |
|---------|----------|
| Force | Arrows/vectors |
| Energy | Glowing aura |
| Waves | Ocean waves |
| Gravity | Pulling down |
| Electricity | Flowing water |

## Animation Techniques for Metaphors

### Transformation Metaphor (A becomes B)
```python
# Show conceptual transformation
water = SVGMobject("water_drop")
steam = SVGMobject("steam_cloud")
self.play(Transform(water, steam))  # Evaporation
```

### Container Metaphor (X contains Y)
```python
# Variable as box
box = Square()
value = Text("42")
self.play(Create(box))
self.play(value.animate.move_to(box))  # Value stored in variable
```

### Flow Metaphor (X leads to Y)
```python
# Process flow
arrow = Arrow(start.get_right(), end.get_left())
self.play(Create(arrow))
# Animated particle along arrow
dot = Dot()
self.play(MoveAlongPath(dot, arrow))
```

### Balance Metaphor (X equals Y)
```python
# Show equality as balance
scale = VGroup(
    Line(LEFT * 2, RIGHT * 2),  # Balance beam
    Triangle().scale(0.3).next_to(ORIGIN, DOWN)  # Fulcrum
)
left_weight = Square().move_to(LEFT * 1.5)
right_weight = Square().move_to(RIGHT * 1.5)
# Scale is level when equal
```

## Common Pitfalls

### DON'T: Mix metaphors
```python
# BAD - Confusing
variable_as_box = Square()  # Box metaphor
variable_as_bucket = Arc()  # Now bucket?? Pick one!
```

### DON'T: Over-complicate
```python
# BAD - Metaphor harder than concept
# Using a 3D rotating hypercube to represent a simple array
```

### DO: Keep it simple and consistent
```python
# GOOD - One clear metaphor throughout
array_boxes = VGroup(*[Square() for _ in range(5)])
array_boxes.arrange(RIGHT)
# Always use boxes for arrays in this animation
```

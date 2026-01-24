# Timing Coordination Rules

## Animation Duration Standards

### Quick Actions (0.2-0.5s)
- Simple property changes
- Small movements
- Opacity changes

```python
self.play(obj.animate.set_opacity(0.5), run_time=0.3)
```

### Standard Actions (0.5-1s)
- Object creation
- Basic transforms
- Position changes

```python
self.play(Create(circle), run_time=0.7)
```

### Deliberate Actions (1-2s)
- Complex transforms
- Educational reveals
- Important transitions

```python
self.play(TransformMatchingTex(eq1, eq2), run_time=1.5)
```

### Slow Actions (2-4s)
- Building complex diagrams
- Tracing curves
- Multi-step processes

```python
self.play(Create(complex_graph), run_time=3)
```

## Coordination Patterns

### Sequential (One After Another)
```python
self.play(Create(obj1))
self.play(Create(obj2))
self.play(Create(obj3))
# Total: 3 animations, clear order
```

### Parallel (Simultaneous)
```python
self.play(
    Create(obj1),
    Create(obj2),
    Create(obj3)
)
# Total: 1 animation, happening together
```

### Staggered (Cascade Effect)
```python
self.play(LaggedStart(
    Create(obj1),
    Create(obj2),
    Create(obj3),
    lag_ratio=0.3
))
# Total: 1 animation, cascading start
```

### Phased (Grouped Sequences)
```python
# Phase 1: Setup
self.play(Create(axes), Create(labels))

# Phase 2: Content
self.play(Create(graph))

# Phase 3: Annotations
self.play(Write(annotation1), Write(annotation2))
```

## Wait Times

### Purpose-Based Waits
| After... | Wait Time | Purpose |
|----------|-----------|---------|
| Title appears | 1-2s | Read title |
| Equation shown | 1-3s | Process math |
| Complex diagram | 2-4s | Understand structure |
| Transformation | 0.5-1s | Observe change |
| Step completion | 1s | Mental checkpoint |
| Final reveal | 2-3s | Absorb conclusion |

### Dynamic Waits (Advanced)
```python
# Scale wait time by content complexity
word_count = len(text.text.split())
wait_time = max(1, word_count * 0.3)  # ~0.3s per word
self.wait(wait_time)
```

## Avoiding Visual Clutter

### Rule: Maximum 3 Simultaneous Movements
```python
# GOOD: Focused attention
self.play(obj1.animate.shift(UP), obj2.animate.shift(DOWN))

# BAD: Too much happening
self.play(
    obj1.animate.shift(UP),
    obj2.animate.shift(DOWN),
    obj3.animate.rotate(PI),
    obj4.animate.scale(2),
    obj5.animate.set_color(RED)
)  # Viewer can't track all changes
```

### Rule: Related Objects Move Together
```python
# GOOD: Logically grouped
graph_elements = VGroup(axes, curve, label)
self.play(graph_elements.animate.shift(LEFT * 2))

# BAD: Unrelated simultaneous movement
self.play(
    axes.animate.shift(LEFT),
    title.animate.shift(RIGHT),  # Unrelated to axes
    caption.animate.shift(UP)     # Also unrelated
)
```

## Rhythm and Pacing

### Consistent Rhythm Pattern
```python
# Establish a rhythm
for step in steps:
    self.play(FadeIn(step), run_time=0.5)  # Consistent timing
    self.wait(1)                            # Consistent pause
```

### Rhythm Variation for Emphasis
```python
# Normal pace
self.play(Create(normal_element), run_time=0.5)
self.wait(0.5)

# Slow down for important moment
self.play(Create(important_element), run_time=2)
self.wait(2)

# Return to normal
self.play(Create(next_element), run_time=0.5)
```

## Synchronization Techniques

### Animation Groups
```python
# Ensure multiple animations have same duration
self.play(
    Create(obj1),
    Create(obj2),
    run_time=1  # Both take exactly 1 second
)
```

### Value Trackers for Sync
```python
# Synchronized movement
t = ValueTracker(0)
obj1.add_updater(lambda m: m.set_x(t.get_value()))
obj2.add_updater(lambda m: m.set_y(t.get_value()))
self.play(t.animate.set_value(3))
```

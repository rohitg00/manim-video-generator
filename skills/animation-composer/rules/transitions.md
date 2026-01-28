# Transition Rules

## Transition Types

### 1. Fade Transitions
**Best for**: Topic changes, scene endings, gentle transitions

```python
# Fade out everything
self.play(*[FadeOut(m) for m in self.mobjects])

# Fade out old, fade in new
self.play(FadeOut(old_content), FadeIn(new_content))

# Cross-fade (simultaneous)
self.play(
    FadeOut(old_content),
    FadeIn(new_content),
    run_time=1
)
```

### 2. Slide Transitions
**Best for**: Sequential content, timeline progressions, revealing more

```python
# Slide out left, new content from right
self.play(
    old_content.animate.shift(LEFT * 15),
    new_content.animate.shift(LEFT * 15),  # Starts off-screen right
    run_time=0.8
)

# Vertical slide (like scrolling)
self.play(
    old_content.animate.shift(UP * 8),
    new_content.animate.shift(UP * 8),  # Starts below
)
```

### 3. Scale/Zoom Transitions
**Best for**: Focus changes, detail views, conclusions

```python
# Zoom into detail
self.play(
    camera.frame.animate.scale(0.5).move_to(detail_area),
    run_time=1.5
)

# Zoom out for overview
self.play(
    camera.frame.animate.scale(2).move_to(ORIGIN),
    run_time=1.5
)
```

### 4. Transform Transitions
**Best for**: Showing evolution, concept connections

```python
# Morph one concept into another
self.play(Transform(concept_a, concept_b), run_time=2)

# Replacement (cleaner for text)
self.play(ReplacementTransform(old_text, new_text))
```

### 5. Wipe Transitions
**Best for**: Clean breaks, professional feel

```python
# Create a wipe rectangle
wipe = Rectangle(width=16, height=10, fill_opacity=1, color=BLACK)
wipe.to_edge(LEFT, buff=0).shift(LEFT * 16)

# Wipe across screen
self.play(wipe.animate.shift(RIGHT * 32), run_time=0.8)
self.remove(*self.mobjects)
self.remove(wipe)
```

## Transition Selection Guide

| Situation | Recommended Transition |
|-----------|----------------------|
| End of major section | Fade out all |
| Moving to related topic | Cross-fade |
| Showing progression/steps | Slide |
| Diving into detail | Zoom in |
| Returning to big picture | Zoom out |
| Complete topic change | Wipe or full fade |
| Showing before/after | Split or slide |

## Transition Timing

### Standard Durations
- Quick transition: 0.3-0.5s
- Standard transition: 0.7-1s
- Dramatic transition: 1.5-2s

### Pacing Rule
```python
# Don't linger after transition starts
self.play(FadeOut(old), run_time=0.5)
# Immediately bring in new content
self.play(FadeIn(new), run_time=0.5)
# THEN wait for viewer
self.wait(1)
```

## Easing for Transitions

### Smooth (Default)
```python
self.play(obj.animate.shift(RIGHT), rate_func=smooth)
```

### Ease Out (Decelerate)
```python
# Feels like sliding into place
self.play(obj.animate.shift(RIGHT), rate_func=ease_out_cubic)
```

### Ease In (Accelerate)
```python
# Feels like launching away
self.play(obj.animate.shift(LEFT * 15), rate_func=ease_in_cubic)
```

### Linear (Constant Speed)
```python
# Mechanical, robotic feel - rarely used
self.play(obj.animate.shift(RIGHT), rate_func=linear)
```

## Common Transition Patterns

### The "Gather and Leave" Pattern
```python
# All elements gather to center
all_elements = VGroup(*self.mobjects)
self.play(all_elements.animate.move_to(ORIGIN).scale(0.5))
# Then exit together
self.play(FadeOut(all_elements, scale=0))
```

### The "Push Out" Pattern
```python
# New content pushes old off-screen
new_content.next_to(old_content, RIGHT, buff=8)  # Off-screen
self.play(
    old_content.animate.shift(LEFT * 16),
    new_content.animate.move_to(ORIGIN)
)
self.remove(old_content)
```

### The "Dissolve to Background" Pattern
```python
# Elements fade into background before new content
for mob in self.mobjects:
    mob.save_state()
self.play(*[m.animate.set_opacity(0.1) for m in self.mobjects])
# Add new content on top
self.play(FadeIn(new_content))
# Optionally restore later
self.play(*[m.animate.restore() for m in old_mobjects])
```

## Anti-Patterns

### DON'T: Multiple transition types at once
```python
# BAD - confusing
self.play(
    obj1.animate.shift(LEFT * 10),    # Sliding
    obj2.animate.scale(0),             # Scaling
    FadeOut(obj3)                       # Fading
)
```

### DON'T: Transition without purpose
```python
# BAD - transition adds nothing
self.play(FadeOut(text))
self.play(FadeIn(same_text))  # Why?
```

### DO: Match transition to content relationship
```python
# GOOD - transform shows relationship
self.play(TransformMatchingTex(equation_v1, equation_v2))
```

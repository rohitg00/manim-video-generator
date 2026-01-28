# Timing Guidelines for Animation Composition

## Default Durations

| Animation Type | Duration | Use Case |
|---------------|----------|----------|
| `Write` | 1-2s | Text, equations |
| `Create` | 0.5-1s | Shapes, lines |
| `FadeIn/Out` | 0.5s | Transitions |
| `Transform` | 1s | Shape morphing |
| `MoveToTarget` | 0.5-1s | Repositioning |

## Wait Times

```python
# After title
self.wait(1)

# After important information
self.wait(2)

# After complex animation
self.wait(1.5)

# Brief pause for rhythm
self.wait(0.5)
```

## Pacing Strategies

### Educational Content
- Slower pace (1.5x default durations)
- Longer wait times
- Step-by-step reveals

### Entertainment/Dynamic
- Faster pace (0.7x default durations)
- Shorter waits
- Parallel animations

### Professional/Corporate
- Medium pace (default durations)
- Consistent timing
- Smooth transitions

## Animation Speed Modifiers

```python
# Slow motion effect
self.play(Create(obj), run_time=3)

# Quick action
self.play(FadeIn(obj), run_time=0.3)

# Rate functions for easing
self.play(obj.animate.shift(RIGHT), rate_func=smooth)
self.play(obj.animate.shift(RIGHT), rate_func=rush_into)
self.play(obj.animate.shift(RIGHT), rate_func=there_and_back)
```

## Total Duration Guidelines

| Content Type | Recommended Length |
|-------------|-------------------|
| Quick concept | 10-30 seconds |
| Single topic explanation | 30-60 seconds |
| Multi-step tutorial | 1-3 minutes |
| Comprehensive overview | 3-5 minutes |

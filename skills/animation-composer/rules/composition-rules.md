# Animation Composer Rules

## Scene Structure

### Act-Based Organization
- Divide animations into logical acts (Introduction, Development, Conclusion)
- Each act should have a clear purpose
- Use transitions between acts for visual continuity

### Timing Guidelines
- Introduction: 2-5 seconds (set context)
- Main content: Variable (depends on complexity)
- Conclusion: 2-3 seconds (reinforce key points)

## Spatial Composition

### Screen Regions
```
┌─────────────────────────────────┐
│  Title Area (UP, buff=0.5)      │
├─────────────────────────────────┤
│                                 │
│     Main Stage (CENTER)         │
│                                 │
├─────────────────────────────────┤
│  Caption Area (DOWN, buff=0.5)  │
└─────────────────────────────────┘
```

### Positioning Best Practices
- Use `to_edge()` for consistent margins
- Use `arrange()` for grouped elements
- Maintain visual hierarchy with size and color

## Animation Sequencing

### Parallel vs Sequential
```python
# Parallel - elements appear together
self.play(Create(obj1), Create(obj2))

# Sequential - one after another
self.play(Create(obj1))
self.play(Create(obj2))

# Staggered - with delay
self.play(LaggedStart(
    Create(obj1), Create(obj2), Create(obj3),
    lag_ratio=0.3
))
```

### Transition Types
- `FadeIn/FadeOut` - Subtle, professional
- `GrowFromCenter` - Emphasis, importance
- `Transform` - Metamorphosis, change
- `ReplacementTransform` - Direct substitution

## Common Patterns

### Title Sequence
```python
title = Text("My Animation").scale(1.5)
subtitle = Text("A Visual Journey").scale(0.7)
VGroup(title, subtitle).arrange(DOWN)
self.play(Write(title))
self.play(FadeIn(subtitle))
```

### Scene Clear
```python
self.play(*[FadeOut(mob) for mob in self.mobjects])
```

## Avoid
- Overcrowding the screen
- Inconsistent animation speeds
- Abrupt transitions without purpose
- Too many simultaneous movements

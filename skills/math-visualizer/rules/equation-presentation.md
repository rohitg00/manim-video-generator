# Equation Presentation Rules

## Progressive Revelation

### Build Equations Step by Step
Never show a complex equation all at once. Build it piece by piece:

```python
# GOOD: Progressive reveal
eq_part1 = MathTex("E")
self.play(Write(eq_part1))
eq_part2 = MathTex("E = mc")
self.play(TransformMatchingTex(eq_part1, eq_part2))
eq_final = MathTex("E = mc^2")
self.play(TransformMatchingTex(eq_part2, eq_final))

# BAD: All at once
eq = MathTex("E = mc^2")
self.play(Write(eq))  # Viewer has no time to process
```

## Timing Guidelines

| Equation Complexity | Write Time | Wait After |
|---------------------|------------|------------|
| Simple (x = 1) | 0.5s | 1s |
| Medium (ax² + bx + c) | 1s | 1.5s |
| Complex (∫∫ f(x,y) dx dy) | 1.5s | 2-3s |
| Multi-line derivations | 2s per line | 1s between lines |

## Positioning

### Center Important Equations
```python
equation.move_to(ORIGIN)  # Main focus
```

### Use Consistent Margins
```python
equation.to_edge(UP, buff=1)  # Standard top margin
supporting_text.to_edge(DOWN, buff=0.5)
```

### Group Related Equations
```python
equations = VGroup(eq1, eq2, eq3)
equations.arrange(DOWN, buff=0.5, aligned_edge=LEFT)
```

## Transitions Between Equations

### Transform for Related Equations
```python
# When equations are related
self.play(TransformMatchingTex(eq1, eq2))
```

### Fade for Unrelated Equations
```python
# When switching topics
self.play(FadeOut(eq1), FadeIn(eq2))
```

### Replacement for Substitution
```python
# When one equation replaces another
self.play(ReplacementTransform(eq1, eq2))
```

## Emphasis Techniques

### Boxing Important Results
```python
box = SurroundingRectangle(equation, color=YELLOW, buff=0.2)
self.play(Create(box))
```

### Underlining Key Terms
```python
underline = Underline(equation[0], color=RED)
self.play(Create(underline))
```

### Scaling for Focus
```python
self.play(equation.animate.scale(1.3))
```

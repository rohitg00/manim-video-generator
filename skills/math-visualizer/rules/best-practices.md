# Math Visualizer Best Practices

## LaTeX Rendering
- Always use `MathTex` for mathematical expressions
- Use `Tex` for plain text labels
- Prefer `\displaystyle` for fractions and integrals
- Use `\text{}` for words within equations

## Color Coding
- Use consistent colors for variables (e.g., x=BLUE, y=GREEN)
- Highlight important terms with `set_color()`
- Use `indicate()` animation for emphasis

## Animation Timing
- Give viewers 1-2 seconds to read new equations
- Use `TransformMatchingTex` for equation transformations
- Fade out intermediate steps, don't delete abruptly

## Common Patterns

### Equation Transformation
```python
eq1 = MathTex("x^2 + 2x + 1")
eq2 = MathTex("(x + 1)^2")
self.play(TransformMatchingTex(eq1, eq2))
```

### Step-by-Step Derivation
```python
steps = VGroup(
    MathTex("f(x) = x^2"),
    MathTex("f'(x) = 2x"),
    MathTex("f''(x) = 2")
).arrange(DOWN)
for step in steps:
    self.play(Write(step))
    self.wait(0.5)
```

### Graph with Function
```python
axes = Axes(x_range=[-3, 3], y_range=[-1, 9])
graph = axes.plot(lambda x: x**2, color=BLUE)
label = axes.get_graph_label(graph, "f(x) = x^2")
```

## Avoid
- Don't crowd too many equations on screen
- Don't use tiny font sizes
- Don't skip steps in derivations
- Don't use inconsistent notation

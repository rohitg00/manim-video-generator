# Color Coding for Mathematics

## Standard Color Palette

| Element Type | Color Name | Hex Code | Manim Constant |
|--------------|------------|----------|----------------|
| Variables (x, y, z) | Blue | #58C4DD | BLUE |
| Constants (a, b, c) | Yellow | #FFFF00 | YELLOW |
| Functions (f, g, h) | Green | #83C167 | GREEN |
| Operators (+, −, ×) | White | #FFFFFF | WHITE |
| Results/Answers | Gold | #FFD700 | GOLD |
| Errors/Negatives | Red | #FC6255 | RED |
| Secondary emphasis | Purple | #9A72AC | PURPLE |
| Neutral/Background | Gray | #888888 | GRAY |

## Application Examples

### Quadratic Formula
```python
formula = MathTex(
    "x", "=",
    "\\frac{-", "b", "\\pm\\sqrt{", "b", "^2 - 4", "a", "c", "}}{2", "a", "}"
)
# Color variables
formula[0].set_color(BLUE)   # x
formula[3].set_color(YELLOW) # b
formula[5].set_color(YELLOW) # b
formula[7].set_color(YELLOW) # a
formula[8].set_color(YELLOW) # c
formula[10].set_color(YELLOW) # a
```

### Function Notation
```python
func = MathTex("f", "(", "x", ")", "=", "x", "^2")
func[0].set_color(GREEN)  # f
func[2].set_color(BLUE)   # x (input)
func[5].set_color(BLUE)   # x (in expression)
```

## Consistency Rules

### Rule 1: Same Variable = Same Color
If `x` is blue in the first equation, it must be blue in ALL equations.

### Rule 2: Color Changes Signal Transformation
```python
# x is blue, transforms to red when squared
x_var = MathTex("x").set_color(BLUE)
x_squared = MathTex("x^2").set_color(BLUE)
# After transformation, result is different color
result = MathTex("4").set_color(GOLD)
```

### Rule 3: Use Color Groups for Related Terms
```python
# Terms being combined should share color family
term1 = MathTex("2x").set_color(BLUE)
term2 = MathTex("3x").set_color(BLUE_C)  # Lighter blue
sum_term = MathTex("5x").set_color(BLUE_A)  # Combined
```

## When NOT to Use Color

- Don't color every single element (visual overload)
- Don't use more than 4-5 colors in one scene
- Don't use similar colors for different concepts (e.g., light blue vs cyan)
- Don't color generic operators unless emphasizing them

## Accessibility Considerations

- Ensure sufficient contrast against background
- Don't rely solely on color to convey meaning
- Consider color-blind viewers (avoid red-green only distinctions)
- Use shapes/labels in addition to colors when critical

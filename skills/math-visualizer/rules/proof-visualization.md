# Proof Visualization Rules

## Structure of a Visual Proof

### 1. State the Theorem
```python
theorem = MathTex(r"\text{Theorem: } a^2 + b^2 = c^2")
theorem.to_edge(UP)
self.play(Write(theorem))
```

### 2. Establish Given Information
```python
given = VGroup(
    MathTex(r"\text{Given: Right triangle with legs } a, b"),
    MathTex(r"\text{and hypotenuse } c")
).arrange(DOWN, aligned_edge=LEFT)
self.play(FadeIn(given))
```

### 3. Build the Proof Step by Step
Each step should:
- Be visually motivated
- Connect to the previous step
- Pause for comprehension

### 4. Conclude with QED
```python
qed = MathTex(r"\blacksquare").to_corner(DR)
self.play(FadeIn(qed))
```

## Visual Proof Techniques

### Proof by Construction
Show that something can be built:
```python
# Build a square from four triangles
triangles = [self.create_triangle() for _ in range(4)]
square = VGroup(*triangles)
for i, t in enumerate(triangles):
    t.rotate(i * PI/2)
self.play(LaggedStart(*[Create(t) for t in triangles]))
```

### Proof by Transformation
Show equivalence through morphing:
```python
# Show two expressions are equal by transforming one into the other
expr1 = MathTex(r"(a+b)^2")
expr2 = MathTex(r"a^2 + 2ab + b^2")
self.play(TransformMatchingTex(expr1, expr2))
```

### Proof by Dissection
Break apart and rearrange:
```python
# Cut shape into pieces, rearrange to show equality
pieces = self.cut_shape(original)
self.play(*[p.animate.move_to(new_positions[i]) for i, p in enumerate(pieces)])
```

## Annotation Patterns

### Step Numbers
```python
for i, step in enumerate(proof_steps):
    number = Text(f"({i+1})", font_size=20).next_to(step, LEFT)
    self.play(Write(number), Write(step))
```

### Justifications
```python
step = MathTex(r"x + x = 2x")
reason = Text("(combining like terms)", font_size=18, color=GRAY)
reason.next_to(step, RIGHT, buff=1)
self.play(Write(step), FadeIn(reason))
```

### Highlighting Key Transitions
```python
# Before transformation
self.play(Indicate(term_to_change, color=YELLOW))
# Transform
self.play(Transform(old_term, new_term))
# After transformation
self.play(Indicate(new_term, color=GREEN))
```

## Timing for Proof Steps

| Proof Element | Duration | Wait |
|--------------|----------|------|
| Theorem statement | 1.5s | 2s |
| Given information | 1s | 1s |
| Simple step | 1s | 1s |
| Complex step | 2s | 2s |
| Key insight | 1.5s | 3s |
| Conclusion | 1s | 2s |

## Common Proof Animations

### Equality Demonstration
```python
# Show A = B by animating A to position of B
self.play(
    left_side.animate.move_to(right_side),
    right_side.animate.set_opacity(0.3)
)
```

### Contradiction Highlight
```python
# Show contradiction with X mark or color
contradiction = Cross(statement, stroke_color=RED, stroke_width=8)
self.play(Create(contradiction))
```

### Induction Step
```python
# Show n → n+1 transition
base = MathTex("P(n)")
inductive = MathTex("P(n+1)")
arrow = Arrow(base.get_right(), inductive.get_left())
self.play(Create(arrow), FadeIn(inductive))
```

## Best Practices

1. **Don't skip steps** - Show every logical connection
2. **Use visual metaphors** - Geometric proofs are often clearest
3. **Color-code consistently** - Same element = same color
4. **Pause at key moments** - Give viewer time to understand
5. **Summarize at end** - Briefly replay the key insight

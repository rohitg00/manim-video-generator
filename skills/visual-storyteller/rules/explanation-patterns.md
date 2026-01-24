# Explanation Patterns for Visual Stories

## The "What, Why, How" Pattern

### Structure
1. **What**: Define the concept (5-10 seconds)
2. **Why**: Explain importance/relevance (10-15 seconds)
3. **How**: Demonstrate mechanics (20-40 seconds)

### Example Implementation
```python
def construct(self):
    # WHAT
    title = Text("Recursion")
    definition = Text("A function that calls itself", font_size=24)
    self.play(Write(title))
    self.play(FadeIn(definition))
    self.wait(2)

    # WHY
    self.clear()
    use_cases = BulletedList(
        "Solve complex problems simply",
        "Tree traversal",
        "Mathematical sequences"
    )
    self.play(Write(use_cases))
    self.wait(3)

    # HOW
    self.clear()
    # ... demonstration animation
```

## The "Problem → Solution" Pattern

### Structure
1. Present the problem visually
2. Show failed/naive approaches (optional)
3. Introduce the solution
4. Demonstrate why it works

### Visual Cues
- Problem: Red highlights, question marks
- Struggle: Shaking, confusion animations
- Solution: Green highlights, checkmarks
- Success: Celebration effects

## The "Build-Up" Pattern

### Layer-by-Layer Construction
```python
# Start simple
base = Square()
self.play(Create(base))

# Add complexity
addition1 = Circle().next_to(base, UP)
self.play(Create(addition1))

# Show relationship
connection = Arrow(base, addition1)
self.play(Create(connection))

# Reveal full picture
label = Text("Complete System")
self.play(Write(label))
```

## The "Comparison" Pattern

### Side-by-Side Analysis
- Show two approaches simultaneously
- Highlight differences with color
- Animate parallel processes
- Conclude with clear winner/summary

## The "Zoom" Pattern

### Macro to Micro
```python
# Start with big picture
overview = ImageMobject("full_system.png")
self.play(FadeIn(overview))

# Zoom to detail
self.play(
    overview.animate.scale(3).shift(LEFT * 2 + UP),
    run_time=2
)

# Highlight specific part
highlight = Circle(color=YELLOW).move_to(...)
self.play(Create(highlight))
```

### Micro to Macro
- Start with detail
- Pull back to show context
- Connect to larger system

## Transition Phrases (Visual)

| Verbal | Visual Equivalent |
|--------|-------------------|
| "First..." | Number "1" appears |
| "However..." | Color shift, direction change |
| "Therefore..." | Arrow pointing to conclusion |
| "In summary..." | Elements gather together |
| "For example..." | Box/highlight appears |

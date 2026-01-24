# Kinetic Typography Rules

## Core Principles

### 1. Text as Character
Each word or phrase should have personality through motion:
- **Bold statements** → Strong, impactful entrances
- **Questions** → Floating, uncertain movement
- **Emphasis words** → Scale and color changes
- **Whispers** → Small, subtle animations

### 2. Timing is Meaning
The speed of text animations conveys emotion:
- **Fast** → Urgency, excitement, energy
- **Slow** → Importance, drama, contemplation
- **Staggered** → Building, listing, progression

## Entry Animations

### Pop In (Impact)
```python
text = Text("BOOM", font_size=96, weight=BOLD)
text.scale(0)
self.play(
    text.animate.scale(1),
    rate_func=ease_out_back,
    run_time=0.3
)
```

### Slide In (Smooth)
```python
text.shift(LEFT * 10)  # Start off-screen
self.play(
    text.animate.move_to(ORIGIN),
    rate_func=ease_out_cubic,
    run_time=0.5
)
```

### Fade Up (Gentle)
```python
text.shift(DOWN * 0.5).set_opacity(0)
self.play(
    text.animate.shift(UP * 0.5).set_opacity(1),
    run_time=0.7
)
```

### Type On (Typewriter)
```python
self.play(AddTextLetterByLetter(text), run_time=1)
```

### Scale from Point
```python
text.scale(0).move_to(start_point)
self.play(
    text.animate.scale(1).move_to(ORIGIN),
    rate_func=ease_out_expo,
    run_time=0.4
)
```

## Exit Animations

### Fade Out Up
```python
self.play(
    text.animate.shift(UP * 0.5).set_opacity(0),
    run_time=0.3
)
```

### Scale to Nothing
```python
self.play(
    text.animate.scale(0),
    rate_func=ease_in_cubic,
    run_time=0.3
)
```

### Slide Out
```python
self.play(
    text.animate.shift(RIGHT * 15),
    rate_func=ease_in_cubic,
    run_time=0.4
)
```

### Shatter (Advanced)
```python
# Split into letters and scatter
letters = VGroup(*[Text(c) for c in text.text])
letters.arrange(RIGHT, buff=0.1)
self.play(
    *[l.animate.shift(
        np.random.uniform(-3, 3) * RIGHT +
        np.random.uniform(-2, 2) * UP
    ).set_opacity(0) for l in letters],
    run_time=0.5
)
```

## Word-by-Word Techniques

### Sequential Words
```python
words = ["The", "Future", "Is", "Now"]
positions = [LEFT * 3, LEFT * 1, RIGHT * 1, RIGHT * 3]

for word, pos in zip(words, positions):
    text = Text(word, font_size=72)
    text.move_to(pos)
    self.play(FadeIn(text, scale=0.5), run_time=0.3)
    self.wait(0.2)
```

### Replace Words
```python
words = ["Think", "Create", "Innovate"]
current = Text(words[0], font_size=96)
self.play(FadeIn(current))

for word in words[1:]:
    new = Text(word, font_size=96)
    self.play(
        FadeOut(current, shift=UP),
        FadeIn(new, shift=UP),
        run_time=0.5
    )
    current = new
```

### Stacking Words
```python
words = ["We", "Make", "Magic", "Happen"]
stack = VGroup()

for word in words:
    text = Text(word, font_size=48)
    stack.add(text)
    stack.arrange(DOWN, buff=0.3)
    self.play(FadeIn(text, shift=LEFT), run_time=0.3)
```

## Text Effects

### Glitch Effect
```python
# Create color-shifted copies
red = text.copy().set_color(RED).shift(LEFT * 0.03 + UP * 0.02)
blue = text.copy().set_color(BLUE).shift(RIGHT * 0.03 + DOWN * 0.02)

self.add(red, blue, text)
for _ in range(5):
    self.play(
        red.animate.shift(RIGHT * 0.05),
        blue.animate.shift(LEFT * 0.05),
        run_time=0.05
    )
    self.play(
        red.animate.shift(LEFT * 0.05),
        blue.animate.shift(RIGHT * 0.05),
        run_time=0.05
    )
```

### Wave Effect
```python
letters = VGroup(*text)
for i, letter in enumerate(letters):
    letter.add_updater(
        lambda m, i=i: m.shift(UP * 0.1 * np.sin(self.time * 5 + i))
    )
```

### Color Sweep
```python
# Gradient color change across text
self.play(
    text.animate.set_color_by_gradient(BLUE, PURPLE, RED),
    run_time=1
)
```

## Font and Style Guidelines

### Font Choices by Mood
| Mood | Font Style | Weight |
|------|-----------|--------|
| Professional | Sans-serif | Regular |
| Bold statement | Sans-serif | Bold/Black |
| Elegant | Serif | Light |
| Playful | Rounded | Medium |
| Technical | Monospace | Regular |

### Size Guidelines
```python
# Hierarchy through size
TITLE = 96
SUBTITLE = 48
BODY = 36
CAPTION = 24
```

## Best Practices

1. **One focal point** - Don't animate multiple text elements competing for attention
2. **Consistent style** - Same animation style for same content type
3. **Readable duration** - Text must be on screen long enough to read
4. **Purposeful motion** - Every animation should support the message
5. **Contrast matters** - Ensure text is readable against background

## Common Mistakes

### DON'T: Too many simultaneous animations
```python
# BAD - Chaotic
self.play(
    word1.animate.rotate(PI),
    word2.animate.scale(2),
    word3.animate.shift(UP * 3),
    word4.animate.set_color(RED)
)
```

### DO: Focused, sequential animations
```python
# GOOD - Clear
self.play(FadeIn(word1))
self.play(Indicate(word2))
self.play(word3.animate.set_color(YELLOW))
```

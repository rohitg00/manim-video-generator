# Progressive Revelation Rules

## Core Principle

**Never show everything at once.** Build understanding layer by layer, allowing viewers to absorb each piece before adding more.

## The Information Hierarchy

### Level 1: Essential (Show First)
- The main concept or question
- Core visual elements
- What the viewer absolutely needs

### Level 2: Supporting (Show Second)
- Details that explain Level 1
- Examples or applications
- Labels and annotations

### Level 3: Enriching (Show Last)
- Additional context
- Edge cases or exceptions
- Deeper connections

## Revelation Patterns

### 1. Linear Revelation (Step by Step)
```python
# Each element builds on the last
self.play(Create(step1))
self.wait(1)
self.play(Create(step2))  # Related to step1
self.wait(1)
self.play(Create(step3))  # Builds on step2
```

### 2. Central Expansion (Outward)
```python
# Start with core, expand outward
self.play(Create(center_element))  # Most important
self.wait(0.5)
self.play(
    *[Create(e) for e in surrounding_elements]  # Supporting
)
```

### 3. Layer Stacking (Top to Bottom)
```python
# Build depth through layers
self.play(FadeIn(background_layer))
self.play(FadeIn(middle_layer))
self.play(FadeIn(foreground_layer))
```

### 4. Question-Answer Revelation
```python
# Pose question, then reveal answer
question = Text("Why does water boil?")
self.play(Write(question))
self.wait(2)  # Let viewer think

answer_parts = [
    "Heat provides energy",
    "Molecules move faster",
    "Escape as steam"
]
for part in answer_parts:
    text = Text(part, font_size=24)
    self.play(FadeIn(text))
    self.wait(1)
```

## Timing for Revelation

| Content Type | Reveal Speed | Wait After |
|--------------|--------------|------------|
| Single word | 0.3s | 0.5s |
| Short phrase | 0.5s | 1s |
| Sentence | 1s | 1.5s |
| Diagram part | 0.5s | 1s |
| Full diagram | 2s | 2s |
| Key insight | 1s | 3s |

## Animation Choices for Revelation

### For Text
```python
# Word by word (dramatic)
words = sentence.split()
for word in words:
    t = Text(word)
    self.play(FadeIn(t, shift=UP * 0.3), run_time=0.2)
    self.wait(0.1)

# Typewriter effect
self.play(AddTextLetterByLetter(text), run_time=2)

# Full write (standard)
self.play(Write(text))
```

### For Diagrams
```python
# Part by part
for part in diagram_parts:
    self.play(Create(part))

# Growing from center
self.play(GrowFromCenter(diagram))

# Tracing (for paths/lines)
self.play(Create(path), run_time=2)
```

### For Data
```python
# Bars growing
self.play(LaggedStart(
    *[GrowFromEdge(bar, DOWN) for bar in bars],
    lag_ratio=0.2
))

# Numbers counting up
number = DecimalNumber(0)
self.play(ChangeDecimalToValue(number, 100), run_time=2)
```

## Pacing Guidelines

### The 3-Second Rule
No new element should appear less than 3 seconds after a complex reveal.

### The Breathing Room Rule
After revealing something important:
1. Wait for viewer to see it (0.5s)
2. Wait for viewer to read it (varies by length)
3. Wait for viewer to understand it (1-2s)

```python
self.play(Write(important_formula))
self.wait(3)  # Full breathing room for formula
```

### The Anticipation Rule
Signal that something is coming before revealing it:
```python
# Create anticipation
self.play(Indicate(related_element))
self.wait(0.5)
# Then reveal
self.play(FadeIn(new_element))
```

## Common Mistakes

### DON'T: Information dump
```python
# BAD
self.add(elem1, elem2, elem3, elem4, elem5)  # All at once
```

### DO: Gradual build
```python
# GOOD
for elem in [elem1, elem2, elem3, elem4, elem5]:
    self.play(FadeIn(elem))
    self.wait(0.3)
```

### DON'T: Reveal and immediately move on
```python
# BAD
self.play(Write(important_concept))
self.play(FadeOut(important_concept))  # No time to absorb
```

### DO: Give time to absorb
```python
# GOOD
self.play(Write(important_concept))
self.wait(2)  # Absorb
self.play(Indicate(important_concept))  # Reinforce
self.wait(1)
```

## Advanced: Conditional Revelation

### Hide-Reveal Pattern
```python
# Show blurred/hidden version first
hidden = element.copy().set_opacity(0.2).add(blur_effect)
self.play(FadeIn(hidden))
self.wait(1)
# Then reveal clearly
self.play(Transform(hidden, element))
```

### Progressive Detail Pattern
```python
# Start simple, add detail
simple_version = create_simplified()
self.play(Create(simple_version))
self.wait(1)

# Add first layer of detail
self.play(Transform(simple_version, medium_detail))
self.wait(1)

# Full detail
self.play(Transform(simple_version, full_detail))
```

# Pacing for Understanding

## The Learning Curve Principle

Viewers need time to:
1. **See** the visual (0.5s minimum)
2. **Read** any text (varies)
3. **Process** the meaning (1-3s)
4. **Connect** to prior knowledge (0.5-1s)

## Pacing by Content Type

### New Concepts (Slow)
```python
# Introducing something unfamiliar
new_concept = Text("Recursion: A function calling itself")
self.play(Write(new_concept), run_time=2)
self.wait(3)  # Long pause for processing

# Support with example
example = Code("def f(): return f()")
self.play(FadeIn(example))
self.wait(2)
```

### Familiar Concepts (Medium)
```python
# Building on known knowledge
familiar = Text("Like the factorial function...")
self.play(Write(familiar), run_time=1)
self.wait(1.5)
```

### Reinforcement (Fast)
```python
# Repeating what viewer already saw
reminder = Text("Remember: f calls f")
self.play(FadeIn(reminder), run_time=0.5)
self.wait(1)
```

## Wait Time Guidelines

### Standard Waits
| After... | Wait Time | Why |
|----------|-----------|-----|
| Title | 2s | Orient viewer |
| Question | 2-3s | Let them think |
| Simple statement | 1s | Read and absorb |
| Complex statement | 2-3s | Process meaning |
| Key insight | 3-4s | Deep processing |
| Transition | 0.5s | Scene change |

### Dynamic Wait Calculation
```python
def calculate_wait(text_content):
    """Estimate appropriate wait time"""
    word_count = len(text_content.split())
    base_wait = 1.0

    # Reading time: ~3 words per second
    reading_time = word_count / 3

    # Complexity bonus (simple heuristic)
    complexity_bonus = 0
    if any(word in text_content.lower() for word in ['therefore', 'because', 'however']):
        complexity_bonus = 1

    return base_wait + reading_time + complexity_bonus
```

## Rhythm Patterns

### The "Teach" Rhythm
```
[Present] → [Pause] → [Explain] → [Pause] → [Example] → [Long Pause]
   1s         1s         1s         1s         1s           2s
```

```python
# Implementation
self.play(Write(concept))  # Present
self.wait(1)               # Pause
self.play(Write(explanation))  # Explain
self.wait(1)               # Pause
self.play(FadeIn(example)) # Example
self.wait(2)               # Long pause
```

### The "Build" Rhythm
```
[Element] → [Short] → [Element] → [Short] → [Element] → [Medium] → [Result] → [Long]
   0.5s       0.3s       0.5s       0.3s       0.5s        1s         1s        2s
```

```python
# Implementation
for elem in building_blocks[:-1]:
    self.play(FadeIn(elem), run_time=0.5)
    self.wait(0.3)
self.play(FadeIn(building_blocks[-1]))  # Last element
self.wait(1)
self.play(Create(result))  # Show result
self.wait(2)
```

### The "Compare" Rhythm
```
[A] → [Pause] → [B] → [Pause] → [Difference Highlight] → [Long Pause]
```

## Signals for Pacing

### Speed Up When:
- Reviewing familiar material
- Showing repetitive examples
- Building momentum toward climax
- Viewer has seen similar patterns

### Slow Down When:
- Introducing new terminology
- Showing crucial transformations
- Making logical leaps
- Complex visual relationships

## The "Breath" Technique

Insert "breathing room" at natural break points:

```python
# Section complete - take a breath
self.wait(1.5)

# Before major topic shift
self.play(FadeOut(*self.mobjects))
self.wait(0.5)  # Mental reset

# After climax/key insight
self.play(Indicate(key_element))
self.wait(3)  # Let it sink in
```

## Avoiding Common Pacing Mistakes

### Too Fast
```python
# BAD - No time to process
for concept in [c1, c2, c3, c4, c5]:
    self.play(FadeIn(concept), run_time=0.2)
# Everything blurs together
```

### Too Slow
```python
# BAD - Boring, loses attention
self.play(Write(simple_text), run_time=5)
self.wait(10)
# Viewer's mind wanders
```

### Inconsistent
```python
# BAD - Jarring
self.wait(3)
self.play(something, run_time=0.1)  # Sudden speed change
self.wait(5)
# Creates anxiety
```

### Just Right
```python
# GOOD - Matched to content
important_concept = Text("Key insight here")
self.play(Write(important_concept), run_time=1.5)
self.wait(2.5)  # Proportional to importance

minor_detail = Text("(side note)")
self.play(FadeIn(minor_detail), run_time=0.5)
self.wait(1)  # Less wait for less importance
```

## Testing Your Pacing

1. Watch at normal speed - does it feel rushed?
2. Watch at 1.5x speed - is it still clear?
3. Watch without sound - do pauses feel natural?
4. Show to someone unfamiliar - do they follow?

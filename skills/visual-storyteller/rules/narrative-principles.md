# Visual Storytelling Principles

## Narrative Structure

### Three-Act Structure
1. **Setup** - Introduce the problem or question
2. **Confrontation** - Explore the concept, show challenges
3. **Resolution** - Reveal the answer, demonstrate understanding

### Story Arc Elements
- **Hook**: Grab attention in first 3 seconds
- **Build**: Gradually increase complexity
- **Climax**: The "aha moment"
- **Denouement**: Reinforce the lesson

## Visual Metaphors

### Abstract → Concrete
Transform abstract concepts into tangible visuals:
- Numbers → Objects (5 apples, not "5")
- Growth → Expanding shapes
- Connection → Lines/arrows between elements
- Time → Left-to-right progression

### Color as Emotion
| Color | Emotion/Meaning |
|-------|-----------------|
| Blue | Trust, stability, calm |
| Red | Urgency, importance, warning |
| Green | Growth, success, nature |
| Yellow | Attention, caution, energy |
| Purple | Creativity, mystery, luxury |

## Pacing for Storytelling

### Emotional Beats
```python
# Tension building
self.play(obj.animate.scale(1.2), run_time=2)
self.wait(0.5)  # Pause for effect

# Release/resolution
self.play(
    obj.animate.set_color(GREEN),
    Flash(obj),
    run_time=0.5
)
```

### Rhythm Patterns
- Quick-quick-slow for emphasis
- Consistent rhythm for procedural content
- Irregular rhythm for dramatic effect

## Character/Object Consistency

### Visual Identity
- Keep consistent colors for recurring elements
- Use similar animation styles for related objects
- Establish visual "characters" early

### Transformation Rules
- Show intermediate states during morphs
- Maintain recognizable features when transforming
- Use anticipation before major changes

## Techniques

### Reveal Strategies
```python
# Progressive reveal
for part in parts:
    self.play(FadeIn(part))
    self.wait(0.3)

# Dramatic reveal
self.play(
    FadeOut(cover),
    GrowFromCenter(hidden_element)
)

# Focus reveal (blur surroundings)
self.play(
    element.animate.set_opacity(1),
    *[other.animate.set_opacity(0.2) for other in others]
)
```

### Emphasis Techniques
- Scale up important elements
- Add glow or highlight
- Isolate from other elements
- Use contrasting colors

## Avoid
- Information overload
- Inconsistent visual language
- Abrupt topic changes
- Missing context or setup

# Shared Animation Resources

Common utilities and references used across all animation skills.

## Contents

### core-animations.py
Reusable animation functions for all projects:
- **Entrance animations**: pop_in, slide_in_*, fade_in_*, zoom_in, grow_from_point
- **Exit animations**: pop_out, fade_out_*, slide_out_*, dissolve, shrink_to_point
- **Emphasis animations**: pulse, shake, wiggle, glow, color_flash, highlight_box, spotlight
- **Text animations**: typewriter, word_by_word, text_replace
- **Transition animations**: wipe_left, wipe_right, circle_wipe, zoom_transition, crossfade
- **Special effects**: confetti, particle_burst
- **Counter animations**: count_up, count_down

### easing-reference.md
Complete reference for rate functions (easing curves):
- Built-in rate functions (linear, smooth, rush_into, etc.)
- Ease in/out/in-out families
- Custom rate function patterns
- Timing recommendations by animation type
- Best practices and consistency guidelines

## Usage

### Importing Core Animations

```python
from skills.shared.core_animations import (
    pop_in, slide_in_left, fade_in_up,
    pop_out, dissolve,
    pulse, glow, spotlight,
    typewriter, word_by_word,
    confetti
)

class MyScene(Scene):
    def construct(self):
        circle = Circle()
        pop_in(self, circle)
        
        pulse(self, circle)
        
        pop_out(self, circle)
```

### Using Easing Reference

Refer to `easing-reference.md` when choosing rate functions:

```python
# For entrance animations
self.play(FadeIn(obj), rate_func=rate_functions.ease_out_cubic)

# For emphasis
self.play(obj.animate.scale(1.2), rate_func=rate_functions.there_and_back)

# For exits
self.play(FadeOut(obj), rate_func=rate_functions.ease_in_cubic)
```

## Integration with Other Skills

The shared resources are designed to work with all skills:

- **animation-composer**: Use core animations for scene transitions
- **math-visualizer**: Use emphasis animations for equation highlighting
- **motion-graphics**: Use all animation types for kinetic typography
- **visual-storyteller**: Use transitions and effects for narrative pacing

# Timing and Easing Rules

## The 12 Principles Applied to Motion Graphics

### 1. Timing
The number of frames for an action determines perception:
- Fewer frames = faster, snappier
- More frames = slower, heavier

### 2. Ease In / Ease Out (Slow In / Slow Out)
Objects accelerate and decelerate naturally:
```python
# Natural motion
rate_func=smooth  # Default, good for most

# Dramatic entrance (fast start, slow end)
rate_func=ease_out_cubic

# Dramatic exit (slow start, fast end)
rate_func=ease_in_cubic
```

## Manim Rate Functions Reference

### Standard Easing
| Rate Function | Feel | Best For |
|--------------|------|----------|
| `linear` | Mechanical | Loading bars, clocks |
| `smooth` | Natural | General purpose |
| `rush_into` | Aggressive | Exits, impacts |
| `rush_from` | Dramatic | Entrances |

### Cubic Family
| Rate Function | Curve | Use Case |
|--------------|-------|----------|
| `ease_in_cubic` | Slow→Fast | Exits |
| `ease_out_cubic` | Fast→Slow | Entrances |
| `ease_in_out_cubic` | Slow→Fast→Slow | Smooth transitions |

### Expo Family (More Dramatic)
| Rate Function | Effect | Use Case |
|--------------|--------|----------|
| `ease_in_expo` | Very slow start | Suspense |
| `ease_out_expo` | Snappy stop | Impact |

### Bounce and Back
| Rate Function | Effect | Use Case |
|--------------|--------|----------|
| `ease_out_bounce` | Bouncy landing | Playful |
| `ease_out_back` | Overshoot | Pop-in effects |
| `ease_in_back` | Wind-up | Anticipation |

### Special Functions
| Rate Function | Effect | Use Case |
|--------------|--------|----------|
| `there_and_back` | Go and return | Pulses |
| `double_smooth` | Extra smooth | Gentle loops |
| `lingering` | Slow at end | Emphasis |

## Timing by Animation Type

### Entrances
```python
# Pop in (impactful)
run_time=0.3, rate_func=ease_out_back

# Slide in (smooth)
run_time=0.5, rate_func=ease_out_cubic

# Fade in (gentle)
run_time=0.7, rate_func=smooth
```

### Exits
```python
# Quick exit
run_time=0.3, rate_func=ease_in_cubic

# Dramatic exit
run_time=0.5, rate_func=ease_in_expo

# Gentle exit
run_time=0.7, rate_func=smooth
```

### Emphasis
```python
# Scale pulse
run_time=0.4, rate_func=there_and_back

# Color flash
run_time=0.3, rate_func=ease_out_cubic

# Shake/wiggle
run_time=0.5, rate_func=wiggle
```

### Transforms
```python
# Shape morph
run_time=1.0, rate_func=smooth

# Position change
run_time=0.5, rate_func=ease_in_out_cubic

# Dramatic transformation
run_time=1.5, rate_func=ease_in_out_expo
```

## Duration Guidelines

### By Content Type
| Animation | Duration |
|-----------|----------|
| Logo reveal | 1-2s |
| Title entrance | 0.5-1s |
| Text word | 0.3-0.5s |
| Icon pop | 0.2-0.4s |
| Scene transition | 0.5-1s |
| Background change | 0.3-0.5s |

### By Emotional Tone
| Tone | Speed Multiplier |
|------|-----------------|
| Energetic | 0.7x |
| Normal | 1.0x |
| Calm | 1.3x |
| Dramatic | 1.5x |
| Suspenseful | 2.0x |

## Custom Rate Functions

### Creating Custom Easing
```python
def custom_ease(t):
    """
    t goes from 0 to 1
    Return value should also be 0 to 1
    """
    # Example: slow middle, fast ends
    return t ** 2 if t < 0.5 else 1 - (1 - t) ** 2

self.play(obj.animate.move_to(RIGHT), rate_func=custom_ease)
```

### Bezier Curve Easing
```python
from manim import bezier

# Custom bezier curve
custom = bezier([0, 0, 0.2, 1])  # Control points
self.play(obj.animate.shift(RIGHT), rate_func=custom)
```

## Timing Patterns

### The "Snap" Pattern
Quick movement with overshoot:
```python
self.play(
    obj.animate.move_to(target),
    rate_func=ease_out_back,
    run_time=0.3
)
```

### The "Slide" Pattern
Smooth, professional movement:
```python
self.play(
    obj.animate.move_to(target),
    rate_func=ease_in_out_cubic,
    run_time=0.7
)
```

### The "Bounce" Pattern
Playful, energetic:
```python
self.play(
    obj.animate.move_to(target),
    rate_func=ease_out_bounce,
    run_time=0.8
)
```

### The "Anticipation" Pattern
Wind-up before action:
```python
# Anticipation
self.play(
    obj.animate.shift(LEFT * 0.2),
    rate_func=ease_out_cubic,
    run_time=0.2
)
# Main action
self.play(
    obj.animate.shift(RIGHT * 5),
    rate_func=ease_in_cubic,
    run_time=0.3
)
```

## Common Mistakes

### DON'T: Same timing for everything
```python
# BAD - Monotonous
self.play(obj1.animate.shift(UP), run_time=1)
self.play(obj2.animate.shift(UP), run_time=1)
self.play(obj3.animate.shift(UP), run_time=1)
```

### DO: Vary timing for interest
```python
# GOOD - Dynamic
self.play(obj1.animate.shift(UP), run_time=0.5)
self.play(obj2.animate.shift(UP), run_time=0.3)
self.play(obj3.animate.shift(UP), run_time=0.7)
```

### DON'T: Linear easing for organic motion
```python
# BAD - Robotic
self.play(logo.animate.move_to(ORIGIN), rate_func=linear)
```

### DO: Use appropriate easing
```python
# GOOD - Natural
self.play(logo.animate.move_to(ORIGIN), rate_func=ease_out_cubic)
```

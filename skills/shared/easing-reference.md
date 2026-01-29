# Easing Functions Reference

Complete reference for rate functions (easing curves) in Manim animations.

## What Are Rate Functions?

Rate functions control the timing of an animation. They map a linear time value (0 to 1) to a progress value (0 to 1), creating different motion feels.

```
Input (time):    0 ─────────────────────────> 1
                 │                             │
Rate Function    │    Easing transformation    │
                 │                             │
Output (progress): 0 ────── varies ──────────> 1
```

## Built-in Rate Functions

### Linear
```python
rate_func=rate_functions.linear
```
Constant speed from start to finish.
- Use for: Mechanical movements, precise timing
- Feel: Robotic, even

### Smooth
```python
rate_func=rate_functions.smooth
```
Slow start, fast middle, slow end (S-curve).
- Use for: Natural, organic movements
- Feel: Professional, polished

### Rush Into/From
```python
rate_func=rate_functions.rush_into    # Fast start, slow end
rate_func=rate_functions.rush_from    # Slow start, fast end
```
- Use for: Dramatic entrances/exits
- Feel: Dynamic, energetic

### There and Back
```python
rate_func=rate_functions.there_and_back
```
Goes to 1, then returns to 0 (pulse effect).
- Use for: Emphasis, heartbeat effects
- Feel: Attention-grabbing

### Double Smooth
```python
rate_func=rate_functions.double_smooth
```
Smoother S-curve with more pronounced ease.
- Use for: Elegant, refined animations
- Feel: Premium, deliberate

### Lingering
```python
rate_func=rate_functions.lingering
```
Slow start, stays near end longer.
- Use for: Dramatic reveals
- Feel: Suspenseful, theatrical

## Ease In Family

Starts slow, accelerates toward the end.

```python
rate_func=rate_functions.ease_in_sine
rate_func=rate_functions.ease_in_quad
rate_func=rate_functions.ease_in_cubic
rate_func=rate_functions.ease_in_quart
rate_func=rate_functions.ease_in_quint
rate_func=rate_functions.ease_in_expo
rate_func=rate_functions.ease_in_circ
rate_func=rate_functions.ease_in_back    # Slight overshoot at start
rate_func=rate_functions.ease_in_elastic # Bouncy start
```

### Intensity Comparison
| Function | Intensity | Use Case |
|----------|-----------|----------|
| sine | Subtle | Gentle starts |
| quad | Light | Smooth starts |
| cubic | Medium | Natural acceleration |
| quart | Strong | Dramatic builds |
| quint | Very Strong | High impact |
| expo | Extreme | Maximum drama |

## Ease Out Family

Starts fast, decelerates toward the end.

```python
rate_func=rate_functions.ease_out_sine
rate_func=rate_functions.ease_out_quad
rate_func=rate_functions.ease_out_cubic
rate_func=rate_functions.ease_out_quart
rate_func=rate_functions.ease_out_quint
rate_func=rate_functions.ease_out_expo
rate_func=rate_functions.ease_out_circ
rate_func=rate_functions.ease_out_back    # Overshoot then settle
rate_func=rate_functions.ease_out_elastic # Bouncy landing
rate_func=rate_functions.ease_out_bounce  # Bouncing ball effect
```

### Recommended Uses
| Function | Best For |
|----------|----------|
| ease_out_cubic | Default for most animations |
| ease_out_back | Pop-in effects |
| ease_out_bounce | Playful, fun animations |
| ease_out_elastic | Attention-grabbing reveals |

## Ease In-Out Family

Slow start, fast middle, slow end.

```python
rate_func=rate_functions.ease_in_out_sine
rate_func=rate_functions.ease_in_out_quad
rate_func=rate_functions.ease_in_out_cubic
rate_func=rate_functions.ease_in_out_quart
rate_func=rate_functions.ease_in_out_quint
rate_func=rate_functions.ease_in_out_expo
rate_func=rate_functions.ease_in_out_circ
rate_func=rate_functions.ease_in_out_back
rate_func=rate_functions.ease_in_out_elastic
rate_func=rate_functions.ease_in_out_bounce
```

## Special Rate Functions

### Not Quite There
```python
rate_func=rate_functions.not_quite_there(func=smooth, proportion=0.7)
```
Stops before reaching 1. Useful for partial movements.

### Running Start
```python
rate_func=rate_functions.running_start(pull_factor=-0.3)
```
Pulls back before moving forward. Like winding up.

### Wiggle
```python
rate_func=rate_functions.wiggle
```
Oscillates around the path. Good for shaking effects.

## Timing Recommendations by Animation Type

### Entrance Animations
| Animation | Rate Function | Duration |
|-----------|---------------|----------|
| FadeIn | smooth | 0.5-1.0s |
| GrowFromCenter | ease_out_back | 0.4-0.6s |
| Slide in | ease_out_cubic | 0.4-0.6s |
| Pop in | ease_out_back | 0.3-0.5s |

### Exit Animations
| Animation | Rate Function | Duration |
|-----------|---------------|----------|
| FadeOut | smooth | 0.3-0.5s |
| ShrinkToCenter | ease_in_back | 0.3-0.4s |
| Slide out | ease_in_cubic | 0.3-0.5s |

### Emphasis Animations
| Animation | Rate Function | Duration |
|-----------|---------------|----------|
| Pulse | there_and_back | 0.3-0.5s |
| Wiggle | wiggle | 0.4-0.6s |
| Flash | there_and_back | 0.2-0.3s |

### Movement Animations
| Animation | Rate Function | Duration |
|-----------|---------------|----------|
| Smooth pan | smooth | 1.0-2.0s |
| Quick shift | ease_out_cubic | 0.3-0.5s |
| Dramatic move | ease_in_out_expo | 0.8-1.2s |

### Transform Animations
| Animation | Rate Function | Duration |
|-----------|---------------|----------|
| Morph | smooth | 1.0-2.0s |
| Replace | ease_in_out_cubic | 0.5-0.8s |
| Match transform | smooth | 0.8-1.2s |

## Custom Rate Functions

### Creating Custom Functions

```python
def custom_ease(t):
    """
    Custom rate function.
    t: input time (0 to 1)
    returns: progress value (0 to 1)
    """
    # Example: quadratic ease out
    return 1 - (1 - t) ** 2

# Usage
self.play(
    mobject.animate.shift(RIGHT),
    rate_func=custom_ease
)
```

### Useful Custom Patterns

#### Delayed Start
```python
def delayed_start(t, delay=0.2):
    """Start animation after a delay."""
    if t < delay:
        return 0
    return (t - delay) / (1 - delay)
```

#### Early Finish
```python
def early_finish(t, end=0.8):
    """Finish animation early, then hold."""
    if t > end:
        return 1
    return t / end
```

#### Step Function
```python
def step_ease(t, steps=5):
    """Discrete steps instead of smooth."""
    return np.floor(t * steps) / steps
```

#### Overshoot and Settle
```python
def overshoot(t, amount=0.1):
    """Go past target then settle back."""
    if t < 0.7:
        return t / 0.7 * (1 + amount)
    else:
        return 1 + amount - (t - 0.7) / 0.3 * amount
```

## Rate Function Visualization

### Testing Rate Functions
```python
class RateFunctionDemo(Scene):
    def construct(self):
        # Create a dot to demonstrate the rate function
        dot = Dot(LEFT * 5)
        path = Line(LEFT * 5, RIGHT * 5, color=GREY)
        
        self.add(path, dot)
        
        # Test different rate functions
        for rate_func in [smooth, ease_out_bounce, linear]:
            self.play(
                dot.animate.move_to(RIGHT * 5),
                rate_func=rate_func,
                run_time=2
            )
            self.play(dot.animate.move_to(LEFT * 5), run_time=0.5)
```

### Curve Visualization
```python
class EasingCurves(Scene):
    def construct(self):
        axes = Axes(x_range=[0, 1], y_range=[0, 1])
        
        curves = {
            "linear": lambda t: t,
            "ease_out_cubic": lambda t: 1 - (1-t)**3,
            "ease_in_out": lambda t: t**2 * (3 - 2*t),
        }
        
        colors = [RED, GREEN, BLUE]
        
        for (name, func), color in zip(curves.items(), colors):
            graph = axes.plot(func, color=color)
            label = Text(name, font_size=20, color=color)
            self.add(graph, label)
```

## Best Practices

### Do
- Use `smooth` as your default
- Match rate function to the emotional intent
- Use `ease_out_*` for entrances (quick appearance, settling)
- Use `ease_in_*` for exits (accelerating away)
- Test animations at different speeds

### Don't
- Use `linear` unless intentionally mechanical
- Use overly aggressive easing (quint, expo) for subtle animations
- Mix too many different rate functions in one scene
- Forget to consider the animation's purpose

### Consistency Guidelines
| Scene Type | Recommended Base |
|------------|------------------|
| Educational | smooth, ease_out_cubic |
| Dramatic | ease_in_out_expo, ease_out_back |
| Playful | ease_out_bounce, ease_out_elastic |
| Technical | linear, smooth |
| Elegant | double_smooth, ease_in_out_sine |

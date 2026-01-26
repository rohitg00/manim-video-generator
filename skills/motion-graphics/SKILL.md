---
name: motion-graphics
version: "1.0.0"
description: |
  Kinetic typography, logo animations, and stylized motion design skill.

  **Triggers when:**
  - User wants text animations or kinetic typography
  - Request involves logo reveals or title sequences
  - Content focuses on visual impact over education
  - User mentions "title", "intro", "logo", "text animation", "kinetic"

  **Capabilities:**
  - Kinetic typography with dynamic text effects
  - Logo reveals and brand animations
  - Particle effects and visual flourishes
  - Modern motion design patterns
  - Attention-grabbing title sequences
author: manim-video-generator
license: MIT
---

# Motion Graphics Skill

The Motion Graphics skill creates visually striking animations focused on aesthetic impact, perfect for titles, intros, and attention-grabbing content.

## Design Principles

### The 4 S's of Motion Graphics
- **Style**: Consistent visual language throughout
- **Surprise**: Unexpected movements that delight
- **Smoothness**: Fluid transitions and easing
- **Simplicity**: Clean design, no visual clutter

### Motion Design Fundamentals
- **Anticipation**: Small movement before main action
- **Follow-through**: Elements continue after stopping
- **Overshoot**: Go past, then settle into place
- **Squash & Stretch**: Emphasize weight and impact

## Rules

### [rules/kinetic-typography.md](rules/kinetic-typography.md)
Creating impactful text animations that convey emotion.

### [rules/timing-and-easing.md](rules/timing-and-easing.md)
Professional easing curves and timing patterns.

### [rules/visual-hierarchy.md](rules/visual-hierarchy.md)
Directing attention through size, color, and motion.

### [rules/brand-consistency.md](rules/brand-consistency.md)
Maintaining consistent style across animations.

## Templates

### Kinetic Typography - Word by Word
```python
from manim import *

class KineticTypography(Scene):
    def construct(self):
        self.camera.background_color = "#1a1a2e"

        words = ["The", "Future", "Is", "NOW"]
        colors = [WHITE, BLUE, WHITE, YELLOW]

        for word, color in zip(words, colors):
            text = Text(word, font_size=96, color=color, weight=BOLD)

            # Dramatic entrance
            text.scale(0)
            self.add(text)
            self.play(
                text.animate.scale(1),
                rate_func=rate_functions.ease_out_back,
                run_time=0.4
            )
            self.wait(0.3)

            # Exit with style
            self.play(
                text.animate.shift(UP * 2).set_opacity(0),
                rate_func=rate_functions.ease_in_cubic,
                run_time=0.3
            )
            self.remove(text)

        # Final combination
        final = Text("THE FUTURE IS NOW", font_size=48, color=GOLD)
        self.play(Write(final), run_time=1)
        self.play(Indicate(final, scale_factor=1.1, color=WHITE))
```

### Logo Reveal - Particle Assemble
```python
from manim import *
import random

class LogoReveal(Scene):
    def construct(self):
        self.camera.background_color = "#0a0a0a"

        # Create logo text
        logo = Text("BRAND", font_size=120, color=WHITE, weight=BOLD)

        # Create particles that will form the logo
        particles = VGroup()
        for _ in range(100):
            dot = Dot(
                point=[random.uniform(-7, 7), random.uniform(-4, 4), 0],
                radius=0.05,
                color=random_color()
            )
            particles.add(dot)

        self.add(particles)

        # Swirl particles
        self.play(
            *[Rotating(p, radians=PI * 2, about_point=ORIGIN)
              for p in particles],
            run_time=1.5,
            rate_func=rate_functions.ease_in_out_sine
        )

        # Converge to logo position
        self.play(
            FadeOut(particles),
            FadeIn(logo, scale=0.5),
            run_time=0.8
        )

        # Glow effect
        glow = logo.copy().set_color(BLUE).set_opacity(0.5)
        self.play(
            glow.animate.scale(1.2).set_opacity(0),
            run_time=0.5
        )
        self.remove(glow)

        self.wait()
```

### Title Sequence - Slide & Stack
```python
from manim import *

class TitleSequence(Scene):
    def construct(self):
        self.camera.background_color = "#16213e"

        # Main title
        title = Text("EPISODE ONE", font_size=72, color=WHITE)
        subtitle = Text("The Beginning", font_size=36, color=BLUE_C)

        # Slide in from sides
        title.shift(LEFT * 10)
        subtitle.shift(RIGHT * 10)

        self.add(title, subtitle)

        self.play(
            title.animate.move_to(UP * 0.5),
            subtitle.animate.move_to(DOWN * 0.5),
            run_time=0.8,
            rate_func=rate_functions.ease_out_cubic
        )

        # Add decorative lines
        line_left = Line(LEFT * 3, LEFT * 0.5, color=GOLD, stroke_width=2)
        line_right = Line(RIGHT * 0.5, RIGHT * 3, color=GOLD, stroke_width=2)

        lines = VGroup(line_left, line_right).next_to(title, UP, buff=0.3)

        self.play(
            Create(line_left),
            Create(line_right),
            run_time=0.5
        )

        # Fade all together
        self.wait(2)
        self.play(
            FadeOut(VGroup(title, subtitle, lines), shift=UP),
            run_time=0.6
        )
```

### Text Glitch Effect
```python
from manim import *

class GlitchText(Scene):
    def construct(self):
        self.camera.background_color = "#000000"

        text = Text("GLITCH", font_size=96, color=WHITE, weight=BOLD)

        # Create glitch copies
        red_copy = text.copy().set_color(RED).shift(LEFT * 0.05 + UP * 0.02)
        blue_copy = text.copy().set_color(BLUE).shift(RIGHT * 0.05 + DOWN * 0.02)

        self.add(red_copy, blue_copy, text)

        # Glitch animation
        for _ in range(5):
            # Random offset
            self.play(
                red_copy.animate.shift(RIGHT * 0.1),
                blue_copy.animate.shift(LEFT * 0.1),
                run_time=0.05
            )
            self.play(
                red_copy.animate.shift(LEFT * 0.1),
                blue_copy.animate.shift(RIGHT * 0.1),
                run_time=0.05
            )

        # Settle
        self.play(
            red_copy.animate.move_to(text.get_center()),
            blue_copy.animate.move_to(text.get_center()),
            run_time=0.2
        )

        self.remove(red_copy, blue_copy)
        self.wait()
```

### Counter Animation
```python
from manim import *

class CounterAnimation(Scene):
    def construct(self):
        self.camera.background_color = "#1a1a2e"

        # Value tracker
        counter = ValueTracker(0)

        # Dynamic text
        number = always_redraw(lambda: Text(
            f"{int(counter.get_value()):,}",
            font_size=120,
            color=WHITE,
            weight=BOLD
        ))

        label = Text("SUBSCRIBERS", font_size=32, color=BLUE_C)
        label.next_to(number, DOWN, buff=0.5)

        self.add(number, label)

        # Animate count
        self.play(
            counter.animate.set_value(1000000),
            run_time=3,
            rate_func=rate_functions.ease_out_cubic
        )

        # Celebration effect
        self.play(
            Indicate(number, scale_factor=1.2, color=GOLD),
            run_time=0.5
        )
```

## Easing Functions Reference

| Effect | Rate Function | Use Case |
|--------|--------------|----------|
| Smooth | `smooth` | General purpose |
| Dramatic entrance | `ease_out_back` | Pop-in effects |
| Gentle exit | `ease_in_cubic` | Fade outs |
| Bouncy | `ease_out_bounce` | Playful motion |
| Snappy | `ease_out_expo` | Quick, impactful |
| Natural | `ease_in_out_sine` | Organic movement |
| Linear | `linear` | Constant speed |

## Color Palettes

### Neon Cyberpunk
```python
NEON_PINK = "#ff00ff"
NEON_BLUE = "#00ffff"
NEON_GREEN = "#00ff00"
DARK_BG = "#0a0a0a"
```

### Corporate Professional
```python
CORP_BLUE = "#0066cc"
CORP_GRAY = "#333333"
CORP_WHITE = "#ffffff"
CORP_ACCENT = "#ff6600"
```

### Minimal Modern
```python
MIN_BLACK = "#1a1a1a"
MIN_WHITE = "#f5f5f5"
MIN_GRAY = "#888888"
MIN_ACCENT = "#3366ff"
```

## Best Practices

1. **Less is more** - Restraint makes key moments impactful
2. **Timing is everything** - Wrong timing kills good animation
3. **Consistency builds trust** - Same style throughout
4. **Sound design matters** - Design with audio in mind
5. **Test on target platform** - Different devices, different experience

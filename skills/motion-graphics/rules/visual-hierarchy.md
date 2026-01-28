# Visual Hierarchy Rules

## The Hierarchy Stack

From most to least attention-grabbing:
1. **Movement** - Moving elements catch the eye first
2. **Size** - Larger elements dominate
3. **Color** - Bright/contrasting colors stand out
4. **Position** - Center > edges
5. **Complexity** - Detailed elements attract attention

## Size Hierarchy

### Scale Ratios
```python
# Primary element (hero)
primary_scale = 1.5

# Secondary elements
secondary_scale = 1.0

# Tertiary/supporting
tertiary_scale = 0.7

# Background/ambient
background_scale = 0.5
```

### Application
```python
# Hero title
title = Text("MAIN MESSAGE", font_size=96)

# Supporting info
subtitle = Text("Supporting details", font_size=48)

# Fine print
caption = Text("Additional context", font_size=24)
```

## Color Hierarchy

### Attention Levels
```python
# Maximum attention (use sparingly)
ATTENTION_HIGH = "#FF0000"  # Pure red
ATTENTION_HIGH = "#FFD700"  # Gold

# Medium attention
ATTENTION_MED = "#3498DB"   # Blue
ATTENTION_MED = "#2ECC71"   # Green

# Low attention
ATTENTION_LOW = "#888888"   # Gray
ATTENTION_LOW = "#CCCCCC"   # Light gray

# Background
BACKGROUND = "#1A1A1A"      # Near black
```

### Color Contrast Rules
```python
# High contrast = high visibility
bright_on_dark = Text("Important", color=WHITE)  # on dark bg
bright_on_dark.set_stroke(BLACK, width=2)  # outline for extra pop

# Low contrast = supporting role
muted = Text("Background info", color=GRAY)
```

## Position Hierarchy

### Screen Zones by Importance
```
┌─────────────────────────────────┐
│         HIGH ATTENTION          │
│          (TOP CENTER)           │
├─────────────────────────────────┤
│ MED    │  HIGHEST   │    MED   │
│ (LEFT) │  (CENTER)  │  (RIGHT) │
├─────────────────────────────────┤
│         LOW ATTENTION           │
│        (BOTTOM CENTER)          │
└─────────────────────────────────┘
```

### Positioning Code
```python
# Highest priority
main_element.move_to(ORIGIN)

# High priority
title.to_edge(UP, buff=1)

# Medium priority
side_element.to_edge(LEFT, buff=1)

# Low priority
caption.to_edge(DOWN, buff=0.5)
```

## Movement Hierarchy

### Speed = Importance
```python
# Important = deliberate motion
self.play(
    important.animate.move_to(ORIGIN),
    run_time=1.0  # Slower = more weight
)

# Less important = quick motion
self.play(
    background_elem.animate.shift(UP),
    run_time=0.3  # Faster = less attention
)
```

### Isolation Through Stillness
```python
# Make everything still except focus
for elem in background_elements:
    elem.clear_updaters()  # Stop any motion

# Only focus element moves
self.play(focus.animate.pulse())
```

## Layering Hierarchy

### Z-Index Control
```python
# Foreground (most important)
hero.set_z_index(10)

# Middle layer
content.set_z_index(5)

# Background
ambient.set_z_index(0)

# Far background
texture.set_z_index(-5)
```

### Depth Through Opacity
```python
# Foreground: full opacity
hero.set_opacity(1)

# Middle: slightly faded
content.set_opacity(0.9)

# Background: significantly faded
ambient.set_opacity(0.4)
```

## Typography Hierarchy

### Font Weight Ladder
```python
# Level 1: Hero text
Text("HERO", weight=ULTRABOLD, font_size=96)

# Level 2: Section header
Text("Section", weight=BOLD, font_size=64)

# Level 3: Subheader
Text("Subheader", weight=SEMIBOLD, font_size=48)

# Level 4: Body
Text("Body text", weight=NORMAL, font_size=32)

# Level 5: Caption
Text("Caption", weight=LIGHT, font_size=24)
```

## Creating Visual Flow

### Leading the Eye
```python
# Use lines/arrows to guide attention
flow_line = CurvedArrow(
    start_point=elem1.get_right(),
    end_point=elem2.get_left()
)

# Numbered sequence
for i, elem in enumerate(elements):
    number = Text(str(i + 1)).scale(0.5).next_to(elem, LEFT)
```

### Reading Order (Western)
```
1 → 2 → 3
↓       ↓
4 → 5 → 6
↓       ↓
7 → 8 → 9
```

## Dynamic Hierarchy

### Shifting Focus
```python
# Initial state: elem1 is focus
elem1.set_opacity(1).scale(1.2)
elem2.set_opacity(0.5).scale(1)

# Shift focus to elem2
self.play(
    elem1.animate.set_opacity(0.5).scale(1/1.2),
    elem2.animate.set_opacity(1).scale(1.2)
)
```

### Temporal Hierarchy
```python
# First = most important (primacy effect)
self.play(FadeIn(most_important))
self.wait(2)

# Middle = supporting
for elem in supporting:
    self.play(FadeIn(elem), run_time=0.3)

# Last = second most important (recency effect)
self.play(FadeIn(conclusion))
self.wait(2)
```

## Common Mistakes

### DON'T: Everything same size
```python
# BAD - No hierarchy
elements = [Text(w, font_size=48) for w in words]
```

### DO: Clear size difference
```python
# GOOD - Obvious hierarchy
title = Text("TITLE", font_size=72)
subtitle = Text("Subtitle", font_size=36)
```

### DON'T: Competing focal points
```python
# BAD - Where should I look?
self.play(
    elem1.animate.set_color(RED).scale(1.5),
    elem2.animate.set_color(YELLOW).scale(1.5),
    elem3.animate.set_color(GREEN).scale(1.5)
)
```

### DO: Single clear focal point
```python
# GOOD - Clear focus
self.play(
    focus.animate.set_color(YELLOW).scale(1.5),
    others.animate.set_opacity(0.3)
)
```

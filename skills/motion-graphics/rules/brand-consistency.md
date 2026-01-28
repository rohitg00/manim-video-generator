# Brand Consistency Rules

## Establishing a Visual Identity

### Core Brand Elements
1. **Color Palette** - Primary, secondary, accent colors
2. **Typography** - Font families and weights
3. **Motion Style** - Animation timing and easing
4. **Visual Elements** - Shapes, icons, patterns

## Color Palette Management

### Define Once, Use Everywhere
```python
# Brand colors (define at top of file)
class BrandColors:
    PRIMARY = "#3498DB"      # Main brand color
    SECONDARY = "#2ECC71"    # Supporting color
    ACCENT = "#F39C12"       # Highlight/CTA
    BACKGROUND = "#1A1A2E"   # Dark background
    TEXT_LIGHT = "#FFFFFF"   # Light text
    TEXT_DARK = "#333333"    # Dark text
    ERROR = "#E74C3C"        # Error/warning
    SUCCESS = "#27AE60"      # Success/positive

# Usage
title = Text("Brand Title", color=BrandColors.PRIMARY)
background = Rectangle(color=BrandColors.BACKGROUND, fill_opacity=1)
```

### Color Usage Rules
```python
# Primary: Main messages, key elements
# Max: 60% of visual space
main_title.set_color(BrandColors.PRIMARY)

# Secondary: Supporting elements, backgrounds
# Max: 30% of visual space
supporting_box.set_fill(BrandColors.SECONDARY, opacity=0.3)

# Accent: CTAs, highlights, emphasis
# Max: 10% of visual space
highlight.set_color(BrandColors.ACCENT)
```

## Typography Standards

### Font Stack Definition
```python
class BrandFonts:
    HEADING = "Montserrat"
    BODY = "Open Sans"
    MONO = "Fira Code"

class BrandSizes:
    HERO = 96
    TITLE = 72
    HEADING = 48
    SUBHEAD = 36
    BODY = 28
    CAPTION = 20

# Usage
title = Text(
    "Main Title",
    font=BrandFonts.HEADING,
    font_size=BrandSizes.TITLE,
    weight=BOLD
)
```

### Font Weight Guidelines
```python
# Heroes and titles: Bold/Black
# Subheadings: SemiBold
# Body text: Regular
# Captions: Light

hero = Text("HERO", weight=ULTRABOLD)
heading = Text("Heading", weight=BOLD)
subhead = Text("Subheading", weight=SEMIBOLD)
body = Text("Body text", weight=NORMAL)
caption = Text("Caption", weight=LIGHT)
```

## Motion Standards

### Animation Presets
```python
class BrandMotion:
    # Timing
    FAST = 0.3
    NORMAL = 0.5
    SLOW = 0.8
    DRAMATIC = 1.2

    # Easing
    ENTRANCE = rate_functions.ease_out_cubic
    EXIT = rate_functions.ease_in_cubic
    EMPHASIS = rate_functions.ease_out_back
    SMOOTH = rate_functions.smooth

# Usage
self.play(
    logo.animate.move_to(ORIGIN),
    run_time=BrandMotion.NORMAL,
    rate_func=BrandMotion.ENTRANCE
)
```

### Transition Standards
```python
def brand_fade_in(self, mobject):
    """Standard brand entrance"""
    mobject.set_opacity(0).shift(UP * 0.3)
    self.play(
        mobject.animate.set_opacity(1).shift(DOWN * 0.3),
        run_time=BrandMotion.NORMAL,
        rate_func=BrandMotion.ENTRANCE
    )

def brand_fade_out(self, mobject):
    """Standard brand exit"""
    self.play(
        mobject.animate.set_opacity(0).shift(UP * 0.3),
        run_time=BrandMotion.FAST,
        rate_func=BrandMotion.EXIT
    )
```

## Visual Element Standards

### Shape Language
```python
class BrandShapes:
    CORNER_RADIUS = 0.2  # Rounded corners
    STROKE_WIDTH = 3     # Line thickness
    DOT_SIZE = 0.1       # Standard dot radius

    @staticmethod
    def rounded_rect(width, height, **kwargs):
        return RoundedRectangle(
            width=width,
            height=height,
            corner_radius=BrandShapes.CORNER_RADIUS,
            stroke_width=BrandShapes.STROKE_WIDTH,
            **kwargs
        )
```

### Icon Style
```python
# Consistent icon treatment
def brand_icon(svg_path, size=1):
    icon = SVGMobject(svg_path)
    icon.set_color(BrandColors.PRIMARY)
    icon.scale_to_fit_height(size)
    return icon
```

## Spacing Standards

### Margins and Padding
```python
class BrandSpacing:
    MARGIN_LARGE = 1.0   # Edge margins
    MARGIN_MEDIUM = 0.5  # Section margins
    MARGIN_SMALL = 0.25  # Element margins
    PADDING = 0.3        # Internal padding

# Usage
title.to_edge(UP, buff=BrandSpacing.MARGIN_LARGE)
elements.arrange(DOWN, buff=BrandSpacing.MARGIN_MEDIUM)
```

### Grid System
```python
# 12-column grid
COLUMN_WIDTH = 14 / 12  # Screen width / 12
def grid_position(column, span=1):
    """Position element on grid"""
    center = (column + span/2 - 6.5) * COLUMN_WIDTH
    return center * RIGHT
```

## Creating a Brand Template

### Scene Base Class
```python
class BrandedScene(Scene):
    def setup(self):
        # Set background
        self.camera.background_color = BrandColors.BACKGROUND

    def add_brand_header(self, title_text):
        title = Text(
            title_text,
            font=BrandFonts.HEADING,
            font_size=BrandSizes.TITLE,
            color=BrandColors.TEXT_LIGHT
        )
        title.to_edge(UP, buff=BrandSpacing.MARGIN_LARGE)
        self.play(Write(title))
        return title

    def add_brand_footer(self):
        logo = SVGMobject("logo.svg")
        logo.scale(0.3)
        logo.to_corner(DR, buff=BrandSpacing.MARGIN_SMALL)
        self.add(logo)
```

## Quality Checklist

Before finalizing any animation:

- [ ] Colors match brand palette exactly
- [ ] Fonts are correct family and weight
- [ ] Animation timing follows brand standards
- [ ] Spacing is consistent
- [ ] Logo is present and correctly sized
- [ ] No off-brand colors or fonts
- [ ] Motion style matches established patterns

## Common Mistakes

### DON'T: Mix brand colors with arbitrary colors
```python
# BAD
text.set_color("#FF69B4")  # Random pink not in palette
```

### DO: Use defined palette
```python
# GOOD
text.set_color(BrandColors.ACCENT)
```

### DON'T: Inconsistent animation styles
```python
# BAD - Different easing everywhere
self.play(obj1.animate.shift(UP), rate_func=ease_out_bounce)
self.play(obj2.animate.shift(UP), rate_func=linear)
self.play(obj3.animate.shift(UP), rate_func=rush_into)
```

### DO: Use brand motion standards
```python
# GOOD - Consistent brand motion
for obj in [obj1, obj2, obj3]:
    self.play(
        obj.animate.shift(UP),
        rate_func=BrandMotion.ENTRANCE,
        run_time=BrandMotion.NORMAL
    )
```

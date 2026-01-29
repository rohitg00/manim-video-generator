# Layout Validation System

Ensures visual elements are properly positioned without overlaps or boundary violations.

## Screen Dimensions

### Default Frame Size
The standard Manim frame has the following dimensions:

```
Width:  14.22 units (-7.11 to +7.11)
Height: 8.0 units  (-4.0 to +4.0)
```

### Safe Zones

```
┌─────────────────────────────────────────────────────┐
│  DANGER ZONE (edges may be cut off)                 │
│  ┌─────────────────────────────────────────────┐    │
│  │  SAFE ZONE (guaranteed visible)             │    │
│  │                                             │    │
│  │     Title Area (y > 2.5)                   │    │
│  │  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─    │    │
│  │                                             │    │
│  │     Main Content Area (-2.5 < y < 2.5)     │    │
│  │                                             │    │
│  │  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─    │    │
│  │     Caption Area (y < -2.5)                │    │
│  │                                             │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
└─────────────────────────────────────────────────────┘

Safe Zone Bounds:
  x: -6.0 to +6.0
  y: -3.5 to +3.5
```

## Position Specification Format

### scene_with_position.md Template

```markdown
# [Scene Name] - Position Specification

## Screen Layout

### Frame Bounds
- Width: 14.22 units
- Height: 8.0 units

### Zone Allocation
- Title Zone: y ∈ [2.5, 3.5]
- Main Zone: y ∈ [-2.0, 2.0]
- Caption Zone: y ∈ [-3.5, -2.5]

---

## Object Positions

### Object: title
- Type: Text
- Position: (0, 3.0)
- Size: width ≈ 8.0, height ≈ 0.6
- Bounds: x ∈ [-4.0, 4.0], y ∈ [2.7, 3.3]

### Object: main_equation
- Type: MathTex
- Position: (0, 1.0)
- Size: width ≈ 5.0, height ≈ 1.0
- Bounds: x ∈ [-2.5, 2.5], y ∈ [0.5, 1.5]

### Object: diagram
- Type: VGroup
- Position: (0, -1.5)
- Size: width ≈ 4.0, height ≈ 3.0
- Bounds: x ∈ [-2.0, 2.0], y ∈ [-3.0, 0]

---

## Overlap Check

| Object A | Object B | Overlap? | Resolution |
|----------|----------|----------|------------|
| title | main_equation | No | - |
| main_equation | diagram | No | - |
| title | diagram | No | - |

---

## Boundary Check

| Object | Within Safe Zone? | Issues |
|--------|-------------------|--------|
| title | Yes | - |
| main_equation | Yes | - |
| diagram | Yes | - |

```

## Overlap Detection

### Algorithm

```python
def check_overlap(obj_a_bounds, obj_b_bounds):
    """
    Check if two rectangular bounds overlap.
    
    Bounds format: (x_min, x_max, y_min, y_max)
    """
    a_x_min, a_x_max, a_y_min, a_y_max = obj_a_bounds
    b_x_min, b_x_max, b_y_min, b_y_max = obj_b_bounds
    
    # No overlap if:
    # - A is entirely to the left of B
    # - A is entirely to the right of B
    # - A is entirely above B
    # - A is entirely below B
    
    if (a_x_max < b_x_min or  # A left of B
        a_x_min > b_x_max or  # A right of B
        a_y_max < b_y_min or  # A below B
        a_y_min > b_y_max):   # A above B
        return False
    
    return True
```

### Manim Implementation

```python
def get_bounds(mobject):
    """Get bounding box of a mobject."""
    return (
        mobject.get_left()[0],   # x_min
        mobject.get_right()[0],  # x_max
        mobject.get_bottom()[1], # y_min
        mobject.get_top()[1]     # y_max
    )

def validate_no_overlap(obj_a, obj_b, buffer=0.2):
    """Check that two objects don't overlap (with buffer)."""
    a_bounds = get_bounds(obj_a)
    b_bounds = get_bounds(obj_b)
    
    # Add buffer
    a_bounds = (
        a_bounds[0] - buffer,
        a_bounds[1] + buffer,
        a_bounds[2] - buffer,
        a_bounds[3] + buffer
    )
    
    return not check_overlap(a_bounds, b_bounds)
```

## Boundary Validation

### Safe Zone Checker

```python
SAFE_ZONE = {
    "x_min": -6.0,
    "x_max": 6.0,
    "y_min": -3.5,
    "y_max": 3.5
}

def is_within_safe_zone(mobject):
    """Check if mobject is entirely within safe zone."""
    left = mobject.get_left()[0]
    right = mobject.get_right()[0]
    bottom = mobject.get_bottom()[1]
    top = mobject.get_top()[1]
    
    return (
        left >= SAFE_ZONE["x_min"] and
        right <= SAFE_ZONE["x_max"] and
        bottom >= SAFE_ZONE["y_min"] and
        top <= SAFE_ZONE["y_max"]
    )
```

### Boundary Violation Report

```python
def report_boundary_issues(mobject, name="object"):
    """Report any boundary violations."""
    issues = []
    
    left = mobject.get_left()[0]
    right = mobject.get_right()[0]
    bottom = mobject.get_bottom()[1]
    top = mobject.get_top()[1]
    
    if left < SAFE_ZONE["x_min"]:
        issues.append(f"{name} extends {SAFE_ZONE['x_min'] - left:.2f} past left edge")
    if right > SAFE_ZONE["x_max"]:
        issues.append(f"{name} extends {right - SAFE_ZONE['x_max']:.2f} past right edge")
    if bottom < SAFE_ZONE["y_min"]:
        issues.append(f"{name} extends {SAFE_ZONE['y_min'] - bottom:.2f} past bottom edge")
    if top > SAFE_ZONE["y_max"]:
        issues.append(f"{name} extends {top - SAFE_ZONE['y_max']:.2f} past top edge")
    
    return issues
```

## Common Layout Patterns

### Centered Single Element
```python
element.move_to(ORIGIN)
# Position: (0, 0)
```

### Title + Content
```python
title.to_edge(UP, buff=0.5)      # Position: (0, ~3.5)
content.move_to(ORIGIN)          # Position: (0, 0)
```

### Side by Side
```python
left_item.shift(LEFT * 3)        # Position: (-3, 0)
right_item.shift(RIGHT * 3)      # Position: (3, 0)
```

### Grid Layout
```python
items = VGroup(*items)
items.arrange_in_grid(rows=2, cols=3, buff=0.5)
items.move_to(ORIGIN)
```

### Vertical Stack
```python
items = VGroup(*items)
items.arrange(DOWN, buff=0.5)
items.move_to(ORIGIN)
```

## Position Constants

### Standard Positions
```python
# Edges
UP    = (0, 1, 0)      # Top center
DOWN  = (0, -1, 0)     # Bottom center
LEFT  = (-1, 0, 0)     # Left center
RIGHT = (1, 0, 0)      # Right center

# Corners
UL = UP + LEFT         # Upper left
UR = UP + RIGHT        # Upper right
DL = DOWN + LEFT       # Lower left
DR = DOWN + RIGHT      # Lower right

# Center
ORIGIN = (0, 0, 0)
```

### Recommended Buffers
```python
# Distance from edge
EDGE_BUFF = 0.5        # Standard edge buffer
SMALL_BUFF = 0.2       # Tight spacing
MED_BUFF = 0.5         # Medium spacing
LARGE_BUFF = 1.0       # Wide spacing
```

## Validation Workflow

### Before Coding
1. List all objects with estimated sizes
2. Assign positions to each object
3. Check for overlaps in specification
4. Verify boundary compliance
5. Document in scene_with_position.md

### During Coding
```python
class ValidatedScene(Scene):
    def construct(self):
        # Create objects
        title = Text("Title")
        content = MathTex("E = mc^2")
        
        # Position objects
        title.to_edge(UP)
        content.move_to(ORIGIN)
        
        # Validate before adding
        self._validate_layout([
            ("title", title),
            ("content", content)
        ])
        
        # Proceed with animation
        self.play(Write(title), Write(content))
    
    def _validate_layout(self, named_objects):
        """Validate all objects before rendering."""
        # Check boundaries
        for name, obj in named_objects:
            issues = report_boundary_issues(obj, name)
            if issues:
                print(f"WARNING: {issues}")
        
        # Check overlaps
        for i, (name_a, obj_a) in enumerate(named_objects):
            for name_b, obj_b in named_objects[i+1:]:
                if not validate_no_overlap(obj_a, obj_b):
                    print(f"WARNING: {name_a} overlaps with {name_b}")
```

## Anti-Patterns

### Avoid
- Positioning without checking bounds
- Overlapping text and diagrams
- Elements cut off at edges
- Crowded layouts with no breathing room

### Prefer
- Explicit position specifications
- Adequate spacing between elements
- Safe zone compliance
- Visual hierarchy through positioning

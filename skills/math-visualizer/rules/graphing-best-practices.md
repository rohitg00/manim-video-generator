# Graphing Best Practices

## Axis Configuration

### Standard Setup
```python
axes = Axes(
    x_range=[-5, 5, 1],      # [min, max, step]
    y_range=[-3, 3, 1],
    x_length=10,              # Screen units
    y_length=6,
    axis_config={
        "include_numbers": True,
        "include_tip": True,
        "numbers_to_exclude": [0],  # Avoid clutter at origin
    }
)
```

### Always Include Labels
```python
labels = axes.get_axis_labels(x_label="x", y_label="y")
# Or custom labels
x_label = MathTex("t").next_to(axes.x_axis, RIGHT)
y_label = MathTex("f(t)").next_to(axes.y_axis, UP)
```

## Function Plotting

### Smooth Curves
```python
# Default resolution is good for most functions
graph = axes.plot(lambda x: x**2, color=BLUE)

# Increase resolution for wiggly functions
graph = axes.plot(
    lambda x: np.sin(10*x),
    color=BLUE,
    use_smoothing=True
)
```

### Discontinuities
```python
# Handle discontinuities with multiple plots
left_part = axes.plot(lambda x: 1/x, x_range=[-5, -0.1], color=BLUE)
right_part = axes.plot(lambda x: 1/x, x_range=[0.1, 5], color=BLUE)
```

### Domain Restrictions
```python
# Explicitly set domain
graph = axes.plot(
    lambda x: np.sqrt(x),
    x_range=[0, 5],  # Only plot where defined
    color=GREEN
)
```

## Labeling Functions

### Graph Labels
```python
label = axes.get_graph_label(
    graph,
    label="f(x) = x^2",
    x_val=3,           # Position along x-axis
    direction=UR,      # Label direction from point
    buff=0.2
)
```

### Point Labels
```python
point = axes.coords_to_point(2, 4)
dot = Dot(point, color=YELLOW)
label = MathTex("(2, 4)").next_to(dot, UR, buff=0.1)
```

## Animation Sequences

### Recommended Order
1. Create axes
2. Add axis labels
3. Plot function
4. Add function label
5. Animate special features (tangents, areas, etc.)

```python
def construct(self):
    # 1. Axes
    self.play(Create(axes))

    # 2. Labels
    self.play(Write(labels))

    # 3. Function (trace animation)
    self.play(Create(graph), run_time=2)

    # 4. Label
    self.play(Write(func_label))

    # 5. Special features
    self.animate_tangent_line()
```

## Special Features

### Tangent Lines
```python
tangent = axes.get_secant_slope_group(
    x=2,
    graph=graph,
    dx=0.01,
    secant_line_color=YELLOW,
    secant_line_length=4
)
```

### Areas Under Curves
```python
area = axes.get_area(
    graph,
    x_range=[0, 2],
    color=BLUE,
    opacity=0.5
)
```

### Vertical/Horizontal Lines
```python
# Vertical line at x=2
v_line = axes.get_vertical_line(
    axes.input_to_graph_point(2, graph),
    color=YELLOW
)

# Horizontal line at y=3
h_line = DashedLine(
    axes.c2p(-5, 3),
    axes.c2p(5, 3),
    color=RED
)
```

## Common Mistakes to Avoid

1. **Unlabeled axes** - Always include labels
2. **Poor domain choice** - Show relevant portion of function
3. **Cluttered numbers** - Use `numbers_to_exclude` to remove 0
4. **Wrong aspect ratio** - Match x_length/y_length to range ratio
5. **Too fast plotting** - Use `run_time=2` or more for complex graphs

# CLEAR Explanation Framework

A structured approach to creating educational animations that ensure understanding and retention.

## The CLEAR Method

**C**ontext → **L**ayers → **E**xamples → **A**nalogies → **R**einforce

Each component builds upon the previous, creating a complete learning experience.

```
┌─────────────────────────────────────────────────────────┐
│                     CLEAR Framework                      │
├──────────┬──────────┬──────────┬──────────┬─────────────┤
│ Context  │  Layers  │ Examples │ Analogies │  Reinforce │
│   10%    │   40%    │   25%    │    15%    │    10%     │
├──────────┼──────────┼──────────┼──────────┼─────────────┤
│  Setup   │  Build   │  Apply   │  Connect  │  Solidify  │
│  ground  │  step by │  to real │  to known │  the       │
│          │  step    │  cases   │  concepts │  learning  │
└──────────┴──────────┴──────────┴──────────┴─────────────┘
```

---

## C - Context (10% of content)

### Purpose
Establish why this matters and what the viewer already knows.

### Elements

| Element | Description | Duration |
|---------|-------------|----------|
| Hook | Grab attention with a question/problem | 5-10s |
| Relevance | Why should they care? | 10-15s |
| Prerequisites | What they need to know | 5-10s |
| Overview | What we'll cover | 5-10s |

### Implementation Pattern

```python
class ContextScene(Scene):
    def construct(self):
        # Hook - Start with a compelling question
        hook = Text("Why do things fall?", font_size=48)
        self.play(Write(hook))
        self.wait(2)
        
        # Relevance - Connect to their world
        relevance = Text(
            "Understanding gravity explains everything\n"
            "from raindrops to rocket launches",
            font_size=32
        )
        self.play(
            FadeOut(hook),
            FadeIn(relevance)
        )
        self.wait(3)
        
        # Overview - Set expectations
        overview = BulletedList(
            "What gravity is",
            "How Newton discovered it",
            "The universal law",
            font_size=28
        )
        self.play(
            FadeOut(relevance),
            Write(overview)
        )
        self.wait(2)
```

### Context Anti-Patterns

| Avoid | Why | Instead |
|-------|-----|---------|
| Jumping straight in | No mental preparation | Start with hook |
| Long introductions | Lose attention | Keep under 30s |
| Assumed knowledge | Confusion later | State prerequisites |
| Vague promises | Low engagement | Be specific |

---

## L - Layers (40% of content)

### Purpose
Build understanding progressively, from simple to complex.

### Layering Strategies

#### 1. Additive Layering
```
Simple concept
    + First detail
        + Second detail
            + Full complexity
```

#### 2. Zoom-In Layering
```
Big picture overview
    → Focus on component A
        → Detail of component A
    → Return to big picture
        → Focus on component B
```

#### 3. Scaffold Layering
```
Foundation concept
    ↑ builds on
Supporting concept
    ↑ builds on
Target concept
```

### Implementation Pattern

```python
class LayeredExplanation(Scene):
    def construct(self):
        # Layer 1: Simplest form
        simple = MathTex("F = ma")
        self.play(Write(simple))
        self.wait(2)
        
        # Layer 2: Add meaning
        labels = VGroup(
            Text("Force", font_size=24).next_to(simple[0][0], DOWN),
            Text("Mass", font_size=24).next_to(simple[0][2], DOWN),
            Text("Acceleration", font_size=24).next_to(simple[0][4], DOWN),
        )
        self.play(FadeIn(labels))
        self.wait(2)
        
        # Layer 3: Add context
        context = Text(
            "The more massive an object,\n"
            "the more force needed to accelerate it",
            font_size=28
        ).to_edge(DOWN)
        self.play(FadeIn(context))
        self.wait(3)
        
        # Layer 4: Show implications
        self.play(FadeOut(labels), FadeOut(context))
        rearranged = MathTex("a = \\frac{F}{m}")
        self.play(TransformMatchingTex(simple, rearranged))
        self.wait(2)
```

### Pacing Guidelines

| Layer | Purpose | Pacing |
|-------|---------|--------|
| First | Foundation | Slow, deliberate |
| Middle | Building | Moderate |
| Last | Full picture | Can be faster |

---

## E - Examples (25% of content)

### Purpose
Make abstract concepts concrete through specific instances.

### Example Types

| Type | Use When | Effect |
|------|----------|--------|
| Worked Example | Teaching procedure | Shows steps |
| Counter-Example | Clarifying boundaries | Shows what it's NOT |
| Edge Case | Deepening understanding | Tests limits |
| Real-World | Building relevance | Connects to life |

### Implementation Pattern

```python
class ExampleScene(Scene):
    def construct(self):
        # Set up the example context
        title = Text("Example: Dropping a ball", font_size=36)
        title.to_edge(UP)
        self.play(Write(title))
        
        # Visual setup
        ball = Circle(radius=0.3, fill_opacity=1, color=RED)
        ball.move_to(UP * 2)
        ground = Line(LEFT * 5, RIGHT * 5, color=WHITE)
        ground.move_to(DOWN * 2)
        
        self.play(Create(ball), Create(ground))
        
        # Show the physics
        formula = MathTex("h = \\frac{1}{2}gt^2")
        formula.to_edge(RIGHT)
        self.play(Write(formula))
        
        # Animate the example
        self.play(
            ball.animate.move_to(DOWN * 2 + UP * 0.3),
            run_time=2,
            rate_func=rate_functions.ease_in_quad
        )
        
        # Highlight the connection
        result = Text("t ≈ 0.64 seconds", font_size=28)
        result.next_to(formula, DOWN)
        self.play(Write(result))
```

### Example Selection Criteria

Good examples are:
- **Familiar**: Use everyday objects/situations
- **Simple**: Minimal distracting details
- **Representative**: Capture the core concept
- **Memorable**: Easy to recall later

---

## A - Analogies (15% of content)

### Purpose
Connect new concepts to existing mental models.

### Analogy Types

| Type | Structure | Example |
|------|-----------|---------|
| Direct | "X is like Y" | "An atom is like a solar system" |
| Functional | "X works like Y" | "RAM works like a desk, storage like a filing cabinet" |
| Structural | "X is structured like Y" | "DNA is structured like a twisted ladder" |
| Process | "X happens like Y" | "Electricity flows like water" |

### Implementation Pattern

```python
class AnalogyScene(Scene):
    def construct(self):
        # Show the unfamiliar concept
        concept = Text("Electric Current", font_size=36)
        concept.to_edge(UP)
        self.play(Write(concept))
        
        # Show the familiar analogy
        analogy = Text("is like", font_size=28)
        familiar = Text("Water Flow", font_size=36)
        
        VGroup(concept, analogy, familiar).arrange(DOWN)
        self.play(Write(analogy), Write(familiar))
        self.wait(1)
        
        # Visual comparison
        self.play(FadeOut(VGroup(concept, analogy, familiar)))
        
        # Left: Water
        pipe = Rectangle(width=4, height=1, color=BLUE)
        pipe.shift(LEFT * 3)
        water = Arrow(LEFT * 1.5, RIGHT * 1.5, color=BLUE)
        water.move_to(pipe)
        water_label = Text("Water", font_size=24).next_to(pipe, DOWN)
        
        # Right: Electricity
        wire = Rectangle(width=4, height=0.3, color=YELLOW)
        wire.shift(RIGHT * 3)
        current = Arrow(LEFT * 1.5, RIGHT * 1.5, color=YELLOW)
        current.move_to(wire)
        current_label = Text("Current", font_size=24).next_to(wire, DOWN)
        
        self.play(
            Create(pipe), Create(wire),
            Create(water), Create(current),
            Write(water_label), Write(current_label)
        )
        self.wait(2)
        
        # Show the mapping
        mapping = VGroup(
            Text("Pressure → Voltage", font_size=24),
            Text("Flow Rate → Current", font_size=24),
            Text("Pipe Width → Resistance", font_size=24),
        ).arrange(DOWN, aligned_edge=LEFT)
        mapping.to_edge(DOWN)
        
        for item in mapping:
            self.play(FadeIn(item, shift=RIGHT * 0.3))
            self.wait(0.5)
```

### Analogy Guidelines

| Do | Don't |
|---|-------|
| Explain the mapping explicitly | Assume they see the connection |
| Acknowledge limitations | Overextend the analogy |
| Use familiar domains | Use equally unfamiliar analogies |
| Keep it simple | Make it more complex than the concept |

---

## R - Reinforce (10% of content)

### Purpose
Solidify learning through summary, repetition, and forward connection.

### Reinforcement Techniques

| Technique | Description | Implementation |
|-----------|-------------|----------------|
| Summary | Recap key points | Bullet list |
| Callback | Reference earlier content | "Remember when..." |
| Application | Suggest uses | "Now you can..." |
| Preview | Connect to next topic | "Next, we'll see..." |

### Implementation Pattern

```python
class ReinforcementScene(Scene):
    def construct(self):
        # Summary title
        title = Text("Key Takeaways", font_size=48)
        title.to_edge(UP)
        self.play(Write(title))
        
        # Key points
        points = VGroup(
            Text("✓ Gravity pulls objects toward Earth", font_size=28),
            Text("✓ F = mg gives the gravitational force", font_size=28),
            Text("✓ All objects fall at the same rate (in vacuum)", font_size=28),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.4)
        points.move_to(ORIGIN)
        
        for point in points:
            self.play(FadeIn(point, shift=RIGHT * 0.3))
            self.wait(0.5)
        
        self.wait(2)
        
        # Application teaser
        application = Text(
            "Now you can calculate the fall time\n"
            "of any object from any height!",
            font_size=32,
            color=YELLOW
        ).to_edge(DOWN)
        
        self.play(FadeIn(application))
        self.wait(2)
        
        # Next topic preview
        self.play(FadeOut(VGroup(title, points, application)))
        preview = Text(
            "Next: How does this apply to orbits?",
            font_size=36
        )
        self.play(Write(preview))
        self.wait(2)
```

### Memory Techniques

```python
# The Rule of Three
key_points = [
    "Point one",
    "Point two", 
    "Point three"
]  # Three is optimal for memory

# Repetition with Variation
self.play(Write(concept))  # First exposure
# ... explanation ...
self.play(Indicate(concept))  # Second exposure (different form)
# ... examples ...
self.play(Transform(concept, summary_version))  # Third exposure (summarized)
```

---

## Complete CLEAR Scene Template

```python
class CLEARExplanation(Scene):
    """Complete template following CLEAR framework."""
    
    def construct(self):
        self.context_phase()
        self.layers_phase()
        self.examples_phase()
        self.analogies_phase()
        self.reinforce_phase()
    
    def context_phase(self):
        """10% - Set up the learning."""
        pass  # Implement hook, relevance, prerequisites
    
    def layers_phase(self):
        """40% - Build understanding."""
        pass  # Implement progressive complexity
    
    def examples_phase(self):
        """25% - Concrete instances."""
        pass  # Implement worked examples
    
    def analogies_phase(self):
        """15% - Connect to known."""
        pass  # Implement visual analogies
    
    def reinforce_phase(self):
        """10% - Solidify learning."""
        pass  # Implement summary and callbacks
```

---

## Measuring Effectiveness

### Self-Check Questions

After creating a CLEAR explanation:

1. **Context**: Could someone skip the intro and still follow?
2. **Layers**: Is there a logical progression?
3. **Examples**: Are examples relatable?
4. **Analogies**: Is the analogy simpler than the concept?
5. **Reinforce**: Will they remember the key points?

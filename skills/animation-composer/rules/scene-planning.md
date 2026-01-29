# Scene Planning Methodology

A structured approach to planning animations before writing code. Planning first prevents wasted effort and ensures cohesive final products.

## The Planning-First Principle

> **Never write animation code without a scene specification document.**

Code written without planning leads to:
- Inconsistent timing
- Overlapping elements
- Missing transitions
- Scope creep
- Rework

## Planning Workflow

```
Phase 0: Requirements    →   Understand the goal
        ↓
Phase 1: Scene Spec      →   Create scenes.md
        ↓
Phase 1.5: Layout Spec   →   Create scene_with_position.md
        ↓
Phase 2: Review          →   Validate and lock plan
        ↓
Phase 3: Implementation  →   Write code
```

## Phase 0: Requirements Gathering

### Key Questions

| Question | Why It Matters |
|----------|----------------|
| Who is the audience? | Determines complexity level |
| What's the core message? | Guides content focus |
| How long should it be? | Sets scope boundaries |
| What style is desired? | Informs visual choices |
| What are the constraints? | Identifies limitations |

### Requirements Template

```markdown
## Animation Requirements

**Title:** [Animation name]
**Purpose:** [What it should accomplish]
**Audience:** [Who will watch this]
**Duration:** [Target length in seconds/minutes]

### Content Scope
- Include: [Topics to cover]
- Exclude: [Topics to avoid]
- Emphasis: [Key points to highlight]

### Style Guidelines
- Visual style: [Modern, classic, playful, etc.]
- Color scheme: [Palette or theme]
- Pacing: [Fast, moderate, slow]

### Constraints
- Technical: [Resolution, format, etc.]
- Time: [Deadline if any]
- Resources: [Available assets]
```

## Phase 1: Scene Specification Document

### scenes.md Format

```markdown
# [Animation Title] - Scene Specification

## Overview
- **Total Duration:** [X minutes Y seconds]
- **Scene Count:** [N]
- **Act Structure:** [3-act / linear / modular]

---

## Scene 1: [Scene Name]
**Duration:** [Xs]
**Purpose:** [What this scene accomplishes]

### Objects
- object_1: [Description]
- object_2: [Description]

### Animations
1. [Animation description] (Xs)
2. [Animation description] (Xs)
3. [Animation description] (Xs)

### Transitions
- Entry: [How scene begins]
- Exit: [How scene ends]

### Notes
- [Any special considerations]

---

## Scene 2: [Scene Name]
...
```

### Scene Specification Example

```markdown
# Pythagorean Theorem - Scene Specification

## Overview
- **Total Duration:** 2 minutes 30 seconds
- **Scene Count:** 4
- **Act Structure:** 3-act (Intro, Demo, Conclusion)

---

## Scene 1: Introduction
**Duration:** 20s
**Purpose:** Present the theorem statement

### Objects
- title: "The Pythagorean Theorem" (Text)
- equation: "a² + b² = c²" (MathTex)
- right_triangle: Right triangle with labeled sides

### Animations
1. Write title (1s)
2. Wait (1s)
3. FadeIn equation below title (0.5s)
4. Create right_triangle to the right (1s)
5. Indicate the three sides with colors (2s)

### Transitions
- Entry: Fade from black
- Exit: Shift all left, make room for proof

---

## Scene 2: Visual Proof
**Duration:** 90s
**Purpose:** Demonstrate the proof visually

### Objects
- triangle: Same triangle from Scene 1
- square_a: Square on side a (area a²)
- square_b: Square on side b (area b²)
- square_c: Square on side c (area c²)

### Animations
1. Grow square_a from side a (1.5s)
2. Label with "a²" (0.5s)
3. Grow square_b from side b (1.5s)
4. Label with "b²" (0.5s)
5. Grow square_c from side c (1.5s)
6. Label with "c²" (0.5s)
7. Rearrange to show a² + b² = c² (3s)

...
```

## Phase 1.5: Layout Specification

See `layout-validation.md` for detailed position specifications.

## Phase 2: Review and Approval

### Review Checklist

- [ ] All scenes serve the stated purpose
- [ ] Timing adds up correctly
- [ ] No gaps between scenes
- [ ] Transitions are logical
- [ ] Objects are clearly defined
- [ ] Animations are achievable
- [ ] Scope matches requirements

### Approval Gate

Before proceeding to implementation:
1. Self-review the specification
2. Check for missing pieces
3. Validate against requirements
4. Lock the specification

## Phase 3: Implementation

### Implementation Guidelines

```python
"""
Scene 1: Introduction
Duration: 20s
"""

class Scene1Introduction(Scene):
    def construct(self):
        # Objects (as specified)
        title = Text("The Pythagorean Theorem", font_size=48)
        equation = MathTex("a^2 + b^2 = c^2")
        # ... etc
        
        # Animations (as specified)
        self.play(Write(title), run_time=1)
        self.wait(1)
        self.play(FadeIn(equation), run_time=0.5)
        # ... etc
```

### Tracking Progress

Mark scenes as implemented:

```markdown
## Implementation Status

- [x] Scene 1: Introduction
- [x] Scene 2: Visual Proof  
- [ ] Scene 3: Examples
- [ ] Scene 4: Conclusion
```

## Scene Planning Templates

### Simple Animation (< 1 minute)
```markdown
## [Title]
Duration: Xs

### Setup
- [Objects to create]

### Main Animation
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Cleanup
- [Exit animations]
```

### Multi-Act Animation (> 2 minutes)
```markdown
## [Title]

### Act 1: Setup (X%)
- Scene 1.1: [Purpose]
- Scene 1.2: [Purpose]

### Act 2: Development (Y%)
- Scene 2.1: [Purpose]
- Scene 2.2: [Purpose]
- Scene 2.3: [Purpose]

### Act 3: Conclusion (Z%)
- Scene 3.1: [Purpose]
- Scene 3.2: [Purpose]
```

## Common Pitfalls

### Avoid
- Starting to code before completing scenes.md
- Vague descriptions ("make it look good")
- Missing timing estimates
- Undefined transitions
- Scope creep during implementation

### Prefer
- Complete specification before coding
- Specific, measurable descriptions
- Time allocations for each step
- Explicit transition definitions
- Scope changes require spec update

## Integration with Codebase

### File Organization
```
project/
├── specs/
│   ├── scenes.md           # Scene specification
│   └── scene_with_position.md  # Layout specification
├── src/
│   ├── scene_1.py          # Implementation
│   ├── scene_2.py
│   └── ...
└── output/
    └── final.mp4
```

### Spec-to-Code Mapping
Each scene in the specification maps to:
- One Python file or class
- One rendered segment
- One section in final video

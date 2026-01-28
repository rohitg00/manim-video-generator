# Animation Skills

This directory contains specialized skills for the Manim Video Generator's natural language animation system.

## Installation

### Using SkillKit (Recommended)

```bash
# Install all skills
npx skillkit install rohitg00/manim-video-generator/skills

# Or install individual skills
skillkit install rohitg00/manim-video-generator/skills/math-visualizer
skillkit install rohitg00/manim-video-generator/skills/motion-graphics
```

### Using skills.sh

```bash
npx skills add rohitg00/manim-video-generator/
```

## Available Skills

### math-visualizer
Mathematical visualization for equations, proofs, and geometric concepts.

**Triggers:** equations, formulas, mathematical expressions, proofs, calculus, geometry

**Contents:**
- `rules/` - Best practices for equation presentation, color coding, graphing
- `examples/` - Pythagorean theorem, derivative visualization
- `templates/` - Equation transforms, function graphs

### animation-composer
Scene composition and orchestration for complex multi-part animations.

**Triggers:** compose, combine, orchestrate, multi-element scenes, transitions

**Contents:**
- `rules/` - Scene structure, timing, transitions, camera control
- `templates/` - Multi-act scenes, side-by-side comparisons

### visual-storyteller
Narrative-driven animations for explanatory content and visual storytelling.

**Triggers:** explain, demonstrate, show how, walk through, step-by-step

**Contents:**
- `rules/` - Progressive revelation, visual metaphors, pacing, emphasis
- `examples/` - Sorting algorithm, gravity story

### motion-graphics
Kinetic typography, logo animations, and stylized motion design.

**Triggers:** title, intro, logo, text animation, kinetic

**Contents:**
- `rules/` - Kinetic typography, timing/easing, visual hierarchy, branding
- `presets/` - Color palettes, animation presets

## Directory Structure

```
skills/
├── animation-composer/
│   ├── SKILL.md
│   ├── rules/
│   └── templates/
├── math-visualizer/
│   ├── SKILL.md
│   ├── rules/
│   ├── examples/
│   └── templates/
├── motion-graphics/
│   ├── SKILL.md
│   ├── rules/
│   └── presets/
└── visual-storyteller/
    ├── SKILL.md
    ├── rules/
    └── examples/
```

## Usage

Skills are automatically selected by the NLU classifier based on user input. The system analyzes the intent and routes to the appropriate skill.

Example prompts and their skill routing:
- "Visualize the quadratic formula" → `math-visualizer`
- "Create a title sequence for my video" → `motion-graphics`
- "Explain how bubble sort works" → `visual-storyteller`
- "Compose a 3-act animation about gravity" → `animation-composer`

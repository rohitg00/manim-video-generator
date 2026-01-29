# Skills System

<!-- SKILLKIT_SKILLS_START -->

## Available Skills

- **animation-composer**: Scene composition and orchestration skill for creating complex multi-part animations.

**Triggers when:**
- User wants to compose multi-element scenes
- Request involves combining multiple visual elements
- Scene requires act-based structure or transitions
- User mentions "scene", "compose", "combine", "orchestrate"

**Capabilities:**
- Scene graph construction with acts and transitions
- Multi-object coordination and timing
- Camera movements and focus control
- Layered animation sequences

- **math-visualizer**: Mathematical visualization skill for equations, proofs, and geometric concepts.

**Triggers when:**
- User mentions equations, formulas, or mathematical expressions
- Request involves mathematical proofs or derivations
- Content includes geometric relationships
- User mentions LaTeX, calculus, algebra, geometry, trigonometry
- Patterns: "equation", "formula", "prove", "derive", "graph", "plot"

**Capabilities:**
- LaTeX equation rendering with color-coded components
- Function graphing and transformations
- Geometric constructions and proofs
- 3D mathematical surfaces
- Step-by-step derivations with highlights

- **motion-graphics**: Kinetic typography, logo animations, and stylized motion design skill.

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

- **visual-storyteller**: Narrative-driven animation skill for explanatory content and visual storytelling.

**Triggers when:**
- User wants to explain a concept or process
- Request involves step-by-step demonstrations
- Content is educational or tutorial-like
- User mentions "explain", "show how", "demonstrate", "walk through"

**Capabilities:**
- Breaking concepts into digestible visual steps
- Progressive revelation of information
- Highlighting cause-and-effect relationships
- Building intuition through visual metaphors


## How to Use Skills

When a task matches one of the available skills, load it to get detailed instructions:

```bash
skillkit read <skill-name>
```

Or with npx:

```bash
npx skillkit read <skill-name>
```

## Skills Data

<skills_system>
<usage>
Skills provide specialized capabilities and domain knowledge.
- Invoke: `skillkit read <skill-name>`
- Base directory provided in output for resolving resources
- Only use skills listed below
- Each invocation is stateless
</usage>

<available_skills>

<skill>
<name>animation-composer</name>
<description>Scene composition and orchestration skill for creating complex multi-part animations.

**Triggers when:**
- User wants to compose multi-element scenes
- Request involves combining multiple visual elements
- Scene requires act-based structure or transitions
- User mentions &quot;scene&quot;, &quot;compose&quot;, &quot;combine&quot;, &quot;orchestrate&quot;

**Capabilities:**
- Scene graph construction with acts and transitions
- Multi-object coordination and timing
- Camera movements and focus control
- Layered animation sequences
</description>
<location>project</location>
</skill>

<skill>
<name>math-visualizer</name>
<description>Mathematical visualization skill for equations, proofs, and geometric concepts.

**Triggers when:**
- User mentions equations, formulas, or mathematical expressions
- Request involves mathematical proofs or derivations
- Content includes geometric relationships
- User mentions LaTeX, calculus, algebra, geometry, trigonometry
- Patterns: &quot;equation&quot;, &quot;formula&quot;, &quot;prove&quot;, &quot;derive&quot;, &quot;graph&quot;, &quot;plot&quot;

**Capabilities:**
- LaTeX equation rendering with color-coded components
- Function graphing and transformations
- Geometric constructions and proofs
- 3D mathematical surfaces
- Step-by-step derivations with highlights
</description>
<location>project</location>
</skill>

<skill>
<name>motion-graphics</name>
<description>Kinetic typography, logo animations, and stylized motion design skill.

**Triggers when:**
- User wants text animations or kinetic typography
- Request involves logo reveals or title sequences
- Content focuses on visual impact over education
- User mentions &quot;title&quot;, &quot;intro&quot;, &quot;logo&quot;, &quot;text animation&quot;, &quot;kinetic&quot;

**Capabilities:**
- Kinetic typography with dynamic text effects
- Logo reveals and brand animations
- Particle effects and visual flourishes
- Modern motion design patterns
- Attention-grabbing title sequences
</description>
<location>project</location>
</skill>

<skill>
<name>visual-storyteller</name>
<description>Narrative-driven animation skill for explanatory content and visual storytelling.

**Triggers when:**
- User wants to explain a concept or process
- Request involves step-by-step demonstrations
- Content is educational or tutorial-like
- User mentions &quot;explain&quot;, &quot;show how&quot;, &quot;demonstrate&quot;, &quot;walk through&quot;

**Capabilities:**
- Breaking concepts into digestible visual steps
- Progressive revelation of information
- Highlighting cause-and-effect relationships
- Building intuition through visual metaphors
</description>
<location>project</location>
</skill>

</available_skills>
</skills_system>

<!-- SKILLKIT_SKILLS_END -->

# [Animation Title] - Scene Specification

## Overview

**Project:** [Project name]
**Author:** [Your name]
**Date:** [Creation date]
**Version:** [1.0]

### Summary
| Attribute | Value |
|-----------|-------|
| Total Duration | [X minutes Y seconds] |
| Scene Count | [N] |
| Act Structure | [3-act / linear / modular] |
| Target Audience | [Description] |
| Visual Style | [Modern / Classic / Playful / etc.] |

---

## Act 1: Introduction
*Purpose: Set up the context and introduce the main topic*
*Duration: ~20% of total*

### Scene 1.1: [Opening Title]
**Duration:** [Xs]
**Purpose:** [What this scene accomplishes]

#### Objects
| Name | Type | Description |
|------|------|-------------|
| title | Text | Main title text |
| subtitle | Text | Supporting text |

#### Positions
| Object | Position | Size (approx) |
|--------|----------|---------------|
| title | (0, 2.5) | 8.0 × 0.8 |
| subtitle | (0, 1.5) | 6.0 × 0.5 |

#### Animation Sequence
| # | Animation | Duration | Notes |
|---|-----------|----------|-------|
| 1 | Write(title) | 1.0s | - |
| 2 | Wait | 0.5s | Let title settle |
| 3 | FadeIn(subtitle) | 0.5s | Shift up slightly |

#### Transitions
- **Entry:** Fade from black
- **Exit:** FadeOut all, or shift left

---

### Scene 1.2: [Problem Statement]
**Duration:** [Xs]
**Purpose:** [What this scene accomplishes]

#### Objects
| Name | Type | Description |
|------|------|-------------|
| question | Text | The main question |
| visual | Mobject | Supporting visual |

#### Positions
| Object | Position | Size (approx) |
|--------|----------|---------------|
| question | (0, 2.0) | 10.0 × 0.6 |
| visual | (0, -0.5) | 5.0 × 4.0 |

#### Animation Sequence
| # | Animation | Duration | Notes |
|---|-----------|----------|-------|
| 1 | Write(question) | 1.5s | - |
| 2 | Create(visual) | 2.0s | Build the visual |
| 3 | Indicate(visual) | 1.0s | Draw attention |

#### Transitions
- **Entry:** Continue from previous
- **Exit:** Keep visual, fade question

---

## Act 2: Development
*Purpose: Explain the main content in detail*
*Duration: ~60% of total*

### Scene 2.1: [First Key Point]
**Duration:** [Xs]
**Purpose:** [What this scene accomplishes]

#### Objects
| Name | Type | Description |
|------|------|-------------|
| heading | Text | Section heading |
| equation | MathTex | Key equation |
| diagram | VGroup | Supporting diagram |

#### Positions
| Object | Position | Size (approx) |
|--------|----------|---------------|
| heading | (0, 3.0) | 6.0 × 0.5 |
| equation | (-3, 0) | 4.0 × 1.0 |
| diagram | (3, 0) | 4.0 × 3.0 |

#### Animation Sequence
| # | Animation | Duration | Notes |
|---|-----------|----------|-------|
| 1 | Write(heading) | 0.8s | - |
| 2 | Write(equation) | 1.5s | - |
| 3 | Create(diagram) | 2.0s | - |
| 4 | Transform connection | 1.5s | Show relationship |

#### Transitions
- **Entry:** Quick fade from previous
- **Exit:** Equation transforms to next

---

### Scene 2.2: [Second Key Point]
**Duration:** [Xs]
**Purpose:** [What this scene accomplishes]

*[Follow same structure as Scene 2.1]*

---

### Scene 2.3: [Third Key Point]
**Duration:** [Xs]
**Purpose:** [What this scene accomplishes]

*[Follow same structure as Scene 2.1]*

---

## Act 3: Conclusion
*Purpose: Summarize and reinforce key takeaways*
*Duration: ~20% of total*

### Scene 3.1: [Summary]
**Duration:** [Xs]
**Purpose:** Recap the main points

#### Objects
| Name | Type | Description |
|------|------|-------------|
| summary_title | Text | "Key Takeaways" |
| points | BulletedList | Main points |
| final_equation | MathTex | Final form |

#### Positions
| Object | Position | Size (approx) |
|--------|----------|---------------|
| summary_title | (0, 3.0) | 5.0 × 0.5 |
| points | (-3, 0) | 5.0 × 3.0 |
| final_equation | (3, 0) | 4.0 × 1.5 |

#### Animation Sequence
| # | Animation | Duration | Notes |
|---|-----------|----------|-------|
| 1 | Write(summary_title) | 0.5s | - |
| 2 | FadeIn(points[0]) | 0.5s | First point |
| 3 | FadeIn(points[1]) | 0.5s | Second point |
| 4 | FadeIn(points[2]) | 0.5s | Third point |
| 5 | Write(final_equation) | 1.0s | - |
| 6 | Circumscribe(final_equation) | 1.0s | Emphasize |

#### Transitions
- **Entry:** Clean transition from development
- **Exit:** Fade to black

---

### Scene 3.2: [Closing]
**Duration:** [Xs]
**Purpose:** End card / call to action

#### Objects
| Name | Type | Description |
|------|------|-------------|
| thanks | Text | Thank you message |
| cta | Text | Call to action |

#### Animation Sequence
| # | Animation | Duration | Notes |
|---|-----------|----------|-------|
| 1 | FadeIn(thanks) | 0.5s | - |
| 2 | Wait | 1.0s | - |
| 3 | FadeIn(cta) | 0.5s | - |
| 4 | Wait | 2.0s | Hold for viewers |
| 5 | FadeOut(all) | 0.5s | End |

---

## Appendix

### Color Palette
| Use | Color | Hex |
|-----|-------|-----|
| Primary | BLUE | #58C4DD |
| Secondary | GREEN | #83C167 |
| Accent | YELLOW | #FFFF00 |
| Text | WHITE | #FFFFFF |
| Background | BLACK | #000000 |

### Typography
| Element | Font Size | Style |
|---------|-----------|-------|
| Title | 48 | Bold |
| Heading | 36 | Regular |
| Body | 32 | Regular |
| Caption | 24 | Light |
| Math | 40 | Default |

### Timing Summary
| Scene | Duration | Cumulative |
|-------|----------|------------|
| 1.1 | Xs | Xs |
| 1.2 | Xs | Xs |
| 2.1 | Xs | Xs |
| 2.2 | Xs | Xs |
| 2.3 | Xs | Xs |
| 3.1 | Xs | Xs |
| 3.2 | Xs | Xs |
| **Total** | **Xs** | - |

### Implementation Checklist
- [ ] Scene 1.1: Opening Title
- [ ] Scene 1.2: Problem Statement
- [ ] Scene 2.1: First Key Point
- [ ] Scene 2.2: Second Key Point
- [ ] Scene 2.3: Third Key Point
- [ ] Scene 3.1: Summary
- [ ] Scene 3.2: Closing
- [ ] Final review
- [ ] Export

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | [Date] | Initial specification |

# Concept Decomposition System

A systematic approach to breaking down complex mathematical concepts into teachable prerequisite chains.

## Overview

Before visualizing any mathematical concept, decompose it into its fundamental prerequisites. This ensures viewers can follow the explanation without knowledge gaps.

## The Prerequisite Discovery Algorithm

### Core Question
For any concept X, recursively ask:
> "What must I understand BEFORE I can understand X?"

### Process Flow

```
Target Concept
      │
      ▼
┌─────────────────┐
│ Identify Direct │
│  Prerequisites  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ For Each Prereq │◄──────┐
│   Recurse       │       │
└────────┬────────┘       │
         │                │
         ▼                │
┌─────────────────┐       │
│ Is Foundation?  │──No───┘
└────────┬────────┘
         │ Yes
         ▼
┌─────────────────┐
│  Stop Recursion │
└─────────────────┘
```

## Foundation Detection

### What Counts as Foundation?
Stop recursion when you reach concepts that:
- Are taught in basic education (algebra, basic geometry)
- Require no special mathematical background
- Can be assumed as common knowledge for target audience

### Foundation Examples by Domain

| Domain | Foundation Concepts |
|--------|---------------------|
| Calculus | Algebra, Functions, Graphs |
| Linear Algebra | Vectors, Basic Arithmetic, Equations |
| Probability | Fractions, Counting, Basic Statistics |
| Number Theory | Integers, Division, Prime Numbers |

## Knowledge Dependency Graph

### Structure
Build a Directed Acyclic Graph (DAG) where:
- **Nodes** = Concepts
- **Edges** = "requires understanding of"
- **Leaves** = Foundation concepts
- **Root** = Target concept

### Example: Eigenvalues

```
                    Eigenvalues
                         │
           ┌─────────────┼─────────────┐
           │             │             │
           ▼             ▼             ▼
    Linear         Determinants    Characteristic
 Transformations                    Polynomial
           │             │             │
           ▼             ▼             ▼
    Matrix          2x2/3x3        Polynomial
 Multiplication     Matrices        Equations
           │             │             │
           └──────┬──────┴──────┬──────┘
                  │             │
                  ▼             ▼
              Vectors       Algebra
              (Foundation)  (Foundation)
```

### JSON Representation
```json
{
  "concept": "Eigenvalues",
  "prerequisites": [
    {
      "concept": "Linear Transformations",
      "prerequisites": [
        {
          "concept": "Matrix Multiplication",
          "prerequisites": [
            {"concept": "Vectors", "foundation": true},
            {"concept": "Algebra", "foundation": true}
          ]
        }
      ]
    },
    {
      "concept": "Determinants",
      "prerequisites": [
        {"concept": "2x2/3x3 Matrices", "foundation": true}
      ]
    },
    {
      "concept": "Characteristic Polynomial",
      "prerequisites": [
        {"concept": "Polynomial Equations", "foundation": true}
      ]
    }
  ]
}
```

## Scene Ordering from DAG

### Topological Sort
Order scenes by dependency depth:
1. **Foundation scenes first** (deepest leaves)
2. **Build up through prerequisites**
3. **Target concept last** (root)

### Algorithm
```python
def get_scene_order(concept_dag):
    """Return concepts in teaching order (foundations first)."""
    order = []
    visited = set()
    
    def visit(node):
        if node["concept"] in visited:
            return
        visited.add(node["concept"])
        
        # Visit prerequisites first
        for prereq in node.get("prerequisites", []):
            visit(prereq)
        
        order.append(node["concept"])
    
    visit(concept_dag)
    return order
```

### Example Output
For Eigenvalues:
1. Vectors (foundation)
2. Algebra (foundation)
3. Matrix Multiplication
4. 2x2/3x3 Matrices
5. Linear Transformations
6. Determinants
7. Polynomial Equations
8. Characteristic Polynomial
9. **Eigenvalues** (target)

## Implementation in Scenes

### Scene Specification Format
```markdown
## Knowledge Tree

Target: Eigenvalues

### Prerequisites (in order)
1. Vectors (30s) - Quick review
2. Matrix Multiplication (60s) - Core mechanic
3. Linear Transformations (90s) - Conceptual understanding
4. Determinants (60s) - Calculation method
5. Characteristic Polynomial (45s) - Setup
6. Eigenvalues (120s) - Main content
```

### Duration Allocation
| Concept Type | Suggested Duration |
|--------------|-------------------|
| Foundation (review) | 15-30s |
| Prerequisite | 30-60s |
| Supporting concept | 60-90s |
| Target concept | 90-180s |

## Practical Guidelines

### Depth Control
- **Quick explanation**: 1-2 prerequisite levels
- **Standard video**: 2-3 levels
- **Deep dive**: 3-4 levels
- **Course content**: Full tree

### Audience Calibration
Adjust foundation level based on audience:

| Audience | Foundation Level |
|----------|------------------|
| General public | Arithmetic, basic shapes |
| High school | Algebra, trigonometry |
| Undergrad | Calculus, linear algebra basics |
| Graduate | Advanced topics as foundations |

### Skip Conditions
Omit a prerequisite when:
- Audience definitely knows it
- It's tangential to main point
- Time constraints require it
- You can reference "recall that..."

## Visual Indicators

### Show the Tree
Consider visualizing the knowledge tree itself:
```python
# Show what we'll cover
tree_visual = create_knowledge_tree_diagram(concept_dag)
self.play(Create(tree_visual))
self.wait(2)

# Highlight current position as we progress
for concept in scene_order:
    highlight_node(tree_visual, concept)
    # ... teach concept ...
```

### Progress Indicators
```python
# Show progress through prerequisites
progress = ProgressBar(len(concepts))
for i, concept in enumerate(concepts):
    progress.update(i)
    # ... teach concept ...
```

## Anti-Patterns

### Avoid
- **Assuming knowledge**: Jumping to advanced concepts
- **Over-decomposition**: Breaking down obvious things
- **Circular dependencies**: A requires B requires A
- **Missing foundations**: Leaving gaps in the tree

### Prefer
- **Explicit prerequisites**: State what's assumed
- **Just-in-time review**: Brief refreshers
- **Clear progression**: Visible path through concepts
- **Appropriate depth**: Match audience level

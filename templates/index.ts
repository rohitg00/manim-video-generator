/**
 * Template Index
 * Comprehensive catalog of all available Manim animation templates
 * Organized by domain for efficient template matching
 */

export interface TemplateInfo {
  name: string;
  file: string;
  description: string;
  keywords: string[];
}

export interface TemplateCategory {
  name: string;
  description: string;
  templates: TemplateInfo[];
}

export const TEMPLATES: Record<string, TemplateCategory> = {
  physics: {
    name: 'Physics',
    description: 'Physics simulations and visualizations',
    templates: [
      {
        name: 'Brownian Motion',
        file: 'physics/brownian-motion.py',
        description: 'Random particle motion visualization (diffusion)',
        keywords: ['brownian', 'particle', 'random walk', 'diffusion', 'molecular']
      },
      {
        name: 'Wave Interference',
        file: 'physics/wave-interference.py',
        description: 'Two-source wave interference pattern',
        keywords: ['wave', 'interference', 'superposition', 'constructive', 'destructive']
      },
      {
        name: 'Pendulum Motion',
        file: 'physics/pendulum-motion.py',
        description: 'Simple harmonic motion of a pendulum',
        keywords: ['pendulum', 'harmonic', 'oscillation', 'period', 'swing']
      },
      {
        name: 'Electric Field',
        file: 'physics/electric-field.py',
        description: 'Electric field lines from point charges',
        keywords: ['electric', 'field', 'charge', 'coulomb', 'lines']
      },
      {
        name: 'Projectile Motion',
        file: 'physics/projectile-motion.py',
        description: 'Trajectory visualization with velocity vectors',
        keywords: ['projectile', 'trajectory', 'parabola', 'throw', 'launch']
      },
      {
        name: 'Spring Oscillation',
        file: 'physics/spring-oscillation.py',
        description: "Hooke's law spring demonstration",
        keywords: ['spring', 'hooke', 'oscillation', 'elastic', 'force']
      },
      {
        name: 'Doppler Effect',
        file: 'physics/doppler-effect.py',
        description: 'Wave compression due to source motion',
        keywords: ['doppler', 'frequency', 'wave', 'sound', 'shift']
      }
    ]
  },

  'computer-science': {
    name: 'Computer Science',
    description: 'Algorithm and data structure visualizations',
    templates: [
      {
        name: 'Bubble Sort',
        file: 'computer-science/bubble-sort.py',
        description: 'Bubble sort algorithm step-by-step',
        keywords: ['bubble', 'sort', 'sorting', 'algorithm', 'swap']
      },
      {
        name: 'Binary Search',
        file: 'computer-science/binary-search.py',
        description: 'Binary search algorithm visualization',
        keywords: ['binary', 'search', 'algorithm', 'divide', 'log n']
      },
      {
        name: 'Tree Traversal',
        file: 'computer-science/tree-traversal.py',
        description: 'BFS and DFS tree traversal algorithms',
        keywords: ['tree', 'traversal', 'bfs', 'dfs', 'breadth', 'depth']
      },
      {
        name: 'Graph Algorithms',
        file: 'computer-science/graph-algorithms.py',
        description: "Dijkstra's shortest path algorithm",
        keywords: ['graph', 'dijkstra', 'shortest', 'path', 'algorithm']
      },
      {
        name: 'Recursion Tree',
        file: 'computer-science/recursion-tree.py',
        description: 'Fibonacci recursion tree visualization',
        keywords: ['recursion', 'fibonacci', 'tree', 'call stack', 'recursive']
      },
      {
        name: 'Stack Operations',
        file: 'computer-science/stack-operations.py',
        description: 'Push/pop stack operations',
        keywords: ['stack', 'push', 'pop', 'lifo', 'data structure']
      },
      {
        name: 'Linked List',
        file: 'computer-science/linked-list.py',
        description: 'Linked list node operations',
        keywords: ['linked', 'list', 'node', 'pointer', 'insert', 'delete']
      }
    ]
  },

  finance: {
    name: 'Finance',
    description: 'Financial concepts and visualizations',
    templates: [
      {
        name: 'Compound Interest',
        file: 'finance/compound-interest.py',
        description: 'Exponential growth from compound interest',
        keywords: ['compound', 'interest', 'growth', 'exponential', 'investment']
      },
      {
        name: 'Stock Chart',
        file: 'finance/stock-chart.py',
        description: 'Animated candlestick chart',
        keywords: ['stock', 'candlestick', 'chart', 'trading', 'ohlc']
      },
      {
        name: 'Portfolio Allocation',
        file: 'finance/portfolio-allocation.py',
        description: 'Pie chart asset allocation transitions',
        keywords: ['portfolio', 'allocation', 'diversification', 'assets', 'pie']
      },
      {
        name: 'Option Payoff',
        file: 'finance/option-payoff.py',
        description: 'Call and put option payoff diagrams',
        keywords: ['option', 'call', 'put', 'payoff', 'strike']
      },
      {
        name: 'Present Value',
        file: 'finance/present-value.py',
        description: 'Time value of money and discounting',
        keywords: ['present', 'value', 'discount', 'time value', 'npv']
      }
    ]
  },

  topology: {
    name: 'Topology',
    description: '3D topological surface visualizations',
    templates: [
      {
        name: 'Mobius Strip',
        file: 'topology/mobius-strip.py',
        description: 'Non-orientable Mobius strip surface',
        keywords: ['mobius', 'strip', 'surface', 'non-orientable', 'one-sided']
      },
      {
        name: 'Klein Bottle',
        file: 'topology/klein-bottle.py',
        description: '4D Klein bottle in 3D immersion',
        keywords: ['klein', 'bottle', '4d', 'surface', 'topology']
      },
      {
        name: 'Torus',
        file: 'topology/torus.py',
        description: 'Donut-shaped torus surface',
        keywords: ['torus', 'donut', 'surface', 'genus', 'hole']
      },
      {
        name: 'Trefoil Knot',
        file: 'topology/trefoil-knot.py',
        description: 'Simplest non-trivial knot',
        keywords: ['trefoil', 'knot', 'crossing', 'topology', 'curve']
      }
    ]
  },

  statistics: {
    name: 'Statistics',
    description: 'Statistical concepts and distributions',
    templates: [
      {
        name: 'Normal Distribution',
        file: 'statistics/normal-distribution.py',
        description: 'Bell curve and empirical rule',
        keywords: ['normal', 'distribution', 'bell curve', 'gaussian', 'standard']
      },
      {
        name: 'Central Limit Theorem',
        file: 'statistics/central-limit-theorem.py',
        description: 'Sample means convergence to normal',
        keywords: ['central limit', 'clt', 'sample', 'mean', 'convergence']
      },
      {
        name: 'Linear Regression',
        file: 'statistics/linear-regression.py',
        description: 'Best fit line and residuals',
        keywords: ['regression', 'linear', 'fit', 'residual', 'r squared']
      },
      {
        name: 'Confidence Interval',
        file: 'statistics/confidence-interval.py',
        description: 'Error bars and confidence levels',
        keywords: ['confidence', 'interval', 'error', 'margin', 'uncertainty']
      },
      {
        name: 'Hypothesis Testing',
        file: 'statistics/hypothesis-testing.py',
        description: 'P-value and decision visualization',
        keywords: ['hypothesis', 'test', 'p-value', 'significance', 'null']
      }
    ]
  },

  mathematics: {
    name: 'Mathematics',
    description: 'Core mathematical concepts and formulas',
    templates: [
      {
        name: 'Quadratic Formula',
        file: 'mathematics/quadratic-formula.py',
        description: 'Derivation and application of quadratic formula',
        keywords: ['quadratic', 'formula', 'polynomial', 'roots', 'discriminant']
      },
      {
        name: 'Law of Cosines',
        file: 'mathematics/law-of-cosines.py',
        description: 'Law of cosines for any triangle',
        keywords: ['cosine', 'law', 'triangle', 'angle', 'sides']
      },
      {
        name: 'Fourier Series',
        file: 'mathematics/fourier-series.py',
        description: 'Fourier series approximation of square wave',
        keywords: ['fourier', 'series', 'sine', 'wave', 'approximation']
      },
      {
        name: 'Taylor Series',
        file: 'mathematics/taylor-series.py',
        description: 'Taylor polynomial approximations',
        keywords: ['taylor', 'series', 'polynomial', 'expansion', 'maclaurin']
      }
    ]
  }
};

/**
 * Get all templates flattened into a single array
 */
export function getAllTemplates(): (TemplateInfo & { category: string })[] {
  const all: (TemplateInfo & { category: string })[] = [];

  for (const [categoryKey, category] of Object.entries(TEMPLATES)) {
    for (const template of category.templates) {
      all.push({
        ...template,
        category: categoryKey
      });
    }
  }

  return all;
}

/**
 * Get total template count
 */
export function getTemplateCount(): number {
  return getAllTemplates().length;
}

/**
 * Search templates by keyword
 */
export function searchTemplates(query: string): (TemplateInfo & { category: string; score: number })[] {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/);
  const results: (TemplateInfo & { category: string; score: number })[] = [];

  for (const template of getAllTemplates()) {
    let score = 0;

    // Check name
    if (template.name.toLowerCase().includes(queryLower)) {
      score += 10;
    }

    // Check description
    if (template.description.toLowerCase().includes(queryLower)) {
      score += 5;
    }

    // Check keywords
    for (const keyword of template.keywords) {
      for (const word of queryWords) {
        if (keyword.includes(word) || word.includes(keyword)) {
          score += 3;
        }
      }
    }

    if (score > 0) {
      results.push({ ...template, score });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results;
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): TemplateInfo[] {
  return TEMPLATES[category]?.templates || [];
}

/**
 * Get all category names
 */
export function getCategories(): string[] {
  return Object.keys(TEMPLATES);
}

// Export template count for easy access
export const TEMPLATE_COUNT = getTemplateCount();

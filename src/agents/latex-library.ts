
import type { LatexEquation, MathCategory, Theorem, MathDefinition } from './types'

export const LATEX_EQUATIONS: LatexEquation[] = [
  {
    id: 'derivative-definition',
    category: 'calculus',
    name: 'Derivative Definition',
    latex: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}",
    description: 'The fundamental definition of a derivative as a limit',
    variables: [
      { symbol: 'f', name: 'function', description: 'The function being differentiated' },
      { symbol: 'x', name: 'point', description: 'The point at which derivative is evaluated' },
      { symbol: 'h', name: 'increment', description: 'Small change approaching zero' },
    ],
    relatedEquations: ['power-rule', 'chain-rule'],
    difficulty: 2,
    tags: ['derivative', 'limit', 'fundamental'],
  },
  {
    id: 'power-rule',
    category: 'calculus',
    name: 'Power Rule',
    latex: '\\frac{d}{dx}[x^n] = nx^{n-1}',
    description: 'Derivative of x raised to a power',
    variables: [
      { symbol: 'x', name: 'variable', description: 'Independent variable' },
      { symbol: 'n', name: 'exponent', description: 'The power to which x is raised' },
    ],
    relatedEquations: ['derivative-definition', 'chain-rule'],
    difficulty: 1,
    tags: ['derivative', 'power', 'basic'],
  },
  {
    id: 'chain-rule',
    category: 'calculus',
    name: 'Chain Rule',
    latex: '\\frac{d}{dx}[f(g(x))] = f\'(g(x)) \\cdot g\'(x)',
    description: 'Derivative of composite functions',
    variables: [
      { symbol: 'f', name: 'outer function', description: 'The outer function' },
      { symbol: 'g', name: 'inner function', description: 'The inner function' },
    ],
    relatedEquations: ['derivative-definition', 'product-rule'],
    difficulty: 2,
    tags: ['derivative', 'composite', 'chain'],
  },
  {
    id: 'product-rule',
    category: 'calculus',
    name: 'Product Rule',
    latex: '\\frac{d}{dx}[f(x)g(x)] = f\'(x)g(x) + f(x)g\'(x)',
    description: 'Derivative of a product of two functions',
    variables: [
      { symbol: 'f', name: 'first function', description: 'First factor' },
      { symbol: 'g', name: 'second function', description: 'Second factor' },
    ],
    relatedEquations: ['quotient-rule', 'chain-rule'],
    difficulty: 2,
    tags: ['derivative', 'product'],
  },
  {
    id: 'quotient-rule',
    category: 'calculus',
    name: 'Quotient Rule',
    latex: '\\frac{d}{dx}\\left[\\frac{f(x)}{g(x)}\\right] = \\frac{f\'(x)g(x) - f(x)g\'(x)}{[g(x)]^2}',
    description: 'Derivative of a quotient of two functions',
    variables: [
      { symbol: 'f', name: 'numerator', description: 'Function in numerator' },
      { symbol: 'g', name: 'denominator', description: 'Function in denominator' },
    ],
    relatedEquations: ['product-rule'],
    difficulty: 2,
    tags: ['derivative', 'quotient'],
  },
  {
    id: 'integral-definition',
    category: 'calculus',
    name: 'Definite Integral',
    latex: '\\int_a^b f(x)\\,dx = \\lim_{n \\to \\infty} \\sum_{i=1}^{n} f(x_i^*)\\Delta x',
    description: 'The definite integral as a Riemann sum limit',
    variables: [
      { symbol: 'f', name: 'function', description: 'The function being integrated' },
      { symbol: 'a', name: 'lower bound', description: 'Lower limit of integration' },
      { symbol: 'b', name: 'upper bound', description: 'Upper limit of integration' },
    ],
    relatedEquations: ['ftc-part1', 'ftc-part2'],
    difficulty: 3,
    tags: ['integral', 'limit', 'riemann'],
  },
  {
    id: 'ftc-part1',
    category: 'calculus',
    name: 'Fundamental Theorem of Calculus (Part 1)',
    latex: '\\frac{d}{dx}\\int_a^x f(t)\\,dt = f(x)',
    description: 'The derivative of an integral returns the original function',
    variables: [
      { symbol: 'f', name: 'function', description: 'Continuous function' },
      { symbol: 'a', name: 'constant', description: 'Fixed lower bound' },
      { symbol: 'x', name: 'variable', description: 'Variable upper bound' },
    ],
    relatedEquations: ['ftc-part2', 'integral-definition'],
    difficulty: 3,
    tags: ['integral', 'derivative', 'fundamental'],
  },
  {
    id: 'ftc-part2',
    category: 'calculus',
    name: 'Fundamental Theorem of Calculus (Part 2)',
    latex: '\\int_a^b f(x)\\,dx = F(b) - F(a)',
    description: 'Evaluate definite integrals using antiderivatives',
    variables: [
      { symbol: 'f', name: 'function', description: 'The integrand' },
      { symbol: 'F', name: 'antiderivative', description: 'Antiderivative of f' },
      { symbol: 'a', name: 'lower bound', description: 'Lower limit' },
      { symbol: 'b', name: 'upper bound', description: 'Upper limit' },
    ],
    relatedEquations: ['ftc-part1'],
    difficulty: 2,
    tags: ['integral', 'antiderivative', 'fundamental'],
  },
  {
    id: 'integration-by-parts',
    category: 'calculus',
    name: 'Integration by Parts',
    latex: '\\int u\\,dv = uv - \\int v\\,du',
    description: 'Integration technique for products of functions',
    variables: [
      { symbol: 'u', name: 'first part', description: 'Function to differentiate' },
      { symbol: 'v', name: 'second part', description: 'Function being integrated' },
    ],
    relatedEquations: ['product-rule'],
    difficulty: 3,
    tags: ['integral', 'technique'],
  },
  {
    id: 'taylor-series',
    category: 'calculus',
    name: 'Taylor Series',
    latex: 'f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!}(x-a)^n',
    description: 'Infinite series representation of a function',
    variables: [
      { symbol: 'f', name: 'function', description: 'Function to expand' },
      { symbol: 'a', name: 'center', description: 'Point of expansion' },
      { symbol: 'n', name: 'index', description: 'Term index' },
    ],
    relatedEquations: ['maclaurin-series'],
    difficulty: 4,
    tags: ['series', 'infinite', 'approximation'],
  },
  {
    id: 'maclaurin-series',
    category: 'calculus',
    name: 'Maclaurin Series',
    latex: 'f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(0)}{n!}x^n',
    description: 'Taylor series centered at x=0',
    variables: [
      { symbol: 'f', name: 'function', description: 'Function to expand' },
      { symbol: 'n', name: 'index', description: 'Term index' },
    ],
    relatedEquations: ['taylor-series', 'exp-series'],
    difficulty: 3,
    tags: ['series', 'infinite', 'approximation'],
  },
  {
    id: 'exp-series',
    category: 'calculus',
    name: 'Exponential Series',
    latex: 'e^x = \\sum_{n=0}^{\\infty} \\frac{x^n}{n!}',
    description: 'Series expansion of e^x',
    variables: [
      { symbol: 'e', name: 'Euler number', description: 'Mathematical constant ~2.718' },
      { symbol: 'x', name: 'exponent', description: 'The exponent' },
    ],
    relatedEquations: ['maclaurin-series', 'sin-series'],
    difficulty: 2,
    tags: ['series', 'exponential'],
  },
  {
    id: 'sin-series',
    category: 'calculus',
    name: 'Sine Series',
    latex: '\\sin(x) = \\sum_{n=0}^{\\infty} \\frac{(-1)^n x^{2n+1}}{(2n+1)!}',
    description: 'Series expansion of sine function',
    variables: [
      { symbol: 'x', name: 'angle', description: 'Angle in radians' },
    ],
    relatedEquations: ['cos-series', 'maclaurin-series'],
    difficulty: 2,
    tags: ['series', 'trigonometry'],
  },
  {
    id: 'cos-series',
    category: 'calculus',
    name: 'Cosine Series',
    latex: '\\cos(x) = \\sum_{n=0}^{\\infty} \\frac{(-1)^n x^{2n}}{(2n)!}',
    description: 'Series expansion of cosine function',
    variables: [
      { symbol: 'x', name: 'angle', description: 'Angle in radians' },
    ],
    relatedEquations: ['sin-series', 'maclaurin-series'],
    difficulty: 2,
    tags: ['series', 'trigonometry'],
  },

  {
    id: 'quadratic-formula',
    category: 'algebra',
    name: 'Quadratic Formula',
    latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
    description: 'Solution to quadratic equations ax^2 + bx + c = 0',
    variables: [
      { symbol: 'a', name: 'leading coefficient', description: 'Coefficient of x^2' },
      { symbol: 'b', name: 'linear coefficient', description: 'Coefficient of x' },
      { symbol: 'c', name: 'constant', description: 'Constant term' },
    ],
    relatedEquations: ['discriminant'],
    difficulty: 1,
    tags: ['quadratic', 'roots', 'formula'],
  },
  {
    id: 'discriminant',
    category: 'algebra',
    name: 'Discriminant',
    latex: '\\Delta = b^2 - 4ac',
    description: 'Determines the nature of roots of a quadratic',
    variables: [
      { symbol: 'a', name: 'leading coefficient', description: 'Coefficient of x^2' },
      { symbol: 'b', name: 'linear coefficient', description: 'Coefficient of x' },
      { symbol: 'c', name: 'constant', description: 'Constant term' },
    ],
    relatedEquations: ['quadratic-formula'],
    difficulty: 1,
    tags: ['quadratic', 'discriminant'],
  },
  {
    id: 'binomial-theorem',
    category: 'algebra',
    name: 'Binomial Theorem',
    latex: '(a+b)^n = \\sum_{k=0}^{n} \\binom{n}{k} a^{n-k} b^k',
    description: 'Expansion of powers of binomials',
    variables: [
      { symbol: 'a', name: 'first term', description: 'First term of binomial' },
      { symbol: 'b', name: 'second term', description: 'Second term of binomial' },
      { symbol: 'n', name: 'power', description: 'Exponent' },
    ],
    relatedEquations: ['binomial-coefficient'],
    difficulty: 2,
    tags: ['binomial', 'expansion', 'combinatorics'],
  },
  {
    id: 'binomial-coefficient',
    category: 'algebra',
    name: 'Binomial Coefficient',
    latex: '\\binom{n}{k} = \\frac{n!}{k!(n-k)!}',
    description: 'Number of ways to choose k items from n items',
    variables: [
      { symbol: 'n', name: 'total', description: 'Total number of items' },
      { symbol: 'k', name: 'chosen', description: 'Number of items to choose' },
    ],
    relatedEquations: ['binomial-theorem', 'factorial'],
    difficulty: 2,
    tags: ['combinatorics', 'binomial'],
  },
  {
    id: 'factorial',
    category: 'algebra',
    name: 'Factorial',
    latex: 'n! = n \\cdot (n-1) \\cdot (n-2) \\cdots 2 \\cdot 1',
    description: 'Product of all positive integers up to n',
    variables: [
      { symbol: 'n', name: 'number', description: 'Non-negative integer' },
    ],
    relatedEquations: ['binomial-coefficient', 'gamma-function'],
    difficulty: 1,
    tags: ['factorial', 'basic'],
  },
  {
    id: 'exponential-laws',
    category: 'algebra',
    name: 'Exponential Laws',
    latex: 'a^m \\cdot a^n = a^{m+n}, \\quad \\frac{a^m}{a^n} = a^{m-n}, \\quad (a^m)^n = a^{mn}',
    description: 'Fundamental laws of exponents',
    variables: [
      { symbol: 'a', name: 'base', description: 'The base number' },
      { symbol: 'm', name: 'first exponent', description: 'First power' },
      { symbol: 'n', name: 'second exponent', description: 'Second power' },
    ],
    relatedEquations: ['logarithm-laws'],
    difficulty: 1,
    tags: ['exponent', 'laws', 'basic'],
  },
  {
    id: 'logarithm-laws',
    category: 'algebra',
    name: 'Logarithm Laws',
    latex: '\\log_a(xy) = \\log_a x + \\log_a y, \\quad \\log_a\\left(\\frac{x}{y}\\right) = \\log_a x - \\log_a y',
    description: 'Fundamental laws of logarithms',
    variables: [
      { symbol: 'a', name: 'base', description: 'Logarithm base' },
      { symbol: 'x', name: 'first argument', description: 'First number' },
      { symbol: 'y', name: 'second argument', description: 'Second number' },
    ],
    relatedEquations: ['exponential-laws', 'change-of-base'],
    difficulty: 2,
    tags: ['logarithm', 'laws'],
  },
  {
    id: 'change-of-base',
    category: 'algebra',
    name: 'Change of Base Formula',
    latex: '\\log_a x = \\frac{\\log_b x}{\\log_b a}',
    description: 'Convert logarithms between different bases',
    variables: [
      { symbol: 'a', name: 'original base', description: 'Original logarithm base' },
      { symbol: 'b', name: 'new base', description: 'Target logarithm base' },
      { symbol: 'x', name: 'argument', description: 'Number being logged' },
    ],
    relatedEquations: ['logarithm-laws'],
    difficulty: 2,
    tags: ['logarithm', 'conversion'],
  },

  {
    id: 'pythagorean-theorem',
    category: 'geometry',
    name: 'Pythagorean Theorem',
    latex: 'a^2 + b^2 = c^2',
    description: 'Relationship between sides of a right triangle',
    variables: [
      { symbol: 'a', name: 'leg', description: 'First leg of right triangle' },
      { symbol: 'b', name: 'leg', description: 'Second leg of right triangle' },
      { symbol: 'c', name: 'hypotenuse', description: 'Hypotenuse (longest side)' },
    ],
    relatedEquations: ['distance-formula', 'law-of-cosines'],
    difficulty: 1,
    tags: ['triangle', 'fundamental', 'pythagoras'],
  },
  {
    id: 'distance-formula',
    category: 'geometry',
    name: 'Distance Formula',
    latex: 'd = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}',
    description: 'Distance between two points in a plane',
    variables: [
      { symbol: 'x_1', name: 'first x', description: 'x-coordinate of first point' },
      { symbol: 'y_1', name: 'first y', description: 'y-coordinate of first point' },
      { symbol: 'x_2', name: 'second x', description: 'x-coordinate of second point' },
      { symbol: 'y_2', name: 'second y', description: 'y-coordinate of second point' },
    ],
    relatedEquations: ['pythagorean-theorem', 'midpoint-formula'],
    difficulty: 1,
    tags: ['distance', 'coordinate'],
  },
  {
    id: 'midpoint-formula',
    category: 'geometry',
    name: 'Midpoint Formula',
    latex: 'M = \\left(\\frac{x_1+x_2}{2}, \\frac{y_1+y_2}{2}\\right)',
    description: 'Midpoint between two points',
    variables: [
      { symbol: 'x_1', name: 'first x', description: 'x-coordinate of first point' },
      { symbol: 'y_1', name: 'first y', description: 'y-coordinate of first point' },
      { symbol: 'x_2', name: 'second x', description: 'x-coordinate of second point' },
      { symbol: 'y_2', name: 'second y', description: 'y-coordinate of second point' },
    ],
    relatedEquations: ['distance-formula'],
    difficulty: 1,
    tags: ['midpoint', 'coordinate'],
  },
  {
    id: 'circle-equation',
    category: 'geometry',
    name: 'Circle Equation',
    latex: '(x-h)^2 + (y-k)^2 = r^2',
    description: 'Equation of a circle with center (h,k) and radius r',
    variables: [
      { symbol: 'h', name: 'center x', description: 'x-coordinate of center' },
      { symbol: 'k', name: 'center y', description: 'y-coordinate of center' },
      { symbol: 'r', name: 'radius', description: 'Radius of the circle' },
    ],
    relatedEquations: ['circle-area', 'circle-circumference'],
    difficulty: 1,
    tags: ['circle', 'conic'],
  },
  {
    id: 'circle-area',
    category: 'geometry',
    name: 'Circle Area',
    latex: 'A = \\pi r^2',
    description: 'Area of a circle',
    variables: [
      { symbol: 'A', name: 'area', description: 'Area of the circle', unit: 'units^2' },
      { symbol: 'r', name: 'radius', description: 'Radius of the circle' },
      { symbol: '\\pi', name: 'pi', description: 'Mathematical constant ~3.14159' },
    ],
    relatedEquations: ['circle-circumference', 'sphere-volume'],
    difficulty: 1,
    tags: ['circle', 'area'],
  },
  {
    id: 'circle-circumference',
    category: 'geometry',
    name: 'Circle Circumference',
    latex: 'C = 2\\pi r',
    description: 'Circumference of a circle',
    variables: [
      { symbol: 'C', name: 'circumference', description: 'Perimeter of the circle', unit: 'units' },
      { symbol: 'r', name: 'radius', description: 'Radius of the circle' },
    ],
    relatedEquations: ['circle-area'],
    difficulty: 1,
    tags: ['circle', 'perimeter'],
  },
  {
    id: 'sphere-volume',
    category: 'geometry',
    name: 'Sphere Volume',
    latex: 'V = \\frac{4}{3}\\pi r^3',
    description: 'Volume of a sphere',
    variables: [
      { symbol: 'V', name: 'volume', description: 'Volume of the sphere', unit: 'units^3' },
      { symbol: 'r', name: 'radius', description: 'Radius of the sphere' },
    ],
    relatedEquations: ['sphere-surface-area', 'circle-area'],
    difficulty: 1,
    tags: ['sphere', 'volume', '3d'],
  },
  {
    id: 'sphere-surface-area',
    category: 'geometry',
    name: 'Sphere Surface Area',
    latex: 'A = 4\\pi r^2',
    description: 'Surface area of a sphere',
    variables: [
      { symbol: 'A', name: 'surface area', description: 'Surface area', unit: 'units^2' },
      { symbol: 'r', name: 'radius', description: 'Radius of the sphere' },
    ],
    relatedEquations: ['sphere-volume'],
    difficulty: 1,
    tags: ['sphere', 'surface', '3d'],
  },

  {
    id: 'sin-cos-identity',
    category: 'trigonometry',
    name: 'Pythagorean Identity',
    latex: '\\sin^2\\theta + \\cos^2\\theta = 1',
    description: 'Fundamental trigonometric identity',
    variables: [
      { symbol: '\\theta', name: 'angle', description: 'Angle in radians or degrees' },
    ],
    relatedEquations: ['tan-identity', 'pythagorean-theorem'],
    difficulty: 1,
    tags: ['identity', 'fundamental'],
  },
  {
    id: 'tan-identity',
    category: 'trigonometry',
    name: 'Tangent Identity',
    latex: '\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}',
    description: 'Definition of tangent in terms of sine and cosine',
    variables: [
      { symbol: '\\theta', name: 'angle', description: 'Angle in radians or degrees' },
    ],
    relatedEquations: ['sin-cos-identity', 'sec-tan-identity'],
    difficulty: 1,
    tags: ['identity', 'tangent'],
  },
  {
    id: 'sec-tan-identity',
    category: 'trigonometry',
    name: 'Secant-Tangent Identity',
    latex: '1 + \\tan^2\\theta = \\sec^2\\theta',
    description: 'Pythagorean identity for tangent and secant',
    variables: [
      { symbol: '\\theta', name: 'angle', description: 'Angle' },
    ],
    relatedEquations: ['sin-cos-identity', 'csc-cot-identity'],
    difficulty: 2,
    tags: ['identity', 'pythagorean'],
  },
  {
    id: 'csc-cot-identity',
    category: 'trigonometry',
    name: 'Cosecant-Cotangent Identity',
    latex: '1 + \\cot^2\\theta = \\csc^2\\theta',
    description: 'Pythagorean identity for cotangent and cosecant',
    variables: [
      { symbol: '\\theta', name: 'angle', description: 'Angle' },
    ],
    relatedEquations: ['sin-cos-identity', 'sec-tan-identity'],
    difficulty: 2,
    tags: ['identity', 'pythagorean'],
  },
  {
    id: 'law-of-sines',
    category: 'trigonometry',
    name: 'Law of Sines',
    latex: '\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}',
    description: 'Relationship between sides and angles of any triangle',
    variables: [
      { symbol: 'a', name: 'side a', description: 'Side opposite to angle A' },
      { symbol: 'A', name: 'angle A', description: 'Angle opposite to side a' },
    ],
    relatedEquations: ['law-of-cosines'],
    difficulty: 2,
    tags: ['triangle', 'law'],
  },
  {
    id: 'law-of-cosines',
    category: 'trigonometry',
    name: 'Law of Cosines',
    latex: 'c^2 = a^2 + b^2 - 2ab\\cos C',
    description: 'Generalization of Pythagorean theorem to any triangle',
    variables: [
      { symbol: 'a', name: 'side a', description: 'First side' },
      { symbol: 'b', name: 'side b', description: 'Second side' },
      { symbol: 'c', name: 'side c', description: 'Third side' },
      { symbol: 'C', name: 'angle C', description: 'Angle opposite to side c' },
    ],
    relatedEquations: ['law-of-sines', 'pythagorean-theorem'],
    difficulty: 2,
    tags: ['triangle', 'law'],
  },
  {
    id: 'double-angle-sin',
    category: 'trigonometry',
    name: 'Double Angle (Sine)',
    latex: '\\sin(2\\theta) = 2\\sin\\theta\\cos\\theta',
    description: 'Sine of double angle formula',
    variables: [
      { symbol: '\\theta', name: 'angle', description: 'Original angle' },
    ],
    relatedEquations: ['double-angle-cos', 'sin-cos-identity'],
    difficulty: 2,
    tags: ['identity', 'double-angle'],
  },
  {
    id: 'double-angle-cos',
    category: 'trigonometry',
    name: 'Double Angle (Cosine)',
    latex: '\\cos(2\\theta) = \\cos^2\\theta - \\sin^2\\theta = 2\\cos^2\\theta - 1',
    description: 'Cosine of double angle formula',
    variables: [
      { symbol: '\\theta', name: 'angle', description: 'Original angle' },
    ],
    relatedEquations: ['double-angle-sin', 'sin-cos-identity'],
    difficulty: 2,
    tags: ['identity', 'double-angle'],
  },
  {
    id: 'euler-formula',
    category: 'trigonometry',
    name: "Euler's Formula",
    latex: 'e^{i\\theta} = \\cos\\theta + i\\sin\\theta',
    description: 'Connection between exponential and trigonometric functions',
    variables: [
      { symbol: 'e', name: 'Euler number', description: 'Mathematical constant ~2.718' },
      { symbol: 'i', name: 'imaginary unit', description: 'Square root of -1' },
      { symbol: '\\theta', name: 'angle', description: 'Angle in radians' },
    ],
    relatedEquations: ['euler-identity'],
    difficulty: 3,
    tags: ['euler', 'complex', 'exponential'],
  },
  {
    id: 'euler-identity',
    category: 'trigonometry',
    name: "Euler's Identity",
    latex: 'e^{i\\pi} + 1 = 0',
    description: 'The most beautiful equation in mathematics',
    variables: [
      { symbol: 'e', name: 'Euler number', description: '~2.71828' },
      { symbol: 'i', name: 'imaginary unit', description: 'Square root of -1' },
      { symbol: '\\pi', name: 'pi', description: '~3.14159' },
    ],
    relatedEquations: ['euler-formula'],
    difficulty: 2,
    tags: ['euler', 'identity', 'beautiful'],
  },

  {
    id: 'matrix-multiplication',
    category: 'linear-algebra',
    name: 'Matrix Multiplication',
    latex: '(AB)_{ij} = \\sum_{k=1}^{n} A_{ik}B_{kj}',
    description: 'Element-wise formula for matrix multiplication',
    variables: [
      { symbol: 'A', name: 'first matrix', description: 'm x n matrix' },
      { symbol: 'B', name: 'second matrix', description: 'n x p matrix' },
    ],
    relatedEquations: ['determinant-2x2'],
    difficulty: 2,
    tags: ['matrix', 'multiplication'],
  },
  {
    id: 'determinant-2x2',
    category: 'linear-algebra',
    name: '2x2 Determinant',
    latex: '\\det\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} = ad - bc',
    description: 'Determinant of a 2x2 matrix',
    variables: [
      { symbol: 'a,b,c,d', name: 'elements', description: 'Matrix elements' },
    ],
    relatedEquations: ['determinant-3x3'],
    difficulty: 1,
    tags: ['determinant', 'matrix'],
  },
  {
    id: 'determinant-3x3',
    category: 'linear-algebra',
    name: '3x3 Determinant',
    latex: '\\det(A) = a(ei-fh) - b(di-fg) + c(dh-eg)',
    description: 'Determinant of a 3x3 matrix using cofactor expansion',
    variables: [],
    relatedEquations: ['determinant-2x2'],
    difficulty: 2,
    tags: ['determinant', 'matrix'],
  },
  {
    id: 'eigenvalue-equation',
    category: 'linear-algebra',
    name: 'Eigenvalue Equation',
    latex: 'A\\vec{v} = \\lambda\\vec{v}',
    description: 'Definition of eigenvalues and eigenvectors',
    variables: [
      { symbol: 'A', name: 'matrix', description: 'Square matrix' },
      { symbol: '\\vec{v}', name: 'eigenvector', description: 'Eigenvector' },
      { symbol: '\\lambda', name: 'eigenvalue', description: 'Eigenvalue' },
    ],
    relatedEquations: ['characteristic-equation'],
    difficulty: 3,
    tags: ['eigenvalue', 'eigenvector'],
  },
  {
    id: 'characteristic-equation',
    category: 'linear-algebra',
    name: 'Characteristic Equation',
    latex: '\\det(A - \\lambda I) = 0',
    description: 'Equation to find eigenvalues',
    variables: [
      { symbol: 'A', name: 'matrix', description: 'Square matrix' },
      { symbol: '\\lambda', name: 'eigenvalue', description: 'Unknown eigenvalue' },
      { symbol: 'I', name: 'identity', description: 'Identity matrix' },
    ],
    relatedEquations: ['eigenvalue-equation'],
    difficulty: 3,
    tags: ['eigenvalue', 'characteristic'],
  },
  {
    id: 'dot-product',
    category: 'linear-algebra',
    name: 'Dot Product',
    latex: '\\vec{a} \\cdot \\vec{b} = |\\vec{a}||\\vec{b}|\\cos\\theta = \\sum_{i=1}^{n} a_i b_i',
    description: 'Scalar product of two vectors',
    variables: [
      { symbol: '\\vec{a}', name: 'first vector', description: 'First vector' },
      { symbol: '\\vec{b}', name: 'second vector', description: 'Second vector' },
      { symbol: '\\theta', name: 'angle', description: 'Angle between vectors' },
    ],
    relatedEquations: ['cross-product'],
    difficulty: 2,
    tags: ['vector', 'product'],
  },
  {
    id: 'cross-product',
    category: 'linear-algebra',
    name: 'Cross Product',
    latex: '\\vec{a} \\times \\vec{b} = |\\vec{a}||\\vec{b}|\\sin\\theta\\,\\hat{n}',
    description: 'Vector product of two 3D vectors',
    variables: [
      { symbol: '\\vec{a}', name: 'first vector', description: 'First vector' },
      { symbol: '\\vec{b}', name: 'second vector', description: 'Second vector' },
      { symbol: '\\hat{n}', name: 'normal', description: 'Unit normal vector' },
    ],
    relatedEquations: ['dot-product'],
    difficulty: 2,
    tags: ['vector', 'product', '3d'],
  },

  {
    id: 'bayes-theorem',
    category: 'probability',
    name: "Bayes' Theorem",
    latex: 'P(A|B) = \\frac{P(B|A)P(A)}{P(B)}',
    description: 'Relates conditional and marginal probabilities',
    variables: [
      { symbol: 'P(A|B)', name: 'posterior', description: 'Probability of A given B' },
      { symbol: 'P(B|A)', name: 'likelihood', description: 'Probability of B given A' },
      { symbol: 'P(A)', name: 'prior', description: 'Prior probability of A' },
      { symbol: 'P(B)', name: 'evidence', description: 'Probability of B' },
    ],
    relatedEquations: ['total-probability'],
    difficulty: 2,
    tags: ['probability', 'conditional', 'bayes'],
  },
  {
    id: 'total-probability',
    category: 'probability',
    name: 'Law of Total Probability',
    latex: 'P(A) = \\sum_{i} P(A|B_i)P(B_i)',
    description: 'Total probability as sum over partitions',
    variables: [
      { symbol: 'A', name: 'event', description: 'Event of interest' },
      { symbol: 'B_i', name: 'partition', description: 'Partition events' },
    ],
    relatedEquations: ['bayes-theorem'],
    difficulty: 2,
    tags: ['probability', 'partition'],
  },
  {
    id: 'expected-value',
    category: 'statistics',
    name: 'Expected Value',
    latex: 'E[X] = \\sum_{i} x_i P(x_i) = \\int x f(x)\\,dx',
    description: 'Mean of a random variable',
    variables: [
      { symbol: 'X', name: 'random variable', description: 'Random variable' },
      { symbol: 'x_i', name: 'values', description: 'Possible values' },
      { symbol: 'P(x_i)', name: 'probability', description: 'Probability of value' },
    ],
    relatedEquations: ['variance'],
    difficulty: 2,
    tags: ['statistics', 'mean', 'expectation'],
  },
  {
    id: 'variance',
    category: 'statistics',
    name: 'Variance',
    latex: '\\text{Var}(X) = E[(X-\\mu)^2] = E[X^2] - (E[X])^2',
    description: 'Measure of spread of a distribution',
    variables: [
      { symbol: 'X', name: 'random variable', description: 'Random variable' },
      { symbol: '\\mu', name: 'mean', description: 'Expected value' },
    ],
    relatedEquations: ['expected-value', 'standard-deviation'],
    difficulty: 2,
    tags: ['statistics', 'variance', 'spread'],
  },
  {
    id: 'standard-deviation',
    category: 'statistics',
    name: 'Standard Deviation',
    latex: '\\sigma = \\sqrt{\\text{Var}(X)}',
    description: 'Square root of variance',
    variables: [
      { symbol: '\\sigma', name: 'std dev', description: 'Standard deviation' },
    ],
    relatedEquations: ['variance'],
    difficulty: 1,
    tags: ['statistics', 'deviation'],
  },
  {
    id: 'normal-distribution',
    category: 'statistics',
    name: 'Normal Distribution',
    latex: 'f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}',
    description: 'Probability density function of normal distribution',
    variables: [
      { symbol: '\\mu', name: 'mean', description: 'Mean of distribution' },
      { symbol: '\\sigma', name: 'std dev', description: 'Standard deviation' },
    ],
    relatedEquations: ['variance', 'z-score'],
    difficulty: 3,
    tags: ['statistics', 'normal', 'gaussian'],
  },
  {
    id: 'z-score',
    category: 'statistics',
    name: 'Z-Score',
    latex: 'z = \\frac{x - \\mu}{\\sigma}',
    description: 'Standardized score measuring distance from mean',
    variables: [
      { symbol: 'z', name: 'z-score', description: 'Standardized value' },
      { symbol: 'x', name: 'value', description: 'Original value' },
      { symbol: '\\mu', name: 'mean', description: 'Population mean' },
      { symbol: '\\sigma', name: 'std dev', description: 'Population std dev' },
    ],
    relatedEquations: ['normal-distribution'],
    difficulty: 1,
    tags: ['statistics', 'standardization'],
  },

  {
    id: 'newton-second-law',
    category: 'physics',
    name: "Newton's Second Law",
    latex: 'F = ma',
    description: 'Force equals mass times acceleration',
    variables: [
      { symbol: 'F', name: 'force', description: 'Net force', unit: 'N' },
      { symbol: 'm', name: 'mass', description: 'Mass of object', unit: 'kg' },
      { symbol: 'a', name: 'acceleration', description: 'Acceleration', unit: 'm/s^2' },
    ],
    relatedEquations: ['kinetic-energy'],
    difficulty: 1,
    tags: ['physics', 'mechanics', 'newton'],
  },
  {
    id: 'kinetic-energy',
    category: 'physics',
    name: 'Kinetic Energy',
    latex: 'KE = \\frac{1}{2}mv^2',
    description: 'Energy of motion',
    variables: [
      { symbol: 'KE', name: 'kinetic energy', description: 'Energy', unit: 'J' },
      { symbol: 'm', name: 'mass', description: 'Mass', unit: 'kg' },
      { symbol: 'v', name: 'velocity', description: 'Speed', unit: 'm/s' },
    ],
    relatedEquations: ['potential-energy', 'newton-second-law'],
    difficulty: 1,
    tags: ['physics', 'energy'],
  },
  {
    id: 'potential-energy',
    category: 'physics',
    name: 'Gravitational Potential Energy',
    latex: 'PE = mgh',
    description: 'Energy due to gravitational position',
    variables: [
      { symbol: 'PE', name: 'potential energy', description: 'Energy', unit: 'J' },
      { symbol: 'm', name: 'mass', description: 'Mass', unit: 'kg' },
      { symbol: 'g', name: 'gravity', description: 'Gravitational acceleration', unit: 'm/s^2' },
      { symbol: 'h', name: 'height', description: 'Height above reference', unit: 'm' },
    ],
    relatedEquations: ['kinetic-energy'],
    difficulty: 1,
    tags: ['physics', 'energy', 'gravity'],
  },
  {
    id: 'wave-equation',
    category: 'physics',
    name: 'Wave Equation',
    latex: 'v = f\\lambda',
    description: 'Relationship between wave speed, frequency, and wavelength',
    variables: [
      { symbol: 'v', name: 'velocity', description: 'Wave speed', unit: 'm/s' },
      { symbol: 'f', name: 'frequency', description: 'Frequency', unit: 'Hz' },
      { symbol: '\\lambda', name: 'wavelength', description: 'Wavelength', unit: 'm' },
    ],
    relatedEquations: [],
    difficulty: 1,
    tags: ['physics', 'waves'],
  },
  {
    id: 'einstein-mass-energy',
    category: 'physics',
    name: 'Mass-Energy Equivalence',
    latex: 'E = mc^2',
    description: 'Energy equals mass times speed of light squared',
    variables: [
      { symbol: 'E', name: 'energy', description: 'Energy', unit: 'J' },
      { symbol: 'm', name: 'mass', description: 'Mass', unit: 'kg' },
      { symbol: 'c', name: 'speed of light', description: '~3x10^8 m/s', unit: 'm/s' },
    ],
    relatedEquations: [],
    difficulty: 1,
    tags: ['physics', 'relativity', 'einstein'],
  },
]

export const THEOREMS: Theorem[] = [
  {
    id: 'pythagorean-theorem',
    name: 'Pythagorean Theorem',
    statement: 'In a right triangle, the square of the hypotenuse equals the sum of squares of the other two sides: $a^2 + b^2 = c^2$',
    proofSteps: [
      { step: 1, description: 'Draw a right triangle with sides a, b, and hypotenuse c', justification: 'Given', animationHint: 'reveal' },
      { step: 2, description: 'Construct a square with side (a+b)', justification: 'Construction', animationHint: 'reveal' },
      { step: 3, description: 'Place four copies of the triangle inside the square', justification: 'Construction', animationHint: 'transform' },
      { step: 4, description: 'Calculate area two ways: (a+b)^2 = 4(ab/2) + c^2', latex: '(a+b)^2 = 2ab + c^2', justification: 'Area calculation', animationHint: 'highlight' },
      { step: 5, description: 'Expand and simplify to get a^2 + b^2 = c^2', latex: 'a^2 + 2ab + b^2 = 2ab + c^2', justification: 'Algebra', animationHint: 'transform' },
    ],
    prerequisites: ['right-triangle', 'area', 'algebra'],
    history: 'Known to ancient civilizations; famously attributed to Pythagoras (~570-495 BCE)',
    visualHints: ['Draw right triangle', 'Show square construction', 'Animate area calculation'],
  },
  {
    id: 'fundamental-theorem-calculus',
    name: 'Fundamental Theorem of Calculus',
    statement: 'If F is an antiderivative of f on [a,b], then $\\int_a^b f(x)dx = F(b) - F(a)$',
    proofSteps: [
      { step: 1, description: 'Define G(x) = integral from a to x of f(t)dt', latex: 'G(x) = \\int_a^x f(t)dt', justification: 'Definition', animationHint: 'reveal' },
      { step: 2, description: 'Show G\'(x) = f(x) using limit definition', justification: 'Part 1 of FTC', animationHint: 'transform' },
      { step: 3, description: 'Since F\'(x) = f(x) = G\'(x), we have F(x) = G(x) + C', justification: 'Antiderivatives differ by constant', animationHint: 'highlight' },
      { step: 4, description: 'Evaluate at endpoints to eliminate C', justification: 'Boundary conditions', animationHint: 'reveal' },
    ],
    prerequisites: ['derivative', 'integral', 'limit'],
    visualHints: ['Show area under curve', 'Animate accumulation function', 'Show derivative relationship'],
  },
]

export const DEFINITIONS: MathDefinition[] = [
  {
    term: 'Derivative',
    formalDefinition: 'The derivative of f at x is the limit of the difference quotient as h approaches 0',
    intuition: 'The instantaneous rate of change of a function; the slope of the tangent line',
    examples: ['Speed is the derivative of position', 'Slope of a curve at a point'],
    notation: "f'(x), \\frac{df}{dx}, Df",
  },
  {
    term: 'Integral',
    formalDefinition: 'The definite integral is the limit of Riemann sums as partition size approaches zero',
    intuition: 'The signed area under a curve; the accumulation of quantities',
    examples: ['Distance from velocity', 'Total mass from density'],
    notation: '\\int_a^b f(x)dx',
  },
  {
    term: 'Limit',
    formalDefinition: 'lim(x->a) f(x) = L means for every epsilon > 0, there exists delta > 0 such that |f(x)-L| < epsilon when 0 < |x-a| < delta',
    intuition: 'The value a function approaches as input approaches some value',
    examples: ['lim(x->0) sin(x)/x = 1', 'lim(x->inf) 1/x = 0'],
    notation: '\\lim_{x \\to a} f(x)',
  },
  {
    term: 'Eigenvalue',
    formalDefinition: 'A scalar lambda such that Av = lambda v for some nonzero vector v',
    intuition: 'A scaling factor for vectors that only change magnitude under a transformation',
    examples: ['Stretch factors of a transformation', 'Stability analysis'],
    notation: '\\lambda',
  },
]

export function findEquationsByCategory(category: MathCategory): LatexEquation[] {
  return LATEX_EQUATIONS.filter(eq => eq.category === category)
}

export function findEquationsByTag(tag: string): LatexEquation[] {
  return LATEX_EQUATIONS.filter(eq => eq.tags.includes(tag.toLowerCase()))
}

export function searchEquations(searchTerm: string): LatexEquation[] {
  const term = searchTerm.toLowerCase()
  return LATEX_EQUATIONS.filter(eq =>
    eq.name.toLowerCase().includes(term) ||
    eq.description.toLowerCase().includes(term) ||
    eq.tags.some(tag => tag.includes(term))
  )
}

export function getEquationById(id: string): LatexEquation | undefined {
  return LATEX_EQUATIONS.find(eq => eq.id === id)
}

export function getRelatedEquations(id: string): LatexEquation[] {
  const equation = getEquationById(id)
  if (!equation) return []

  return equation.relatedEquations
    .map(relId => getEquationById(relId))
    .filter((eq): eq is LatexEquation => eq !== undefined)
}

export function getTheoremById(id: string): Theorem | undefined {
  return THEOREMS.find(t => t.id === id)
}

export function getDefinitionByTerm(term: string): MathDefinition | undefined {
  return DEFINITIONS.find(d => d.term.toLowerCase() === term.toLowerCase())
}

export function findEquationsForConcept(concept: string): LatexEquation[] {
  const conceptLower = concept.toLowerCase()

  let results = searchEquations(concept)

  const categoryMatches: Record<string, MathCategory[]> = {
    'derivative': ['calculus'],
    'integral': ['calculus'],
    'limit': ['calculus'],
    'series': ['calculus'],
    'quadratic': ['algebra'],
    'exponential': ['algebra'],
    'logarithm': ['algebra'],
    'triangle': ['geometry', 'trigonometry'],
    'circle': ['geometry'],
    'sine': ['trigonometry'],
    'cosine': ['trigonometry'],
    'vector': ['linear-algebra'],
    'matrix': ['linear-algebra'],
    'probability': ['probability'],
    'statistics': ['statistics'],
    'physics': ['physics'],
  }

  for (const [keyword, categories] of Object.entries(categoryMatches)) {
    if (conceptLower.includes(keyword)) {
      for (const category of categories) {
        results = [...results, ...findEquationsByCategory(category)]
      }
    }
  }

  const seen = new Set<string>()
  return results.filter(eq => {
    if (seen.has(eq.id)) return false
    seen.add(eq.id)
    return true
  })
}

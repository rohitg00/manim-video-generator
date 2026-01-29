import type { AgentOutput, QualityScoreBreakdown, AnimationTask } from './types'
import type { SceneGraph } from '../types/scene.types'

export interface ScoringWeights {
  codeCorrectness: number
  visualAppeal: number
  pedagogicalClarity: number
  performanceEfficiency: number
  styleConsistency: number
}

const DEFAULT_WEIGHTS: ScoringWeights = {
  codeCorrectness: 0.30,
  visualAppeal: 0.20,
  pedagogicalClarity: 0.20,
  performanceEfficiency: 0.15,
  styleConsistency: 0.15,
}

function normalizeWeights(weights: ScoringWeights): ScoringWeights {
  const total = Object.values(weights).reduce((a, b) => a + b, 0)
  if (Math.abs(total - 1) <= 0.001) return weights

  const normalized = { ...weights }
  for (const key of Object.keys(normalized) as (keyof ScoringWeights)[]) {
    normalized[key] /= total
  }
  return normalized
}

function checkBalance(code: string, open: string, close: string): number {
  let balance = 0
  for (const char of code) {
    if (char === open) balance++
    if (char === close) balance--
  }
  return balance
}

function scoreCodeCorrectness(code: string): number {
  if (!code || code.length === 0) return 0

  let score = 1.0

  if (!code.includes('from manim import')) {
    score -= 0.2
  }

  if (!code.match(/class\s+\w+\s*\([^)]*Scene[^)]*\)\s*:/)) {
    score -= 0.3
  }

  if (!code.match(/def\s+construct\s*\(\s*self\s*\)\s*:/)) {
    score -= 0.3
  }

  if (checkBalance(code, '(', ')') !== 0) {
    score -= 0.2
  }

  if (checkBalance(code, '[', ']') !== 0) {
    score -= 0.1
  }

  if (!code.includes('self.play(')) {
    score -= 0.15
  }

  const hasObjects = code.match(/\b(Circle|Square|Text|MathTex|Axes|Line|Arrow|Dot)\s*\(/g)
  if (!hasObjects) {
    score -= 0.1
  }

  if (code.match(/\bundefined\b|\bNone\s*\.\w+/)) {
    score -= 0.1
  }

  return Math.max(0, Math.min(1, score))
}

function scoreVisualAppeal(sceneGraph: SceneGraph | undefined): number {
  if (!sceneGraph) {
    return 0.5
  }

  let score = 0.5

  const mobjectTypes = new Set<string>()
  for (const act of sceneGraph.acts) {
    for (const mobject of act.mobjects) {
      mobjectTypes.add(mobject.type)
    }
  }
  if (mobjectTypes.size >= 3) score += 0.15
  if (mobjectTypes.size >= 5) score += 0.1

  const style = sceneGraph.style
  if (style.primaryColor !== style.secondaryColor) score += 0.1
  if (style.accentColor && style.accentColor !== style.primaryColor) score += 0.05

  if (sceneGraph.acts.length >= 2) score += 0.1
  if (sceneGraph.acts.length >= 4) score += 0.05

  const hasTransitions = sceneGraph.acts.some(act => act.transition?.type !== 'none')
  if (hasTransitions) score += 0.05

  if (sceneGraph.totalDuration > 30) score -= 0.1

  return Math.max(0, Math.min(1, score))
}

function scorePedagogicalClarity(output: AgentOutput, task: AnimationTask): number {
  let score = 0.5

  if (output.insights.length > 0) {
    score += 0.1
    if (output.insights.length >= 3) score += 0.1
  }

  if (output.code) {
    const commentLines = (output.code.match(/#.*$/gm) || []).length
    const totalLines = output.code.split('\n').length
    const commentRatio = commentLines / totalLines

    if (commentRatio > 0.1) score += 0.1
    if (commentRatio > 0.2) score += 0.05
  }

  if (output.sceneGraph) {
    const hasTextLabels = output.sceneGraph.acts.some(act =>
      act.mobjects.some(m => m.type === 'Text' || m.type === 'MathTex')
    )
    if (hasTextLabels) score += 0.1
  }

  if (output.code && output.code.match(/self\.wait\s*\(/g)) {
    const waitCalls = (output.code.match(/self\.wait\s*\(/g) || []).length
    if (waitCalls >= 2) score += 0.1
    if (waitCalls >= 4) score += 0.05
  }

  const intent = task.nluResult.intent
  if (intent === 'EXPLAIN_CONCEPT' || intent === 'DEMONSTRATE_PROCESS') {
    if (output.sceneGraph && output.sceneGraph.acts.length >= 3) {
      score += 0.1
    }
  }

  return Math.max(0, Math.min(1, score))
}

function scorePerformanceEfficiency(code: string): number {
  if (!code) return 0.5

  let score = 0.8

  const lineCount = code.split('\n').length
  if (lineCount > 150) score -= 0.1
  if (lineCount > 200) score -= 0.1

  const expensivePatterns = [
    /for\s+\w+\s+in\s+range\s*\(\s*\d{3,}/g,
    /\.get_all_points\(\)/g,
    /NumberPlane\(\)/g,
  ]

  for (const pattern of expensivePatterns) {
    if (code.match(pattern)) {
      score -= 0.1
    }
  }

  if (code.match(/LaggedStart/)) score += 0.05
  if (code.match(/AnimationGroup/)) score += 0.05
  if (code.match(/VGroup/)) score += 0.05

  return Math.max(0, Math.min(1, score))
}

function scoreStyleConsistency(code: string, targetStyle: string): number {
  if (!code) return 0.5

  let score = 0.5

  const styleColors: Record<string, string[]> = {
    '3blue1brown': ['#58c4dd', '#83c167', '#ffff00', 'BLUE', 'GREEN', 'YELLOW'],
    'minimalist': ['#333333', '#666666', '#0066cc', 'WHITE', 'BLACK'],
    'playful': ['#e17055', '#00cec9', '#6c5ce7', 'ORANGE', 'TEAL', 'PURPLE'],
    'corporate': ['#3498db', '#95a5a6', '#e74c3c', 'BLUE', 'GRAY', 'RED'],
    'neon': ['#00ffff', '#ff00ff', '#00ff00', 'CYAN', 'MAGENTA', 'GREEN'],
  }

  const expectedColors = styleColors[targetStyle] || styleColors['3blue1brown']
  let colorMatches = 0

  for (const color of expectedColors) {
    if (code.toLowerCase().includes(color.toLowerCase())) {
      colorMatches++
    }
  }

  if (colorMatches > 0) score += 0.2
  if (colorMatches >= 2) score += 0.1
  if (colorMatches >= 3) score += 0.1

  const rateFuncMatches = code.match(/rate_func\s*=\s*\w+/g) || []
  if (rateFuncMatches.length > 0) {
    const uniqueRateFuncs = new Set(rateFuncMatches)
    if (uniqueRateFuncs.size <= 2) score += 0.1
  }

  return Math.max(0, Math.min(1, score))
}

export function scoreOutput(
  output: AgentOutput,
  task: AnimationTask,
  weights: Partial<ScoringWeights> = {}
): QualityScoreBreakdown {
  const normalizedWeights = normalizeWeights({ ...DEFAULT_WEIGHTS, ...weights })

  const codeCorrectness = scoreCodeCorrectness(output.code || '')
  const visualAppeal = scoreVisualAppeal(output.sceneGraph)
  const pedagogicalClarity = scorePedagogicalClarity(output, task)
  const performanceEfficiency = scorePerformanceEfficiency(output.code || '')
  const styleConsistency = scoreStyleConsistency(output.code || '', task.style)

  const overall =
    codeCorrectness * normalizedWeights.codeCorrectness +
    visualAppeal * normalizedWeights.visualAppeal +
    pedagogicalClarity * normalizedWeights.pedagogicalClarity +
    performanceEfficiency * normalizedWeights.performanceEfficiency +
    styleConsistency * normalizedWeights.styleConsistency

  return {
    codeCorrectness,
    visualAppeal,
    pedagogicalClarity,
    performanceEfficiency,
    styleConsistency,
    overall,
  }
}

export function rankOutputs(
  outputs: AgentOutput[],
  task: AnimationTask,
  weights?: Partial<ScoringWeights>
): Array<{
  output: AgentOutput
  breakdown: QualityScoreBreakdown
  rank: number
}> {
  const scored = outputs.map(output => ({
    output,
    breakdown: scoreOutput(output, task, weights),
  }))

  scored.sort((a, b) => b.breakdown.overall - a.breakdown.overall)

  return scored.map((item, index) => ({
    ...item,
    rank: index + 1,
  }))
}

export function selectBestOutput(
  outputs: AgentOutput[],
  task: AnimationTask,
  weights?: Partial<ScoringWeights>
): {
  winner: AgentOutput
  breakdown: QualityScoreBreakdown
  runners: Array<{ output: AgentOutput; breakdown: QualityScoreBreakdown }>
} | null {
  if (outputs.length === 0) return null

  const ranked = rankOutputs(outputs, task, weights)
  const winner = ranked[0]
  const runners = ranked.slice(1).map(r => ({
    output: r.output,
    breakdown: r.breakdown,
  }))

  return {
    winner: winner.output,
    breakdown: winner.breakdown,
    runners,
  }
}

export function getFeedback(
  output: AgentOutput,
  task: AnimationTask,
  weights?: Partial<ScoringWeights>
): {
  breakdown: QualityScoreBreakdown
  strengths: string[]
  improvements: string[]
} {
  const breakdown = scoreOutput(output, task, weights)
  const strengths: string[] = []
  const improvements: string[] = []

  if (breakdown.codeCorrectness >= 0.8) {
    strengths.push('Well-structured and syntactically correct code')
  } else if (breakdown.codeCorrectness < 0.5) {
    improvements.push('Fix code syntax issues and ensure proper Manim structure')
  }

  if (breakdown.visualAppeal >= 0.7) {
    strengths.push('Good visual variety and appealing design')
  } else if (breakdown.visualAppeal < 0.4) {
    improvements.push('Add more visual elements and color variety')
  }

  if (breakdown.pedagogicalClarity >= 0.7) {
    strengths.push('Clear explanation with good pacing')
  } else if (breakdown.pedagogicalClarity < 0.4) {
    improvements.push('Add more explanatory elements and better pacing')
  }

  if (breakdown.performanceEfficiency >= 0.7) {
    strengths.push('Efficient code with good performance')
  } else if (breakdown.performanceEfficiency < 0.4) {
    improvements.push('Optimize code for better rendering performance')
  }

  if (breakdown.styleConsistency >= 0.7) {
    strengths.push('Consistent visual style throughout')
  } else if (breakdown.styleConsistency < 0.4) {
    improvements.push('Use more consistent colors and animation styles')
  }

  return { breakdown, strengths, improvements }
}

export { DEFAULT_WEIGHTS }

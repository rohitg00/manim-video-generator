import type {
  AgentOutput,
  AgentType,
  AnimationTask,
  SwarmResult,
  ConflictResolution,
  SwarmMode,
  Conflict,
} from './types'
import type { SceneGraph, Act } from '../types/scene.types'
import { scoreOutput, selectBestOutput } from './quality-scorer'

export type AggregationStrategy = 'best-wins' | 'merge' | 'sequential' | 'weighted-merge'

const AGENT_PRIORITIES: Record<AgentType, number> = {
  'code-generator': 10,
  'quality-reviewer': 9,
  'visual-designer': 8,
  'math-enricher': 7,
  'narrative-composer': 6,
  'prerequisite-explorer': 5,
  'style-harmonizer': 4,
}

function detectCodeConflict(outputs: AgentOutput[]): Conflict | null {
  const codeOutputs = outputs.filter(o => o.code && o.code.length > 0)
  if (codeOutputs.length <= 1) return null

  const classNames = codeOutputs.map(o => {
    const match = o.code?.match(/class\s+(\w+)\s*\(/)
    return match ? match[1] : null
  }).filter(Boolean)

  const uniqueClassNames = new Set(classNames)

  if (uniqueClassNames.size > 1) {
    return {
      id: `conflict-${Date.now()}`,
      agents: codeOutputs.map(o => o.agent),
      type: 'code-overlap',
      description: `Multiple agents produced different class structures: ${Array.from(uniqueClassNames).join(', ')}`,
      items: codeOutputs.map(o => ({ agent: o.agent, code: o.code })),
      severity: 3,
      timestamp: Date.now(),
    }
  }

  return null
}

function detectStyleConflict(outputs: AgentOutput[]): Conflict | null {
  const sceneGraphOutputs = outputs.filter(o => o.sceneGraph)
  if (sceneGraphOutputs.length <= 1) return null

  const styles = sceneGraphOutputs.map(o => o.sceneGraph!.style.preset)
  const uniqueStyles = new Set(styles)

  if (uniqueStyles.size > 1) {
    return {
      id: `conflict-${Date.now()}-style`,
      agents: sceneGraphOutputs.map(o => o.agent),
      type: 'style-mismatch',
      description: `Agents disagree on visual style: ${Array.from(uniqueStyles).join(', ')}`,
      items: sceneGraphOutputs.map(o => ({
        agent: o.agent,
        style: o.sceneGraph!.style.preset,
      })),
      severity: 2,
      timestamp: Date.now(),
    }
  }

  return null
}

export function detectConflicts(outputs: AgentOutput[]): Conflict[] {
  const conflicts: Conflict[] = []

  const codeConflict = detectCodeConflict(outputs)
  if (codeConflict) conflicts.push(codeConflict)

  const styleConflict = detectStyleConflict(outputs)
  if (styleConflict) conflicts.push(styleConflict)

  return conflicts
}

export function resolveConflict(
  conflict: Conflict,
  outputs: AgentOutput[],
  task: AnimationTask,
  strategy: 'voting' | 'priority' | 'first-wins' | 'best-quality'
): ConflictResolution {
  const conflictOutputs = outputs.filter(o => conflict.agents.includes(o.agent))

  switch (strategy) {
    case 'best-quality': {
      const result = selectBestOutput(conflictOutputs, task)
      if (result) {
        return {
          conflictId: conflict.id,
          method: 'voting',
          winner: result.winner.agent,
          description: `Resolved by quality: ${result.winner.agent} scored ${result.breakdown.overall.toFixed(2)}`,
          resolvedValue: result.winner.code || result.winner.sceneGraph,
          timestamp: Date.now(),
        }
      }
    }

    case 'priority': {
      let winner: AgentType | undefined
      let maxPriority = -1

      for (const agent of conflict.agents) {
        const priority = AGENT_PRIORITIES[agent] || 0
        if (priority > maxPriority) {
          maxPriority = priority
          winner = agent
        }
      }

      const winnerOutput = outputs.find(o => o.agent === winner)
      return {
        conflictId: conflict.id,
        method: 'priority',
        winner,
        description: `Resolved by priority: ${winner} has highest priority (${maxPriority})`,
        resolvedValue: winnerOutput?.code || winnerOutput?.sceneGraph,
        timestamp: Date.now(),
      }
    }

    case 'first-wins': {
      const sorted = [...conflictOutputs].sort((a, b) => a.processingTime - b.processingTime)
      const winner = sorted[0]?.agent

      return {
        conflictId: conflict.id,
        method: 'override',
        winner,
        description: `Resolved by first-wins: ${winner} completed first`,
        resolvedValue: sorted[0]?.code || sorted[0]?.sceneGraph,
        timestamp: Date.now(),
      }
    }

    case 'voting':
    default: {
      const votes = new Map<AgentType, number>()

      for (const output of outputs) {
        votes.set(output.agent, (votes.get(output.agent) || 0) + output.qualityScore)

        for (const suggestion of output.suggestions) {
          if (suggestion.targetAgent !== 'all' && conflict.agents.includes(suggestion.targetAgent)) {
            const delta = suggestion.type === 'warning' ? -0.2 : 0.2
            votes.set(
              suggestion.targetAgent,
              (votes.get(suggestion.targetAgent) || 0) + delta * suggestion.priority
            )
          }
        }
      }

      let winner: AgentType | undefined
      let maxVotes = -Infinity

      for (const [agent, voteCount] of votes) {
        if (voteCount > maxVotes) {
          maxVotes = voteCount
          winner = agent
        }
      }

      const winnerOutput = outputs.find(o => o.agent === winner)

      return {
        conflictId: conflict.id,
        method: 'voting',
        winner,
        description: `Resolved by voting: ${winner} won with score ${maxVotes.toFixed(2)}`,
        resolvedValue: winnerOutput?.code || winnerOutput?.sceneGraph,
        timestamp: Date.now(),
      }
    }
  }
}

function mergeSceneGraphs(outputs: AgentOutput[]): SceneGraph | undefined {
  const sceneGraphs = outputs
    .map(o => o.sceneGraph)
    .filter((sg): sg is SceneGraph => sg !== undefined)

  if (sceneGraphs.length === 0) return undefined
  if (sceneGraphs.length === 1) return sceneGraphs[0]

  const base = selectBestSceneGraph(outputs)
  if (!base) return undefined

  const mergedActs: Act[] = [...base.acts]
  const existingActTitles = new Set(mergedActs.map(a => a.title))

  for (const sg of sceneGraphs) {
    if (sg.id === base.id) continue

    for (const act of sg.acts) {
      if (!existingActTitles.has(act.title) && act.mobjects.length > 0) {
        mergedActs.push(act)
        existingActTitles.add(act.title)
      }
    }
  }

  return {
    ...base,
    acts: mergedActs,
    totalDuration: mergedActs.reduce((sum, a) => sum + a.duration, 0),
  }
}

function selectBestSceneGraph(outputs: AgentOutput[]): SceneGraph | undefined {
  const withSceneGraph = outputs.filter(o => o.sceneGraph)

  if (withSceneGraph.length === 0) return undefined
  if (withSceneGraph.length === 1) return withSceneGraph[0].sceneGraph

  return withSceneGraph.sort((a, b) => {
    const aActs = a.sceneGraph!.acts.length
    const bActs = b.sceneGraph!.acts.length
    if (aActs !== bActs) return bActs - aActs

    const aMobjects = a.sceneGraph!.acts.reduce((sum, act) => sum + act.mobjects.length, 0)
    const bMobjects = b.sceneGraph!.acts.reduce((sum, act) => sum + act.mobjects.length, 0)
    return bMobjects - aMobjects
  })[0].sceneGraph
}

function mergeCode(outputs: AgentOutput[]): string {
  const codeOutputs = outputs.filter(o => o.code && o.code.length > 0)

  if (codeOutputs.length === 0) return ''
  if (codeOutputs.length === 1) return codeOutputs[0].code!

  const sorted = [...codeOutputs].sort((a, b) => b.qualityScore - a.qualityScore)

  let baseCode = sorted[0].code!

  for (let i = 1; i < sorted.length; i++) {
    const otherCode = sorted[i].code!
    const comments = otherCode.match(/#.*$/gm) || []

    for (const comment of comments) {
      if (!baseCode.includes(comment) && comment.length > 10) {
        const classMatch = baseCode.match(/class\s+\w+/)
        if (classMatch && classMatch.index !== undefined) {
          baseCode =
            baseCode.slice(0, classMatch.index) +
            comment + '\n' +
            baseCode.slice(classMatch.index)
        }
      }
    }
  }

  return baseCode
}

function aggregateBestWins(
  outputs: AgentOutput[],
  task: AnimationTask,
  conflictResolutions: ConflictResolution[]
): {
  code: string
  sceneGraph?: SceneGraph
  qualityScore: number
  conflictResolutions: ConflictResolution[]
  warnings: string[]
} {
  const result = selectBestOutput(outputs.filter(o => o.code), task)
  const warnings: string[] = []

  if (!result) {
    const sceneGraphOutput = outputs.find(o => o.sceneGraph)
    return {
      code: '',
      sceneGraph: sceneGraphOutput?.sceneGraph,
      qualityScore: 0,
      conflictResolutions,
      warnings: ['No code output available from any agent'],
    }
  }

  for (const runner of result.runners) {
    if (runner.breakdown.overall < 0.5) {
      warnings.push(`Agent ${runner.output.agent} produced low-quality output (${runner.breakdown.overall.toFixed(2)})`)
    }
  }

  return {
    code: result.winner.code || '',
    sceneGraph: result.winner.sceneGraph,
    qualityScore: result.breakdown.overall,
    conflictResolutions,
    warnings,
  }
}

function aggregateMerge(
  outputs: AgentOutput[],
  conflictResolutions: ConflictResolution[]
): {
  code: string
  sceneGraph?: SceneGraph
  qualityScore: number
  conflictResolutions: ConflictResolution[]
  warnings: string[]
} {
  const mergedCode = mergeCode(outputs)
  const warnings: string[] = []
  const sceneGraph = mergeSceneGraphs(outputs)
  const qualityScore = outputs.reduce((sum, o) => sum + o.qualityScore, 0) / outputs.length

  if (outputs.length > 1) {
    warnings.push(`Merged output from ${outputs.length} agents`)
  }

  return {
    code: mergedCode,
    sceneGraph,
    qualityScore,
    conflictResolutions,
    warnings,
  }
}

function aggregateSequential(
  outputs: AgentOutput[],
  conflictResolutions: ConflictResolution[]
): {
  code: string
  sceneGraph?: SceneGraph
  qualityScore: number
  conflictResolutions: ConflictResolution[]
  warnings: string[]
} {
  const warnings: string[] = []
  const codeOutput = outputs.find(o => o.agent === 'code-generator')
  const reviewOutput = outputs.find(o => o.agent === 'quality-reviewer')

  let finalCode = codeOutput?.code || ''
  let qualityScore = codeOutput?.qualityScore || 0

  if (reviewOutput && reviewOutput.suggestions.length > 0) {
    for (const suggestion of reviewOutput.suggestions) {
      if (suggestion.type === 'enhancement' && suggestion.priority > 0.7) {
        warnings.push(`Review suggestion: ${suggestion.content}`)
      }
    }
    qualityScore = reviewOutput.qualityScore
  }

  const sceneGraph = selectBestSceneGraph(outputs)

  return {
    code: finalCode,
    sceneGraph,
    qualityScore,
    conflictResolutions,
    warnings,
  }
}

function aggregateWeightedMerge(
  outputs: AgentOutput[],
  task: AnimationTask,
  conflictResolutions: ConflictResolution[]
): {
  code: string
  sceneGraph?: SceneGraph
  qualityScore: number
  conflictResolutions: ConflictResolution[]
  warnings: string[]
} {
  const warnings: string[] = []

  const scored = outputs.map(output => ({
    output,
    breakdown: scoreOutput(output, task),
  }))

  const totalQuality = scored.reduce((sum, s) => sum + s.breakdown.overall, 0)
  const weights = scored.map(s => s.breakdown.overall / totalQuality)

  const bestIndex = weights.indexOf(Math.max(...weights))
  const bestOutput = scored[bestIndex].output

  const qualityScore = scored.reduce(
    (sum, s, i) => sum + s.breakdown.overall * weights[i],
    0
  )

  const allInsights = scored
    .flatMap((s, i) => s.output.insights.map(insight => ({ insight, weight: weights[i] })))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5)
    .map(i => i.insight)

  if (allInsights.length > 0) {
    warnings.push(`Top insights: ${allInsights.join('; ')}`)
  }

  return {
    code: bestOutput.code || '',
    sceneGraph: bestOutput.sceneGraph,
    qualityScore,
    conflictResolutions,
    warnings,
  }
}

export function aggregateOutputs(
  outputs: Map<AgentType, AgentOutput> | AgentOutput[],
  task: AnimationTask,
  strategy: AggregationStrategy = 'best-wins'
): {
  code: string
  sceneGraph?: SceneGraph
  qualityScore: number
  conflictResolutions: ConflictResolution[]
  warnings: string[]
} {
  const outputArray = outputs instanceof Map ? Array.from(outputs.values()) : outputs

  const conflicts = detectConflicts(outputArray)
  const conflictResolutions: ConflictResolution[] = conflicts.map(conflict =>
    resolveConflict(conflict, outputArray, task, 'best-quality')
  )

  switch (strategy) {
    case 'best-wins':
      return aggregateBestWins(outputArray, task, conflictResolutions)
    case 'merge':
      return aggregateMerge(outputArray, conflictResolutions)
    case 'sequential':
      return aggregateSequential(outputArray, conflictResolutions)
    case 'weighted-merge':
      return aggregateWeightedMerge(outputArray, task, conflictResolutions)
    default:
      return aggregateBestWins(outputArray, task, conflictResolutions)
  }
}

export function createSwarmResult(
  taskId: string,
  jobId: string,
  outputs: Map<AgentType, AgentOutput>,
  task: AnimationTask,
  mode: SwarmMode,
  startTime: number,
  iterations: number = 1,
  strategy: AggregationStrategy = 'best-wins'
): SwarmResult {
  const aggregated = aggregateOutputs(outputs, task, strategy)

  return {
    taskId,
    jobId,
    success: aggregated.code.length > 0 || aggregated.sceneGraph !== undefined,
    code: aggregated.code,
    sceneGraph: aggregated.sceneGraph,
    mode,
    participatingAgents: Array.from(outputs.keys()),
    agentOutputs: outputs,
    qualityScore: aggregated.qualityScore,
    totalTime: Date.now() - startTime,
    iterations,
    conflictResolutions: aggregated.conflictResolutions,
    warnings: aggregated.warnings,
  }
}

export function getOutputStats(outputs: Map<AgentType, AgentOutput> | AgentOutput[]): {
  totalOutputs: number
  withCode: number
  withSceneGraph: number
  avgQualityScore: number
  successRate: number
} {
  const outputArray = outputs instanceof Map ? Array.from(outputs.values()) : outputs
  const withCode = outputArray.filter(o => o.code && o.code.length > 0).length
  const withSceneGraph = outputArray.filter(o => o.sceneGraph).length
  const successful = outputArray.filter(o => o.success).length

  return {
    totalOutputs: outputArray.length,
    withCode,
    withSceneGraph,
    avgQualityScore: outputArray.reduce((sum, o) => sum + o.qualityScore, 0) / outputArray.length,
    successRate: successful / outputArray.length,
  }
}

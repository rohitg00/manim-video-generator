
import type {
  AgentOutput,
  AgentType,
  AnimationTask,
  SwarmResult,
  ConflictResolution,
  SwarmMode,
} from './types'
import type { SceneGraph, Act } from '../types/scene.types'
import { getQualityScorer } from './quality-scorer'
import { getConflictResolver } from './conflict-resolver'

type AggregationStrategy = 'best-wins' | 'merge' | 'sequential' | 'weighted-merge'

export class ResultAggregator {
  private strategy: AggregationStrategy

  constructor(strategy: AggregationStrategy = 'best-wins') {
    this.strategy = strategy
  }

  aggregate(
    outputs: Map<AgentType, AgentOutput>,
    task: AnimationTask,
    mode: SwarmMode
  ): {
    code: string
    sceneGraph?: SceneGraph
    qualityScore: number
    conflictResolutions: ConflictResolution[]
    warnings: string[]
  } {
    const outputArray = Array.from(outputs.values())

    const resolver = getConflictResolver()
    const conflicts = resolver.detectConflicts(outputArray)
    const conflictResolutions: ConflictResolution[] = []

    for (const conflict of conflicts) {
      const resolution = resolver.resolve(
        conflict,
        outputArray,
        task,
        'best-quality'
      )
      conflictResolutions.push(resolution)
    }

    switch (this.strategy) {
      case 'best-wins':
        return this.aggregateBestWins(outputArray, task, mode, conflictResolutions)
      case 'merge':
        return this.aggregateMerge(outputArray, task, mode, conflictResolutions)
      case 'sequential':
        return this.aggregateSequential(outputArray, task, mode, conflictResolutions)
      case 'weighted-merge':
        return this.aggregateWeightedMerge(outputArray, task, mode, conflictResolutions)
      default:
        return this.aggregateBestWins(outputArray, task, mode, conflictResolutions)
    }
  }

  private aggregateBestWins(
    outputs: AgentOutput[],
    task: AnimationTask,
    mode: SwarmMode,
    conflictResolutions: ConflictResolution[]
  ): {
    code: string
    sceneGraph?: SceneGraph
    qualityScore: number
    conflictResolutions: ConflictResolution[]
    warnings: string[]
  } {
    const scorer = getQualityScorer()
    const result = scorer.selectBest(outputs.filter(o => o.code), task)
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

  private aggregateMerge(
    outputs: AgentOutput[],
    task: AnimationTask,
    mode: SwarmMode,
    conflictResolutions: ConflictResolution[]
  ): {
    code: string
    sceneGraph?: SceneGraph
    qualityScore: number
    conflictResolutions: ConflictResolution[]
    warnings: string[]
  } {
    const resolver = getConflictResolver()
    const mergedCode = resolver.mergeCode(outputs)
    const warnings: string[] = []

    const sceneGraph = this.mergeSceneGraphs(outputs)

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

  private aggregateSequential(
    outputs: AgentOutput[],
    task: AnimationTask,
    mode: SwarmMode,
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

    const sceneGraph = this.selectBestSceneGraph(outputs)

    return {
      code: finalCode,
      sceneGraph,
      qualityScore,
      conflictResolutions,
      warnings,
    }
  }

  private aggregateWeightedMerge(
    outputs: AgentOutput[],
    task: AnimationTask,
    mode: SwarmMode,
    conflictResolutions: ConflictResolution[]
  ): {
    code: string
    sceneGraph?: SceneGraph
    qualityScore: number
    conflictResolutions: ConflictResolution[]
    warnings: string[]
  } {
    const scorer = getQualityScorer()
    const warnings: string[] = []

    const scored = outputs.map(output => ({
      output,
      breakdown: scorer.score(output, task),
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

  private mergeSceneGraphs(outputs: AgentOutput[]): SceneGraph | undefined {
    const sceneGraphs = outputs
      .map(o => o.sceneGraph)
      .filter((sg): sg is SceneGraph => sg !== undefined)

    if (sceneGraphs.length === 0) return undefined
    if (sceneGraphs.length === 1) return sceneGraphs[0]

    const base = this.selectBestSceneGraph(outputs)
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

  private selectBestSceneGraph(outputs: AgentOutput[]): SceneGraph | undefined {
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

  createSwarmResult(
    taskId: string,
    jobId: string,
    outputs: Map<AgentType, AgentOutput>,
    task: AnimationTask,
    mode: SwarmMode,
    startTime: number,
    iterations: number
  ): SwarmResult {
    const aggregated = this.aggregate(outputs, task, mode)

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

  setStrategy(strategy: AggregationStrategy): void {
    this.strategy = strategy
  }

  getStrategy(): AggregationStrategy {
    return this.strategy
  }

  getStats(outputs: Map<AgentType, AgentOutput>): {
    totalOutputs: number
    withCode: number
    withSceneGraph: number
    avgQualityScore: number
    successRate: number
  } {
    const outputArray = Array.from(outputs.values())
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
}

let resultAggregator: ResultAggregator | null = null

export function getResultAggregator(strategy?: AggregationStrategy): ResultAggregator {
  if (!resultAggregator) {
    resultAggregator = new ResultAggregator(strategy)
  }
  return resultAggregator
}

export function resetResultAggregator(): void {
  resultAggregator = null
}

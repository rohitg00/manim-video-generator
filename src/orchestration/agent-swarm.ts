
import { v4 as uuidv4 } from 'uuid'
import type {
  Agent,
  AgentType,
  AgentOutput,
  AnimationTask,
  SwarmConfig,
  SwarmResult,
  SwarmMode,
  TaskContext,
  Conflict,
} from './types'
import { DEFAULT_SWARM_CONFIG } from './types'
import { getCommunicationHub } from './agent-communication'
import { getTaskDistributor } from './task-distributor'
import { getResultAggregator } from './result-aggregator'
import { getConflictResolver } from './conflict-resolver'
import { getQualityScorer } from './quality-scorer'
import { createAgents } from './base-agent'
import type { NLUResult, StylePreset } from '../types/nlu.types'

export interface AgentSwarm {
  agents: Agent[]
  mode: SwarmMode
  coordinate(task: AnimationTask): Promise<SwarmResult>
}

export class AgentSwarmCoordinator implements AgentSwarm {
  private config: SwarmConfig
  private agentMap: Map<AgentType, Agent>
  private communicationHub = getCommunicationHub()
  private taskDistributor = getTaskDistributor()
  private resultAggregator = getResultAggregator()
  private conflictResolver = getConflictResolver()
  private qualityScorer = getQualityScorer()

  constructor(config: Partial<SwarmConfig> = {}) {
    this.config = { ...DEFAULT_SWARM_CONFIG, ...config }
    this.agentMap = createAgents()
    this.conflictResolver.setVotingThreshold(this.config.votingThreshold)

    for (const [type, agent] of this.agentMap) {
      if (this.config.agents.includes(type)) {
        this.communicationHub.registerAgent(type)
      }
    }
  }

  get agents(): Agent[] {
    return this.config.agents
      .map(type => this.agentMap.get(type))
      .filter((agent): agent is Agent => agent !== undefined)
  }

  get mode(): SwarmMode {
    return this.config.mode
  }

  async coordinate(task: AnimationTask): Promise<SwarmResult> {
    const startTime = Date.now()
    await this.communicationHub.emitEvent('swarm.started', task.id, { mode: this.mode })

    try {
      let result: SwarmResult

      switch (this.mode) {
        case 'sequential':
          result = await this.coordinateSequential(task, startTime)
          break
        case 'parallel':
          result = await this.coordinateParallel(task, startTime)
          break
        case 'collaborative':
          result = await this.coordinateCollaborative(task, startTime)
          break
        case 'competitive':
          result = await this.coordinateCompetitive(task, startTime)
          break
        default:
          result = await this.coordinateSequential(task, startTime)
      }

      await this.communicationHub.emitEvent('swarm.completed', task.id, {
        success: result.success,
        mode: this.mode,
        totalTime: result.totalTime,
      })

      return result
    } catch (error) {
      await this.communicationHub.emitEvent('swarm.failed', task.id, {
        error: String(error),
      })

      return {
        taskId: task.id,
        jobId: task.jobId,
        success: false,
        code: '',
        mode: this.mode,
        participatingAgents: [],
        agentOutputs: new Map(),
        qualityScore: 0,
        totalTime: Date.now() - startTime,
        iterations: 0,
        conflictResolutions: [],
        warnings: [`Swarm coordination failed: ${error}`],
      }
    }
  }

  private async coordinateSequential(
    task: AnimationTask,
    startTime: number
  ): Promise<SwarmResult> {
    const outputs = new Map<AgentType, AgentOutput>()
    const context: TaskContext = {
      previousOutputs: new Map(),
      insights: [],
      sharedData: {},
      iteration: 1,
      notes: [],
    }

    for (const agentType of this.config.agents) {
      const agent = this.agentMap.get(agentType)
      if (!agent) continue

      if (Date.now() - startTime > this.config.totalTimeout) {
        context.notes.push(`Timeout reached - skipping ${agentType}`)
        break
      }

      if (!agent.canHandle({ ...task, context })) {
        context.notes.push(`${agentType} cannot handle this task - skipping`)
        continue
      }

      await this.communicationHub.emitEvent('agent.started', task.id, { agent: agentType })

      try {
        const output = await this.runAgentWithTimeout(
          agent,
          { ...task, context },
          this.config.agentTimeout
        )

        outputs.set(agentType, output)
        context.previousOutputs.set(agentType, output)
        context.insights.push(...output.insights)

        await this.communicationHub.emitEvent('agent.completed', task.id, {
          agent: agentType,
          success: output.success,
          qualityScore: output.qualityScore,
        })
      } catch (error) {
        const failedOutput: AgentOutput = {
          agent: agentType,
          success: false,
          insights: [],
          suggestions: [],
          qualityScore: 0,
          processingTime: 0,
          error: String(error),
        }
        outputs.set(agentType, failedOutput)

        await this.communicationHub.emitEvent('agent.failed', task.id, {
          agent: agentType,
          error: String(error),
        })
      }
    }

    return this.resultAggregator.createSwarmResult(
      task.id,
      task.jobId,
      outputs,
      task,
      'sequential',
      startTime,
      1
    )
  }

  private async coordinateParallel(
    task: AnimationTask,
    startTime: number
  ): Promise<SwarmResult> {
    const outputs = new Map<AgentType, AgentOutput>()

    const independentAgents: AgentType[] = [
      'prerequisite-explorer',
      'math-enricher',
      'visual-designer',
      'narrative-composer',
    ].filter(a => this.config.agents.includes(a))

    const dependentAgents: AgentType[] = [
      'code-generator',
      'quality-reviewer',
      'style-harmonizer',
    ].filter(a => this.config.agents.includes(a))

    const independentPromises = independentAgents.map(async (agentType) => {
      const agent = this.agentMap.get(agentType)
      if (!agent || !agent.canHandle(task)) return null

      await this.communicationHub.emitEvent('agent.started', task.id, { agent: agentType })

      try {
        const output = await this.runAgentWithTimeout(agent, task, this.config.agentTimeout)
        await this.communicationHub.emitEvent('agent.completed', task.id, {
          agent: agentType,
          success: output.success,
        })
        return { agentType, output }
      } catch (error) {
        await this.communicationHub.emitEvent('agent.failed', task.id, {
          agent: agentType,
          error: String(error),
        })
        return {
          agentType,
          output: {
            agent: agentType,
            success: false,
            insights: [],
            suggestions: [],
            qualityScore: 0,
            processingTime: 0,
            error: String(error),
          } as AgentOutput,
        }
      }
    })

    const independentResults = await Promise.all(independentPromises)

    const context: TaskContext = {
      previousOutputs: new Map(),
      insights: [],
      sharedData: {},
      iteration: 1,
      notes: [],
    }

    for (const result of independentResults) {
      if (result) {
        outputs.set(result.agentType, result.output)
        context.previousOutputs.set(result.agentType, result.output)
        context.insights.push(...result.output.insights)
      }
    }

    for (const agentType of dependentAgents) {
      const agent = this.agentMap.get(agentType)
      if (!agent || !agent.canHandle({ ...task, context })) continue

      await this.communicationHub.emitEvent('agent.started', task.id, { agent: agentType })

      try {
        const output = await this.runAgentWithTimeout(
          agent,
          { ...task, context },
          this.config.agentTimeout
        )
        outputs.set(agentType, output)
        context.previousOutputs.set(agentType, output)
        context.insights.push(...output.insights)

        await this.communicationHub.emitEvent('agent.completed', task.id, {
          agent: agentType,
          success: output.success,
        })
      } catch (error) {
        await this.communicationHub.emitEvent('agent.failed', task.id, {
          agent: agentType,
          error: String(error),
        })
      }
    }

    return this.resultAggregator.createSwarmResult(
      task.id,
      task.jobId,
      outputs,
      task,
      'parallel',
      startTime,
      1
    )
  }

  private async coordinateCollaborative(
    task: AnimationTask,
    startTime: number
  ): Promise<SwarmResult> {
    let iteration = 0
    let bestResult: SwarmResult | null = null
    const allOutputs = new Map<AgentType, AgentOutput>()

    while (iteration < this.config.maxIterations) {
      iteration++
      await this.communicationHub.emitEvent('iteration.started', task.id, { iteration })

      const context: TaskContext = {
        previousOutputs: new Map(allOutputs),
        insights: Array.from(allOutputs.values()).flatMap(o => o.insights),
        sharedData: {},
        iteration,
        notes: [],
      }

      const iterationOutputs = await this.runCollaborativeIteration(task, context)

      for (const [type, output] of iterationOutputs) {
        allOutputs.set(type, output)
      }

      const conflicts = this.conflictResolver.detectConflicts(Array.from(iterationOutputs.values()))

      if (conflicts.length > 0) {
        context.notes.push(`Iteration ${iteration}: ${conflicts.length} conflicts detected`)

        for (const conflict of conflicts) {
          const resolution = this.conflictResolver.resolve(
            conflict,
            Array.from(iterationOutputs.values()),
            task,
            'voting'
          )
          context.notes.push(`Resolved ${conflict.type}: ${resolution.description}`)
        }
      }

      const result = this.resultAggregator.createSwarmResult(
        task.id,
        task.jobId,
        allOutputs,
        task,
        'collaborative',
        startTime,
        iteration
      )

      if (result.qualityScore >= this.config.minQualityScore) {
        bestResult = result
        break
      }

      if (!bestResult || result.qualityScore > bestResult.qualityScore) {
        bestResult = result
      }

      await this.communicationHub.emitEvent('iteration.completed', task.id, {
        iteration,
        qualityScore: result.qualityScore,
      })

      if (Date.now() - startTime > this.config.totalTimeout) {
        context.notes.push('Timeout reached - stopping iterations')
        break
      }
    }

    return bestResult || this.resultAggregator.createSwarmResult(
      task.id,
      task.jobId,
      allOutputs,
      task,
      'collaborative',
      startTime,
      iteration
    )
  }

  private async runCollaborativeIteration(
    task: AnimationTask,
    context: TaskContext
  ): Promise<Map<AgentType, AgentOutput>> {
    const outputs = new Map<AgentType, AgentOutput>()

    const independentAgents = this.config.agents.filter(a =>
      !['code-generator', 'quality-reviewer'].includes(a)
    )

    const parallelResults = await Promise.all(
      independentAgents.map(async (agentType) => {
        const agent = this.agentMap.get(agentType)
        if (!agent || !agent.canHandle({ ...task, context })) return null

        try {
          const output = await this.runAgentWithTimeout(
            agent,
            { ...task, context },
            this.config.agentTimeout
          )
          return { agentType, output }
        } catch {
          return null
        }
      })
    )

    for (const result of parallelResults) {
      if (result) {
        outputs.set(result.agentType, result.output)
        context.previousOutputs.set(result.agentType, result.output)
        context.insights.push(...result.output.insights)
      }
    }

    const codeGenerator = this.agentMap.get('code-generator')
    if (codeGenerator) {
      const output = await this.runAgentWithTimeout(
        codeGenerator,
        { ...task, context },
        this.config.agentTimeout
      )
      outputs.set('code-generator', output)
      context.previousOutputs.set('code-generator', output)
    }

    const qualityReviewer = this.agentMap.get('quality-reviewer')
    if (qualityReviewer) {
      const output = await this.runAgentWithTimeout(
        qualityReviewer,
        { ...task, context },
        this.config.agentTimeout
      )
      outputs.set('quality-reviewer', output)
    }

    return outputs
  }

  private async coordinateCompetitive(
    task: AnimationTask,
    startTime: number
  ): Promise<SwarmResult> {
    const codeGeneratingAgents: AgentType[] = ['code-generator']
    const outputs = new Map<AgentType, AgentOutput>()

    const analysisAgents = this.config.agents.filter(a =>
      ['prerequisite-explorer', 'math-enricher', 'visual-designer', 'narrative-composer'].includes(a)
    )

    const context: TaskContext = {
      previousOutputs: new Map(),
      insights: [],
      sharedData: {},
      iteration: 1,
      notes: [],
    }

    await Promise.all(
      analysisAgents.map(async (agentType) => {
        const agent = this.agentMap.get(agentType)
        if (!agent || !agent.canHandle(task)) return

        try {
          const output = await this.runAgentWithTimeout(agent, task, this.config.agentTimeout)
          outputs.set(agentType, output)
          context.previousOutputs.set(agentType, output)
          context.insights.push(...output.insights)
        } catch {
        }
      })
    )

    const codeGenerator = this.agentMap.get('code-generator')
    const proposals: AgentOutput[] = []

    if (codeGenerator) {
      for (let i = 0; i < 3; i++) {
        try {
          const output = await this.runAgentWithTimeout(
            codeGenerator,
            { ...task, context: { ...context, iteration: i + 1 } },
            this.config.agentTimeout
          )
          proposals.push(output)
        } catch {
        }
      }
    }

    if (proposals.length > 0) {
      const best = this.qualityScorer.selectBest(proposals, task)
      if (best) {
        outputs.set('code-generator', best.winner)
        context.notes.push(
          `Selected best from ${proposals.length} proposals (score: ${best.breakdown.overall.toFixed(2)})`
        )
      }
    }

    const qualityReviewer = this.agentMap.get('quality-reviewer')
    if (qualityReviewer && outputs.has('code-generator')) {
      context.previousOutputs.set('code-generator', outputs.get('code-generator')!)
      const reviewOutput = await this.runAgentWithTimeout(
        qualityReviewer,
        { ...task, context },
        this.config.agentTimeout
      )
      outputs.set('quality-reviewer', reviewOutput)
    }

    return this.resultAggregator.createSwarmResult(
      task.id,
      task.jobId,
      outputs,
      task,
      'competitive',
      startTime,
      1
    )
  }

  private async runAgentWithTimeout(
    agent: Agent,
    task: AnimationTask,
    timeout: number
  ): Promise<AgentOutput> {
    return Promise.race([
      agent.process(task),
      new Promise<AgentOutput>((_, reject) =>
        setTimeout(() => reject(new Error(`Agent ${agent.type} timed out`)), timeout)
      ),
    ])
  }

  setConfig(config: Partial<SwarmConfig>): void {
    this.config = { ...this.config, ...config }
    this.conflictResolver.setVotingThreshold(this.config.votingThreshold)
  }

  getConfig(): SwarmConfig {
    return { ...this.config }
  }

  reset(): void {
    this.communicationHub.reset()
    this.taskDistributor.reset()
    this.conflictResolver.reset()

    for (const agent of this.agentMap.values()) {
      agent.reset()
    }
  }
}

export function createAnimationTask(
  jobId: string,
  input: string,
  nluResult: NLUResult,
  style: StylePreset,
  quality: 'low' | 'medium' | 'high' = 'medium'
): AnimationTask {
  return {
    id: uuidv4(),
    jobId,
    input,
    nluResult,
    style,
    quality,
    priority: 5,
    createdAt: Date.now(),
  }
}

let agentSwarm: AgentSwarmCoordinator | null = null

export function getAgentSwarm(config?: Partial<SwarmConfig>): AgentSwarmCoordinator {
  if (!agentSwarm) {
    agentSwarm = new AgentSwarmCoordinator(config)
  }
  return agentSwarm
}

export function resetAgentSwarm(): void {
  if (agentSwarm) {
    agentSwarm.reset()
  }
  agentSwarm = null
}

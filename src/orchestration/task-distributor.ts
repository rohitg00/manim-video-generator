
import { v4 as uuidv4 } from 'uuid'
import type {
  AnimationTask,
  AgentType,
  Subtask,
  TaskContext,
  Agent,
  AgentOutput,
} from './types'
import type { NLUResult, Intent } from '../types/nlu.types'

interface SubtaskTemplate {
  type: Subtask['type']
  agents: AgentType[]
  dependencies: string[]
  complexityWeight: number
}

const INTENT_SUBTASK_TEMPLATES: Record<Intent, SubtaskTemplate[]> = {
  EXPLAIN_CONCEPT: [
    { type: 'analysis', agents: ['prerequisite-explorer'], dependencies: [], complexityWeight: 1 },
    { type: 'design', agents: ['visual-designer', 'narrative-composer'], dependencies: ['analysis'], complexityWeight: 2 },
    { type: 'generation', agents: ['code-generator'], dependencies: ['design'], complexityWeight: 3 },
    { type: 'review', agents: ['quality-reviewer'], dependencies: ['generation'], complexityWeight: 1 },
  ],
  VISUALIZE_MATH: [
    { type: 'analysis', agents: ['math-enricher'], dependencies: [], complexityWeight: 2 },
    { type: 'design', agents: ['visual-designer'], dependencies: ['analysis'], complexityWeight: 2 },
    { type: 'generation', agents: ['code-generator'], dependencies: ['design'], complexityWeight: 3 },
    { type: 'review', agents: ['quality-reviewer'], dependencies: ['generation'], complexityWeight: 1 },
  ],
  TELL_STORY: [
    { type: 'analysis', agents: ['narrative-composer'], dependencies: [], complexityWeight: 2 },
    { type: 'design', agents: ['visual-designer'], dependencies: ['analysis'], complexityWeight: 2 },
    { type: 'generation', agents: ['code-generator'], dependencies: ['design'], complexityWeight: 3 },
    { type: 'review', agents: ['quality-reviewer'], dependencies: ['generation'], complexityWeight: 1 },
  ],
  TRANSFORM_OBJECT: [
    { type: 'analysis', agents: ['visual-designer'], dependencies: [], complexityWeight: 1 },
    { type: 'generation', agents: ['code-generator'], dependencies: ['analysis'], complexityWeight: 2 },
    { type: 'review', agents: ['quality-reviewer'], dependencies: ['generation'], complexityWeight: 1 },
  ],
  DEMONSTRATE_PROCESS: [
    { type: 'analysis', agents: ['prerequisite-explorer', 'narrative-composer'], dependencies: [], complexityWeight: 2 },
    { type: 'design', agents: ['visual-designer'], dependencies: ['analysis'], complexityWeight: 2 },
    { type: 'generation', agents: ['code-generator'], dependencies: ['design'], complexityWeight: 3 },
    { type: 'review', agents: ['quality-reviewer'], dependencies: ['generation'], complexityWeight: 1 },
  ],
  CREATE_SCENE: [
    { type: 'design', agents: ['visual-designer'], dependencies: [], complexityWeight: 2 },
    { type: 'generation', agents: ['code-generator'], dependencies: ['design'], complexityWeight: 3 },
    { type: 'review', agents: ['quality-reviewer'], dependencies: ['generation'], complexityWeight: 1 },
  ],
  KINETIC_TEXT: [
    { type: 'design', agents: ['visual-designer', 'narrative-composer'], dependencies: [], complexityWeight: 2 },
    { type: 'generation', agents: ['code-generator'], dependencies: ['design'], complexityWeight: 2 },
    { type: 'review', agents: ['quality-reviewer', 'style-harmonizer'], dependencies: ['generation'], complexityWeight: 1 },
  ],
  COMPARE_CONTRAST: [
    { type: 'analysis', agents: ['prerequisite-explorer'], dependencies: [], complexityWeight: 2 },
    { type: 'design', agents: ['visual-designer'], dependencies: ['analysis'], complexityWeight: 2 },
    { type: 'generation', agents: ['code-generator'], dependencies: ['design'], complexityWeight: 3 },
    { type: 'review', agents: ['quality-reviewer'], dependencies: ['generation'], complexityWeight: 1 },
  ],
  GRAPH_FUNCTION: [
    { type: 'analysis', agents: ['math-enricher'], dependencies: [], complexityWeight: 2 },
    { type: 'design', agents: ['visual-designer'], dependencies: ['analysis'], complexityWeight: 1 },
    { type: 'generation', agents: ['code-generator'], dependencies: ['design'], complexityWeight: 2 },
    { type: 'review', agents: ['quality-reviewer'], dependencies: ['generation'], complexityWeight: 1 },
  ],
  GEOMETRIC_PROOF: [
    { type: 'analysis', agents: ['math-enricher', 'prerequisite-explorer'], dependencies: [], complexityWeight: 3 },
    { type: 'design', agents: ['visual-designer', 'narrative-composer'], dependencies: ['analysis'], complexityWeight: 2 },
    { type: 'generation', agents: ['code-generator'], dependencies: ['design'], complexityWeight: 3 },
    { type: 'review', agents: ['quality-reviewer'], dependencies: ['generation'], complexityWeight: 1 },
  ],
}

export class TaskDistributor {
  private subtasks: Map<string, Subtask> = new Map()
  private taskSubtaskMap: Map<string, string[]> = new Map()
  private dependencyGraph: Map<string, Set<string>> = new Map()

  distribute(task: AnimationTask, availableAgents: AgentType[]): Subtask[] {
    const intent = task.nluResult.intent
    const templates = INTENT_SUBTASK_TEMPLATES[intent] || INTENT_SUBTASK_TEMPLATES.CREATE_SCENE

    const subtasks: Subtask[] = []
    const subtaskIdMap = new Map<string, string>()

    templates.forEach((template, index) => {
      const subtaskId = uuidv4()
      subtaskIdMap.set(`${index}`, subtaskId)

      const assignedAgent = this.selectAgent(template.agents, availableAgents, task)

      const subtask: Subtask = {
        id: subtaskId,
        parentTaskId: task.id,
        type: template.type,
        assignedAgent,
        input: this.prepareSubtaskInput(template.type, task),
        dependencies: [],
        output: undefined,
        status: 'pending',
        priority: task.priority + (templates.length - index),
        complexity: this.calculateComplexity(task, template),
      }

      subtasks.push(subtask)
      this.subtasks.set(subtaskId, subtask)
    })

    templates.forEach((template, index) => {
      const subtask = subtasks[index]
      subtask.dependencies = template.dependencies.map(depIndex => {
        const depTemplate = templates.find((_, i) => i === parseInt(depIndex.split('analysis')[1] || '0', 10))
        return subtaskIdMap.get(depIndex) || ''
      }).filter(Boolean)

      if (!this.dependencyGraph.has(subtask.id)) {
        this.dependencyGraph.set(subtask.id, new Set())
      }
      for (const dep of subtask.dependencies) {
        this.dependencyGraph.get(subtask.id)!.add(dep)
      }
    })

    for (let i = 0; i < subtasks.length; i++) {
      const template = templates[i]
      const subtask = subtasks[i]

      subtask.dependencies = template.dependencies.map(depName => {
        const depSubtask = subtasks.find((s, j) => {
          const depTemplate = templates[j]
          return depName === depTemplate.type ||
                 (depName === 'analysis' && depTemplate.type === 'analysis') ||
                 (depName === 'design' && depTemplate.type === 'design') ||
                 (depName === 'generation' && depTemplate.type === 'generation')
        })
        return depSubtask?.id || ''
      }).filter(Boolean)
    }

    subtasks.forEach(subtask => {
      if (subtask.dependencies.length === 0) {
        subtask.status = 'ready'
      }
    })

    this.taskSubtaskMap.set(task.id, subtasks.map(s => s.id))

    return subtasks
  }

  private selectAgent(
    preferredAgents: AgentType[],
    availableAgents: AgentType[],
    task: AnimationTask
  ): AgentType | undefined {
    const candidates = preferredAgents.filter(a => availableAgents.includes(a))

    if (candidates.length === 0) {
      return availableAgents[0]
    }

    if (candidates.length === 1) {
      return candidates[0]
    }

    const intent = task.nluResult.intent

    if (intent === 'VISUALIZE_MATH' || intent === 'GRAPH_FUNCTION' || intent === 'GEOMETRIC_PROOF') {
      if (candidates.includes('math-enricher')) return 'math-enricher'
    }

    if (intent === 'TELL_STORY' || intent === 'EXPLAIN_CONCEPT') {
      if (candidates.includes('narrative-composer')) return 'narrative-composer'
    }

    return candidates[0]
  }

  private prepareSubtaskInput(
    type: Subtask['type'],
    task: AnimationTask
  ): Record<string, unknown> {
    const base = {
      concept: task.input,
      nluResult: task.nluResult,
      style: task.style,
      quality: task.quality,
    }

    switch (type) {
      case 'analysis':
        return {
          ...base,
          focus: 'extract_prerequisites_and_concepts',
          maxDepth: 2,
        }
      case 'design':
        return {
          ...base,
          focus: 'visual_structure_and_flow',
          includeTimings: true,
        }
      case 'generation':
        return {
          ...base,
          focus: 'code_generation',
          includeComments: true,
        }
      case 'review':
        return {
          ...base,
          focus: 'quality_and_correctness',
          checkSyntax: true,
        }
      case 'merge':
        return {
          ...base,
          focus: 'combine_outputs',
        }
      default:
        return base
    }
  }

  private calculateComplexity(task: AnimationTask, template: SubtaskTemplate): number {
    let complexity = template.complexityWeight

    const { entities, estimatedDuration, needs3D } = task.nluResult

    if (needs3D) complexity += 2
    if (entities.mathExpressions.length > 2) complexity += 1
    if (estimatedDuration > 10) complexity += 1
    if (task.nluResult.entities.complexity === 'complex') complexity += 2

    return Math.min(complexity, 10)
  }

  getReadySubtasks(taskId: string): Subtask[] {
    const subtaskIds = this.taskSubtaskMap.get(taskId) || []
    return subtaskIds
      .map(id => this.subtasks.get(id)!)
      .filter(subtask => {
        if (subtask.status !== 'pending' && subtask.status !== 'ready') {
          return false
        }
        return subtask.dependencies.every(depId => {
          const dep = this.subtasks.get(depId)
          return dep?.status === 'completed'
        })
      })
      .map(subtask => {
        subtask.status = 'ready'
        return subtask
      })
  }

  markProcessing(subtaskId: string): void {
    const subtask = this.subtasks.get(subtaskId)
    if (subtask) {
      subtask.status = 'processing'
    }
  }

  completeSubtask(subtaskId: string, output: unknown): void {
    const subtask = this.subtasks.get(subtaskId)
    if (subtask) {
      subtask.status = 'completed'
      subtask.output = output
    }
  }

  failSubtask(subtaskId: string, error: string): void {
    const subtask = this.subtasks.get(subtaskId)
    if (subtask) {
      subtask.status = 'failed'
      subtask.output = { error }
    }
  }

  getSubtask(subtaskId: string): Subtask | undefined {
    return this.subtasks.get(subtaskId)
  }

  getSubtasksForTask(taskId: string): Subtask[] {
    const subtaskIds = this.taskSubtaskMap.get(taskId) || []
    return subtaskIds.map(id => this.subtasks.get(id)!).filter(Boolean)
  }

  isTaskComplete(taskId: string): boolean {
    const subtasks = this.getSubtasksForTask(taskId)
    return subtasks.length > 0 && subtasks.every(s => s.status === 'completed')
  }

  hasTaskFailed(taskId: string): boolean {
    const subtasks = this.getSubtasksForTask(taskId)
    return subtasks.some(s => s.status === 'failed')
  }

  getTaskProgress(taskId: string): {
    total: number
    completed: number
    processing: number
    pending: number
    failed: number
    percentage: number
  } {
    const subtasks = this.getSubtasksForTask(taskId)
    const total = subtasks.length
    const completed = subtasks.filter(s => s.status === 'completed').length
    const processing = subtasks.filter(s => s.status === 'processing').length
    const pending = subtasks.filter(s => s.status === 'pending' || s.status === 'ready').length
    const failed = subtasks.filter(s => s.status === 'failed').length

    return {
      total,
      completed,
      processing,
      pending,
      failed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    }
  }

  getCompletedOutputs(taskId: string): Map<string, unknown> {
    const outputs = new Map<string, unknown>()
    const subtasks = this.getSubtasksForTask(taskId)

    for (const subtask of subtasks) {
      if (subtask.status === 'completed' && subtask.output) {
        outputs.set(subtask.id, subtask.output)
      }
    }

    return outputs
  }

  getExecutionOrder(taskId: string): Subtask[][] {
    const subtasks = this.getSubtasksForTask(taskId)
    const levels: Subtask[][] = []
    const processed = new Set<string>()

    while (processed.size < subtasks.length) {
      const level: Subtask[] = []

      for (const subtask of subtasks) {
        if (processed.has(subtask.id)) continue

        const allDepsProcessed = subtask.dependencies.every(d => processed.has(d))
        if (allDepsProcessed) {
          level.push(subtask)
        }
      }

      if (level.length === 0) {
        console.error('Unable to build execution order - possible circular dependency')
        break
      }

      levels.push(level)
      level.forEach(s => processed.add(s.id))
    }

    return levels
  }

  clearTask(taskId: string): void {
    const subtaskIds = this.taskSubtaskMap.get(taskId) || []
    for (const id of subtaskIds) {
      this.subtasks.delete(id)
      this.dependencyGraph.delete(id)
    }
    this.taskSubtaskMap.delete(taskId)
  }

  reset(): void {
    this.subtasks.clear()
    this.taskSubtaskMap.clear()
    this.dependencyGraph.clear()
  }
}

let taskDistributor: TaskDistributor | null = null

export function getTaskDistributor(): TaskDistributor {
  if (!taskDistributor) {
    taskDistributor = new TaskDistributor()
  }
  return taskDistributor
}

export function resetTaskDistributor(): void {
  if (taskDistributor) {
    taskDistributor.reset()
  }
  taskDistributor = null
}

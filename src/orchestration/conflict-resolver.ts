
import { v4 as uuidv4 } from 'uuid'
import type {
  Conflict,
  ConflictResolution,
  AgentVote,
  Proposal,
  AgentType,
  AgentOutput,
  SwarmConfig,
} from './types'
import { getQualityScorer } from './quality-scorer'
import type { AnimationTask } from './types'

const AGENT_PRIORITIES: Record<AgentType, number> = {
  'code-generator': 10,
  'quality-reviewer': 9,
  'visual-designer': 8,
  'math-enricher': 7,
  'narrative-composer': 6,
  'prerequisite-explorer': 5,
  'style-harmonizer': 4,
}

export class ConflictResolver {
  private conflicts: Map<string, Conflict> = new Map()
  private resolutions: Map<string, ConflictResolution> = new Map()
  private proposals: Map<string, Proposal> = new Map()
  private votingThreshold: number

  constructor(votingThreshold: number = 0.6) {
    this.votingThreshold = votingThreshold
  }

  detectConflicts(outputs: AgentOutput[]): Conflict[] {
    const conflicts: Conflict[] = []

    const codeConflict = this.detectCodeConflict(outputs)
    if (codeConflict) conflicts.push(codeConflict)

    const styleConflict = this.detectStyleConflict(outputs)
    if (styleConflict) conflicts.push(styleConflict)

    const priorityConflict = this.detectPriorityConflict(outputs)
    if (priorityConflict) conflicts.push(priorityConflict)

    for (const conflict of conflicts) {
      this.conflicts.set(conflict.id, conflict)
    }

    return conflicts
  }

  private detectCodeConflict(outputs: AgentOutput[]): Conflict | null {
    const codeOutputs = outputs.filter(o => o.code && o.code.length > 0)

    if (codeOutputs.length <= 1) return null

    const classNames = codeOutputs.map(o => {
      const match = o.code?.match(/class\s+(\w+)\s*\(/)
      return match ? match[1] : null
    }).filter(Boolean)

    const uniqueClassNames = new Set(classNames)

    if (uniqueClassNames.size > 1) {
      return {
        id: uuidv4(),
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

  private detectStyleConflict(outputs: AgentOutput[]): Conflict | null {
    const sceneGraphOutputs = outputs.filter(o => o.sceneGraph)

    if (sceneGraphOutputs.length <= 1) return null

    const styles = sceneGraphOutputs.map(o => o.sceneGraph!.style.preset)
    const uniqueStyles = new Set(styles)

    if (uniqueStyles.size > 1) {
      return {
        id: uuidv4(),
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

  private detectPriorityConflict(outputs: AgentOutput[]): Conflict | null {
    const suggestions = outputs.flatMap(o =>
      o.suggestions.map(s => ({ ...s, sourceAgent: o.agent }))
    )

    const byTarget = new Map<string, typeof suggestions>()
    for (const suggestion of suggestions) {
      const key = `${suggestion.targetAgent}-${suggestion.type}`
      if (!byTarget.has(key)) {
        byTarget.set(key, [])
      }
      byTarget.get(key)!.push(suggestion)
    }

    for (const [key, group] of byTarget) {
      if (group.length > 1) {
        const contents = group.map(s => s.content)
        const uniqueContents = new Set(contents)

        if (uniqueContents.size > 1) {
          return {
            id: uuidv4(),
            agents: group.map(s => s.sourceAgent),
            type: 'priority-conflict',
            description: `Conflicting suggestions for ${key}: ${Array.from(uniqueContents).slice(0, 2).join(' vs ')}`,
            items: group,
            severity: 2,
            timestamp: Date.now(),
          }
        }
      }
    }

    return null
  }

  resolve(
    conflict: Conflict,
    outputs: AgentOutput[],
    task: AnimationTask,
    strategy: SwarmConfig['conflictStrategy']
  ): ConflictResolution {
    let resolution: ConflictResolution

    switch (strategy) {
      case 'voting':
        resolution = this.resolveByVoting(conflict, outputs)
        break
      case 'priority':
        resolution = this.resolveByPriority(conflict, outputs)
        break
      case 'first-wins':
        resolution = this.resolveFirstWins(conflict, outputs)
        break
      case 'best-quality':
        resolution = this.resolveByQuality(conflict, outputs, task)
        break
      default:
        resolution = this.resolveByPriority(conflict, outputs)
    }

    this.resolutions.set(conflict.id, resolution)
    return resolution
  }

  private resolveByVoting(conflict: Conflict, outputs: AgentOutput[]): ConflictResolution {
    const votes = new Map<AgentType, number>()

    for (const output of outputs) {
      const agent = output.agent

      votes.set(agent, (votes.get(agent) || 0) + output.qualityScore)

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

  private resolveByPriority(conflict: Conflict, outputs: AgentOutput[]): ConflictResolution {
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

  private resolveFirstWins(conflict: Conflict, outputs: AgentOutput[]): ConflictResolution {
    const sorted = [...outputs]
      .filter(o => conflict.agents.includes(o.agent))
      .sort((a, b) => a.processingTime - b.processingTime)

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

  private resolveByQuality(
    conflict: Conflict,
    outputs: AgentOutput[],
    task: AnimationTask
  ): ConflictResolution {
    const scorer = getQualityScorer()
    const conflictOutputs = outputs.filter(o => conflict.agents.includes(o.agent))

    const result = scorer.selectBest(conflictOutputs, task)

    if (!result) {
      return this.resolveByPriority(conflict, outputs)
    }

    return {
      conflictId: conflict.id,
      method: 'voting',
      winner: result.winner.agent,
      description: `Resolved by quality: ${result.winner.agent} scored ${result.breakdown.overall.toFixed(2)}`,
      resolvedValue: result.winner.code || result.winner.sceneGraph,
      timestamp: Date.now(),
    }
  }

  createProposal(
    proposer: AgentType,
    type: Proposal['type'],
    description: string,
    content: unknown,
    expirationMs: number = 30000
  ): Proposal {
    const proposal: Proposal = {
      id: uuidv4(),
      proposer,
      type,
      description,
      content,
      votes: [],
      status: 'pending',
      createdAt: Date.now(),
      expiresAt: Date.now() + expirationMs,
    }

    this.proposals.set(proposal.id, proposal)
    return proposal
  }

  vote(proposalId: string, vote: AgentVote): boolean {
    const proposal = this.proposals.get(proposalId)
    if (!proposal) return false

    if (proposal.status !== 'pending' || Date.now() > proposal.expiresAt) {
      return false
    }

    const existingVote = proposal.votes.find(v => v.agent === vote.agent)
    if (existingVote) {
      existingVote.vote = vote.vote
      existingVote.reason = vote.reason
      existingVote.timestamp = vote.timestamp
    } else {
      proposal.votes.push(vote)
    }

    this.evaluateProposal(proposal)

    return true
  }

  private evaluateProposal(proposal: Proposal): void {
    const totalVotes = proposal.votes.length
    const approvalVotes = proposal.votes.filter(v => v.vote === 1).length
    const rejectionVotes = proposal.votes.filter(v => v.vote === -1).length

    const approvalRatio = totalVotes > 0 ? approvalVotes / totalVotes : 0
    const rejectionRatio = totalVotes > 0 ? rejectionVotes / totalVotes : 0

    if (approvalRatio >= this.votingThreshold) {
      proposal.status = 'approved'
    } else if (rejectionRatio > (1 - this.votingThreshold)) {
      proposal.status = 'rejected'
    }
  }

  getProposal(proposalId: string): Proposal | undefined {
    const proposal = this.proposals.get(proposalId)

    if (proposal && proposal.status === 'pending' && Date.now() > proposal.expiresAt) {
      proposal.status = 'expired'
    }

    return proposal
  }

  getPendingProposals(): Proposal[] {
    const now = Date.now()
    return Array.from(this.proposals.values()).filter(p => {
      if (p.status === 'pending' && now > p.expiresAt) {
        p.status = 'expired'
      }
      return p.status === 'pending'
    })
  }

  mergeCode(outputs: AgentOutput[]): string {
    const codeOutputs = outputs.filter(o => o.code && o.code.length > 0)

    if (codeOutputs.length === 0) return ''
    if (codeOutputs.length === 1) return codeOutputs[0].code!

    const scorer = getQualityScorer()
    const sorted = [...codeOutputs].sort(
      (a, b) => b.qualityScore - a.qualityScore
    )

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

  getConflict(conflictId: string): Conflict | undefined {
    return this.conflicts.get(conflictId)
  }

  getResolution(conflictId: string): ConflictResolution | undefined {
    return this.resolutions.get(conflictId)
  }

  getUnresolvedConflicts(): Conflict[] {
    return Array.from(this.conflicts.values()).filter(
      c => !this.resolutions.has(c.id)
    )
  }

  getAllResolutions(): ConflictResolution[] {
    return Array.from(this.resolutions.values())
  }

  setVotingThreshold(threshold: number): void {
    this.votingThreshold = Math.max(0, Math.min(1, threshold))
  }

  reset(): void {
    this.conflicts.clear()
    this.resolutions.clear()
    this.proposals.clear()
  }
}

let conflictResolver: ConflictResolver | null = null

export function getConflictResolver(votingThreshold?: number): ConflictResolver {
  if (!conflictResolver) {
    conflictResolver = new ConflictResolver(votingThreshold)
  }
  return conflictResolver
}

export function resetConflictResolver(): void {
  if (conflictResolver) {
    conflictResolver.reset()
  }
  conflictResolver = null
}

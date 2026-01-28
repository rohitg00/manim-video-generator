
import type { NLUResult, Intent, StylePreset } from '../types/nlu.types'
import type { SceneGraph, GeneratedScene } from '../types/scene.types'

export type AgentType =
  | 'prerequisite-explorer'
  | 'math-enricher'
  | 'visual-designer'
  | 'narrative-composer'
  | 'code-generator'
  | 'quality-reviewer'
  | 'style-harmonizer'

export type SwarmMode = 'sequential' | 'parallel' | 'collaborative' | 'competitive'

export type AgentStatus = 'idle' | 'processing' | 'completed' | 'failed' | 'waiting'

export interface AnimationTask {
  /** Unique task identifier */
  id: string
  /** Job ID for tracking */
  jobId: string
  /** User's input/concept */
  input: string
  /** NLU analysis result */
  nluResult: NLUResult
  /** Target style */
  style: StylePreset
  /** Quality level */
  quality: 'low' | 'medium' | 'high'
  /** Priority (higher = more urgent) */
  priority: number
  /** Task creation timestamp */
  createdAt: number
  /** Optional constraints */
  constraints?: TaskConstraints
  /** Task context from previous agents */
  context?: TaskContext
}

export interface TaskConstraints {
  /** Maximum duration in seconds */
  maxDuration?: number
  /** Maximum iterations for refinement */
  maxIterations?: number
  /** Required agents that must participate */
  requiredAgents?: AgentType[]
  /** Excluded agents */
  excludedAgents?: AgentType[]
  /** Minimum quality score threshold */
  minQualityScore?: number
  /** Timeout per agent in milliseconds */
  agentTimeout?: number
}

export interface TaskContext {
  /** Previous agent outputs */
  previousOutputs: Map<AgentType, AgentOutput>
  /** Accumulated insights */
  insights: string[]
  /** Shared data */
  sharedData: Record<string, unknown>
  /** Iteration count */
  iteration: number
  /** Any warnings or notes */
  notes: string[]
}

export interface Agent {
  /** Agent type identifier */
  type: AgentType
  /** Human-readable name */
  name: string
  /** Agent description */
  description: string
  /** Agent capabilities */
  capabilities: string[]
  /** Current status */
  status: AgentStatus
  /** Process a task */
  process(task: AnimationTask): Promise<AgentOutput>
  /** Check if agent can handle this task */
  canHandle(task: AnimationTask): boolean
  /** Get agent's confidence for this task */
  getConfidence(task: AnimationTask): number
  /** Reset agent state */
  reset(): void
}

export interface AgentOutput {
  /** Agent that produced this output */
  agent: AgentType
  /** Whether processing succeeded */
  success: boolean
  /** Generated code (if applicable) */
  code?: string
  /** Scene graph (if applicable) */
  sceneGraph?: SceneGraph
  /** Insights or analysis */
  insights: string[]
  /** Suggestions for other agents */
  suggestions: AgentSuggestion[]
  /** Quality score (0-1) */
  qualityScore: number
  /** Processing time in ms */
  processingTime: number
  /** Error message if failed */
  error?: string
  /** Additional data */
  metadata?: Record<string, unknown>
}

export interface AgentSuggestion {
  /** Target agent (or 'all' for broadcast) */
  targetAgent: AgentType | 'all'
  /** Suggestion type */
  type: 'enhancement' | 'warning' | 'requirement' | 'alternative'
  /** Suggestion content */
  content: string
  /** Priority (0-1) */
  priority: number
}

export interface AgentMessage {
  /** Unique message ID */
  id: string
  /** Sending agent */
  from: AgentType
  /** Receiving agent (or 'broadcast' for all) */
  to: AgentType | 'broadcast'
  /** Message type */
  type: 'request' | 'response' | 'update' | 'vote' | 'proposal' | 'feedback'
  /** Message payload */
  payload: unknown
  /** Priority (0-10) */
  priority: number
  /** Timestamp */
  timestamp: number
  /** Optional correlation ID for request-response */
  correlationId?: string
  /** Time-to-live in milliseconds */
  ttl?: number
}

export interface SwarmResult {
  /** Task that was processed */
  taskId: string
  /** Job ID */
  jobId: string
  /** Overall success */
  success: boolean
  /** Final generated code */
  code: string
  /** Final scene graph */
  sceneGraph?: SceneGraph
  /** Mode used */
  mode: SwarmMode
  /** Agents that participated */
  participatingAgents: AgentType[]
  /** Individual agent outputs */
  agentOutputs: Map<AgentType, AgentOutput>
  /** Combined quality score */
  qualityScore: number
  /** Total processing time */
  totalTime: number
  /** Number of iterations (for collaborative mode) */
  iterations: number
  /** Conflict resolutions made */
  conflictResolutions: ConflictResolution[]
  /** Warnings and notes */
  warnings: string[]
}

export interface AgentVote {
  /** Voting agent */
  agent: AgentType
  /** Proposal being voted on */
  proposalId: string
  /** Vote value (-1 = reject, 0 = abstain, 1 = approve) */
  vote: -1 | 0 | 1
  /** Reason for vote */
  reason: string
  /** Timestamp */
  timestamp: number
}

export interface Proposal {
  /** Unique proposal ID */
  id: string
  /** Proposing agent */
  proposer: AgentType
  /** What is being proposed */
  type: 'code-change' | 'style-change' | 'structure-change' | 'enhancement'
  /** Proposal description */
  description: string
  /** Proposed changes/content */
  content: unknown
  /** Votes received */
  votes: AgentVote[]
  /** Status */
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  /** Creation timestamp */
  createdAt: number
  /** Expiration timestamp */
  expiresAt: number
}

export interface Conflict {
  /** Unique conflict ID */
  id: string
  /** Agents involved */
  agents: AgentType[]
  /** Type of conflict */
  type: 'code-overlap' | 'style-mismatch' | 'priority-conflict' | 'timing-conflict'
  /** Description of conflict */
  description: string
  /** Conflicting items */
  items: unknown[]
  /** Severity (1-5) */
  severity: number
  /** Timestamp */
  timestamp: number
}

export interface ConflictResolution {
  /** Conflict that was resolved */
  conflictId: string
  /** Resolution method used */
  method: 'voting' | 'priority' | 'merge' | 'override' | 'manual'
  /** Winning agent (if applicable) */
  winner?: AgentType
  /** Resolution description */
  description: string
  /** Final resolved value */
  resolvedValue: unknown
  /** Timestamp */
  timestamp: number
}

export interface SwarmConfig {
  /** Swarm mode */
  mode: SwarmMode
  /** Active agents */
  agents: AgentType[]
  /** Voting threshold for collaborative decisions (0-1) */
  votingThreshold: number
  /** Maximum iterations */
  maxIterations: number
  /** Timeout per agent (ms) */
  agentTimeout: number
  /** Total swarm timeout (ms) */
  totalTimeout: number
  /** Enable parallel processing where possible */
  enableParallel: boolean
  /** Minimum quality score to accept result */
  minQualityScore: number
  /** Conflict resolution strategy */
  conflictStrategy: 'voting' | 'priority' | 'first-wins' | 'best-quality'
}

export interface Subtask {
  /** Unique subtask ID */
  id: string
  /** Parent task ID */
  parentTaskId: string
  /** Subtask type */
  type: 'analysis' | 'design' | 'generation' | 'review' | 'merge'
  /** Assigned agent */
  assignedAgent?: AgentType
  /** Input for this subtask */
  input: unknown
  /** Dependencies on other subtasks */
  dependencies: string[]
  /** Output from execution */
  output?: unknown
  /** Status */
  status: 'pending' | 'ready' | 'processing' | 'completed' | 'failed'
  /** Priority */
  priority: number
  /** Estimated complexity (1-10) */
  complexity: number
}

export interface QualityScoreBreakdown {
  /** Code correctness (0-1) */
  codeCorrectness: number
  /** Visual appeal (0-1) */
  visualAppeal: number
  /** Pedagogical clarity (0-1) */
  pedagogicalClarity: number
  /** Performance efficiency (0-1) */
  performanceEfficiency: number
  /** Style consistency (0-1) */
  styleConsistency: number
  /** Overall weighted score (0-1) */
  overall: number
}

export type SwarmEventType =
  | 'swarm.started'
  | 'swarm.completed'
  | 'swarm.failed'
  | 'agent.started'
  | 'agent.completed'
  | 'agent.failed'
  | 'task.distributed'
  | 'subtask.completed'
  | 'proposal.created'
  | 'vote.cast'
  | 'conflict.detected'
  | 'conflict.resolved'
  | 'iteration.started'
  | 'iteration.completed'

export interface SwarmEvent {
  /** Event type */
  type: SwarmEventType
  /** Task/Job ID */
  taskId: string
  /** Event data */
  data: unknown
  /** Timestamp */
  timestamp: number
}

export type SwarmEventHandler = (event: SwarmEvent) => void | Promise<void>

export const DEFAULT_SWARM_CONFIG: SwarmConfig = {
  mode: 'collaborative',
  agents: [
    'prerequisite-explorer',
    'math-enricher',
    'visual-designer',
    'narrative-composer',
    'code-generator',
  ],
  votingThreshold: 0.6,
  maxIterations: 3,
  agentTimeout: 30000,
  totalTimeout: 120000,
  enableParallel: true,
  minQualityScore: 0.7,
  conflictStrategy: 'voting',
}

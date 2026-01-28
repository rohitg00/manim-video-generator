
export type {
  AgentType,
  SwarmMode,
  AgentStatus,
  AnimationTask,
  TaskConstraints,
  TaskContext,
  Agent,
  AgentOutput,
  AgentSuggestion,
  AgentMessage,
  SwarmResult,
  AgentVote,
  Proposal,
  Conflict,
  ConflictResolution,
  SwarmConfig,
  Subtask,
  QualityScoreBreakdown,
  SwarmEventType,
  SwarmEvent,
  SwarmEventHandler,
} from './types'

export { DEFAULT_SWARM_CONFIG } from './types'

export {
  AgentSwarmCoordinator,
  getAgentSwarm,
  resetAgentSwarm,
  createAnimationTask,
  type AgentSwarm,
} from './agent-swarm'

export {
  MessageQueue,
  SwarmEventEmitter,
  AgentCommunicationHub,
  getCommunicationHub,
  resetCommunicationHub,
} from './agent-communication'

export {
  TaskDistributor,
  getTaskDistributor,
  resetTaskDistributor,
} from './task-distributor'

export {
  QualityScorer,
  getQualityScorer,
  resetQualityScorer,
} from './quality-scorer'

export {
  ConflictResolver,
  getConflictResolver,
  resetConflictResolver,
} from './conflict-resolver'

export {
  ResultAggregator,
  getResultAggregator,
  resetResultAggregator,
} from './result-aggregator'

export {
  BaseAgent,
  PrerequisiteExplorerAgent,
  MathEnricherAgent,
  VisualDesignerAgent,
  NarrativeComposerAgent,
  CodeGeneratorAgent,
  QualityReviewerAgent,
  StyleHarmonizerAgent,
  createAgents,
} from './base-agent'

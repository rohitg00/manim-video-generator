import type { InternalStateManager } from 'motia'
import type {
  AgentType,
  AgentOutput,
  SwarmMode,
  SwarmConfig,
} from '../orchestration/types'

const SWARM_STATE_GROUP = 'swarm-state'
const AGENT_OUTPUTS_GROUP = 'agent-outputs'

export interface SwarmState {
  jobId: string
  mode: SwarmMode
  startTime: number
  iteration: number
  status: 'running' | 'completed' | 'failed'
  config: SwarmConfig
  insights: string[]
  notes: string[]
  completedAgents: AgentType[]
  expectedAgents: AgentType[]
}

export interface AgentOutputStore {
  jobId: string
  outputs: Record<string, AgentOutput>
  lastUpdated: number
}

export async function initSwarmState(
  state: InternalStateManager,
  jobId: string,
  config: SwarmConfig
): Promise<SwarmState> {
  const swarmState: SwarmState = {
    jobId,
    mode: config.mode,
    startTime: Date.now(),
    iteration: 1,
    status: 'running',
    config,
    insights: [],
    notes: [],
    completedAgents: [],
    expectedAgents: config.agents,
  }

  await state.set(SWARM_STATE_GROUP, jobId, swarmState)

  const outputStore: AgentOutputStore = {
    jobId,
    outputs: {},
    lastUpdated: Date.now(),
  }
  await state.set(AGENT_OUTPUTS_GROUP, jobId, outputStore)

  return swarmState
}

export async function getSwarmState(
  state: InternalStateManager,
  jobId: string
): Promise<SwarmState | null> {
  return await state.get<SwarmState>(SWARM_STATE_GROUP, jobId)
}

export async function updateSwarmState(
  state: InternalStateManager,
  jobId: string,
  updates: Partial<Omit<SwarmState, 'jobId' | 'startTime' | 'config'>>
): Promise<SwarmState | null> {
  const current = await getSwarmState(state, jobId)
  if (!current) return null

  const updated: SwarmState = {
    ...current,
    ...updates,
    insights: updates.insights
      ? [...current.insights, ...updates.insights]
      : current.insights,
    notes: updates.notes
      ? [...current.notes, ...updates.notes]
      : current.notes,
    completedAgents: updates.completedAgents
      ? [...new Set([...current.completedAgents, ...updates.completedAgents])]
      : current.completedAgents,
  }

  await state.set(SWARM_STATE_GROUP, jobId, updated)
  return updated
}

export async function storeAgentOutput(
  state: InternalStateManager,
  jobId: string,
  agentType: AgentType,
  output: AgentOutput
): Promise<void> {
  const store = await state.get<AgentOutputStore>(AGENT_OUTPUTS_GROUP, jobId)

  const updated: AgentOutputStore = {
    jobId,
    outputs: {
      ...(store?.outputs || {}),
      [agentType]: output,
    },
    lastUpdated: Date.now(),
  }

  await state.set(AGENT_OUTPUTS_GROUP, jobId, updated)
}

export async function getAgentOutput(
  state: InternalStateManager,
  jobId: string,
  agentType: AgentType
): Promise<AgentOutput | null> {
  const store = await state.get<AgentOutputStore>(AGENT_OUTPUTS_GROUP, jobId)
  return store?.outputs[agentType] || null
}

export async function getAllAgentOutputs(
  state: InternalStateManager,
  jobId: string
): Promise<Record<AgentType, AgentOutput>> {
  const store = await state.get<AgentOutputStore>(AGENT_OUTPUTS_GROUP, jobId)
  return (store?.outputs || {}) as Record<AgentType, AgentOutput>
}

export async function getAgentOutputsMap(
  state: InternalStateManager,
  jobId: string
): Promise<Map<AgentType, AgentOutput>> {
  const outputs = await getAllAgentOutputs(state, jobId)
  return new Map(Object.entries(outputs) as [AgentType, AgentOutput][])
}

export async function cleanupSwarmState(
  state: InternalStateManager,
  jobId: string
): Promise<void> {
  await state.delete?.(SWARM_STATE_GROUP, jobId)
  await state.delete?.(AGENT_OUTPUTS_GROUP, jobId)
}

export function isSwarmComplete(swarmState: SwarmState): boolean {
  const { completedAgents, expectedAgents } = swarmState
  return expectedAgents.every(agent => completedAgents.includes(agent))
}

export function getOutputCount(swarmState: SwarmState): number {
  return swarmState.completedAgents.length
}

export function getRemainingAgents(swarmState: SwarmState): AgentType[] {
  return swarmState.expectedAgents.filter(
    agent => !swarmState.completedAgents.includes(agent)
  )
}

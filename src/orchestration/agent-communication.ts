
import { v4 as uuidv4 } from 'uuid'
import type {
  AgentMessage,
  AgentType,
  SwarmEvent,
  SwarmEventHandler,
  SwarmEventType,
} from './types'

export class MessageQueue {
  private messages: AgentMessage[] = []
  private handlers: Map<AgentType | 'broadcast', Set<(msg: AgentMessage) => void>> = new Map()
  private maxQueueSize: number

  constructor(maxQueueSize: number = 1000) {
    this.maxQueueSize = maxQueueSize
  }

  send(message: Omit<AgentMessage, 'id' | 'timestamp'>): string {
    const fullMessage: AgentMessage = {
      ...message,
      id: uuidv4(),
      timestamp: Date.now(),
    }

    if (this.messages.length >= this.maxQueueSize) {
      this.messages.shift()
    }

    this.messages.push(fullMessage)
    this.notifyHandlers(fullMessage)

    return fullMessage.id
  }

  subscribe(agent: AgentType | 'broadcast', handler: (msg: AgentMessage) => void): () => void {
    if (!this.handlers.has(agent)) {
      this.handlers.set(agent, new Set())
    }
    this.handlers.get(agent)!.add(handler)

    return () => {
      this.handlers.get(agent)?.delete(handler)
    }
  }

  getMessagesFor(agent: AgentType): AgentMessage[] {
    const now = Date.now()
    return this.messages.filter(msg => {
      const isTargeted = msg.to === agent || msg.to === 'broadcast'
      const isNotExpired = !msg.ttl || (msg.timestamp + msg.ttl > now)
      return isTargeted && isNotExpired
    })
  }

  getByCorrelationId(correlationId: string): AgentMessage[] {
    return this.messages.filter(msg => msg.correlationId === correlationId)
  }

  acknowledge(messageIds: string[]): void {
    const idSet = new Set(messageIds)
    this.messages = this.messages.filter(msg => !idSet.has(msg.id))
  }

  clear(): void {
    this.messages = []
  }

  getStats(): { total: number; byType: Record<string, number> } {
    const byType: Record<string, number> = {}
    for (const msg of this.messages) {
      byType[msg.type] = (byType[msg.type] || 0) + 1
    }
    return { total: this.messages.length, byType }
  }

  private notifyHandlers(message: AgentMessage): void {
    if (message.to !== 'broadcast') {
      const handlers = this.handlers.get(message.to)
      if (handlers) {
        for (const handler of handlers) {
          try {
            handler(message)
          } catch (error) {
            console.error(`Handler error for agent ${message.to}:`, error)
          }
        }
      }
    }

    const broadcastHandlers = this.handlers.get('broadcast')
    if (broadcastHandlers) {
      for (const handler of broadcastHandlers) {
        try {
          handler(message)
        } catch (error) {
          console.error('Broadcast handler error:', error)
        }
      }
    }
  }
}

export class SwarmEventEmitter {
  private handlers: Map<SwarmEventType | '*', Set<SwarmEventHandler>> = new Map()
  private eventLog: SwarmEvent[] = []
  private maxLogSize: number

  constructor(maxLogSize: number = 500) {
    this.maxLogSize = maxLogSize
  }

  on(eventType: SwarmEventType | '*', handler: SwarmEventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set())
    }
    this.handlers.get(eventType)!.add(handler)

    return () => {
      this.handlers.get(eventType)?.delete(handler)
    }
  }

  once(eventType: SwarmEventType, handler: SwarmEventHandler): () => void {
    const wrappedHandler: SwarmEventHandler = async (event) => {
      unsubscribe()
      await handler(event)
    }
    const unsubscribe = this.on(eventType, wrappedHandler)
    return unsubscribe
  }

  async emit(eventType: SwarmEventType, taskId: string, data: unknown): Promise<void> {
    const event: SwarmEvent = {
      type: eventType,
      taskId,
      data,
      timestamp: Date.now(),
    }

    if (this.eventLog.length >= this.maxLogSize) {
      this.eventLog.shift()
    }
    this.eventLog.push(event)

    const typeHandlers = this.handlers.get(eventType)
    const wildcardHandlers = this.handlers.get('*')

    const allHandlers = [
      ...(typeHandlers ? Array.from(typeHandlers) : []),
      ...(wildcardHandlers ? Array.from(wildcardHandlers) : []),
    ]

    await Promise.all(
      allHandlers.map(handler =>
        Promise.resolve(handler(event)).catch(error => {
          console.error(`Event handler error for ${eventType}:`, error)
        })
      )
    )
  }

  getEventsForTask(taskId: string): SwarmEvent[] {
    return this.eventLog.filter(e => e.taskId === taskId)
  }

  getEventsByType(eventType: SwarmEventType): SwarmEvent[] {
    return this.eventLog.filter(e => e.type === eventType)
  }

  clearLog(): void {
    this.eventLog = []
  }
}

export class AgentCommunicationHub {
  private messageQueue: MessageQueue
  private eventEmitter: SwarmEventEmitter
  private agentStatus: Map<AgentType, 'online' | 'offline' | 'busy'> = new Map()

  constructor() {
    this.messageQueue = new MessageQueue()
    this.eventEmitter = new SwarmEventEmitter()
  }

  registerAgent(agentType: AgentType): void {
    this.agentStatus.set(agentType, 'online')
  }

  unregisterAgent(agentType: AgentType): void {
    this.agentStatus.delete(agentType)
  }

  setAgentStatus(agentType: AgentType, status: 'online' | 'offline' | 'busy'): void {
    this.agentStatus.set(agentType, status)
  }

  getAgentStatus(agentType: AgentType): 'online' | 'offline' | 'busy' | undefined {
    return this.agentStatus.get(agentType)
  }

  getOnlineAgents(): AgentType[] {
    return Array.from(this.agentStatus.entries())
      .filter(([_, status]) => status === 'online')
      .map(([agent]) => agent)
  }

  sendMessage(
    from: AgentType,
    to: AgentType | 'broadcast',
    type: AgentMessage['type'],
    payload: unknown,
    options: { priority?: number; ttl?: number; correlationId?: string } = {}
  ): string {
    return this.messageQueue.send({
      from,
      to,
      type,
      payload,
      priority: options.priority ?? 5,
      ttl: options.ttl,
      correlationId: options.correlationId,
    })
  }

  async request(
    from: AgentType,
    to: AgentType,
    payload: unknown,
    timeout: number = 10000
  ): Promise<AgentMessage | null> {
    const correlationId = uuidv4()

    this.sendMessage(from, to, 'request', payload, { correlationId })

    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        resolve(null)
      }, timeout)

      const unsubscribe = this.messageQueue.subscribe(from, (msg) => {
        if (msg.correlationId === correlationId && msg.type === 'response') {
          clearTimeout(timeoutId)
          unsubscribe()
          resolve(msg)
        }
      })
    })
  }

  broadcast(
    from: AgentType,
    type: AgentMessage['type'],
    payload: unknown,
    priority: number = 5
  ): string {
    return this.sendMessage(from, 'broadcast', type, payload, { priority })
  }

  subscribeToMessages(
    agent: AgentType | 'broadcast',
    handler: (msg: AgentMessage) => void
  ): () => void {
    return this.messageQueue.subscribe(agent, handler)
  }

  getMessages(agent: AgentType): AgentMessage[] {
    return this.messageQueue.getMessagesFor(agent)
  }

  acknowledgeMessages(messageIds: string[]): void {
    this.messageQueue.acknowledge(messageIds)
  }

  async emitEvent(eventType: SwarmEventType, taskId: string, data: unknown): Promise<void> {
    await this.eventEmitter.emit(eventType, taskId, data)
  }

  onEvent(eventType: SwarmEventType | '*', handler: SwarmEventHandler): () => void {
    return this.eventEmitter.on(eventType, handler)
  }

  getEventHistory(taskId?: string): SwarmEvent[] {
    if (taskId) {
      return this.eventEmitter.getEventsForTask(taskId)
    }
    return this.eventEmitter.getEventsByType('swarm.started')
  }

  getStats(): {
    messageQueue: { total: number; byType: Record<string, number> }
    agents: { total: number; online: number; busy: number }
  } {
    const agentStats = {
      total: this.agentStatus.size,
      online: Array.from(this.agentStatus.values()).filter(s => s === 'online').length,
      busy: Array.from(this.agentStatus.values()).filter(s => s === 'busy').length,
    }

    return {
      messageQueue: this.messageQueue.getStats(),
      agents: agentStats,
    }
  }

  reset(): void {
    this.messageQueue.clear()
    this.eventEmitter.clearLog()
    this.agentStatus.clear()
  }
}

let communicationHub: AgentCommunicationHub | null = null

export function getCommunicationHub(): AgentCommunicationHub {
  if (!communicationHub) {
    communicationHub = new AgentCommunicationHub()
  }
  return communicationHub
}

export function resetCommunicationHub(): void {
  if (communicationHub) {
    communicationHub.reset()
  }
  communicationHub = null
}

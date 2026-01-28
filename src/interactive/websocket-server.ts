
import { WebSocketServer, WebSocket } from 'ws'
import { EventEmitter } from 'events'
import type { Logger } from 'motia'

export type CommandType =
  | 'play'
  | 'pause'
  | 'seek'
  | 'reload'
  | 'speed'
  | 'camera'
  | 'screenshot'
  | 'stop'

export interface InteractiveCommand {
  type: CommandType
  payload?: Record<string, unknown>
  timestamp: number
}

export interface InteractiveResponse {
  type: 'ack' | 'error' | 'status' | 'data'
  command?: CommandType
  payload?: Record<string, unknown>
  error?: string
  timestamp: number
}

export interface SessionStatus {
  sessionId: string
  playing: boolean
  currentTime: number
  totalDuration: number
  speed: number
  connected: boolean
}

export interface WebSocketServerOptions {
  port: number
  host?: string
  logger: Logger
  sessionId: string
  onCommand?: (cmd: InteractiveCommand) => void
}

export class InteractiveWebSocketServer extends EventEmitter {
  private wss: WebSocketServer | null = null
  private clients: Set<WebSocket> = new Set()
  private status: SessionStatus
  private logger: Logger
  private options: WebSocketServerOptions

  constructor(options: WebSocketServerOptions) {
    super()
    this.options = options
    this.logger = options.logger

    this.status = {
      sessionId: options.sessionId,
      playing: false,
      currentTime: 0,
      totalDuration: 0,
      speed: 1,
      connected: false
    }
  }

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.wss = new WebSocketServer({
          port: this.options.port,
          host: this.options.host || 'localhost'
        })

        this.wss.on('connection', (ws) => this.handleConnection(ws))
        this.wss.on('error', (error) => this.handleError(error))

        this.wss.on('listening', () => {
          this.logger.info(
            `[${this.options.sessionId}] WebSocket server started on port ${this.options.port}`
          )
          resolve()
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.wss) {
        for (const client of this.clients) {
          client.close(1000, 'Server shutting down')
        }
        this.clients.clear()

        this.wss.close(() => {
          this.logger.info(`[${this.options.sessionId}] WebSocket server stopped`)
          resolve()
        })
        this.wss = null
      } else {
        resolve()
      }
    })
  }

  private handleConnection(ws: WebSocket): void {
    this.clients.add(ws)
    this.status.connected = true

    this.logger.info(
      `[${this.options.sessionId}] Client connected. Total clients: ${this.clients.size}`
    )

    this.sendTo(ws, {
      type: 'status',
      payload: this.status,
      timestamp: Date.now()
    })

    ws.on('message', (data) => this.handleMessage(ws, data))

    ws.on('close', () => {
      this.clients.delete(ws)
      this.status.connected = this.clients.size > 0

      this.logger.info(
        `[${this.options.sessionId}] Client disconnected. Total clients: ${this.clients.size}`
      )
    })

    ws.on('error', (error) => {
      this.logger.error(`[${this.options.sessionId}] Client error:`, error)
    })
  }

  private handleMessage(ws: WebSocket, data: unknown): void {
    try {
      const message = JSON.parse(data.toString()) as InteractiveCommand

      this.logger.info(
        `[${this.options.sessionId}] Received command: ${message.type}`
      )

      this.processCommand(message)

      this.sendTo(ws, {
        type: 'ack',
        command: message.type,
        timestamp: Date.now()
      })

      if (this.options.onCommand) {
        this.options.onCommand(message)
      }

      this.emit('command', message)
    } catch (error) {
      this.logger.error(`[${this.options.sessionId}] Failed to parse message:`, error)

      this.sendTo(ws, {
        type: 'error',
        error: 'Invalid message format',
        timestamp: Date.now()
      })
    }
  }

  private processCommand(cmd: InteractiveCommand): void {
    switch (cmd.type) {
      case 'play':
        this.status.playing = true
        break

      case 'pause':
        this.status.playing = false
        break

      case 'seek':
        if (typeof cmd.payload?.time === 'number') {
          this.status.currentTime = cmd.payload.time as number
        }
        break

      case 'speed':
        if (typeof cmd.payload?.speed === 'number') {
          this.status.speed = cmd.payload.speed as number
        }
        break

      case 'stop':
        this.status.playing = false
        this.status.currentTime = 0
        break
    }

    this.broadcastStatus()
  }

  private sendTo(ws: WebSocket, response: InteractiveResponse): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(response))
    }
  }

  broadcast(response: InteractiveResponse): void {
    const message = JSON.stringify(response)

    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message)
      }
    }
  }

  broadcastStatus(): void {
    this.broadcast({
      type: 'status',
      payload: this.status,
      timestamp: Date.now()
    })
  }

  updateStatus(updates: Partial<SessionStatus>): void {
    this.status = { ...this.status, ...updates }
    this.broadcastStatus()
  }

  private handleError(error: Error): void {
    this.logger.error(`[${this.options.sessionId}] WebSocket server error:`, error)
    this.emit('error', error)
  }

  getStatus(): SessionStatus {
    return { ...this.status }
  }

  getClientCount(): number {
    return this.clients.size
  }

  isRunning(): boolean {
    return this.wss !== null
  }
}

export async function createInteractiveServer(
  options: WebSocketServerOptions
): Promise<InteractiveWebSocketServer> {
  const server = new InteractiveWebSocketServer(options)
  await server.start()
  return server
}

export async function findAvailablePort(
  startPort: number = 8765,
  maxTries: number = 10
): Promise<number> {
  const net = await import('net')

  for (let port = startPort; port < startPort + maxTries; port++) {
    const available = await new Promise<boolean>((resolve) => {
      const server = net.createServer()

      server.once('error', () => resolve(false))
      server.once('listening', () => {
        server.close()
        resolve(true)
      })

      server.listen(port, 'localhost')
    })

    if (available) return port
  }

  throw new Error(`No available port found in range ${startPort}-${startPort + maxTries}`)
}

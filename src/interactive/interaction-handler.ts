
import { EventEmitter } from 'events'
import { ChildProcess, spawn } from 'child_process'
import * as path from 'path'
import * as fs from 'fs'
import type { Logger } from 'motia'
import {
  InteractiveWebSocketServer,
  createInteractiveServer,
  findAvailablePort,
  type InteractiveCommand,
  type SessionStatus
} from './websocket-server'

export interface InteractiveSessionConfig {
  sessionId: string

  code: string

  tempDir: string

  logger: Logger

  wsPort?: number

  sceneName?: string

  autoStart?: boolean
}

export interface InteractiveSession {
  id: string

  wsServer: InteractiveWebSocketServer

  process: ChildProcess | null

  status: SessionStatus

  startedAt: Date

  codeFile: string
}

export interface InteractionEvents {
  'session:started': (session: InteractiveSession) => void
  'session:stopped': (sessionId: string) => void
  'session:error': (sessionId: string, error: Error) => void
  'command:received': (sessionId: string, command: InteractiveCommand) => void
  'status:updated': (sessionId: string, status: SessionStatus) => void
}

export class InteractionHandler extends EventEmitter {
  private sessions: Map<string, InteractiveSession> = new Map()
  private logger: Logger

  constructor(logger: Logger) {
    super()
    this.logger = logger
  }

  async startSession(config: InteractiveSessionConfig): Promise<InteractiveSession> {
    const { sessionId, code, tempDir, wsPort = 8765, sceneName = 'MainScene' } = config

    if (this.sessions.has(sessionId)) {
      throw new Error(`Session ${sessionId} already exists`)
    }

    this.logger.info(`[${sessionId}] Starting interactive session`)

    const port = await findAvailablePort(wsPort)
    this.logger.info(`[${sessionId}] Using WebSocket port ${port}`)

    const wsServer = await createInteractiveServer({
      port,
      logger: this.logger,
      sessionId,
      onCommand: (cmd) => this.handleCommand(sessionId, cmd)
    })

    const interactiveCode = this.prepareInteractiveCode(code, port, sceneName)

    const codeFile = path.join(tempDir, `interactive_${sessionId}.py`)
    fs.mkdirSync(tempDir, { recursive: true })
    fs.writeFileSync(codeFile, interactiveCode, 'utf-8')

    const session: InteractiveSession = {
      id: sessionId,
      wsServer,
      process: null,
      status: wsServer.getStatus(),
      startedAt: new Date(),
      codeFile
    }

    session.process = this.startManimGL(session, sceneName)

    this.sessions.set(sessionId, session)

    this.emit('session:started', session)

    this.logger.info(`[${sessionId}] Interactive session started`)

    return session
  }

  async stopSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId)

    if (!session) {
      throw new Error(`Session ${sessionId} not found`)
    }

    this.logger.info(`[${sessionId}] Stopping interactive session`)

    if (session.process && !session.process.killed) {
      session.process.kill('SIGTERM')
    }

    await session.wsServer.stop()

    try {
      fs.unlinkSync(session.codeFile)
    } catch {
    }

    this.sessions.delete(sessionId)

    this.emit('session:stopped', sessionId)

    this.logger.info(`[${sessionId}] Interactive session stopped`)
  }

  async stopAllSessions(): Promise<void> {
    const sessionIds = Array.from(this.sessions.keys())

    await Promise.all(sessionIds.map((id) => this.stopSession(id)))
  }

  getSession(sessionId: string): InteractiveSession | undefined {
    return this.sessions.get(sessionId)
  }

  getAllSessions(): InteractiveSession[] {
    return Array.from(this.sessions.values())
  }

  sendCommand(sessionId: string, command: InteractiveCommand): void {
    const session = this.sessions.get(sessionId)

    if (!session) {
      throw new Error(`Session ${sessionId} not found`)
    }

    session.wsServer.broadcast({
      type: 'data',
      payload: { command },
      timestamp: Date.now()
    })
  }

  private handleCommand(sessionId: string, command: InteractiveCommand): void {
    const session = this.sessions.get(sessionId)

    if (!session) return

    this.logger.info(`[${sessionId}] Command received: ${command.type}`)

    switch (command.type) {
      case 'play':
        session.status.playing = true
        break
      case 'pause':
        session.status.playing = false
        break
      case 'seek':
        if (typeof command.payload?.time === 'number') {
          session.status.currentTime = command.payload.time as number
        }
        break
      case 'stop':
        this.stopSession(sessionId).catch((err) =>
          this.logger.error(`[${sessionId}] Error stopping session:`, err)
        )
        return
    }

    this.emit('command:received', sessionId, command)
    this.emit('status:updated', sessionId, session.status)
  }

  private prepareInteractiveCode(
    code: string,
    wsPort: number,
    sceneName: string
  ): string {
    const interactiveHooks = `
# Interactive session hooks
import asyncio
import websockets
import json
import threading
from queue import Queue

class InteractiveController:
    def __init__(self, port=${wsPort}):
        self.port = port
        self.command_queue = Queue()
        self.connected = False
        self._thread = None

    def start(self):
        self._thread = threading.Thread(target=self._run_client, daemon=True)
        self._thread.start()

    def _run_client(self):
        asyncio.run(self._connect())

    async def _connect(self):
        uri = f"ws://localhost:{self.port}"
        try:
            async with websockets.connect(uri) as ws:
                self.connected = True
                print(f"[Interactive] Connected to control server on port {self.port}")

                while True:
                    try:
                        message = await asyncio.wait_for(ws.recv(), timeout=0.1)
                        data = json.loads(message)
                        if data.get('type') == 'data' and 'command' in data.get('payload', {}):
                            self.command_queue.put(data['payload']['command'])
                    except asyncio.TimeoutError:
                        continue
                    except Exception as e:
                        print(f"[Interactive] Error: {e}")
                        break
        except Exception as e:
            print(f"[Interactive] Connection failed: {e}")
            self.connected = False

    def get_command(self):
        if not self.command_queue.empty():
            return self.command_queue.get_nowait()
        return None

_interactive_controller = None

def init_interactive():
    global _interactive_controller
    _interactive_controller = InteractiveController()
    _interactive_controller.start()
    return _interactive_controller

def check_interactive_commands():
    global _interactive_controller
    if _interactive_controller:
        cmd = _interactive_controller.get_command()
        if cmd:
            return cmd
    return None

`

    let modifiedCode = code
    if (!modifiedCode.includes('from manimlib import')) {
      modifiedCode = modifiedCode.replace('from manim import *', 'from manimlib import *')
    }

    const importEnd = modifiedCode.indexOf('class ')
    if (importEnd > 0) {
      modifiedCode =
        modifiedCode.slice(0, importEnd) +
        interactiveHooks +
        modifiedCode.slice(importEnd)
    } else {
      modifiedCode = modifiedCode + '\n' + interactiveHooks
    }

    const constructMatch = modifiedCode.match(/def construct\(self\):\s*\n/)
    if (constructMatch) {
      const insertPos = modifiedCode.indexOf(constructMatch[0]) + constructMatch[0].length
      modifiedCode =
        modifiedCode.slice(0, insertPos) +
        '        _controller = init_interactive()\n' +
        modifiedCode.slice(insertPos)
    }

    return modifiedCode
  }

  private startManimGL(session: InteractiveSession, sceneName: string): ChildProcess {
    const args = [
      session.codeFile,
      sceneName,
      '--presenter_mode'
    ]

    this.logger.info(`[${session.id}] Starting: manimgl ${args.join(' ')}`)

    const proc = spawn('manimgl', args, {
      cwd: path.dirname(session.codeFile),
      stdio: ['pipe', 'pipe', 'pipe']
    })

    proc.stdout?.on('data', (data) => {
      this.logger.info(`[${session.id}] ManimGL: ${data.toString().trim()}`)
    })

    proc.stderr?.on('data', (data) => {
      this.logger.warn(`[${session.id}] ManimGL stderr: ${data.toString().trim()}`)
    })

    proc.on('exit', (code) => {
      this.logger.info(`[${session.id}] ManimGL exited with code ${code}`)

      if (this.sessions.has(session.id)) {
        this.stopSession(session.id).catch((err) =>
          this.logger.error(`[${session.id}] Cleanup error:`, err)
        )
      }
    })

    proc.on('error', (error) => {
      this.logger.error(`[${session.id}] ManimGL error:`, error)
      this.emit('session:error', session.id, error)
    })

    return proc
  }
}

export function createInteractionHandler(logger: Logger): InteractionHandler {
  return new InteractionHandler(logger)
}

let handlerInstance: InteractionHandler | null = null

export function getInteractionHandler(logger: Logger): InteractionHandler {
  if (!handlerInstance) {
    handlerInstance = createInteractionHandler(logger)
  }
  return handlerInstance
}

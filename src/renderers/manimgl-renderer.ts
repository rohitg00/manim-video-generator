
import { spawn } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import {
  RendererBase,
  type RenderOptions,
  type RenderResult,
  type RenderQuality,
  type RendererCapabilities
} from './renderer-base'
import { getCapabilities } from './feature-matrix'

const QUALITY_SETTINGS: Record<RenderQuality, { resolution: string; fps: number }> = {
  low: { resolution: '480p', fps: 15 },
  medium: { resolution: '720p', fps: 30 },
  high: { resolution: '1080p', fps: 60 }
}

export class ManimGLRenderer extends RendererBase {
  readonly type = 'manimgl' as const

  get capabilities(): RendererCapabilities {
    return getCapabilities('manimgl')
  }

  async isAvailable(): Promise<boolean> {
    return new Promise((resolve) => {
      const proc = spawn('manimgl', ['--version'])

      proc.on('close', (code) => resolve(code === 0))
      proc.on('error', () => {
        const proc2 = spawn('python', ['-m', 'manimlib', '--version'])
        proc2.on('close', (code) => resolve(code === 0))
        proc2.on('error', () => resolve(false))
      })
    })
  }

  async getVersion(): Promise<string | null> {
    return new Promise((resolve) => {
      const proc = spawn('manimgl', ['--version'])
      let output = ''

      proc.stdout.on('data', (data) => {
        output += data.toString()
      })

      proc.stderr.on('data', (data) => {
        output += data.toString()
      })

      proc.on('close', (code) => {
        if (code === 0) {
          const match = output.match(/v?(\d+\.\d+\.\d+)/)
          resolve(match ? match[1] : output.trim())
        } else {
          resolve(null)
        }
      })

      proc.on('error', () => resolve(null))
    })
  }

  transformCode(code: string): string {
    let transformed = code

    transformed = transformed.replace('from manim import *', 'from manimlib import *')



    if (transformed.includes('self.set_camera_orientation')) {
      transformed = transformed.replace(
        /self\.set_camera_orientation\(phi=(\d+)\s*\*\s*DEGREES,\s*theta=(\d+)\s*\*\s*DEGREES\)/g,
        'self.camera.frame.set_euler_angles(phi=$1 * DEGREES, theta=$2 * DEGREES)'
      )
    }

    if (transformed.includes('self.begin_ambient_camera_rotation')) {
      transformed = transformed.replace(
        /self\.begin_ambient_camera_rotation\(rate=([0-9.]+)\)/g,
        'self.camera.frame.add_updater(lambda m, dt: m.rotate(dt * $1, axis=UP))'
      )
      transformed = transformed.replace(
        /self\.stop_ambient_camera_rotation\(\)/g,
        'self.camera.frame.clear_updaters()'
      )
    }

    return transformed
  }

  getQualityFlag(quality: RenderQuality): string {
    const settings = QUALITY_SETTINGS[quality] || QUALITY_SETTINGS.low
    return `--${settings.resolution}`
  }

  getCommand(options: RenderOptions): { command: string; args: string[] } {
    const settings = QUALITY_SETTINGS[options.quality] || QUALITY_SETTINGS.low
    const sceneName = options.sceneName || 'MainScene'
    const codeFile = path.join(options.tempDir, 'scene.py')

    const args = [
      codeFile,
      sceneName,
      '--write_file',
      '--file_name',
      'MainScene',
      '-o',
      options.mediaDir,
      '--frame_rate',
      settings.fps.toString()
    ]

    if (settings.resolution === '1080p') {
      args.push('--uhd')
    } else if (settings.resolution === '480p') {
      args.push('--low_quality')
    }

    if (options.shaders && options.shaders.length > 0) {
    }

    if (!options.interactive) {
      args.push('--skip_animations')
      args.push('--write_file')
    }

    return { command: 'manimgl', args }
  }

  findVideoFile(mediaDir: string, quality: RenderQuality): string | null {
    const possibleNames = ['MainScene.mp4', 'MainScene.mov']

    for (const name of possibleNames) {
      const directPath = path.join(mediaDir, name)
      if (fs.existsSync(directPath)) {
        return directPath
      }
    }

    return this.findFileRecursive(mediaDir, 'MainScene.mp4') ||
           this.findFileRecursive(mediaDir, 'MainScene.mov')
  }

  async render(options: RenderOptions): Promise<RenderResult> {
    const startTime = Date.now()
    const { jobId, code, tempDir, mediaDir, logger } = options

    const transformedCode = this.transformCode(code)

    const codeFile = path.join(tempDir, 'scene.py')
    fs.writeFileSync(codeFile, transformedCode, 'utf-8')

    logger.info(`[${jobId}] Wrote ManimGL code to ${codeFile}`)

    const { command, args } = this.getCommand(options)

    logger.info(`[${jobId}] Running: ${command} ${args.join(' ')}`)

    const result = await this.executeCommand(command, args, tempDir, logger, jobId)

    if (!result.success) {
      return {
        success: false,
        stdout: result.stdout,
        stderr: result.stderr,
        renderer: this.type,
        error: 'ManimGL render failed',
        renderTime: Date.now() - startTime
      }
    }

    const videoPath = this.findVideoFile(mediaDir, options.quality)

    if (!videoPath) {
      return {
        success: false,
        stdout: result.stdout,
        stderr: result.stderr,
        renderer: this.type,
        error: 'Video file not found after ManimGL render',
        renderTime: Date.now() - startTime
      }
    }

    return {
      success: true,
      videoPath,
      stdout: result.stdout,
      stderr: result.stderr,
      renderer: this.type,
      renderTime: Date.now() - startTime
    }
  }

  async startInteractive(
    options: RenderOptions
  ): Promise<{ process: any; port: number }> {
    const { code, tempDir, logger, jobId, wsPort = 8765 } = options

    const interactiveCode = this.addInteractiveHooks(this.transformCode(code), wsPort)
    const codeFile = path.join(tempDir, 'interactive_scene.py')
    fs.writeFileSync(codeFile, interactiveCode, 'utf-8')

    logger.info(`[${jobId}] Starting interactive ManimGL session on port ${wsPort}`)

    const proc = spawn('manimgl', [codeFile, 'MainScene', '--presenter_mode'], {
      cwd: tempDir,
      detached: true
    })

    return { process: proc, port: wsPort }
  }

  private addInteractiveHooks(code: string, wsPort: number): string {
    const interactiveImports = `
import asyncio
import websockets
import json
import threading

class InteractiveController:
    def __init__(self, scene, port=${wsPort}):
        self.scene = scene
        self.port = port
        self.paused = False
        self.seek_time = None

    async def handle_commands(self, websocket, path):
        async for message in websocket:
            cmd = json.loads(message)
            if cmd['type'] == 'pause':
                self.paused = True
            elif cmd['type'] == 'play':
                self.paused = False
            elif cmd['type'] == 'seek':
                self.seek_time = cmd['time']
            elif cmd['type'] == 'reload':
                self.scene.reload()

    def start_server(self):
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        server = websockets.serve(self.handle_commands, 'localhost', self.port)
        loop.run_until_complete(server)
        loop.run_forever()

`

    return code.replace(
      'from manimlib import *',
      `from manimlib import *\n${interactiveImports}`
    )
  }

  private executeCommand(
    command: string,
    args: string[],
    cwd: string,
    logger: any,
    jobId: string
  ): Promise<{ success: boolean; stdout: string; stderr: string }> {
    return new Promise((resolve) => {
      const proc = spawn(command, args, { cwd })

      let stdout = ''
      let stderr = ''

      proc.stdout.on('data', (data) => {
        stdout += data.toString()
      })

      proc.stderr.on('data', (data) => {
        stderr += data.toString()
      })

      proc.on('close', (code) => {
        if (code === 0) {
          logger.info(`[${jobId}] ManimGL completed successfully`)
          resolve({ success: true, stdout, stderr })
        } else {
          logger.error(`[${jobId}] ManimGL exited with code ${code}`)
          resolve({ success: false, stdout, stderr })
        }
      })

      proc.on('error', (error) => {
        logger.error(`[${jobId}] Failed to start ManimGL`, error)
        resolve({ success: false, stdout, stderr: error.message })
      })
    })
  }

  private findFileRecursive(dir: string, filename: string): string | null {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory()) {
          const found = this.findFileRecursive(fullPath, filename)
          if (found) return found
        } else if (entry.name === filename) {
          return fullPath
        }
      }
    } catch {
    }

    return null
  }
}

export function createManimGLRenderer(): ManimGLRenderer {
  return new ManimGLRenderer()
}

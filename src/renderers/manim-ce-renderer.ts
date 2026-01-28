
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

const QUALITY_FLAGS: Record<RenderQuality, string> = {
  low: '-ql',
  medium: '-qm',
  high: '-qh'
}

const QUALITY_FOLDERS: Record<RenderQuality, string[]> = {
  low: ['480p15'],
  medium: ['720p30'],
  high: ['1080p60']
}

export class ManimCERenderer extends RendererBase {
  readonly type = 'manim-ce' as const

  get capabilities(): RendererCapabilities {
    return getCapabilities('manim-ce')
  }

  async isAvailable(): Promise<boolean> {
    return new Promise((resolve) => {
      const proc = spawn('manim', ['--version'])
      proc.on('close', (code) => resolve(code === 0))
      proc.on('error', () => resolve(false))
    })
  }

  async getVersion(): Promise<string | null> {
    return new Promise((resolve) => {
      const proc = spawn('manim', ['--version'])
      let output = ''

      proc.stdout.on('data', (data) => {
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
    if (code.includes('from manimlib import')) {
      return code.replace('from manimlib import *', 'from manim import *')
    }
    return code
  }

  getQualityFlag(quality: RenderQuality): string {
    return QUALITY_FLAGS[quality] || QUALITY_FLAGS.low
  }

  getCommand(options: RenderOptions): { command: string; args: string[] } {
    const qualityFlag = this.getQualityFlag(options.quality)
    const sceneName = options.sceneName || 'MainScene'

    const args = [
      'render',
      qualityFlag,
      '--format',
      'mp4',
      '--media_dir',
      options.mediaDir,
      path.join(options.tempDir, 'scene.py'),
      sceneName
    ]

    return { command: 'manim', args }
  }

  findVideoFile(mediaDir: string, quality: RenderQuality): string | null {
    const folders = QUALITY_FOLDERS[quality] || QUALITY_FOLDERS.low

    for (const folder of folders) {
      const expectedPath = path.join(mediaDir, 'videos', 'scene', folder, 'MainScene.mp4')
      if (fs.existsSync(expectedPath)) {
        return expectedPath
      }
    }

    return this.findFileRecursive(mediaDir, 'MainScene.mp4')
  }

  async render(options: RenderOptions): Promise<RenderResult> {
    const startTime = Date.now()
    const { jobId, code, tempDir, mediaDir, logger } = options

    const transformedCode = this.transformCode(code)

    const codeFile = path.join(tempDir, 'scene.py')
    fs.writeFileSync(codeFile, transformedCode, 'utf-8')

    logger.info(`[${jobId}] Wrote code to ${codeFile}`)

    const { command, args } = this.getCommand(options)

    logger.info(`[${jobId}] Running: ${command} ${args.join(' ')}`)

    const result = await this.executeCommand(command, args, tempDir, logger, jobId)

    if (!result.success) {
      return {
        success: false,
        stdout: result.stdout,
        stderr: result.stderr,
        renderer: this.type,
        error: 'Manim CE render failed',
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
        error: 'Video file not found after render',
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
          logger.info(`[${jobId}] Manim CE completed successfully`)
          resolve({ success: true, stdout, stderr })
        } else {
          logger.error(`[${jobId}] Manim CE exited with code ${code}`)
          resolve({ success: false, stdout, stderr })
        }
      })

      proc.on('error', (error) => {
        logger.error(`[${jobId}] Failed to start Manim CE`, error)
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

export function createManimCERenderer(): ManimCERenderer {
  return new ManimCERenderer()
}

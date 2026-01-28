
import type { Logger } from 'motia'

export type RendererType = 'manim-ce' | 'manimgl'

export type RenderQuality = 'low' | 'medium' | 'high'

export interface RenderOptions {
  jobId: string

  code: string

  quality: RenderQuality

  tempDir: string

  mediaDir: string

  sceneName?: string

  logger: Logger

  interactive?: boolean

  wsPort?: number

  shaders?: string[]

  preferGPU?: boolean
}

export interface RenderResult {
  success: boolean

  videoPath?: string

  stdout: string

  stderr: string

  renderTime?: number

  renderer: RendererType

  error?: string
}

export interface RendererCapabilities {
  gpuShaders: boolean

  interactive: boolean

  realTimePreview: boolean

  dockerSupport: boolean

  support3D: boolean

  supportLatex: boolean

  maxQuality: RenderQuality

  exportFormats: string[]
}

export abstract class RendererBase {
  abstract readonly type: RendererType

  abstract readonly capabilities: RendererCapabilities

  abstract isAvailable(): Promise<boolean>

  abstract getVersion(): Promise<string | null>

  abstract render(options: RenderOptions): Promise<RenderResult>

  abstract transformCode(code: string): string

  abstract getQualityFlag(quality: RenderQuality): string

  abstract getCommand(options: RenderOptions): { command: string; args: string[] }

  abstract findVideoFile(mediaDir: string, quality: RenderQuality): string | null
}

export type RendererFactory = () => RendererBase

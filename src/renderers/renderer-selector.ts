
import { exec } from 'child_process'
import { promisify } from 'util'
import type { RendererType, RendererBase, RenderQuality } from './renderer-base'
import { ManimCERenderer, createManimCERenderer } from './manim-ce-renderer'
import { ManimGLRenderer, createManimGLRenderer } from './manimgl-renderer'
import { FEATURE_MATRIX, type FeatureFlags } from './feature-matrix'

const execAsync = promisify(exec)

export interface SelectionCriteria {
  interactive?: boolean

  gpuShaders?: boolean

  realTimePreview?: boolean

  dockerRequired?: boolean

  preferGPU?: boolean

  preferredRenderer?: RendererType

  requiredFeatures?: (keyof FeatureFlags)[]

  quality?: RenderQuality
}

export interface EnvironmentInfo {
  isDocker: boolean

  hasGPU: boolean

  hasManimGL: boolean

  hasManimCE: boolean

  hasDisplay: boolean

  platform: NodeJS.Platform
}

export interface SelectionResult {
  renderer: RendererType

  instance: RendererBase

  reason: string

  warnings: string[]

  unavailableFeatures: string[]
}

export class RendererSelector {
  private manimCE: ManimCERenderer | null = null
  private manimGL: ManimGLRenderer | null = null
  private envInfo: EnvironmentInfo | null = null

  async detectEnvironment(): Promise<EnvironmentInfo> {
    if (this.envInfo) return this.envInfo

    const [isDocker, hasGPU, hasManimGL, hasManimCE, hasDisplay] = await Promise.all([
      this.checkDocker(),
      this.checkGPU(),
      this.checkManimGL(),
      this.checkManimCE(),
      this.checkDisplay()
    ])

    this.envInfo = {
      isDocker,
      hasGPU,
      hasManimGL,
      hasManimCE,
      hasDisplay,
      platform: process.platform
    }

    return this.envInfo
  }

  async select(criteria: SelectionCriteria = {}): Promise<SelectionResult> {
    const env = await this.detectEnvironment()
    const warnings: string[] = []
    const unavailableFeatures: string[] = []

    if (criteria.preferredRenderer) {
      if (criteria.preferredRenderer === 'manimgl' && env.hasManimGL) {
        return this.createResult('manimgl', 'User preference', warnings, unavailableFeatures)
      }
      if (criteria.preferredRenderer === 'manim-ce' && env.hasManimCE) {
        return this.createResult('manim-ce', 'User preference', warnings, unavailableFeatures)
      }
      warnings.push(`Preferred renderer '${criteria.preferredRenderer}' not available`)
    }

    if (criteria.interactive) {
      if (env.hasManimGL && env.hasDisplay) {
        return this.createResult(
          'manimgl',
          'Interactive mode requires ManimGL',
          warnings,
          unavailableFeatures
        )
      }
      warnings.push('Interactive mode requested but not available')
    }

    if (criteria.gpuShaders) {
      if (env.hasManimGL && env.hasGPU) {
        return this.createResult(
          'manimgl',
          'GPU shader support requires ManimGL',
          warnings,
          unavailableFeatures
        )
      }
      unavailableFeatures.push('gpuShaders')
      warnings.push('GPU shaders requested but ManimGL or GPU not available')
    }

    if (criteria.realTimePreview) {
      if (env.hasManimGL && env.hasDisplay) {
        return this.createResult(
          'manimgl',
          'Real-time preview requires ManimGL',
          warnings,
          unavailableFeatures
        )
      }
      unavailableFeatures.push('realTimePreview')
      warnings.push('Real-time preview requested but not available')
    }

    if (criteria.dockerRequired || env.isDocker) {
      if (env.hasManimCE) {
        return this.createResult(
          'manim-ce',
          'Docker environment requires Manim CE',
          warnings,
          unavailableFeatures
        )
      }
      warnings.push('Docker environment but Manim CE not available')
    }

    if (criteria.requiredFeatures && criteria.requiredFeatures.length > 0) {
      const ceSupports = criteria.requiredFeatures.every(
        (f) => FEATURE_MATRIX['manim-ce'][f]
      )
      const glSupports = criteria.requiredFeatures.every(
        (f) => FEATURE_MATRIX['manimgl'][f]
      )

      if (glSupports && !ceSupports && env.hasManimGL) {
        return this.createResult(
          'manimgl',
          'Required features only available in ManimGL',
          warnings,
          unavailableFeatures
        )
      }

      if (ceSupports && !glSupports && env.hasManimCE) {
        return this.createResult(
          'manim-ce',
          'Required features only available in Manim CE',
          warnings,
          unavailableFeatures
        )
      }

      for (const feature of criteria.requiredFeatures) {
        if (!FEATURE_MATRIX['manim-ce'][feature] && !FEATURE_MATRIX['manimgl'][feature]) {
          unavailableFeatures.push(feature)
        }
      }
    }

    if (criteria.preferGPU && env.hasGPU && env.hasManimGL) {
      return this.createResult(
        'manimgl',
        'GPU acceleration preferred and available',
        warnings,
        unavailableFeatures
      )
    }

    if (env.hasManimCE) {
      return this.createResult(
        'manim-ce',
        'Default: Manim CE for stability',
        warnings,
        unavailableFeatures
      )
    }

    if (env.hasManimGL) {
      return this.createResult(
        'manimgl',
        'Fallback: ManimGL (Manim CE not available)',
        warnings,
        unavailableFeatures
      )
    }

    throw new Error('No Manim renderer available. Please install manim or manimgl.')
  }

  getRenderer(type: RendererType): RendererBase {
    if (type === 'manim-ce') {
      if (!this.manimCE) {
        this.manimCE = createManimCERenderer()
      }
      return this.manimCE
    }

    if (!this.manimGL) {
      this.manimGL = createManimGLRenderer()
    }
    return this.manimGL
  }

  async getAvailableRenderers(): Promise<RendererType[]> {
    const env = await this.detectEnvironment()
    const available: RendererType[] = []

    if (env.hasManimCE) available.push('manim-ce')
    if (env.hasManimGL) available.push('manimgl')

    return available
  }

  private createResult(
    type: RendererType,
    reason: string,
    warnings: string[],
    unavailableFeatures: string[]
  ): SelectionResult {
    return {
      renderer: type,
      instance: this.getRenderer(type),
      reason,
      warnings,
      unavailableFeatures
    }
  }

  private async checkDocker(): Promise<boolean> {
    try {
      const { existsSync } = await import('fs')
      if (existsSync('/.dockerenv')) return true

      const { readFileSync } = await import('fs')
      const cgroup = readFileSync('/proc/1/cgroup', 'utf-8')
      return cgroup.includes('docker') || cgroup.includes('kubepods')
    } catch {
      return false
    }
  }

  private async checkGPU(): Promise<boolean> {
    try {
      await execAsync('nvidia-smi')
      return true
    } catch {
      try {
        if (process.platform === 'darwin') {
          const result = await execAsync('system_profiler SPDisplaysDataType')
          return result.stdout.includes('Metal')
        }
        return false
      } catch {
        return false
      }
    }
  }

  private async checkManimGL(): Promise<boolean> {
    if (!this.manimGL) {
      this.manimGL = createManimGLRenderer()
    }
    return this.manimGL.isAvailable()
  }

  private async checkManimCE(): Promise<boolean> {
    if (!this.manimCE) {
      this.manimCE = createManimCERenderer()
    }
    return this.manimCE.isAvailable()
  }

  private async checkDisplay(): Promise<boolean> {
    if (process.env.DISPLAY) return true

    if (process.platform === 'darwin') return true

    if (process.platform === 'win32') {
      try {
        await execAsync('where explorer.exe')
        return true
      } catch {
        return false
      }
    }

    return false
  }
}

let selectorInstance: RendererSelector | null = null

export function getRendererSelector(): RendererSelector {
  if (!selectorInstance) {
    selectorInstance = new RendererSelector()
  }
  return selectorInstance
}

export async function selectRenderer(
  criteria: SelectionCriteria = {}
): Promise<SelectionResult> {
  return getRendererSelector().select(criteria)
}

export async function selectForUseCase(
  useCase: 'default' | 'interactive' | 'docker' | 'gpu' | 'high-quality'
): Promise<SelectionResult> {
  const criteria: SelectionCriteria = {}

  switch (useCase) {
    case 'interactive':
      criteria.interactive = true
      criteria.realTimePreview = true
      break
    case 'docker':
      criteria.dockerRequired = true
      break
    case 'gpu':
      criteria.preferGPU = true
      criteria.gpuShaders = true
      break
    case 'high-quality':
      criteria.quality = 'high'
      criteria.preferGPU = true
      break
    default:
      break
  }

  return selectRenderer(criteria)
}

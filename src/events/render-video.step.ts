/**
 * Render Video Step
 * Renders Manim code to video using subprocess
 */

import { z } from 'zod'
import { spawn } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import type { EventConfig, Handlers } from 'motia'

// Input schema - includes NLU metadata
const inputSchema = z.object({
  jobId: z.string(),
  concept: z.string(),
  quality: z.enum(['low', 'medium', 'high']),
  manimCode: z.string(),
  usedAI: z.boolean(),
  generationType: z.string(),
  // NLU pipeline metadata (optional)
  skill: z.string().optional(),
  style: z.string().optional(),
  intent: z.string().optional()
})

export const config: EventConfig = {
  type: 'event',
  name: 'RenderVideo',
  description: 'Render Manim code to MP4 video',
  subscribes: ['code.generated'],
  emits: ['video.rendered', 'video.failed'],
  input: inputSchema as any
}

// Quality flag mapping
const QUALITY_FLAGS: Record<string, string> = {
  low: '-ql',
  medium: '-qm',
  high: '-qh'
}

export const handler: Handlers['RenderVideo'] = async (input, { emit, logger }) => {
  const { jobId, concept, quality, manimCode, usedAI, generationType, skill, style, intent } = inputSchema.parse(input)

  logger.info('Rendering video for job', { jobId, quality, skill, style })

  // Create temporary directory for this job
  const tempDir = path.join(os.tmpdir(), `manim-${jobId}`)
  const mediaDir = path.join(tempDir, 'media')
  const codeFile = path.join(tempDir, 'scene.py')

  // Output directory for final videos
  const outputDir = path.join(process.cwd(), 'public', 'videos')

  try {
    // Create directories
    fs.mkdirSync(tempDir, { recursive: true })
    fs.mkdirSync(mediaDir, { recursive: true })
    fs.mkdirSync(outputDir, { recursive: true })

    // Write Manim code to file
    fs.writeFileSync(codeFile, manimCode, 'utf-8')
    logger.info('Wrote code to temp file', { jobId, codeFile })

    // Build manim command
    const qualityFlag = QUALITY_FLAGS[quality] || '-ql'
    const args = [
      'render',
      qualityFlag,
      '--format', 'mp4',
      '--media_dir', mediaDir,
      codeFile,
      'MainScene'
    ]

    logger.info('Running manim command', { jobId, command: `manim ${args.join(' ')}` })

    // Run manim
    const result = await runManimCommand(args, tempDir, logger, jobId)

    if (!result.success) {
      logger.error('Manim render failed', {
        jobId,
        stderr: result.stderr
      })
      await emit({
        topic: 'video.failed',
        data: {
          jobId,
          error: 'Failed to render animation',
          details: result.stderr
        }
      })
      return
    }

    // Find the generated video file
    const videoPath = findVideoFile(mediaDir, quality)

    if (!videoPath) {
      logger.error('Video file not found after render', {
        jobId,
        mediaDir
      })
      await emit({
        topic: 'video.failed',
        data: {
          jobId,
          error: 'Generated video file not found'
        }
      })
      return
    }

    // Copy video to public directory
    const outputFilename = `${jobId}.mp4`
    const outputPath = path.join(outputDir, outputFilename)
    fs.copyFileSync(videoPath, outputPath)

    logger.info('Video saved successfully', {
      jobId,
      outputPath,
      videoUrl: `/videos/${outputFilename}`
    })

    // Emit success event with NLU metadata
    await emit({
      topic: 'video.rendered',
      data: {
        jobId,
        concept,
        manimCode,
        usedAI,
        generationType,
        quality,
        videoUrl: `/videos/${outputFilename}`,
        videoPath: outputPath,
        // NLU metadata
        skill,
        style,
        intent
      }
    })

    logger.info('Rendering complete', { jobId })

  } catch (error) {
    logger.error('Render failed with exception', {
      jobId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    await emit({
      topic: 'video.failed',
      data: {
        jobId,
        error: 'Internal error during rendering',
        details: error instanceof Error ? error.message : String(error)
      }
    })
  } finally {
    // Cleanup temp directory
    try {
      fs.rmSync(tempDir, { recursive: true, force: true })
      logger.info('Cleaned up temp directory', { jobId })
    } catch (error) {
      logger.warn('Failed to cleanup temp directory', {
        jobId,
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }
}

function runManimCommand(
  args: string[],
  cwd: string,
  logger: any,
  jobId: string
): Promise<{ success: boolean; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const proc = spawn('manim', args, { cwd })

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
        logger.info(`Job ${jobId}: Manim completed successfully`)
        resolve({ success: true, stdout, stderr })
      } else {
        logger.error(`Job ${jobId}: Manim exited with code ${code}`)
        resolve({ success: false, stdout, stderr })
      }
    })

    proc.on('error', (error) => {
      logger.error(`Job ${jobId}: Failed to start manim`, error)
      resolve({ success: false, stdout, stderr: error.message })
    })
  })
}

function findVideoFile(mediaDir: string, quality: string): string | null {
  const qualityFolders: Record<string, string[]> = {
    low: ['480p15'],
    medium: ['720p30'],
    high: ['1080p60']
  }

  const folders = qualityFolders[quality] || ['480p15', '720p30', '1080p60']

  // Check expected paths first
  for (const folder of folders) {
    const expectedPath = path.join(mediaDir, 'videos', 'scene', folder, 'MainScene.mp4')
    if (fs.existsSync(expectedPath)) {
      return expectedPath
    }
  }

  // Fallback: search recursively
  return findFileRecursive(mediaDir, 'MainScene.mp4')
}

function findFileRecursive(dir: string, filename: string): string | null {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        const found = findFileRecursive(fullPath, filename)
        if (found) return found
      } else if (entry.name === filename) {
        return fullPath
      }
    }
  } catch {
    // Ignore errors
  }

  return null
}

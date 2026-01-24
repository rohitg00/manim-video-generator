/**
 * Job Store Service
 * Uses Motia's state management for persistence across steps
 */

import type { InternalStateManager } from 'motia'

interface CompletedResult {
  status: 'completed'
  data: {
    videoUrl: string
    manimCode: string
    usedAI: boolean
    quality: string
    generationType: string
    // NLU metadata (optional)
    skill?: string
    style?: string
    intent?: string
  }
}

interface FailedResult {
  status: 'failed'
  data: {
    error: string
    details?: string
  }
}

type JobResult = (CompletedResult | FailedResult) & { timestamp: number }

const JOB_RESULTS_GROUP = 'job-results'

/**
 * Store job result using Motia's state management
 */
export async function storeJobResult(
  state: InternalStateManager,
  jobId: string,
  result: Omit<JobResult, 'timestamp'>
): Promise<void> {
  await state.set(JOB_RESULTS_GROUP, jobId, {
    ...result,
    timestamp: Date.now()
  })
}

/**
 * Get job result using Motia's state management
 */
export async function getJobResult(
  state: InternalStateManager,
  jobId: string
): Promise<JobResult | null> {
  return await state.get<JobResult>(JOB_RESULTS_GROUP, jobId)
}

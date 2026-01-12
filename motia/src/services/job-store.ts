/**
 * Job Store Service
 * In-memory store for job results
 * In production, use Motia's state management with Redis
 */

interface CompletedResult {
  status: 'completed'
  data: {
    videoUrl: string
    manimCode: string
    usedAI: boolean
    quality: string
    generationType: string
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

// In-memory store
const jobResults = new Map<string, JobResult>()

// Cleanup old results (older than 1 hour)
setInterval(() => {
  const oneHourAgo = Date.now() - 60 * 60 * 1000
  for (const [jobId, result] of jobResults.entries()) {
    if (result.timestamp < oneHourAgo) {
      jobResults.delete(jobId)
    }
  }
}, 5 * 60 * 1000)

export function storeJobResult(jobId: string, result: Omit<JobResult, 'timestamp'>): void {
  jobResults.set(jobId, {
    ...result,
    timestamp: Date.now()
  })
}

export function getJobResult(jobId: string): JobResult | undefined {
  return jobResults.get(jobId)
}

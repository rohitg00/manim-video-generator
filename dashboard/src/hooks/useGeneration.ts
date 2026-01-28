import { useState, useCallback, useRef } from 'react'

interface GenerationParams {
  concept: string
  style: '3blue1brown' | 'minimalist' | 'playful' | 'corporate' | 'neon'
  quality: 'low' | 'medium' | 'high'
  useNLU: boolean
}

interface GenerationMetadata {
  skill?: string
  style?: string
  intent?: string
}

interface GenerationResult {
  jobId: string
  videoUrl: string
  code: string
  metadata: GenerationMetadata
}

type GenerationStatus = 'idle' | 'generating' | 'completed' | 'failed'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''

export function useGeneration() {
  const [status, setStatus] = useState<GenerationStatus>('idle')
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [code, setCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [metadata, setMetadata] = useState<GenerationMetadata>({})

  const abortControllerRef = useRef<AbortController | null>(null)

  const reset = useCallback(() => {
    setStatus('idle')
    setVideoUrl(null)
    setCode(null)
    setError(null)
    setProgress(0)
    setMetadata({})
  }, [])

  const generate = useCallback(async (params: GenerationParams) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    setStatus('generating')
    setVideoUrl(null)
    setCode(null)
    setError(null)
    setProgress(0)
    setMetadata({})

    try {
      const response = await fetch(`${API_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
        signal,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to start generation')
      }

      const { jobId } = await response.json()

      const maxAttempts = params.quality === 'high' ? 180 : 90
      const pollInterval = 2000

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        if (signal.aborted) {
          throw new Error('Generation cancelled')
        }

        setProgress(attempt / maxAttempts)

        const statusResponse = await fetch(
          `${API_BASE_URL}/api/jobs/${jobId}`,
          { signal }
        )

        if (!statusResponse.ok) {
          throw new Error('Failed to check job status')
        }

        const result = await statusResponse.json()

        if (result.status === 'completed') {
          setStatus('completed')
          setVideoUrl(result.video_url)
          setCode(result.code)
          setMetadata({
            skill: result.skill,
            style: result.style,
            intent: result.intent,
          })
          setProgress(1)
          return {
            jobId,
            videoUrl: result.video_url,
            code: result.code,
            metadata: {
              skill: result.skill,
              style: result.style,
              intent: result.intent,
            },
          } as GenerationResult
        }

        if (result.status === 'failed') {
          throw new Error(result.error || 'Generation failed')
        }

        await new Promise((resolve) => setTimeout(resolve, pollInterval))
      }

      throw new Error('Generation timed out')
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          return
        }
        setError(err.message)
      } else {
        setError('An unexpected error occurred')
      }
      setStatus('failed')
    }
  }, [])

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setStatus('idle')
    setProgress(0)
  }, [])

  return {
    generate,
    cancel,
    reset,
    status,
    videoUrl,
    code,
    error,
    progress,
    metadata,
    isGenerating: status === 'generating',
    isCompleted: status === 'completed',
    isFailed: status === 'failed',
  }
}

export function useGenerationHistory() {
  const [history, setHistory] = useState<GenerationResult[]>([])

  const addToHistory = useCallback((result: GenerationResult) => {
    setHistory((prev) => [result, ...prev].slice(0, 10))
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
  }, [])

  return {
    history,
    addToHistory,
    clearHistory,
  }
}

import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Download,
  RotateCcw,
  Loader2,
} from 'lucide-react'

interface VideoPlayerProps {
  src: string | null
  status: 'idle' | 'generating' | 'completed' | 'failed'
  metadata?: {
    skill?: string
    style?: string
    intent?: string
  }
}

export function VideoPlayer({ src, status, metadata }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      setProgress((video.currentTime / video.duration) * 100)
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => {
      setIsPlaying(false)
      setProgress(0)
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
    }
  }, [src])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current
    if (!video) return

    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    video.currentTime = percent * video.duration
  }

  const handleFullscreen = () => {
    const video = videoRef.current
    if (!video) return

    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      video.requestFullscreen()
    }
  }

  const handleDownload = () => {
    if (!src) return
    const a = document.createElement('a')
    a.href = src
    a.download = 'animation.mp4'
    a.click()
  }

  const handleRestart = () => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = 0
    video.play()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (status === 'idle') {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl border bg-muted/30">
        <div className="text-center">
          <Play className="mx-auto mb-2 h-12 w-12 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            Your animation will appear here
          </p>
        </div>
      </div>
    )
  }

  if (status === 'generating') {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl border bg-muted/30">
        <div className="text-center">
          <Loader2 className="mx-auto mb-3 h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-medium">Generating animation...</p>
          <p className="mt-1 text-xs text-muted-foreground">
            This may take a moment
          </p>
        </div>
      </div>
    )
  }

  if (status === 'failed' || !src) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5">
        <div className="text-center">
          <p className="text-sm text-destructive">Generation failed</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Please try again
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-black">
      <div className="relative aspect-video">
        <video
          ref={videoRef}
          src={src}
          className="h-full w-full"
          muted={isMuted}
          playsInline
          autoPlay
          loop
        />

        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity"
        >
          <button
            onClick={togglePlay}
            className="rounded-full bg-white/20 p-4 backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            {isPlaying ? (
              <Pause className="h-8 w-8 text-white" />
            ) : (
              <Play className="h-8 w-8 text-white" />
            )}
          </button>
        </motion.div>
      </div>

      <div className="bg-card p-3">
        <div
          className="mb-3 h-1 cursor-pointer rounded-full bg-muted"
          onClick={handleSeek}
        >
          <motion.div
            className="h-full rounded-full bg-primary"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="rounded-lg p-2 hover:bg-muted"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </button>

            <button
              onClick={handleRestart}
              className="rounded-lg p-2 hover:bg-muted"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            <button
              onClick={toggleMute}
              className="rounded-lg p-2 hover:bg-muted"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>

            <span className="ml-2 text-xs text-muted-foreground">
              {formatTime(videoRef.current?.currentTime || 0)} /{' '}
              {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {metadata?.skill && (
              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                {metadata.skill}
              </span>
            )}
            {metadata?.intent && (
              <span className="rounded-full bg-muted px-2 py-1 text-xs">
                {metadata.intent}
              </span>
            )}

            <button
              onClick={handleDownload}
              className="rounded-lg p-2 hover:bg-muted"
              title="Download"
            >
              <Download className="h-4 w-4" />
            </button>

            <button
              onClick={handleFullscreen}
              className="rounded-lg p-2 hover:bg-muted"
              title="Fullscreen"
            >
              <Maximize className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

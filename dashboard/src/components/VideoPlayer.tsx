import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Download,
  RotateCcw,
  Pencil,
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
  const [showControls, setShowControls] = useState(false)

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
      <div
        className="relative aspect-video overflow-hidden bg-white border-2 border-pencil shadow-hard"
        style={{ borderRadius: '15px 255px 15px 225px / 225px 15px 255px 15px' }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="relative mx-auto mb-4 w-20 h-20">
              <div
                className="relative w-full h-full bg-[#fff9c4] border-2 border-pencil flex items-center justify-center shadow-hard-sm"
                style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
              >
                <Play className="h-8 w-8 text-pencil" strokeWidth={2.5} />
              </div>
            </div>
            <p className="text-lg text-pencil font-bold text-marker">
              Your sketch will appear here ✏️
            </p>
            <p className="text-sm text-pencil/60 mt-1 text-hand">
              Enter a prompt and click "Let's Draw!"
            </p>
          </div>
        </div>
        {/* Notebook lines */}
        <div className="absolute inset-0 bg-[repeating-linear-gradient(transparent,transparent_31px,#e5e0d8_31px,#e5e0d8_32px)]" />
      </div>
    )
  }

  if (status === 'generating') {
    return (
      <div
        className="relative aspect-video overflow-hidden bg-[#fff9c4] border-2 border-pencil shadow-hard"
        style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="relative mx-auto mb-4">
              <motion.div
                className="w-16 h-16 border-3 border-pencil border-dashed"
                style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
              <Pencil className="absolute inset-0 m-auto h-6 w-6 text-pencil" strokeWidth={2.5} />
            </div>
            <p className="text-lg font-bold text-pencil text-marker">
              Drawing your animation... ✨
            </p>
            <p className="text-sm text-pencil/60 mt-1 text-hand">
              The AI is sketching something amazing!
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-3 bg-white border-t-2 border-pencil">
          <motion.div
            className="h-full bg-[#ff4d4d]"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 30, ease: 'linear' }}
          />
        </div>
      </div>
    )
  }

  if (status === 'failed' || !src) {
    return (
      <div
        className="relative aspect-video overflow-hidden bg-white border-2 border-[#ff4d4d] shadow-hard-accent"
        style={{ borderRadius: '15px 255px 15px 225px / 225px 15px 255px 15px' }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div
              className="w-16 h-16 bg-white border-2 border-[#ff4d4d] flex items-center justify-center mx-auto mb-4 shadow-hard-sm"
              style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
            >
              <RotateCcw className="h-6 w-6 text-[#ff4d4d]" strokeWidth={2.5} />
            </div>
            <p className="text-lg font-bold text-[#ff4d4d] text-marker">
              Oops! Something went wrong 😅
            </p>
            <p className="text-sm text-pencil/60 mt-1 text-hand">
              Let's try again with a different prompt
            </p>
          </div>
        </div>
        {/* Cross-out scribble effect */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#ff4d4d] transform -rotate-12" />
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#ff4d4d] transform rotate-12" />
        </div>
      </div>
    )
  }

  return (
    <div
      className="relative overflow-hidden bg-[#2d2d2d] border-3 border-pencil shadow-hard-lg group"
      style={{ borderRadius: '15px 255px 15px 225px / 225px 15px 255px 15px' }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <div className="relative aspect-video">
        <video
          ref={videoRef}
          src={src}
          className="h-full w-full object-contain"
          muted={isMuted}
          playsInline
          autoPlay
          loop
        />

        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-t from-[#2d2d2d] via-transparent to-[#2d2d2d]/50"
            >
              <button
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-16 h-16 bg-[#fff9c4] border-3 border-pencil flex items-center justify-center shadow-hard"
                  style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
                >
                  {isPlaying ? (
                    <Pause className="h-7 w-7 text-pencil" strokeWidth={2.5} />
                  ) : (
                    <Play className="h-7 w-7 text-pencil ml-1" strokeWidth={2.5} />
                  )}
                </motion.div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#2d2d2d] to-transparent">
        <div
          className="mb-3 h-2 cursor-pointer bg-white/30 border border-white/50"
          style={{ borderRadius: '95px 8px 100px 8px / 8px 100px 8px 95px' }}
          onClick={handleSeek}
        >
          <motion.div
            className="h-full bg-[#ff4d4d] relative"
            style={{
              width: `${progress}%`,
              borderRadius: '95px 8px 100px 8px / 8px 100px 8px 95px'
            }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#fff9c4] border-2 border-pencil shadow-hard-sm opacity-0 group-hover:opacity-100 transition-opacity" style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }} />
          </motion.div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={togglePlay}
              className="p-2 hover:bg-white/10 transition-colors"
              style={{ borderRadius: '95px 8px 100px 8px / 8px 100px 8px 95px' }}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 text-white" strokeWidth={2.5} />
              ) : (
                <Play className="h-4 w-4 text-white" strokeWidth={2.5} />
              )}
            </button>

            <button
              onClick={handleRestart}
              className="p-2 hover:bg-white/10 transition-colors"
              style={{ borderRadius: '95px 8px 100px 8px / 8px 100px 8px 95px' }}
            >
              <RotateCcw className="h-4 w-4 text-white/70" strokeWidth={2.5} />
            </button>

            <button
              onClick={toggleMute}
              className="p-2 hover:bg-white/10 transition-colors"
              style={{ borderRadius: '95px 8px 100px 8px / 8px 100px 8px 95px' }}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4 text-white/70" strokeWidth={2.5} />
              ) : (
                <Volume2 className="h-4 w-4 text-white/70" strokeWidth={2.5} />
              )}
            </button>

            <span className="ml-2 text-xs text-white/70 font-hand">
              {formatTime(videoRef.current?.currentTime || 0)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {metadata?.skill && (
              <span
                className="text-xs px-2 py-1 bg-[#fff9c4] border-2 border-pencil text-pencil font-bold mr-2"
                style={{ borderRadius: '95px 8px 100px 8px / 8px 100px 8px 95px' }}
              >
                {metadata.skill}
              </span>
            )}

            <button
              onClick={handleDownload}
              className="p-2 hover:bg-white/10 transition-colors"
              style={{ borderRadius: '95px 8px 100px 8px / 8px 100px 8px 95px' }}
              title="Download"
            >
              <Download className="h-4 w-4 text-white/70" strokeWidth={2.5} />
            </button>

            <button
              onClick={handleFullscreen}
              className="p-2 hover:bg-white/10 transition-colors"
              style={{ borderRadius: '95px 8px 100px 8px / 8px 100px 8px 95px' }}
              title="Fullscreen"
            >
              <Maximize className="h-4 w-4 text-white/70" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

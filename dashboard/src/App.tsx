import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Code2, Play, Settings, Moon, Sun } from 'lucide-react'
import { PromptEditor } from './components/PromptEditor'
import { StyleGallery } from './components/StyleGallery'
import { VideoPlayer } from './components/VideoPlayer'
import { CodePanel } from './components/CodePanel'
import { useGeneration } from './hooks/useGeneration'

type Style = '3blue1brown' | 'minimalist' | 'playful' | 'corporate' | 'neon'
type Quality = 'low' | 'medium' | 'high'

export default function App() {
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState<Style>('3blue1brown')
  const [quality, setQuality] = useState<Quality>('low')
  const [useNLU, setUseNLU] = useState(true)
  const [darkMode, setDarkMode] = useState(true)

  const {
    generate,
    status,
    videoUrl,
    code,
    error,
    isGenerating,
    progress,
    metadata,
  } = useGeneration()

  const handleGenerate = () => {
    if (!prompt.trim()) return
    generate({ concept: prompt, style, quality, useNLU })
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Manim Video Generator</h1>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="rounded-lg p-2 hover:bg-muted"
              >
                {darkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
              <Settings className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">Animation Prompt</h2>
                <PromptEditor
                  value={prompt}
                  onChange={setPrompt}
                  onSubmit={handleGenerate}
                  disabled={isGenerating}
                />
              </section>

              <section className="space-y-4">
                <h2 className="text-lg font-semibold">Visual Style</h2>
                <StyleGallery
                  selected={style}
                  onSelect={setStyle}
                  disabled={isGenerating}
                />
              </section>

              <section className="space-y-4">
                <h2 className="text-lg font-semibold">Options</h2>
                <div className="flex flex-wrap gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">
                      Quality
                    </label>
                    <div className="flex gap-2">
                      {(['low', 'medium', 'high'] as Quality[]).map((q) => (
                        <button
                          key={q}
                          onClick={() => setQuality(q)}
                          disabled={isGenerating}
                          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                            quality === q
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted hover:bg-muted/80'
                          }`}
                        >
                          {q.charAt(0).toUpperCase() + q.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">
                      NLU Pipeline
                    </label>
                    <button
                      onClick={() => setUseNLU(!useNLU)}
                      disabled={isGenerating}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        useNLU
                          ? 'bg-green-500/20 text-green-500'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      {useNLU ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                </div>
              </section>

              <motion.button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex w-full items-center justify-center gap-2 rounded-lg px-6 py-4 text-lg font-semibold transition-colors ${
                  isGenerating || !prompt.trim()
                    ? 'cursor-not-allowed bg-muted text-muted-foreground'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
              >
                {isGenerating ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Generating... {Math.round(progress * 100)}%
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    Generate Animation
                  </>
                )}
              </motion.button>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-6">
              <section className="space-y-4">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <Play className="h-5 w-5" />
                  Preview
                </h2>
                <VideoPlayer
                  src={videoUrl}
                  status={status}
                  metadata={metadata}
                />
              </section>

              <section className="space-y-4">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <Code2 className="h-5 w-5" />
                  Generated Code
                </h2>
                <CodePanel code={code} />
              </section>
            </div>
          </div>
        </main>

        <footer className="border-t py-8">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>
              Built with{' '}
              <a
                href="https://www.manim.community/"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Manim
              </a>{' '}
              and AI
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}

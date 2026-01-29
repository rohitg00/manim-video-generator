import { useState } from 'react'
import {
  Sparkles,
  Code2,
  Play,
  Clock,
  XCircle,
  ArrowRight,
  RotateCcw,
  Pencil,
  Palette,
  Github,
  BookOpen,
  Layers,
} from 'lucide-react'
import { PromptEditor } from './components/PromptEditor'
import { VideoPlayer } from './components/VideoPlayer'
import { CodePanel } from './components/CodePanel'
import { ExamplesGallery } from './components/ExamplesGallery'
import { DocsSection } from './components/DocsSection'
import { useGeneration } from './hooks/useGeneration'

type Style = '3blue1brown' | 'minimalist' | 'playful' | 'corporate' | 'neon'
type Quality = 'low' | 'medium' | 'high'
type Tab = 'create' | 'examples' | 'docs'

const STYLE_PRESETS = {
  '3blue1brown': { label: '3B1B', color: '#3b82f6' },
  minimalist: { label: 'Clean', color: '#6b7280' },
  playful: { label: 'Fun!', color: '#f97316' },
  corporate: { label: 'Pro', color: '#1e40af' },
  neon: { label: 'Glow', color: '#d946ef' },
}

const QUALITY_PRESETS = {
  low: { label: 'Quick Sketch', time: '~30s' },
  medium: { label: 'Nice Drawing', time: '~1min' },
  high: { label: 'Masterpiece!', time: '~3min' },
}

const EXAMPLE_PROMPTS = [
  'Show the Pythagorean theorem ✏️',
  'Animate a bouncing ball 🏀',
  'Draw sine waves 〰️',
]

export default function App() {
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState<Style>('3blue1brown')
  const [quality, setQuality] = useState<Quality>('medium')
  const [useNLU, setUseNLU] = useState(true)
  const [showCode, setShowCode] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('create')

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

  const handleSelectExample = (examplePrompt: string) => {
    setPrompt(examplePrompt)
    setActiveTab('create')
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b-2 border-[#2d2d2d] bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 bg-[#fff9c4] border-2 border-[#2d2d2d] flex items-center justify-center shadow-hard"
              style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
            >
              <Sparkles className="h-6 w-6 text-[#2d2d2d]" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl text-[#2d2d2d]">Manim Sketchbook</h1>
              <p className="text-sm text-[#2d2d2d]/60">Draw math animations ✨</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 text-lg border-2 transition-all ${
                activeTab === 'create'
                  ? 'bg-[#2d2d2d] text-white border-[#2d2d2d]'
                  : 'bg-transparent text-[#2d2d2d]/60 border-transparent hover:text-[#2d2d2d] hover:border-[#2d2d2d]/30'
              }`}
              style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
            >
              <span className="flex items-center gap-2">
                <Pencil className="h-4 w-4" strokeWidth={2.5} />
                Create
              </span>
            </button>
            <button
              onClick={() => setActiveTab('examples')}
              className={`px-4 py-2 text-lg border-2 transition-all ${
                activeTab === 'examples'
                  ? 'bg-[#2d2d2d] text-white border-[#2d2d2d]'
                  : 'bg-transparent text-[#2d2d2d]/60 border-transparent hover:text-[#2d2d2d] hover:border-[#2d2d2d]/30'
              }`}
              style={{ borderRadius: '15px 255px 15px 225px / 225px 15px 255px 15px' }}
            >
              <span className="flex items-center gap-2">
                <Layers className="h-4 w-4" strokeWidth={2.5} />
                Examples
              </span>
            </button>
            <button
              onClick={() => setActiveTab('docs')}
              className={`px-4 py-2 text-lg border-2 transition-all ${
                activeTab === 'docs'
                  ? 'bg-[#2d2d2d] text-white border-[#2d2d2d]'
                  : 'bg-transparent text-[#2d2d2d]/60 border-transparent hover:text-[#2d2d2d] hover:border-[#2d2d2d]/30'
              }`}
              style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
            >
              <span className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" strokeWidth={2.5} />
                Docs
              </span>
            </button>
          </nav>

          <a
            href="https://github.com/rohitg00/manim-video-generator"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 border-2 border-[#2d2d2d] bg-white shadow-hard-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            style={{ borderRadius: '15px 255px 15px 225px / 225px 15px 255px 15px' }}
          >
            <Github className="h-5 w-5" strokeWidth={2.5} />
          </a>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center justify-center gap-2 px-4 pb-3">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-2 text-sm border-2 ${
              activeTab === 'create'
                ? 'bg-[#2d2d2d] text-white border-[#2d2d2d]'
                : 'bg-white text-[#2d2d2d] border-[#2d2d2d]'
            }`}
            style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
          >
            ✏️ Create
          </button>
          <button
            onClick={() => setActiveTab('examples')}
            className={`flex-1 py-2 text-sm border-2 ${
              activeTab === 'examples'
                ? 'bg-[#2d2d2d] text-white border-[#2d2d2d]'
                : 'bg-white text-[#2d2d2d] border-[#2d2d2d]'
            }`}
            style={{ borderRadius: '15px 255px 15px 225px / 225px 15px 255px 15px' }}
          >
            📚 Examples
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`flex-1 py-2 text-sm border-2 ${
              activeTab === 'docs'
                ? 'bg-[#2d2d2d] text-white border-[#2d2d2d]'
                : 'bg-white text-[#2d2d2d] border-[#2d2d2d]'
            }`}
            style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
          >
            📖 Docs
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* CREATE TAB */}
        {activeTab === 'create' && (
          <>
            {/* Hero */}
            <div className="text-center mb-12 relative">
              <div className="hidden md:block absolute -left-8 top-0 w-8 h-8 border-2 border-[#ff4d4d] border-dashed rounded-full animate-bounce-gentle" />

              <h2 className="text-5xl md:text-6xl text-[#2d2d2d] mb-4">
                Turn ideas into{' '}
                <span className="relative inline-block">
                  <span className="relative z-10">animations</span>
                  <span className="absolute bottom-2 left-0 right-0 h-3 bg-[#fff9c4] -z-0 -rotate-1" />
                </span>
                <span className="inline-block rotate-12 ml-2">!</span>
              </h2>
              <p className="text-xl md:text-2xl text-[#2d2d2d]/70 max-w-2xl mx-auto">
                Describe your math concept, and we'll sketch it out as a beautiful Manim animation 📐
              </p>
            </div>

            <div className="grid lg:grid-cols-5 gap-8">
              {/* Left Column - Controls */}
              <div className="lg:col-span-2 space-y-6">
                {/* Prompt Card */}
                <div
                  className="card-sketchy tape"
                  style={{ transform: 'rotate(-0.5deg)' }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div
                      className="w-8 h-8 bg-[#2d5da1] text-white flex items-center justify-center border-2 border-[#2d2d2d]"
                      style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
                    >
                      <Pencil className="h-4 w-4" strokeWidth={3} />
                    </div>
                    <h3 className="text-xl text-[#2d2d2d]">What do you want to animate?</h3>
                  </div>

                  <PromptEditor
                    value={prompt}
                    onChange={setPrompt}
                    onSubmit={handleGenerate}
                    disabled={isGenerating}
                    placeholder="Describe your animation idea here..."
                  />

                  <div className="mt-4 flex flex-wrap gap-2">
                    {EXAMPLE_PROMPTS.map((example, i) => (
                      <button
                        key={i}
                        onClick={() => setPrompt(example)}
                        className="text-sm px-3 py-1 border-2 border-dashed border-[#2d2d2d]/30 text-[#2d2d2d]/70 hover:border-[#2d2d2d] hover:text-[#2d2d2d] transition-colors"
                        style={{ borderRadius: '95px 8px 100px 8px / 8px 100px 8px 95px' }}
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Style Card */}
                <div
                  className="card-sketchy"
                  style={{ transform: 'rotate(0.5deg)' }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div
                      className="w-8 h-8 bg-[#ff4d4d] text-white flex items-center justify-center border-2 border-[#2d2d2d]"
                      style={{ borderRadius: '15px 255px 15px 225px / 225px 15px 255px 15px' }}
                    >
                      <Palette className="h-4 w-4" strokeWidth={3} />
                    </div>
                    <h3 className="text-xl text-[#2d2d2d]">Pick a style</h3>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(Object.entries(STYLE_PRESETS) as [Style, typeof STYLE_PRESETS['3blue1brown']][]).map(
                      ([key, preset]) => (
                        <button
                          key={key}
                          onClick={() => setStyle(key)}
                          disabled={isGenerating}
                          className={`px-4 py-2 border-[3px] transition-all duration-100 ${
                            style === key
                              ? 'bg-[#2d2d2d] text-white border-[#2d2d2d] shadow-none translate-x-[2px] translate-y-[2px]'
                              : 'bg-white text-[#2d2d2d] border-[#2d2d2d] shadow-hard-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
                          }`}
                          style={{
                            borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
                          }}
                        >
                          <span className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full border border-[#2d2d2d]"
                              style={{ backgroundColor: preset.color }}
                            />
                            {preset.label}
                          </span>
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Quality Card */}
                <div
                  className="card-postit"
                  style={{ transform: 'rotate(-1deg)' }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-5 w-5 text-[#2d2d2d]" strokeWidth={2.5} />
                    <h3 className="text-xl text-[#2d2d2d]">Quality</h3>
                  </div>

                  <div className="space-y-2">
                    {(Object.entries(QUALITY_PRESETS) as [Quality, typeof QUALITY_PRESETS['low']][]).map(
                      ([key, preset]) => (
                        <button
                          key={key}
                          onClick={() => setQuality(key)}
                          disabled={isGenerating}
                          className={`w-full text-left px-4 py-2 border-2 transition-all ${
                            quality === key
                              ? 'bg-white border-[#2d2d2d] shadow-hard-sm'
                              : 'bg-transparent border-dashed border-[#2d2d2d]/40 hover:border-[#2d2d2d]'
                          }`}
                          style={{ borderRadius: '15px 255px 15px 225px / 225px 15px 255px 15px' }}
                        >
                          <span className="flex items-center justify-between">
                            <span className="text-[#2d2d2d]">{preset.label}</span>
                            <span className="text-sm text-[#2d2d2d]/60">{preset.time}</span>
                          </span>
                        </button>
                      )
                    )}
                  </div>

                  {/* NLU Toggle */}
                  <div className="mt-4 pt-4 border-t-2 border-dashed border-[#2d2d2d]/30">
                    <button
                      onClick={() => setUseNLU(!useNLU)}
                      disabled={isGenerating}
                      className="flex items-center gap-3 w-full"
                    >
                      <div
                        className={`w-12 h-6 border-2 border-[#2d2d2d] relative transition-colors ${
                          useNLU ? 'bg-[#2d5da1]' : 'bg-white'
                        }`}
                        style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
                      >
                        <div
                          className={`absolute top-0.5 w-4 h-4 bg-white border-2 border-[#2d2d2d] transition-all ${
                            useNLU ? 'left-6' : 'left-0.5'
                          }`}
                          style={{ borderRadius: '50%' }}
                        />
                      </div>
                      <span className="text-[#2d2d2d]">
                        Smart Mode <span className="text-[#2d5da1]">(AI-enhanced)</span>
                      </span>
                    </button>
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className={`w-full py-4 text-xl border-[3px] transition-all duration-100 flex items-center justify-center gap-3 ${
                    isGenerating || !prompt.trim()
                      ? 'bg-[#e5e0d8] border-[#2d2d2d]/40 text-[#2d2d2d]/40 cursor-not-allowed'
                      : 'bg-[#ff4d4d] border-[#2d2d2d] text-white shadow-hard-lg hover:shadow-hard hover:translate-x-[2px] hover:translate-y-[2px]'
                  }`}
                  style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
                >
                  {isGenerating ? (
                    <>
                      <div className="w-6 h-6 border-3 border-[#2d2d2d]/30 border-t-[#2d2d2d] rounded-full animate-spin" />
                      Drawing... {Math.round(progress * 100)}%
                    </>
                  ) : (
                    <>
                      <Play className="h-6 w-6" strokeWidth={3} fill="currentColor" />
                      Let's Draw!
                      <ArrowRight className="h-5 w-5" strokeWidth={3} />
                    </>
                  )}
                </button>
              </div>

              {/* Right Column - Preview */}
              <div className="lg:col-span-3 space-y-6">
                {/* Video Preview */}
                <div
                  className="bg-white border-2 border-[#2d2d2d] overflow-hidden shadow-hard-lg tack"
                  style={{
                    borderRadius: '15px 255px 15px 225px / 225px 15px 255px 15px',
                    transform: 'rotate(0.5deg)'
                  }}
                >
                  <div className="p-4 border-b-2 border-dashed border-[#2d2d2d]/30 flex items-center justify-between">
                    <h3 className="text-xl text-[#2d2d2d] flex items-center gap-2">
                      <Play className="h-5 w-5" strokeWidth={2.5} />
                      Your Animation
                    </h3>
                    {videoUrl && (
                      <span className="text-sm px-3 py-1 bg-[#fff9c4] border-2 border-[#2d2d2d]" style={{ borderRadius: '95px 8px 100px 8px / 8px 100px 8px 95px' }}>
                        ✓ Ready!
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <VideoPlayer src={videoUrl} status={status} metadata={metadata} />
                  </div>

                  {isGenerating && (
                    <div className="px-4 pb-4">
                      <div className="flex items-center gap-4 mb-2">
                        <span className={`text-sm ${progress > 0.25 ? 'text-[#2d2d2d]' : 'text-[#2d2d2d]/40'}`}>
                          ✏️ Analyzing
                        </span>
                        <span className={`text-sm ${progress > 0.5 ? 'text-[#2d2d2d]' : 'text-[#2d2d2d]/40'}`}>
                          🎨 Designing
                        </span>
                        <span className={`text-sm ${progress > 0.75 ? 'text-[#2d2d2d]' : 'text-[#2d2d2d]/40'}`}>
                          📝 Coding
                        </span>
                        <span className={`text-sm ${progress > 0.9 ? 'text-[#2d2d2d]' : 'text-[#2d2d2d]/40'}`}>
                          🎬 Rendering
                        </span>
                      </div>
                      <div className="h-3 bg-[#e5e0d8] border-2 border-[#2d2d2d]" style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}>
                        <div
                          className="h-full bg-[#2d5da1] transition-all duration-300"
                          style={{
                            width: `${progress * 100}%`,
                            borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px'
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Code Panel */}
                <div
                  className="bg-white border-2 border-[#2d2d2d] overflow-hidden shadow-hard"
                  style={{
                    borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
                    transform: 'rotate(-0.3deg)'
                  }}
                >
                  <button
                    onClick={() => setShowCode(!showCode)}
                    className="w-full p-4 border-b-2 border-dashed border-[#2d2d2d]/30 flex items-center justify-between hover:bg-[#fdfbf7] transition-colors"
                  >
                    <h3 className="text-xl text-[#2d2d2d] flex items-center gap-2">
                      <Code2 className="h-5 w-5" strokeWidth={2.5} />
                      Generated Code
                    </h3>
                    <span className="text-2xl text-[#2d2d2d]">{showCode ? '−' : '+'}</span>
                  </button>

                  {showCode && (
                    <div className="p-4">
                      <CodePanel code={code} />
                    </div>
                  )}

                  {!showCode && code && (
                    <div className="px-4 pb-4 flex items-center gap-2 text-sm text-[#2d2d2d]/60">
                      <span className="px-2 py-1 bg-[#e5e0d8] border border-[#2d2d2d]/30" style={{ borderRadius: '4px' }}>Python</span>
                      <span>{code.split('\n').length} lines</span>
                    </div>
                  )}
                </div>

                {/* Error */}
                {error && (
                  <div
                    className="bg-white border-[3px] border-[#ff4d4d] p-4 shadow-hard-accent"
                    style={{
                      borderRadius: '15px 255px 15px 225px / 225px 15px 255px 15px',
                      transform: 'rotate(-0.5deg)'
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <XCircle className="h-6 w-6 text-[#ff4d4d] flex-shrink-0" strokeWidth={2.5} />
                      <div>
                        <h4 className="text-lg text-[#ff4d4d] mb-1">Oops! Something went wrong 😅</h4>
                        <p className="text-[#2d2d2d]/70">{error}</p>
                        <button
                          onClick={handleGenerate}
                          className="mt-3 text-[#2d5da1] hover:underline flex items-center gap-1"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Try again?
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* EXAMPLES TAB */}
        {activeTab === 'examples' && (
          <>
            <div className="text-center mb-12">
              <h2 className="text-5xl md:text-6xl text-[#2d2d2d] mb-4">
                Example Gallery 🖼️
              </h2>
              <p className="text-xl md:text-2xl text-[#2d2d2d]/70 max-w-2xl mx-auto">
                Get inspired by these ready-to-use animation prompts
              </p>
            </div>
            <ExamplesGallery onSelectPrompt={handleSelectExample} />
          </>
        )}

        {/* DOCS TAB */}
        {activeTab === 'docs' && (
          <DocsSection />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-dashed border-[#2d2d2d]/30 mt-16 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#2d2d2d]/60">
            Made with ✏️ + Manim + AI
          </p>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('docs')}
              className="text-[#2d2d2d]/60 hover:text-[#2d2d2d] flex items-center gap-1"
            >
              <BookOpen className="h-4 w-4" strokeWidth={2.5} />
              Docs
            </button>
            <a href="https://github.com/rohitg00/manim-video-generator" target="_blank" rel="noopener noreferrer" className="text-[#2d2d2d]/60 hover:text-[#2d2d2d] flex items-center gap-1">
              <Github className="h-4 w-4" strokeWidth={2.5} />
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

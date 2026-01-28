import { motion } from 'framer-motion'
import { Play, Code2, Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface Example {
  id: string
  title: string
  description: string
  prompt: string
  thumbnail: string
  category: 'math' | 'physics' | 'data' | 'other'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

const EXAMPLES: Example[] = [
  {
    id: '1',
    title: 'Pythagorean Theorem',
    description: 'Classic proof with animated squares',
    prompt: 'Show the Pythagorean theorem with animated squares on each side of a right triangle',
    thumbnail: '📐',
    category: 'math',
    difficulty: 'beginner',
  },
  {
    id: '2',
    title: 'Sine Wave Animation',
    description: 'Unit circle to sine wave transformation',
    prompt: 'Animate how the unit circle creates a sine wave, showing the connection between circular motion and the wave',
    thumbnail: '〰️',
    category: 'math',
    difficulty: 'intermediate',
  },
  {
    id: '3',
    title: 'Bouncing Ball Physics',
    description: 'Gravity and energy conservation',
    prompt: 'Show a bouncing ball with decreasing height, demonstrating energy loss',
    thumbnail: '🏀',
    category: 'physics',
    difficulty: 'beginner',
  },
  {
    id: '4',
    title: 'Fourier Transform',
    description: 'Breaking down complex signals',
    prompt: 'Demonstrate how the Fourier transform breaks a square wave into sine components',
    thumbnail: '📊',
    category: 'math',
    difficulty: 'advanced',
  },
  {
    id: '5',
    title: 'Binary Search',
    description: 'Algorithm visualization',
    prompt: 'Visualize binary search algorithm finding a number in a sorted array',
    thumbnail: '🔍',
    category: 'data',
    difficulty: 'intermediate',
  },
  {
    id: '6',
    title: 'Newton\'s Cradle',
    description: 'Conservation of momentum',
    prompt: 'Animate Newton\'s cradle showing momentum and energy transfer',
    thumbnail: '⚖️',
    category: 'physics',
    difficulty: 'intermediate',
  },
  {
    id: '7',
    title: 'Matrix Multiplication',
    description: 'Step-by-step calculation',
    prompt: 'Show matrix multiplication with highlighted rows and columns',
    thumbnail: '🔢',
    category: 'math',
    difficulty: 'beginner',
  },
  {
    id: '8',
    title: 'Bubble Sort',
    description: 'Sorting algorithm in action',
    prompt: 'Visualize bubble sort with colored bars swapping positions',
    thumbnail: '📈',
    category: 'data',
    difficulty: 'beginner',
  },
]

const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '✨' },
  { id: 'math', label: 'Math', emoji: '📐' },
  { id: 'physics', label: 'Physics', emoji: '⚡' },
  { id: 'data', label: 'Data & Algo', emoji: '📊' },
]

interface ExamplesGalleryProps {
  onSelectPrompt: (prompt: string) => void
}

export function ExamplesGallery({ onSelectPrompt }: ExamplesGalleryProps) {
  const [category, setCategory] = useState<string>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const filteredExamples = category === 'all'
    ? EXAMPLES
    : EXAMPLES.filter(e => e.category === category)

  const handleCopy = async (example: Example) => {
    await navigator.clipboard.writeText(example.prompt)
    setCopiedId(example.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-8">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`px-4 py-2 border-2 transition-all ${
              category === cat.id
                ? 'bg-[#2d2d2d] text-white border-[#2d2d2d] shadow-none translate-x-[2px] translate-y-[2px]'
                : 'bg-white text-[#2d2d2d] border-[#2d2d2d] shadow-hard-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
            }`}
            style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Examples Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredExamples.map((example, index) => (
          <motion.div
            key={example.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white border-2 border-[#2d2d2d] shadow-hard overflow-hidden group"
            style={{
              borderRadius: index % 2 === 0
                ? '255px 15px 225px 15px / 15px 225px 15px 255px'
                : '15px 255px 15px 225px / 225px 15px 255px 15px',
              transform: `rotate(${index % 2 === 0 ? -0.5 : 0.5}deg)`,
            }}
          >
            {/* Thumbnail */}
            <div className="h-24 bg-[#fff9c4] border-b-2 border-dashed border-[#2d2d2d]/30 flex items-center justify-center">
              <span className="text-5xl">{example.thumbnail}</span>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-lg font-bold text-[#2d2d2d]" style={{ fontFamily: "'Kalam', cursive" }}>
                  {example.title}
                </h3>
                <span
                  className={`text-xs px-2 py-0.5 border ${
                    example.difficulty === 'beginner'
                      ? 'bg-green-100 border-green-500 text-green-700'
                      : example.difficulty === 'intermediate'
                      ? 'bg-yellow-100 border-yellow-500 text-yellow-700'
                      : 'bg-red-100 border-red-500 text-red-700'
                  }`}
                  style={{ borderRadius: '4px' }}
                >
                  {example.difficulty}
                </span>
              </div>

              <p className="text-sm text-[#2d2d2d]/70 mb-4" style={{ fontFamily: "'Patrick Hand', cursive" }}>
                {example.description}
              </p>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => onSelectPrompt(example.prompt)}
                  className="flex-1 flex items-center justify-center gap-1 py-2 bg-[#ff4d4d] text-white border-2 border-[#2d2d2d] shadow-hard-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                  style={{ borderRadius: '95px 8px 100px 8px / 8px 100px 8px 95px' }}
                >
                  <Play className="h-4 w-4" strokeWidth={2.5} fill="currentColor" />
                  <span className="text-sm font-bold">Try it!</span>
                </button>

                <button
                  onClick={() => handleCopy(example)}
                  className="p-2 bg-white border-2 border-[#2d2d2d] shadow-hard-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                  style={{ borderRadius: '95px 8px 100px 8px / 8px 100px 8px 95px' }}
                  title="Copy prompt"
                >
                  {copiedId === example.id ? (
                    <Check className="h-4 w-4 text-green-600" strokeWidth={2.5} />
                  ) : (
                    <Copy className="h-4 w-4 text-[#2d2d2d]" strokeWidth={2.5} />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Prompt Preview */}
      <div
        className="card-postit max-w-2xl mx-auto"
        style={{ transform: 'rotate(1deg)' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Code2 className="h-5 w-5 text-[#2d2d2d]" strokeWidth={2.5} />
          <span className="text-lg font-bold text-[#2d2d2d]">Pro tip!</span>
        </div>
        <p className="text-[#2d2d2d]/80" style={{ fontFamily: "'Patrick Hand', cursive" }}>
          Click "Try it!" to use an example prompt, or copy and customize it to fit your needs.
          The more specific your prompt, the better the animation! 📝
        </p>
      </div>
    </div>
  )
}

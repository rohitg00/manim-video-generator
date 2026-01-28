import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { clsx } from 'clsx'

type Style = '3blue1brown' | 'minimalist' | 'playful' | 'corporate' | 'neon'

interface StyleGalleryProps {
  selected: Style
  onSelect: (style: Style) => void
  disabled?: boolean
}

const STYLES: {
  id: Style
  name: string
  description: string
  emoji: string
  background: string
  primaryColor: string
  accentColor: string
  textColor: string
}[] = [
  {
    id: '3blue1brown',
    name: '3Blue1Brown',
    description: 'Classic math style',
    emoji: '📐',
    background: '#1c1c1c',
    primaryColor: '#3b82f6',
    accentColor: '#22c55e',
    textColor: '#ffffff',
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Clean & simple',
    emoji: '✨',
    background: '#f5f5f5',
    primaryColor: '#1f2937',
    accentColor: '#3b82f6',
    textColor: '#1f2937',
  },
  {
    id: 'playful',
    name: 'Playful',
    description: 'Fun for learning',
    emoji: '🎨',
    background: '#fef3c7',
    primaryColor: '#f97316',
    accentColor: '#ec4899',
    textColor: '#1f2937',
  },
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Business ready',
    emoji: '💼',
    background: '#1e293b',
    primaryColor: '#0ea5e9',
    accentColor: '#a3e635',
    textColor: '#f1f5f9',
  },
  {
    id: 'neon',
    name: 'Neon',
    description: 'Glowing vibes',
    emoji: '🌟',
    background: '#0a0a0a',
    primaryColor: '#f0abfc',
    accentColor: '#22d3ee',
    textColor: '#ffffff',
  },
]

export function StyleGallery({ selected, onSelect, disabled }: StyleGalleryProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {STYLES.map((style, index) => (
        <motion.button
          key={style.id}
          onClick={() => onSelect(style.id)}
          disabled={disabled}
          whileHover={{ scale: disabled ? 1 : 1.02, rotate: disabled ? 0 : (index % 2 === 0 ? 1 : -1) }}
          whileTap={{ scale: disabled ? 1 : 0.98 }}
          className={clsx(
            'relative overflow-hidden p-4 text-left transition-all border-2',
            selected === style.id
              ? 'border-[#ff4d4d] shadow-hard-accent'
              : 'border-pencil shadow-hard hover:shadow-hard-lg',
            disabled && 'cursor-not-allowed opacity-50'
          )}
          style={{
            borderRadius: index % 2 === 0
              ? '255px 15px 225px 15px / 15px 225px 15px 255px'
              : '15px 255px 15px 225px / 225px 15px 255px 15px',
            background: style.background,
            color: style.textColor,
            transform: `rotate(${index % 2 === 0 ? -0.5 : 0.5}deg)`,
          }}
        >
          {selected === style.id && (
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              className="absolute right-2 top-2 bg-[#ff4d4d] border-2 border-white p-1"
              style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
            >
              <Check className="h-3 w-3 text-white" strokeWidth={3} />
            </motion.div>
          )}

          <div className="mb-3 flex items-center gap-2">
            <span className="text-xl">{style.emoji}</span>
            <div className="flex gap-1.5">
              <div
                className="h-4 w-4 border border-current/30"
                style={{
                  background: style.primaryColor,
                  borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px'
                }}
              />
              <div
                className="h-4 w-4 border border-current/30"
                style={{
                  background: style.accentColor,
                  borderRadius: '15px 255px 15px 225px / 225px 15px 255px 15px'
                }}
              />
            </div>
          </div>

          <h3
            className="text-base font-bold"
            style={{ fontFamily: "'Kalam', cursive" }}
          >
            {style.name}
          </h3>
          <p
            className="mt-0.5 text-sm opacity-70"
            style={{ fontFamily: "'Patrick Hand', cursive" }}
          >
            {style.description}
          </p>

          {/* Mini preview */}
          <div
            className="mt-3 h-8 overflow-hidden opacity-60 border border-current/20"
            style={{ borderRadius: '95px 8px 100px 8px / 8px 100px 8px 95px' }}
          >
            <svg width="100%" height="100%" viewBox="0 0 100 32">
              <motion.circle
                cx="20"
                cy="16"
                r="5"
                fill={style.primaryColor}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.rect
                x="42"
                y="11"
                width="10"
                height="10"
                fill={style.accentColor}
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
              <motion.path
                d="M70 22 L76 10 L82 22 Z"
                fill={style.primaryColor}
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </svg>
          </div>
        </motion.button>
      ))}
    </div>
  )
}

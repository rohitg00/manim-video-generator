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
  background: string
  primaryColor: string
  accentColor: string
  textColor: string
}[] = [
  {
    id: '3blue1brown',
    name: '3Blue1Brown',
    description: 'Classic mathematical animation style',
    background: '#1c1c1c',
    primaryColor: '#3b82f6',
    accentColor: '#22c55e',
    textColor: '#ffffff',
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Clean and simple white background',
    background: '#f5f5f5',
    primaryColor: '#1f2937',
    accentColor: '#3b82f6',
    textColor: '#1f2937',
  },
  {
    id: 'playful',
    name: 'Playful',
    description: 'Colorful and fun for education',
    background: '#fef3c7',
    primaryColor: '#f97316',
    accentColor: '#ec4899',
    textColor: '#1f2937',
  },
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Professional business style',
    background: '#1e293b',
    primaryColor: '#0ea5e9',
    accentColor: '#a3e635',
    textColor: '#f1f5f9',
  },
  {
    id: 'neon',
    name: 'Neon',
    description: 'Dark with glowing elements',
    background: '#0a0a0a',
    primaryColor: '#f0abfc',
    accentColor: '#22d3ee',
    textColor: '#ffffff',
  },
]

export function StyleGallery({ selected, onSelect, disabled }: StyleGalleryProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {STYLES.map((style) => (
        <motion.button
          key={style.id}
          onClick={() => onSelect(style.id)}
          disabled={disabled}
          whileHover={{ scale: disabled ? 1 : 1.02 }}
          whileTap={{ scale: disabled ? 1 : 0.98 }}
          className={clsx(
            'relative overflow-hidden rounded-xl p-4 text-left transition-all',
            'border-2',
            selected === style.id
              ? 'border-primary ring-2 ring-primary/20'
              : 'border-transparent hover:border-muted-foreground/20',
            disabled && 'cursor-not-allowed opacity-50'
          )}
          style={{
            background: style.background,
            color: style.textColor,
          }}
        >
          {selected === style.id && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-2 top-2 rounded-full bg-primary p-1"
            >
              <Check className="h-3 w-3 text-primary-foreground" />
            </motion.div>
          )}

          <div className="mb-3 flex gap-2">
            <div
              className="h-5 w-5 rounded-full"
              style={{ background: style.primaryColor }}
            />
            <div
              className="h-5 w-5 rounded-full"
              style={{ background: style.accentColor }}
            />
          </div>

          <h3 className="text-sm font-semibold">{style.name}</h3>
          <p className="mt-1 text-xs opacity-70">{style.description}</p>

          <div className="mt-3 h-8 overflow-hidden rounded-md opacity-50">
            <svg width="100%" height="100%" viewBox="0 0 100 32">
              <motion.circle
                cx="20"
                cy="16"
                r="6"
                fill={style.primaryColor}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.rect
                x="40"
                y="10"
                width="12"
                height="12"
                fill={style.accentColor}
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
              <motion.path
                d="M70 22 L76 10 L82 22 Z"
                fill={style.primaryColor}
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </svg>
          </div>
        </motion.button>
      ))}
    </div>
  )
}

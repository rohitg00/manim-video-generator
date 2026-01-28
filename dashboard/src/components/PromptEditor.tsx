import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Lightbulb, Image, X } from 'lucide-react'

interface PromptEditorProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled?: boolean
}

const EXAMPLE_PROMPTS = [
  'Show how the Pythagorean theorem works with a visual proof',
  'Visualize the derivative of sin(x) as a rate of change',
  'Demonstrate bubble sort algorithm step by step',
  'Animate a sine wave transforming into a cosine wave',
  'Show how vectors add together in 2D space',
  'Explain the chain rule with animated derivatives',
  'Visualize matrix multiplication step by step',
  'Show the relationship between e^(ix) and the unit circle',
]

export function PromptEditor({
  value,
  onChange,
  onSubmit,
  disabled = false,
}: PromptEditorProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [value])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      onSubmit()
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Describe what you want to animate...

Examples:
- Show how the Pythagorean theorem works
- Visualize the derivative of x^2
- Demonstrate sorting algorithms"
          className="w-full resize-none rounded-lg border bg-background p-4 pr-12 text-base leading-relaxed transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
          rows={4}
        />

        <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
          {value.length}/2000
        </div>
      </div>

      {imagePreview && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative inline-block"
        >
          <img
            src={imagePreview}
            alt="Uploaded diagram"
            className="h-24 rounded-lg border object-cover"
          />
          <button
            onClick={removeImage}
            className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/90"
          >
            <X className="h-3 w-3" />
          </button>
        </motion.div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setShowSuggestions(!showSuggestions)}
          className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm font-medium transition-colors hover:bg-muted/80"
        >
          <Lightbulb className="h-4 w-4" />
          Examples
        </button>

        <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm font-medium transition-colors hover:bg-muted/80">
          <Image className="h-4 w-4" />
          Upload Diagram
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>

        <span className="ml-auto flex items-center text-xs text-muted-foreground">
          Press <kbd className="mx-1 rounded bg-muted px-1.5 py-0.5 font-mono">Cmd</kbd> +{' '}
          <kbd className="mx-1 rounded bg-muted px-1.5 py-0.5 font-mono">Enter</kbd> to generate
        </span>
      </div>

      {showSuggestions && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border bg-card p-4"
        >
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">
            Example Prompts
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {EXAMPLE_PROMPTS.map((example, index) => (
              <button
                key={index}
                onClick={() => {
                  onChange(example)
                  setShowSuggestions(false)
                }}
                className="rounded-lg bg-muted/50 p-3 text-left text-sm transition-colors hover:bg-muted"
              >
                {example}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

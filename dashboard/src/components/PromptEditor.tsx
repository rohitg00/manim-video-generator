import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Image, X, Pencil } from 'lucide-react'

interface PromptEditorProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled?: boolean
  placeholder?: string
}

export function PromptEditor({
  value,
  onChange,
  onSubmit,
  disabled = false,
  placeholder = "What should we draw today? ✏️",
}: PromptEditorProps) {
  const [isFocused, setIsFocused] = useState(false)
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
      <div
        className={`relative transition-all duration-300 bg-white border-2 ${
          isFocused
            ? 'border-[#2d5da1] shadow-hard-blue'
            : 'border-pencil shadow-hard'
        }`}
        style={{ borderRadius: '15px 255px 15px 225px / 225px 15px 255px 15px' }}
      >
        {/* Notebook lines background */}
        <div className="absolute inset-0 bg-[repeating-linear-gradient(transparent,transparent_31px,#e5e0d8_31px,#e5e0d8_32px)] pointer-events-none" style={{ borderRadius: '15px 255px 15px 225px / 225px 15px 255px 15px' }} />

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          placeholder={placeholder}
          className="relative w-full resize-none bg-transparent p-4 text-pencil placeholder:text-pencil/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 text-lg"
          style={{ fontFamily: "'Patrick Hand', cursive" }}
          rows={4}
        />

        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <span
            className="text-xs text-pencil/50 px-2 py-1 bg-[#fff9c4] border border-pencil"
            style={{ borderRadius: '95px 8px 100px 8px / 8px 100px 8px 95px', fontFamily: "'Patrick Hand', cursive" }}
          >
            {value.length}/2000
          </span>
        </div>

        <AnimatePresence>
          {isFocused && value.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotate: 5 }}
              className="absolute bottom-3 right-24"
            >
              <button
                onClick={onSubmit}
                disabled={disabled || !value.trim()}
                className="p-2 bg-[#ff4d4d] border-2 border-pencil text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#e64545] transition-colors shadow-hard-sm"
                style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
              >
                <Pencil className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {imagePreview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 1 }}
            exit={{ opacity: 0, scale: 0.95, rotate: 2 }}
            className="relative inline-block"
          >
            <img
              src={imagePreview}
              alt="Uploaded diagram"
              className="h-20 border-2 border-pencil object-cover shadow-hard"
              style={{ borderRadius: '15px 255px 15px 225px / 225px 15px 255px 15px' }}
            />
            <button
              onClick={removeImage}
              className="absolute -right-2 -top-2 bg-[#ff4d4d] border-2 border-pencil p-1 text-white hover:bg-[#e64545] transition-colors shadow-hard-sm"
              style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
            >
              <X className="h-3 w-3" strokeWidth={3} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label
            className={`flex items-center gap-2 bg-white border-2 border-pencil px-3 py-2 text-sm font-bold text-pencil transition-colors shadow-hard-sm ${
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-[#e5e0d8]'
            }`}
            style={{ borderRadius: '95px 8px 100px 8px / 8px 100px 8px 95px', fontFamily: "'Patrick Hand', cursive" }}
            aria-disabled={disabled}
          >
            <Image className="h-4 w-4" strokeWidth={2.5} />
            📎 Upload Diagram
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => { if (!disabled) handleImageUpload(e) }}
              disabled={disabled}
              className="hidden"
            />
          </label>
        </div>

        <div className="flex items-center text-sm text-pencil/60" style={{ fontFamily: "'Patrick Hand', cursive" }}>
          <span
            className="px-2 py-1 bg-[#fff9c4] border border-pencil mr-1"
            style={{ borderRadius: '4px' }}
          >⌘</span>
          <span className="mr-1">+</span>
          <span
            className="px-2 py-1 bg-[#fff9c4] border border-pencil mr-2"
            style={{ borderRadius: '4px' }}
          >↵</span>
          <span>to draw!</span>
        </div>
      </div>
    </div>
  )
}

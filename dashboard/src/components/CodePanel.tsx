import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check, Download, FileCode2, Terminal } from 'lucide-react'

interface CodePanelProps {
  code: string | null
}

export function CodePanel({ code }: CodePanelProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!code) return
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!code) return
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'animation.py'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!code) {
    return (
      <div
        className="relative overflow-hidden bg-white border-2 border-pencil p-8 shadow-hard"
        style={{ borderRadius: '15px 255px 15px 225px / 225px 15px 255px 15px' }}
      >
        <div className="text-center">
          <div
            className="w-14 h-14 bg-[#fff9c4] border-2 border-pencil flex items-center justify-center mx-auto mb-4 shadow-hard-sm"
            style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
          >
            <Terminal className="h-6 w-6 text-pencil" strokeWidth={2.5} />
          </div>
          <p className="text-lg text-pencil font-bold text-marker">
            Your code will appear here 📝
          </p>
          <p className="text-sm text-pencil/60 mt-1 text-hand">
            Python code ready to run locally
          </p>
        </div>
        {/* Notebook lines */}
        <div className="absolute inset-0 bg-[repeating-linear-gradient(transparent,transparent_31px,#e5e0d8_31px,#e5e0d8_32px)] pointer-events-none" style={{ borderRadius: '15px 255px 15px 225px / 225px 15px 255px 15px' }} />
      </div>
    )
  }

  return (
    <div
      className="overflow-hidden border-2 border-pencil bg-[#2d2d2d] shadow-hard-lg"
      style={{ borderRadius: '15px 255px 15px 225px / 225px 15px 255px 15px' }}
    >
      <div className="flex items-center justify-between px-4 py-3 bg-[#3d3d3d] border-b-2 border-pencil">
        <div className="flex items-center gap-3">
          {/* Sketchy dots */}
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 bg-[#ff4d4d] border border-[#2d2d2d]"
              style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
            />
            <div
              className="w-3 h-3 bg-[#fff9c4] border border-[#2d2d2d]"
              style={{ borderRadius: '15px 255px 15px 225px / 225px 15px 255px 15px' }}
            />
            <div
              className="w-3 h-3 bg-[#90EE90] border border-[#2d2d2d]"
              style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
            />
          </div>
          <div className="flex items-center gap-2 text-white/80">
            <FileCode2 className="h-4 w-4" strokeWidth={2.5} />
            <span className="text-sm font-bold" style={{ fontFamily: "'Patrick Hand', cursive" }}>animation.py</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            onClick={handleCopy}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-white border-2 border-white/30 hover:bg-white/10 transition-colors"
            style={{ borderRadius: '95px 8px 100px 8px / 8px 100px 8px 95px', fontFamily: "'Patrick Hand', cursive" }}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-[#90EE90]" strokeWidth={2.5} />
                <span className="text-[#90EE90]">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" strokeWidth={2.5} />
                <span>Copy</span>
              </>
            )}
          </motion.button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-white border-2 border-white/30 hover:bg-white/10 transition-colors"
            style={{ borderRadius: '95px 8px 100px 8px / 8px 100px 8px 95px', fontFamily: "'Patrick Hand', cursive" }}
          >
            <Download className="h-4 w-4" strokeWidth={2.5} />
            <span>Download</span>
          </button>
        </div>
      </div>

      <div className="relative max-h-80 overflow-auto">
        <pre className="p-4 text-sm leading-relaxed font-mono">
          <code className="text-[#e6edf3]">
            {highlightPython(code)}
          </code>
        </pre>
      </div>

      <div
        className="flex items-center justify-between px-4 py-2 bg-[#3d3d3d] border-t-2 border-pencil text-sm text-white/60"
        style={{ fontFamily: "'Patrick Hand', cursive" }}
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span
              className="w-2 h-2 bg-[#2d5da1]"
              style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
            />
            Python
          </span>
          <span>{code.split('\n').length} lines</span>
        </div>
        <span>Manim Community Edition 🎬</span>
      </div>
    </div>
  )
}

function highlightPython(code: string): React.ReactNode {
  const keywords = [
    'from', 'import', 'class', 'def', 'return', 'if', 'else', 'elif',
    'for', 'while', 'in', 'and', 'or', 'not', 'True', 'False', 'None',
    'self', 'with', 'as', 'try', 'except', 'finally', 'raise', 'pass',
    'break', 'continue', 'lambda', 'yield', 'global', 'nonlocal',
  ]

  const builtins = [
    'print', 'len', 'range', 'str', 'int', 'float', 'list', 'dict',
    'tuple', 'set', 'bool', 'type', 'isinstance', 'super',
  ]

  const manimClasses = [
    'Scene', 'VGroup', 'VMobject', 'Mobject', 'Text', 'MathTex', 'Tex',
    'Circle', 'Square', 'Rectangle', 'Line', 'Arrow', 'Dot', 'Polygon',
    'NumberPlane', 'Axes', 'Graph', 'Surface', 'ThreeDScene',
    'FadeIn', 'FadeOut', 'Write', 'Create', 'Uncreate', 'Transform',
    'ReplacementTransform', 'MoveToTarget', 'Indicate', 'Flash',
    'UP', 'DOWN', 'LEFT', 'RIGHT', 'ORIGIN', 'PI', 'TAU',
  ]

  const lines = code.split('\n')

  return lines.map((line, lineIndex) => {
    const tokens: React.ReactNode[] = []
    let remaining = line
    const lineNum = lineIndex + 1

    const addToken = (text: string, className?: string) => {
      if (className) {
        tokens.push(
          <span key={tokens.length} className={className}>
            {text}
          </span>
        )
      } else {
        tokens.push(text)
      }
    }

    while (remaining) {
      const commentMatch = remaining.match(/^(#.*)/)
      if (commentMatch) {
        addToken(commentMatch[1], 'text-[#8b949e] italic')
        remaining = remaining.slice(commentMatch[1].length)
        continue
      }

      const stringMatch = remaining.match(/^(["']{3}[\s\S]*?["']{3}|["'][^"']*["'])/)
      if (stringMatch) {
        addToken(stringMatch[1], 'text-[#a5d6ff]')
        remaining = remaining.slice(stringMatch[1].length)
        continue
      }

      const fstringMatch = remaining.match(/^(f["'][^"']*["'])/)
      if (fstringMatch) {
        addToken(fstringMatch[1], 'text-[#a5d6ff]')
        remaining = remaining.slice(fstringMatch[1].length)
        continue
      }

      const keywordMatch = remaining.match(new RegExp(`^(${keywords.join('|')})\\b`))
      if (keywordMatch) {
        addToken(keywordMatch[1], 'text-[#ff7b72]')
        remaining = remaining.slice(keywordMatch[1].length)
        continue
      }

      const manimMatch = remaining.match(new RegExp(`^(${manimClasses.join('|')})\\b`))
      if (manimMatch) {
        addToken(manimMatch[1], 'text-[#79c0ff]')
        remaining = remaining.slice(manimMatch[1].length)
        continue
      }

      const builtinMatch = remaining.match(new RegExp(`^(${builtins.join('|')})\\b`))
      if (builtinMatch) {
        addToken(builtinMatch[1], 'text-[#d2a8ff]')
        remaining = remaining.slice(builtinMatch[1].length)
        continue
      }

      const numberMatch = remaining.match(/^(\d+\.?\d*)/)
      if (numberMatch) {
        addToken(numberMatch[1], 'text-[#79c0ff]')
        remaining = remaining.slice(numberMatch[1].length)
        continue
      }

      const funcMatch = remaining.match(/^(\w+)(?=\()/)
      if (funcMatch) {
        addToken(funcMatch[1], 'text-[#d2a8ff]')
        remaining = remaining.slice(funcMatch[1].length)
        continue
      }

      addToken(remaining[0])
      remaining = remaining.slice(1)
    }

    return (
      <div key={lineIndex} className="flex">
        <span className="w-10 text-right pr-4 text-white/30 select-none">
          {lineNum}
        </span>
        <span className="flex-1">{tokens}</span>
      </div>
    )
  })
}

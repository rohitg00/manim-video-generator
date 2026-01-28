import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check, Download, FileCode2 } from 'lucide-react'

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
      <div className="flex h-64 items-center justify-center rounded-xl border bg-muted/30">
        <div className="text-center">
          <FileCode2 className="mx-auto mb-2 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            Generated code will appear here
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-2">
        <div className="flex items-center gap-2">
          <FileCode2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">animation.py</span>
        </div>

        <div className="flex items-center gap-1">
          <motion.button
            onClick={handleCopy}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-muted"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </motion.button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-muted"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        </div>
      </div>

      <div className="relative max-h-96 overflow-auto bg-[#1e1e1e]">
        <pre className="p-4 text-sm leading-relaxed">
          <code className="text-[#d4d4d4]">
            {highlightPython(code)}
          </code>
        </pre>

        <div className="absolute left-0 top-0 border-r border-[#333] bg-[#1e1e1e] py-4 pr-3 text-right text-sm leading-relaxed text-[#858585]">
          {code.split('\n').map((_, i) => (
            <div key={i} className="px-2">
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between border-t bg-muted/50 px-4 py-2 text-xs text-muted-foreground">
        <span>{code.split('\n').length} lines</span>
        <span>Python/Manim</span>
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
  ]

  const lines = code.split('\n')

  return lines.map((line, lineIndex) => {
    const tokens: React.ReactNode[] = []
    let remaining = line

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
        addToken(commentMatch[1], 'text-[#6a9955] italic')
        remaining = remaining.slice(commentMatch[1].length)
        continue
      }

      const stringMatch = remaining.match(/^(["']{3}[\s\S]*?["']{3}|["'][^"']*["'])/)
      if (stringMatch) {
        addToken(stringMatch[1], 'text-[#ce9178]')
        remaining = remaining.slice(stringMatch[1].length)
        continue
      }

      const fstringMatch = remaining.match(/^(f["'][^"']*["'])/)
      if (fstringMatch) {
        addToken(fstringMatch[1], 'text-[#ce9178]')
        remaining = remaining.slice(fstringMatch[1].length)
        continue
      }

      const keywordMatch = remaining.match(new RegExp(`^(${keywords.join('|')})\\b`))
      if (keywordMatch) {
        addToken(keywordMatch[1], 'text-[#c586c0]')
        remaining = remaining.slice(keywordMatch[1].length)
        continue
      }

      const manimMatch = remaining.match(new RegExp(`^(${manimClasses.join('|')})\\b`))
      if (manimMatch) {
        addToken(manimMatch[1], 'text-[#4ec9b0]')
        remaining = remaining.slice(manimMatch[1].length)
        continue
      }

      const builtinMatch = remaining.match(new RegExp(`^(${builtins.join('|')})\\b`))
      if (builtinMatch) {
        addToken(builtinMatch[1], 'text-[#dcdcaa]')
        remaining = remaining.slice(builtinMatch[1].length)
        continue
      }

      const numberMatch = remaining.match(/^(\d+\.?\d*)/)
      if (numberMatch) {
        addToken(numberMatch[1], 'text-[#b5cea8]')
        remaining = remaining.slice(numberMatch[1].length)
        continue
      }

      const funcMatch = remaining.match(/^(\w+)(?=\()/)
      if (funcMatch) {
        addToken(funcMatch[1], 'text-[#dcdcaa]')
        remaining = remaining.slice(funcMatch[1].length)
        continue
      }

      addToken(remaining[0])
      remaining = remaining.slice(1)
    }

    return (
      <div key={lineIndex} className="pl-12">
        {tokens}
      </div>
    )
  })
}

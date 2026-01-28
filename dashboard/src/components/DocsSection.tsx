import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Sparkles,
  Palette,
  Code2,
  Zap,
  ChevronDown,
  Terminal,
  Lightbulb,
  ExternalLink,
} from 'lucide-react'

interface DocSection {
  id: string
  title: string
  icon: React.ReactNode
  content: React.ReactNode
}

const DOCS_SECTIONS: DocSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: <Sparkles className="h-5 w-5" strokeWidth={2.5} />,
    content: (
      <div className="space-y-4">
        <p>Welcome to Manim Sketchbook! Here's how to create your first animation:</p>
        <ol className="list-decimal list-inside space-y-2 text-[#2d2d2d]/80">
          <li><strong>Describe your idea</strong> - Write what you want to animate in the prompt box</li>
          <li><strong>Pick a style</strong> - Choose from 5 visual styles (3Blue1Brown, Minimalist, etc.)</li>
          <li><strong>Select quality</strong> - Higher quality = longer render time</li>
          <li><strong>Click "Let's Draw!"</strong> - Our AI will generate and render your animation</li>
        </ol>
        <div className="bg-[#fff9c4] border-2 border-[#2d2d2d] p-4 mt-4" style={{ borderRadius: '15px 255px 15px 225px / 225px 15px 255px 15px' }}>
          <p className="text-sm"><strong>💡 Tip:</strong> Enable "Smart Mode" for AI-enhanced prompt understanding!</p>
        </div>
      </div>
    ),
  },
  {
    id: 'writing-prompts',
    title: 'Writing Great Prompts',
    icon: <Lightbulb className="h-5 w-5" strokeWidth={2.5} />,
    content: (
      <div className="space-y-4">
        <p>The quality of your animation depends on how well you describe it. Here are some tips:</p>

        <div className="space-y-3">
          <div className="bg-green-50 border-2 border-green-500 p-3" style={{ borderRadius: '95px 8px 100px 8px / 8px 100px 8px 95px' }}>
            <p className="text-sm"><strong>✅ Good:</strong> "Show a unit circle rotating and trace out a sine wave on the right, with labels for the angle and amplitude"</p>
          </div>
          <div className="bg-red-50 border-2 border-red-500 p-3" style={{ borderRadius: '95px 8px 100px 8px / 8px 100px 8px 95px' }}>
            <p className="text-sm"><strong>❌ Vague:</strong> "Make something with waves"</p>
          </div>
        </div>

        <h4 className="font-bold text-[#2d2d2d] mt-4">Key elements to include:</h4>
        <ul className="list-disc list-inside space-y-1 text-[#2d2d2d]/80">
          <li><strong>What objects</strong> - shapes, graphs, text, equations</li>
          <li><strong>What actions</strong> - transform, move, fade, highlight</li>
          <li><strong>What order</strong> - sequence of events</li>
          <li><strong>What labels</strong> - text, annotations, arrows</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'styles',
    title: 'Animation Styles',
    icon: <Palette className="h-5 w-5" strokeWidth={2.5} />,
    content: (
      <div className="space-y-4">
        <p>Choose a style that fits your content and audience:</p>

        <div className="grid gap-3">
          {[
            { name: '3Blue1Brown', desc: 'Dark background, blue/green palette. Perfect for math explanations.', color: '#1c1c1c' },
            { name: 'Minimalist', desc: 'Clean white background. Great for presentations.', color: '#f5f5f5' },
            { name: 'Playful', desc: 'Warm yellow tones. Ideal for educational content for kids.', color: '#fef3c7' },
            { name: 'Corporate', desc: 'Professional dark blue. Business presentations.', color: '#1e293b' },
            { name: 'Neon', desc: 'Dark with glowing elements. Eye-catching demos.', color: '#0a0a0a' },
          ].map((style) => (
            <div
              key={style.name}
              className="flex items-center gap-3 p-3 bg-white border-2 border-[#2d2d2d]"
              style={{ borderRadius: '95px 8px 100px 8px / 8px 100px 8px 95px' }}
            >
              <div
                className="w-8 h-8 border-2 border-[#2d2d2d]"
                style={{ backgroundColor: style.color, borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
              />
              <div>
                <p className="font-bold text-[#2d2d2d]">{style.name}</p>
                <p className="text-sm text-[#2d2d2d]/70">{style.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'code',
    title: 'Using Generated Code',
    icon: <Code2 className="h-5 w-5" strokeWidth={2.5} />,
    content: (
      <div className="space-y-4">
        <p>Every animation generates Manim Python code you can download and modify:</p>

        <div className="bg-[#2d2d2d] text-white p-4 font-mono text-sm overflow-x-auto" style={{ borderRadius: '15px 255px 15px 225px / 225px 15px 255px 15px' }}>
          <pre>{`from manim import *

class MyAnimation(Scene):
    def construct(self):
        circle = Circle(color=BLUE)
        self.play(Create(circle))
        self.wait()`}</pre>
        </div>

        <h4 className="font-bold text-[#2d2d2d] mt-4">Running locally:</h4>
        <ol className="list-decimal list-inside space-y-2 text-[#2d2d2d]/80">
          <li>Install Manim: <code className="bg-[#e5e0d8] px-2 py-0.5 rounded">pip install manim</code></li>
          <li>Download the generated code</li>
          <li>Run: <code className="bg-[#e5e0d8] px-2 py-0.5 rounded">manim -pql animation.py MyAnimation</code></li>
        </ol>
      </div>
    ),
  },
  {
    id: 'api',
    title: 'API & Integration',
    icon: <Terminal className="h-5 w-5" strokeWidth={2.5} />,
    content: (
      <div className="space-y-4">
        <p>Integrate Manim generation into your own applications:</p>

        <div className="bg-[#2d2d2d] text-white p-4 font-mono text-sm overflow-x-auto" style={{ borderRadius: '15px 255px 15px 225px / 225px 15px 255px 15px' }}>
          <pre>{`POST /api/generate
Content-Type: application/json

{
  "prompt": "Show the Pythagorean theorem",
  "style": "3blue1brown",
  "quality": "medium",
  "useNLU": true
}`}</pre>
        </div>

        <h4 className="font-bold text-[#2d2d2d] mt-4">Response:</h4>
        <div className="bg-[#2d2d2d] text-white p-4 font-mono text-sm overflow-x-auto" style={{ borderRadius: '15px 255px 15px 225px / 225px 15px 255px 15px' }}>
          <pre>{`{
  "videoUrl": "https://...",
  "code": "from manim import *...",
  "metadata": {
    "skill": "geometry",
    "duration": 5.2
  }
}`}</pre>
        </div>
      </div>
    ),
  },
  {
    id: 'tips',
    title: 'Tips & Best Practices',
    icon: <Zap className="h-5 w-5" strokeWidth={2.5} />,
    content: (
      <div className="space-y-4">
        <ul className="space-y-3">
          {[
            { emoji: '🎯', tip: 'Be specific', desc: 'Mention exact colors, positions, and timing if important' },
            { emoji: '📏', tip: 'Keep it focused', desc: 'One concept per animation works best' },
            { emoji: '🔄', tip: 'Iterate', desc: 'Start simple, then add details in follow-up generations' },
            { emoji: '📝', tip: 'Use examples', desc: 'Reference well-known animations or styles' },
            { emoji: '⚡', tip: 'Use Smart Mode', desc: 'Let AI enhance your prompts for better results' },
            { emoji: '💾', tip: 'Save your prompts', desc: 'Keep a collection of prompts that work well' },
          ].map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-3 p-3 bg-white border-2 border-[#2d2d2d]"
              style={{ borderRadius: i % 2 === 0 ? '255px 15px 225px 15px / 15px 225px 15px 255px' : '15px 255px 15px 225px / 225px 15px 255px 15px' }}
            >
              <span className="text-2xl">{item.emoji}</span>
              <div>
                <p className="font-bold text-[#2d2d2d]">{item.tip}</p>
                <p className="text-sm text-[#2d2d2d]/70">{item.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
]

export function DocsSection() {
  const [openSections, setOpenSections] = useState<string[]>(['getting-started'])

  const toggleSection = (id: string) => {
    setOpenSections(prev =>
      prev.includes(id)
        ? prev.filter(s => s !== id)
        : [...prev, id]
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-4xl text-[#2d2d2d] mb-2">
          Documentation 📚
        </h2>
        <p className="text-xl text-[#2d2d2d]/70">
          Everything you need to create amazing animations
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {DOCS_SECTIONS.map((section, index) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white border-2 border-[#2d2d2d] shadow-hard overflow-hidden"
            style={{
              borderRadius: index % 2 === 0
                ? '255px 15px 225px 15px / 15px 225px 15px 255px'
                : '15px 255px 15px 225px / 225px 15px 255px 15px',
            }}
          >
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full p-4 flex items-center justify-between hover:bg-[#fdfbf7] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 bg-[#fff9c4] border-2 border-[#2d2d2d] flex items-center justify-center"
                  style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
                >
                  {section.icon}
                </div>
                <h3 className="text-xl text-[#2d2d2d]" style={{ fontFamily: "'Kalam', cursive" }}>
                  {section.title}
                </h3>
              </div>
              <ChevronDown
                className={`h-6 w-6 text-[#2d2d2d] transition-transform ${
                  openSections.includes(section.id) ? 'rotate-180' : ''
                }`}
                strokeWidth={2.5}
              />
            </button>

            <AnimatePresence>
              {openSections.includes(section.id) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pt-2 border-t-2 border-dashed border-[#2d2d2d]/30">
                    <div className="pl-13" style={{ fontFamily: "'Patrick Hand', cursive" }}>
                      {section.content}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* External Links */}
      <div
        className="card-postit text-center"
        style={{ transform: 'rotate(-0.5deg)' }}
      >
        <h4 className="text-xl font-bold text-[#2d2d2d] mb-4">More Resources</h4>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="https://docs.manim.community/"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#2d2d2d] shadow-hard-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            style={{ borderRadius: '95px 8px 100px 8px / 8px 100px 8px 95px' }}
          >
            <BookOpen className="h-4 w-4" strokeWidth={2.5} />
            Manim Docs
            <ExternalLink className="h-3 w-3" strokeWidth={2.5} />
          </a>
          <a
            href="https://github.com/rohitg00/manim-video-generator"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#2d2d2d] shadow-hard-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            style={{ borderRadius: '95px 8px 100px 8px / 8px 100px 8px 95px' }}
          >
            <Code2 className="h-4 w-4" strokeWidth={2.5} />
            GitHub Repo
            <ExternalLink className="h-3 w-3" strokeWidth={2.5} />
          </a>
        </div>
      </div>
    </div>
  )
}

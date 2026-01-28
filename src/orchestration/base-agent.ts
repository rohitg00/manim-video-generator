
import type {
  Agent,
  AgentType,
  AgentStatus,
  AgentOutput,
  AgentSuggestion,
  AnimationTask,
  TaskContext,
} from './types'
import { getCommunicationHub } from './agent-communication'
import type { SceneGraph } from '../types/scene.types'
import type { NLUResult } from '../types/nlu.types'

export abstract class BaseAgent implements Agent {
  abstract type: AgentType
  abstract name: string
  abstract description: string
  abstract capabilities: string[]

  status: AgentStatus = 'idle'
  protected processingStartTime: number = 0

  abstract process(task: AnimationTask): Promise<AgentOutput>

  canHandle(task: AnimationTask): boolean {
    return this.getConfidence(task) > 0.3
  }

  abstract getConfidence(task: AnimationTask): number

  reset(): void {
    this.status = 'idle'
    this.processingStartTime = 0
  }

  protected createOutput(
    code?: string,
    sceneGraph?: SceneGraph,
    insights: string[] = [],
    suggestions: AgentSuggestion[] = [],
    metadata?: Record<string, unknown>
  ): AgentOutput {
    return {
      agent: this.type,
      success: true,
      code,
      sceneGraph,
      insights,
      suggestions,
      qualityScore: 0.7,
      processingTime: Date.now() - this.processingStartTime,
      metadata,
    }
  }

  protected createFailedOutput(error: string): AgentOutput {
    return {
      agent: this.type,
      success: false,
      insights: [],
      suggestions: [],
      qualityScore: 0,
      processingTime: Date.now() - this.processingStartTime,
      error,
    }
  }

  protected createSuggestion(
    targetAgent: AgentType | 'all',
    type: AgentSuggestion['type'],
    content: string,
    priority: number = 0.5
  ): AgentSuggestion {
    return {
      targetAgent,
      type,
      content,
      priority,
    }
  }

  protected startProcessing(): void {
    this.status = 'processing'
    this.processingStartTime = Date.now()
    const hub = getCommunicationHub()
    hub.setAgentStatus(this.type, 'busy')
  }

  protected endProcessing(): void {
    this.status = 'completed'
    const hub = getCommunicationHub()
    hub.setAgentStatus(this.type, 'online')
  }

  protected getPreviousOutput(
    task: AnimationTask,
    agentType: AgentType
  ): AgentOutput | undefined {
    return task.context?.previousOutputs.get(agentType)
  }

  protected getAllInsights(task: AnimationTask): string[] {
    return task.context?.insights || []
  }

  protected sendMessage(
    to: AgentType,
    payload: unknown,
    type: 'request' | 'update' | 'feedback' = 'update'
  ): void {
    const hub = getCommunicationHub()
    hub.sendMessage(this.type, to, type, payload)
  }

  protected broadcast(
    payload: unknown,
    type: 'update' | 'proposal' = 'update'
  ): void {
    const hub = getCommunicationHub()
    hub.broadcast(this.type, type, payload)
  }
}

export class PrerequisiteExplorerAgent extends BaseAgent {
  type: AgentType = 'prerequisite-explorer'
  name = 'Prerequisite Explorer'
  description = 'Identifies prerequisites and foundational concepts needed for understanding'
  capabilities = ['concept-analysis', 'prerequisite-detection', 'knowledge-graph']

  async process(task: AnimationTask): Promise<AgentOutput> {
    this.startProcessing()

    try {
      const { nluResult, input } = task
      const insights: string[] = []
      const suggestions: AgentSuggestion[] = []

      const prerequisites = this.identifyPrerequisites(nluResult, input)
      insights.push(...prerequisites.map(p => `Prerequisite: ${p}`))

      suggestions.push(
        this.createSuggestion(
          'visual-designer',
          'requirement',
          `Include visual elements for: ${prerequisites.slice(0, 3).join(', ')}`,
          0.8
        )
      )

      if (nluResult.intent === 'EXPLAIN_CONCEPT') {
        suggestions.push(
          this.createSuggestion(
            'narrative-composer',
            'enhancement',
            `Consider building up from: ${prerequisites[0] || 'basic concepts'}`,
            0.7
          )
        )
      }

      this.endProcessing()

      return this.createOutput(
        undefined,
        undefined,
        insights,
        suggestions,
        { prerequisites }
      )
    } catch (error) {
      this.endProcessing()
      return this.createFailedOutput(String(error))
    }
  }

  getConfidence(task: AnimationTask): number {
    const { intent } = task.nluResult
    if (intent === 'EXPLAIN_CONCEPT') return 0.9
    if (intent === 'DEMONSTRATE_PROCESS') return 0.8
    if (intent === 'GEOMETRIC_PROOF') return 0.85
    if (intent === 'COMPARE_CONTRAST') return 0.7
    return 0.4
  }

  private identifyPrerequisites(nluResult: NLUResult, input: string): string[] {
    const prerequisites: string[] = []
    const { intent, entities } = nluResult

    if (entities.mathExpressions.length > 0) {
      prerequisites.push('Understanding of mathematical notation')
      if (input.toLowerCase().includes('derivative')) {
        prerequisites.push('Basic calculus concepts')
        prerequisites.push('Understanding of limits')
      }
      if (input.toLowerCase().includes('integral')) {
        prerequisites.push('Derivative concepts')
        prerequisites.push('Summation understanding')
      }
    }

    if (intent === 'GEOMETRIC_PROOF') {
      prerequisites.push('Basic geometry')
      prerequisites.push('Logical reasoning')
    }

    if (entities.complexity === 'complex') {
      prerequisites.push('Intermediate mathematical background')
    }

    return prerequisites.slice(0, 5)
  }
}

export class MathEnricherAgent extends BaseAgent {
  type: AgentType = 'math-enricher'
  name = 'Math Enricher'
  description = 'Enhances mathematical expressions and adds context'
  capabilities = ['latex-processing', 'formula-analysis', 'math-context']

  async process(task: AnimationTask): Promise<AgentOutput> {
    this.startProcessing()

    try {
      const { nluResult } = task
      const insights: string[] = []
      const suggestions: AgentSuggestion[] = []

      const mathAnalysis = this.analyzeMath(nluResult)
      insights.push(...mathAnalysis.insights)

      if (mathAnalysis.latexSuggestions.length > 0) {
        suggestions.push(
          this.createSuggestion(
            'code-generator',
            'enhancement',
            `Use these LaTeX improvements: ${mathAnalysis.latexSuggestions.join(', ')}`,
            0.9
          )
        )
      }

      if (mathAnalysis.visualizations.length > 0) {
        suggestions.push(
          this.createSuggestion(
            'visual-designer',
            'enhancement',
            `Consider visualizing: ${mathAnalysis.visualizations.join(', ')}`,
            0.8
          )
        )
      }

      this.endProcessing()

      return this.createOutput(
        undefined,
        undefined,
        insights,
        suggestions,
        { mathAnalysis }
      )
    } catch (error) {
      this.endProcessing()
      return this.createFailedOutput(String(error))
    }
  }

  getConfidence(task: AnimationTask): number {
    const { intent, hasLatex, entities } = task.nluResult
    if (hasLatex) return 0.95
    if (intent === 'VISUALIZE_MATH') return 0.9
    if (intent === 'GRAPH_FUNCTION') return 0.85
    if (intent === 'GEOMETRIC_PROOF') return 0.8
    if (entities.mathExpressions.length > 0) return 0.7
    return 0.3
  }

  private analyzeMath(nluResult: NLUResult): {
    insights: string[]
    latexSuggestions: string[]
    visualizations: string[]
  } {
    const insights: string[] = []
    const latexSuggestions: string[] = []
    const visualizations: string[] = []

    const { entities, intent } = nluResult

    for (const expr of entities.mathExpressions) {
      if (expr.includes('\\frac') || expr.includes('/')) {
        insights.push('Contains fractions - consider step-by-step simplification')
        visualizations.push('fraction visualization')
      }
      if (expr.includes('\\int') || expr.includes('integral')) {
        insights.push('Contains integral - show area under curve')
        visualizations.push('area shading')
        latexSuggestions.push('Use \\int_{a}^{b} for definite integrals')
      }
      if (expr.includes('\\sum') || expr.includes('sum')) {
        insights.push('Contains summation - show term-by-term')
        visualizations.push('partial sums animation')
      }
      if (expr.includes('^2') || expr.includes('\\sqrt')) {
        insights.push('Contains powers/roots - show geometric interpretation')
        visualizations.push('square/root geometry')
      }
    }

    if (intent === 'GRAPH_FUNCTION') {
      insights.push('Function graphing detected - include axes and labels')
      visualizations.push('coordinate axes', 'function curve', 'point markers')
    }

    return { insights, latexSuggestions, visualizations }
  }
}

export class VisualDesignerAgent extends BaseAgent {
  type: AgentType = 'visual-designer'
  name = 'Visual Designer'
  description = 'Designs visual layout, colors, and element arrangement'
  capabilities = ['layout-design', 'color-theory', 'visual-hierarchy']

  async process(task: AnimationTask): Promise<AgentOutput> {
    this.startProcessing()

    try {
      const { nluResult, style } = task
      const insights: string[] = []
      const suggestions: AgentSuggestion[] = []

      const design = this.createDesign(nluResult, style)
      insights.push(...design.insights)

      suggestions.push(
        this.createSuggestion(
          'code-generator',
          'requirement',
          `Color scheme: primary=${design.colors.primary}, secondary=${design.colors.secondary}`,
          0.9
        )
      )

      suggestions.push(
        this.createSuggestion(
          'code-generator',
          'enhancement',
          `Layout: ${design.layout}`,
          0.8
        )
      )

      this.endProcessing()

      return this.createOutput(
        undefined,
        undefined,
        insights,
        suggestions,
        { design }
      )
    } catch (error) {
      this.endProcessing()
      return this.createFailedOutput(String(error))
    }
  }

  getConfidence(task: AnimationTask): number {
    const { intent } = task.nluResult
    if (intent === 'KINETIC_TEXT') return 0.9
    if (intent === 'CREATE_SCENE') return 0.85
    if (intent === 'TRANSFORM_OBJECT') return 0.8
    if (intent === 'COMPARE_CONTRAST') return 0.85
    return 0.6
  }

  private createDesign(nluResult: NLUResult, style: string): {
    insights: string[]
    colors: { primary: string; secondary: string; accent: string }
    layout: string
  } {
    const insights: string[] = []

    const colorSchemes: Record<string, { primary: string; secondary: string; accent: string }> = {
      '3blue1brown': { primary: '#58c4dd', secondary: '#83c167', accent: '#ffff00' },
      'minimalist': { primary: '#333333', secondary: '#666666', accent: '#0066cc' },
      'playful': { primary: '#e17055', secondary: '#00cec9', accent: '#6c5ce7' },
      'corporate': { primary: '#3498db', secondary: '#95a5a6', accent: '#e74c3c' },
      'neon': { primary: '#00ffff', secondary: '#ff00ff', accent: '#00ff00' },
    }

    const colors = colorSchemes[style] || colorSchemes['3blue1brown']
    insights.push(`Using ${style} color scheme`)

    let layout = 'centered'
    const { intent, entities } = nluResult

    if (intent === 'COMPARE_CONTRAST') {
      layout = 'split-vertical'
      insights.push('Using split layout for comparison')
    } else if (intent === 'DEMONSTRATE_PROCESS') {
      layout = 'flow-horizontal'
      insights.push('Using flow layout for process steps')
    } else if (intent === 'GRAPH_FUNCTION') {
      layout = 'graph-centered'
      insights.push('Centering graph with labels')
    } else if (entities.mathExpressions.length > 2) {
      layout = 'vertical-stack'
      insights.push('Stacking multiple equations vertically')
    }

    return { insights, colors, layout }
  }
}

export class NarrativeComposerAgent extends BaseAgent {
  type: AgentType = 'narrative-composer'
  name = 'Narrative Composer'
  description = 'Creates narrative flow, pacing, and explanatory structure'
  capabilities = ['storytelling', 'pacing', 'explanation-structure']

  async process(task: AnimationTask): Promise<AgentOutput> {
    this.startProcessing()

    try {
      const { nluResult, input } = task
      const insights: string[] = []
      const suggestions: AgentSuggestion[] = []

      const narrative = this.createNarrative(nluResult, input)
      insights.push(...narrative.insights)

      suggestions.push(
        this.createSuggestion(
          'code-generator',
          'requirement',
          `Structure: ${narrative.acts.join(' -> ')}`,
          0.85
        )
      )

      suggestions.push(
        this.createSuggestion(
          'code-generator',
          'enhancement',
          `Pacing: ${narrative.pacing}`,
          0.7
        )
      )

      this.endProcessing()

      return this.createOutput(
        undefined,
        undefined,
        insights,
        suggestions,
        { narrative }
      )
    } catch (error) {
      this.endProcessing()
      return this.createFailedOutput(String(error))
    }
  }

  getConfidence(task: AnimationTask): number {
    const { intent } = task.nluResult
    if (intent === 'TELL_STORY') return 0.95
    if (intent === 'EXPLAIN_CONCEPT') return 0.85
    if (intent === 'DEMONSTRATE_PROCESS') return 0.8
    if (intent === 'KINETIC_TEXT') return 0.75
    return 0.5
  }

  private createNarrative(nluResult: NLUResult, input: string): {
    insights: string[]
    acts: string[]
    pacing: string
  } {
    const insights: string[] = []
    const { intent, estimatedDuration } = nluResult

    let acts: string[] = ['Introduction', 'Main Content', 'Conclusion']

    if (intent === 'DEMONSTRATE_PROCESS') {
      const steps = input.match(/step|first|then|next|finally/gi)?.length || 3
      acts = Array.from({ length: steps }, (_, i) => `Step ${i + 1}`)
      insights.push(`Process has ${steps} steps`)
    } else if (intent === 'EXPLAIN_CONCEPT') {
      acts = ['Hook', 'Definition', 'Example', 'Summary']
      insights.push('Using educational narrative structure')
    } else if (intent === 'TELL_STORY') {
      acts = ['Setup', 'Rising Action', 'Climax', 'Resolution']
      insights.push('Using classic story arc')
    } else if (intent === 'GEOMETRIC_PROOF') {
      acts = ['Given', 'Construction', 'Proof Steps', 'QED']
      insights.push('Using proof structure')
    }

    let pacing = 'moderate'
    if (estimatedDuration < 5) pacing = 'fast'
    else if (estimatedDuration > 15) pacing = 'slow'

    insights.push(`Recommended pacing: ${pacing}`)

    return { insights, acts, pacing }
  }
}

export class CodeGeneratorAgent extends BaseAgent {
  type: AgentType = 'code-generator'
  name = 'Code Generator'
  description = 'Generates final Manim Python code based on all inputs'
  capabilities = ['code-generation', 'manim-api', 'code-optimization']

  async process(task: AnimationTask): Promise<AgentOutput> {
    this.startProcessing()

    try {
      const { nluResult, style, context } = task
      const insights: string[] = []
      const suggestions: AgentSuggestion[] = []

      const previousInsights = this.getAllInsights(task)
      insights.push(`Incorporating ${previousInsights.length} insights from other agents`)

      const code = this.generateCode(nluResult, style, previousInsights)

      if (code.length < 100) {
        suggestions.push(
          this.createSuggestion(
            'quality-reviewer',
            'warning',
            'Generated code is very short - may need enhancement',
            0.8
          )
        )
      }

      this.endProcessing()

      const output = this.createOutput(code, undefined, insights, suggestions)
      output.qualityScore = 0.75
      return output
    } catch (error) {
      this.endProcessing()
      return this.createFailedOutput(String(error))
    }
  }

  getConfidence(task: AnimationTask): number {
    return 0.95
  }

  private generateCode(nluResult: NLUResult, style: string, insights: string[]): string {
    const { intent, entities } = nluResult

    const styleColors: Record<string, { bg: string; primary: string }> = {
      '3blue1brown': { bg: '#1a1a2e', primary: '#58c4dd' },
      'minimalist': { bg: '#ffffff', primary: '#333333' },
      'playful': { bg: '#ffeaa7', primary: '#e17055' },
      'corporate': { bg: '#2c3e50', primary: '#3498db' },
      'neon': { bg: '#0a0a0a', primary: '#00ffff' },
    }

    const colors = styleColors[style] || styleColors['3blue1brown']

    return `from manim import *

config.background_color = "${colors.bg}"

class MainScene(Scene):
    def construct(self):
        # Generated based on insights: ${insights.slice(0, 2).join(', ') || 'none'}

        # Title
        title = Text("Animation", color="${colors.primary}")
        title.scale(1.5)

        self.play(Write(title))
        self.wait(1)
        self.play(FadeOut(title))

        # Main content
        circle = Circle(color="${colors.primary}")
        self.play(Create(circle))
        self.wait(0.5)

        # Transform
        square = Square(color="${colors.primary}")
        self.play(Transform(circle, square))
        self.wait(0.5)

        # Conclusion
        self.play(FadeOut(circle))
`
  }
}

export class QualityReviewerAgent extends BaseAgent {
  type: AgentType = 'quality-reviewer'
  name = 'Quality Reviewer'
  description = 'Reviews code quality and suggests improvements'
  capabilities = ['code-review', 'quality-assessment', 'improvement-suggestions']

  async process(task: AnimationTask): Promise<AgentOutput> {
    this.startProcessing()

    try {
      const codeGeneratorOutput = this.getPreviousOutput(task, 'code-generator')
      const insights: string[] = []
      const suggestions: AgentSuggestion[] = []

      if (!codeGeneratorOutput?.code) {
        insights.push('No code to review')
        this.endProcessing()
        return this.createOutput(undefined, undefined, insights, suggestions)
      }

      const review = this.reviewCode(codeGeneratorOutput.code)
      insights.push(...review.insights)

      for (const improvement of review.improvements) {
        suggestions.push(
          this.createSuggestion(
            'code-generator',
            'enhancement',
            improvement,
            0.7
          )
        )
      }

      this.endProcessing()

      const output = this.createOutput(
        codeGeneratorOutput.code,
        undefined,
        insights,
        suggestions,
        { review }
      )
      output.qualityScore = review.score
      return output
    } catch (error) {
      this.endProcessing()
      return this.createFailedOutput(String(error))
    }
  }

  getConfidence(task: AnimationTask): number {
    return 0.9
  }

  private reviewCode(code: string): {
    score: number
    insights: string[]
    improvements: string[]
  } {
    const insights: string[] = []
    const improvements: string[] = []
    let score = 0.7

    if (code.includes('from manim import')) {
      insights.push('Correct imports present')
      score += 0.05
    } else {
      improvements.push('Add manim imports')
      score -= 0.1
    }

    if (code.match(/class\s+MainScene/)) {
      insights.push('MainScene class defined correctly')
      score += 0.05
    }

    if (code.includes('def construct(self)')) {
      insights.push('construct method present')
      score += 0.05
    }

    const playCount = (code.match(/self\.play\(/g) || []).length
    if (playCount >= 3) {
      insights.push(`Good number of animations (${playCount})`)
      score += 0.05
    } else if (playCount === 0) {
      improvements.push('Add animations with self.play()')
      score -= 0.1
    }

    const waitCount = (code.match(/self\.wait\(/g) || []).length
    if (waitCount >= 2) {
      insights.push('Good pacing with wait calls')
      score += 0.05
    } else {
      improvements.push('Add self.wait() calls for better pacing')
    }

    const commentCount = (code.match(/#.*$/gm) || []).length
    if (commentCount >= 3) {
      insights.push('Well documented code')
      score += 0.05
    } else {
      improvements.push('Add more comments to explain the code')
    }

    return {
      score: Math.max(0, Math.min(1, score)),
      insights,
      improvements,
    }
  }
}

export class StyleHarmonizerAgent extends BaseAgent {
  type: AgentType = 'style-harmonizer'
  name = 'Style Harmonizer'
  description = 'Ensures consistent visual style throughout the animation'
  capabilities = ['style-consistency', 'color-harmony', 'visual-polish']

  async process(task: AnimationTask): Promise<AgentOutput> {
    this.startProcessing()

    try {
      const { style } = task
      const codeGeneratorOutput = this.getPreviousOutput(task, 'code-generator')
      const insights: string[] = []
      const suggestions: AgentSuggestion[] = []

      if (!codeGeneratorOutput?.code) {
        insights.push('No code to harmonize')
        this.endProcessing()
        return this.createOutput(undefined, undefined, insights, suggestions)
      }

      const harmony = this.checkStyleConsistency(codeGeneratorOutput.code, style)
      insights.push(...harmony.insights)

      for (const suggestion of harmony.suggestions) {
        suggestions.push(
          this.createSuggestion(
            'code-generator',
            'enhancement',
            suggestion,
            0.6
          )
        )
      }

      this.endProcessing()

      return this.createOutput(undefined, undefined, insights, suggestions, { harmony })
    } catch (error) {
      this.endProcessing()
      return this.createFailedOutput(String(error))
    }
  }

  getConfidence(task: AnimationTask): number {
    return 0.7
  }

  private checkStyleConsistency(code: string, targetStyle: string): {
    insights: string[]
    suggestions: string[]
    isConsistent: boolean
  } {
    const insights: string[] = []
    const suggestions: string[] = []
    let isConsistent = true

    const styleExpectations: Record<string, string[]> = {
      '3blue1brown': ['#58c4dd', '#83c167', 'BLUE', 'GREEN', 'YELLOW'],
      'minimalist': ['#333333', '#ffffff', 'WHITE', 'BLACK'],
      'playful': ['#e17055', '#00cec9', 'ORANGE', 'TEAL'],
      'corporate': ['#3498db', '#95a5a6', 'BLUE', 'GRAY'],
      'neon': ['#00ffff', '#ff00ff', 'CYAN', 'MAGENTA'],
    }

    const expectedColors = styleExpectations[targetStyle] || []
    const foundColors = expectedColors.filter(c =>
      code.toLowerCase().includes(c.toLowerCase())
    )

    if (foundColors.length >= 2) {
      insights.push(`Style consistency: ${foundColors.length}/${expectedColors.length} expected colors used`)
    } else {
      isConsistent = false
      suggestions.push(`Consider using more ${targetStyle} style colors: ${expectedColors.slice(0, 3).join(', ')}`)
    }

    if (code.includes('rate_func')) {
      insights.push('Custom animation timing used')
    }

    return { insights, suggestions, isConsistent }
  }
}

export function createAgents(): Map<AgentType, Agent> {
  const agents = new Map<AgentType, Agent>()

  agents.set('prerequisite-explorer', new PrerequisiteExplorerAgent())
  agents.set('math-enricher', new MathEnricherAgent())
  agents.set('visual-designer', new VisualDesignerAgent())
  agents.set('narrative-composer', new NarrativeComposerAgent())
  agents.set('code-generator', new CodeGeneratorAgent())
  agents.set('quality-reviewer', new QualityReviewerAgent())
  agents.set('style-harmonizer', new StyleHarmonizerAgent())

  return agents
}

import { z } from 'zod'
import type { EventConfig } from 'motia'
import { getSwarmState, storeAgentOutput, getAllAgentOutputs } from '../services/swarm-state'
import { selectBestOutput, scoreOutput } from '../orchestration/quality-scorer'
import type { AgentType, AgentOutput, AnimationTask } from '../orchestration/types'

const inputSchema = z.object({
  jobId: z.string(),
  taskId: z.string(),
  task: z.any(),
  proposals: z.array(z.object({
    agent: z.string(),
    success: z.boolean(),
    code: z.string().optional(),
    sceneGraph: z.any().optional(),
    insights: z.array(z.string()),
    suggestions: z.array(z.any()),
    qualityScore: z.number(),
    processingTime: z.number(),
    error: z.string().optional(),
    metadata: z.record(z.any()).optional(),
  })),
})

export const config: EventConfig = {
  type: 'event',
  name: 'SwarmCompetitiveSelect',
  description: 'Select best proposal from competitive swarm execution',
  subscribes: ['competitive.proposals.ready'],
  emits: ['swarm.complete', 'swarm.failed'],
  input: inputSchema as any,
}

export const handler = async (input: unknown, { emit, state, logger }: { emit: any; state: any; logger: any }) => {
  const parsed = inputSchema.parse(input)
  const { jobId, taskId, task, proposals } = parsed

  logger.info('Selecting best proposal from competitive execution', {
    jobId,
    proposalCount: proposals.length,
  })

  const swarmState = await getSwarmState(state, jobId)
  if (!swarmState) {
    logger.error('Swarm state not found', { jobId })
    await emit({
      topic: 'swarm.failed',
      data: { jobId, taskId, error: 'Swarm state not found' },
    })
    return
  }

  const animationTask = task as AnimationTask
  const proposalOutputs = proposals as AgentOutput[]

  if (proposalOutputs.length === 0) {
    logger.warn('No proposals received', { jobId })
    await emit({
      topic: 'swarm.failed',
      data: { jobId, taskId, error: 'No proposals received from competitive swarm' },
    })
    return
  }

  const scoredProposals = proposalOutputs.map((proposal, index) => ({
    proposal,
    breakdown: scoreOutput(proposal, animationTask),
    index,
  }))

  scoredProposals.sort((a, b) => b.breakdown.overall - a.breakdown.overall)

  logger.info('Proposal scores', {
    jobId,
    scores: scoredProposals.map((s, i) => ({
      rank: i + 1,
      score: s.breakdown.overall.toFixed(3),
      agent: s.proposal.agent,
    })),
  })

  const best = selectBestOutput(proposalOutputs, animationTask)

  if (!best) {
    logger.warn('Could not select best proposal', { jobId })
    await emit({
      topic: 'swarm.failed',
      data: { jobId, taskId, error: 'Could not select best proposal' },
    })
    return
  }

  await storeAgentOutput(state, jobId, 'code-generator' as AgentType, best.winner)

  const previousOutputs = await getAllAgentOutputs(state, jobId)

  logger.info('Best proposal selected', {
    jobId,
    winner: best.winner.agent,
    qualityScore: best.breakdown.overall.toFixed(3),
    runnersUp: best.runners.length,
  })

  await emit({
    topic: 'swarm.complete',
    data: {
      jobId,
      taskId,
      success: true,
      code: best.winner.code,
      sceneGraph: best.winner.sceneGraph,
      qualityScore: best.breakdown.overall,
      iterations: 1,
      mode: 'competitive',
      metadata: {
        proposalCount: proposals.length,
        selectedFrom: scoredProposals.length,
        breakdown: best.breakdown,
        previousOutputs,
      },
    },
  })
}

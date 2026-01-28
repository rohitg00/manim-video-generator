
import { v4 as uuidv4 } from 'uuid'
import type { KnowledgeNode, KnowledgeTree } from './types'

export function createKnowledgeNode(
  concept: string,
  options: Partial<KnowledgeNode> = {}
): KnowledgeNode {
  return {
    id: options.id || uuidv4(),
    concept,
    description: options.description || '',
    fundamentalScore: options.fundamentalScore ?? 0.5,
    explanationTime: options.explanationTime ?? 10,
    depth: options.depth ?? 0,
    prerequisites: options.prerequisites || [],
    relatedConcepts: options.relatedConcepts || [],
    tags: options.tags || [],
    explored: options.explored ?? false,
  }
}

export function createKnowledgeTree(rootConcept: string): KnowledgeTree {
  const root = createKnowledgeNode(rootConcept, { depth: 0 })

  return {
    root,
    totalNodes: 1,
    maxDepth: 0,
    learningPath: [root.id],
    metadata: {
      generatedAt: new Date().toISOString(),
      originalConcept: rootConcept,
      processingTime: 0,
    },
  }
}

export function addPrerequisite(
  tree: KnowledgeTree,
  parentId: string,
  prerequisite: KnowledgeNode
): KnowledgeTree {
  const updatedRoot = addPrerequisiteToNode(tree.root, parentId, prerequisite)

  if (updatedRoot === tree.root) {
    return tree
  }

  const newMaxDepth = calculateMaxDepth(updatedRoot)
  const newTotalNodes = countNodes(updatedRoot)
  const newLearningPath = generateLearningPath(updatedRoot)

  return {
    ...tree,
    root: updatedRoot,
    totalNodes: newTotalNodes,
    maxDepth: newMaxDepth,
    learningPath: newLearningPath,
  }
}

function addPrerequisiteToNode(
  node: KnowledgeNode,
  parentId: string,
  prerequisite: KnowledgeNode
): KnowledgeNode {
  if (node.id === parentId) {
    const newPrerequisite = {
      ...prerequisite,
      depth: node.depth + 1,
    }

    return {
      ...node,
      prerequisites: [...node.prerequisites, newPrerequisite],
    }
  }

  const updatedPrerequisites = node.prerequisites.map((prereq) =>
    addPrerequisiteToNode(prereq, parentId, prerequisite)
  )

  const wasUpdated = updatedPrerequisites.some(
    (prereq, i) => prereq !== node.prerequisites[i]
  )

  if (wasUpdated) {
    return {
      ...node,
      prerequisites: updatedPrerequisites,
    }
  }

  return node
}

export function findNodeById(
  tree: KnowledgeTree,
  nodeId: string
): KnowledgeNode | null {
  return findNodeInSubtree(tree.root, nodeId)
}

function findNodeInSubtree(
  node: KnowledgeNode,
  nodeId: string
): KnowledgeNode | null {
  if (node.id === nodeId) {
    return node
  }

  for (const prereq of node.prerequisites) {
    const found = findNodeInSubtree(prereq, nodeId)
    if (found) {
      return found
    }
  }

  return null
}

export function findNodeByConcept(
  tree: KnowledgeTree,
  concept: string
): KnowledgeNode | null {
  return findNodeByConceptInSubtree(tree.root, concept.toLowerCase())
}

function findNodeByConceptInSubtree(
  node: KnowledgeNode,
  conceptLower: string
): KnowledgeNode | null {
  if (node.concept.toLowerCase() === conceptLower) {
    return node
  }

  for (const prereq of node.prerequisites) {
    const found = findNodeByConceptInSubtree(prereq, conceptLower)
    if (found) {
      return found
    }
  }

  return null
}

export function calculateMaxDepth(node: KnowledgeNode): number {
  if (node.prerequisites.length === 0) {
    return node.depth
  }

  return Math.max(
    ...node.prerequisites.map((prereq) => calculateMaxDepth(prereq))
  )
}

export function countNodes(node: KnowledgeNode): number {
  return (
    1 + node.prerequisites.reduce((sum, prereq) => sum + countNodes(prereq), 0)
  )
}

export function generateLearningPath(root: KnowledgeNode): string[] {
  const path: string[] = []
  const visited = new Set<string>()

  function visit(node: KnowledgeNode): void {
    if (visited.has(node.id)) {
      return
    }

    for (const prereq of node.prerequisites) {
      visit(prereq)
    }

    visited.add(node.id)
    path.push(node.id)
  }

  visit(root)
  return path
}

export function getNodesAtDepth(
  tree: KnowledgeTree,
  depth: number
): KnowledgeNode[] {
  const nodes: KnowledgeNode[] = []
  collectNodesAtDepth(tree.root, depth, nodes)
  return nodes
}

function collectNodesAtDepth(
  node: KnowledgeNode,
  targetDepth: number,
  result: KnowledgeNode[]
): void {
  if (node.depth === targetDepth) {
    result.push(node)
  }

  for (const prereq of node.prerequisites) {
    collectNodesAtDepth(prereq, targetDepth, result)
  }
}

export function getLeafNodes(tree: KnowledgeTree): KnowledgeNode[] {
  const leaves: KnowledgeNode[] = []
  collectLeafNodes(tree.root, leaves)
  return leaves
}

function collectLeafNodes(
  node: KnowledgeNode,
  result: KnowledgeNode[]
): void {
  if (node.prerequisites.length === 0) {
    result.push(node)
    return
  }

  for (const prereq of node.prerequisites) {
    collectLeafNodes(prereq, result)
  }
}

export function calculateTotalExplanationTime(tree: KnowledgeTree): number {
  return calculateNodeExplanationTime(tree.root)
}

function calculateNodeExplanationTime(node: KnowledgeNode): number {
  return (
    node.explanationTime +
    node.prerequisites.reduce(
      (sum, prereq) => sum + calculateNodeExplanationTime(prereq),
      0
    )
  )
}

export function markNodeExplored(
  tree: KnowledgeTree,
  nodeId: string
): KnowledgeTree {
  const updatedRoot = markNodeExploredInSubtree(tree.root, nodeId)

  return {
    ...tree,
    root: updatedRoot,
  }
}

function markNodeExploredInSubtree(
  node: KnowledgeNode,
  nodeId: string
): KnowledgeNode {
  if (node.id === nodeId) {
    return { ...node, explored: true }
  }

  const updatedPrerequisites = node.prerequisites.map((prereq) =>
    markNodeExploredInSubtree(prereq, nodeId)
  )

  const wasUpdated = updatedPrerequisites.some(
    (prereq, i) => prereq !== node.prerequisites[i]
  )

  if (wasUpdated) {
    return { ...node, prerequisites: updatedPrerequisites }
  }

  return node
}

export function getUnexploredNodes(tree: KnowledgeTree): KnowledgeNode[] {
  const unexplored: KnowledgeNode[] = []
  collectUnexploredNodes(tree.root, unexplored)
  return unexplored
}

function collectUnexploredNodes(
  node: KnowledgeNode,
  result: KnowledgeNode[]
): void {
  if (!node.explored) {
    result.push(node)
  }

  for (const prereq of node.prerequisites) {
    collectUnexploredNodes(prereq, result)
  }
}

export function flattenTree(tree: KnowledgeTree): KnowledgeNode[] {
  const nodes: KnowledgeNode[] = []
  collectAllNodes(tree.root, nodes)
  return nodes
}

function collectAllNodes(node: KnowledgeNode, result: KnowledgeNode[]): void {
  result.push(node)

  for (const prereq of node.prerequisites) {
    collectAllNodes(prereq, result)
  }
}

export function updateTreeMetadata(
  tree: KnowledgeTree,
  processingTime: number
): KnowledgeTree {
  return {
    ...tree,
    metadata: {
      ...tree.metadata,
      processingTime,
    },
  }
}

export function pruneToDepth(
  tree: KnowledgeTree,
  maxDepth: number
): KnowledgeTree {
  const prunedRoot = pruneNodeToDepth(tree.root, maxDepth)

  return {
    ...tree,
    root: prunedRoot,
    totalNodes: countNodes(prunedRoot),
    maxDepth: Math.min(tree.maxDepth, maxDepth),
    learningPath: generateLearningPath(prunedRoot),
  }
}

function pruneNodeToDepth(node: KnowledgeNode, maxDepth: number): KnowledgeNode {
  if (node.depth >= maxDepth) {
    return { ...node, prerequisites: [] }
  }

  return {
    ...node,
    prerequisites: node.prerequisites.map((prereq) =>
      pruneNodeToDepth(prereq, maxDepth)
    ),
  }
}

export function serializeTree(tree: KnowledgeTree): string {
  return JSON.stringify(tree, null, 2)
}

export function deserializeTree(json: string): KnowledgeTree {
  return JSON.parse(json) as KnowledgeTree
}

export function getTreeSummary(tree: KnowledgeTree): string {
  const nodes = flattenTree(tree)
  const concepts = nodes.map((n) => n.concept).join(' -> ')

  return `Knowledge Tree: "${tree.metadata.originalConcept}"
  Total Nodes: ${tree.totalNodes}
  Max Depth: ${tree.maxDepth}
  Concepts: ${concepts}
  Generated: ${tree.metadata.generatedAt}`
}

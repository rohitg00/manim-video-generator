/**
 * Concept Cache Service
 * Uses Motia's state management for intelligent caching of generated animations
 *
 * Caching Strategy:
 * - Cache by normalized concept hash for exact matches
 * - Configurable cache TTL (default: 1 hour)
 * - Optional cache bypass for fresh generation
 */

import type { InternalStateManager } from 'motia'
import crypto from 'crypto'

const CONCEPT_CACHE_GROUP = 'concept-cache'
const CACHE_TTL_MS = parseInt(process.env.CACHE_TTL_MS || '3600000', 10) // 1 hour default

export interface CachedResult {
  jobId: string
  concept: string
  normalizedConcept: string
  conceptHash: string
  quality: string
  videoUrl: string
  manimCode: string
  generationType: string
  usedAI: boolean
  createdAt: number
  expiresAt: number
}

/**
 * Normalize concept for consistent caching
 * - Lowercase
 * - Trim whitespace
 * - Collapse multiple spaces
 * - Remove punctuation variations
 */
export function normalizeConcept(concept: string): string {
  return concept
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[.,!?;:'"]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Generate a hash for the normalized concept
 * Used as cache key for exact matching
 */
export function generateConceptHash(concept: string, quality: string): string {
  const normalized = normalizeConcept(concept)
  return crypto
    .createHash('sha256')
    .update(`${normalized}:${quality}`)
    .digest('hex')
    .slice(0, 16)
}

/**
 * Check if a cached result exists and is still valid
 */
export async function getCachedResult(
  state: InternalStateManager,
  concept: string,
  quality: string
): Promise<CachedResult | null> {
  const hash = generateConceptHash(concept, quality)

  try {
    const cached = await state.get<CachedResult>(CONCEPT_CACHE_GROUP, hash)

    if (!cached) {
      return null
    }

    // Check if cache has expired
    if (Date.now() > cached.expiresAt) {
      // Clean up expired entry
      await state.delete(CONCEPT_CACHE_GROUP, hash)
      return null
    }

    return cached
  } catch (error) {
    console.warn('Cache lookup failed:', error)
    return null
  }
}

/**
 * Store a result in the cache
 */
export async function cacheResult(
  state: InternalStateManager,
  result: Omit<CachedResult, 'conceptHash' | 'normalizedConcept' | 'createdAt' | 'expiresAt'>
): Promise<void> {
  const normalizedConcept = normalizeConcept(result.concept)
  const conceptHash = generateConceptHash(result.concept, result.quality)
  const now = Date.now()

  const cacheEntry: CachedResult = {
    ...result,
    normalizedConcept,
    conceptHash,
    createdAt: now,
    expiresAt: now + CACHE_TTL_MS
  }

  try {
    await state.set(CONCEPT_CACHE_GROUP, conceptHash, cacheEntry)
  } catch (error) {
    console.warn('Cache store failed:', error)
  }
}

/**
 * Invalidate cache for a specific concept
 */
export async function invalidateCache(
  state: InternalStateManager,
  concept: string,
  quality: string
): Promise<void> {
  const hash = generateConceptHash(concept, quality)

  try {
    await state.delete(CONCEPT_CACHE_GROUP, hash)
  } catch (error) {
    console.warn('Cache invalidation failed:', error)
  }
}

/**
 * Check if caching is enabled via environment
 */
export function isCachingEnabled(): boolean {
  return process.env.DISABLE_CONCEPT_CACHE !== 'true'
}

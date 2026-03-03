import type { Cell, Level, Wall } from '../types'
import { cellKey } from '../logic/pathUtils'
import { solve } from './solver'

interface GenerateInput {
  rows: number
  cols: number
  path: Cell[]
  targetWalls: number
  targetCheckpoints: number
}

interface GenerateResult {
  success: boolean
  level?: Level
  attempts: number
  error?: string
}

type ProgressCallback = (attempts: number, total: number) => void

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function placeCheckpoints(
  path: Cell[],
  count: number,
): Record<string, number> {
  const checkpoints: Record<string, number> = {}
  // #1 at start, #N at end
  checkpoints[cellKey(path[0])] = 1
  checkpoints[cellKey(path[path.length - 1])] = count

  if (count <= 2) return checkpoints

  // Distribute remaining checkpoints evenly along the path
  const inner = count - 2
  for (let i = 1; i <= inner; i++) {
    const idx = Math.round((i / (inner + 1)) * (path.length - 1))
    checkpoints[cellKey(path[idx])] = i + 1
  }
  return checkpoints
}

function placeCheckpointsWithOffset(
  path: Cell[],
  count: number,
  offset: number,
): Record<string, number> {
  const checkpoints: Record<string, number> = {}
  checkpoints[cellKey(path[0])] = 1
  checkpoints[cellKey(path[path.length - 1])] = count

  if (count <= 2) return checkpoints

  const inner = count - 2
  for (let i = 1; i <= inner; i++) {
    const baseIdx = Math.round((i / (inner + 1)) * (path.length - 1))
    // Offset but clamp to [1, path.length - 2] to avoid start/end
    const idx = Math.max(1, Math.min(path.length - 2, baseIdx + offset))
    const key = cellKey(path[idx])
    // Skip if already assigned
    if (checkpoints[key] !== undefined) {
      // Try adjacent indices
      for (let d = 1; d < path.length; d++) {
        for (const dir of [1, -1]) {
          const alt = idx + d * dir
          if (alt >= 1 && alt < path.length - 1) {
            const altKey = cellKey(path[alt])
            if (checkpoints[altKey] === undefined) {
              checkpoints[altKey] = i + 1
              break
            }
          }
        }
        if (Object.keys(checkpoints).length === i + 1) break
      }
      if (checkpoints[cellKey(path[0])] !== undefined &&
          Object.values(checkpoints).includes(i + 1)) continue
      // fallback: just use baseIdx
      checkpoints[cellKey(path[baseIdx])] = i + 1
    } else {
      checkpoints[key] = i + 1
    }
  }
  return checkpoints
}

export function enumerateCandidateWalls(
  rows: number,
  cols: number,
  path: Cell[],
): Wall[] {
  // Build set of consecutive path pairs (edges that must remain open)
  const pathEdges = new Set<string>()
  for (let i = 0; i < path.length - 1; i++) {
    const a = cellKey(path[i])
    const b = cellKey(path[i + 1])
    pathEdges.add(`${a}|${b}`)
    pathEdges.add(`${b}|${a}`)
  }

  const walls: Wall[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Right neighbor
      if (c + 1 < cols) {
        const a = cellKey([r, c])
        const b = cellKey([r, c + 1])
        if (!pathEdges.has(`${a}|${b}`)) {
          walls.push([[r, c], [r, c + 1]])
        }
      }
      // Down neighbor
      if (r + 1 < rows) {
        const a = cellKey([r, c])
        const b = cellKey([r + 1, c])
        if (!pathEdges.has(`${a}|${b}`)) {
          walls.push([[r, c], [r + 1, c]])
        }
      }
    }
  }
  return walls
}

function sample<T>(arr: T[], n: number): T[] {
  const s = shuffled(arr)
  return s.slice(0, n)
}

const BUDGET = 500
const CHECKPOINT_VARIATIONS = 3

export function getCandidateWallCount(
  rows: number,
  cols: number,
  path: Cell[],
): number {
  return enumerateCandidateWalls(rows, cols, path).length
}

export async function generate(
  input: GenerateInput,
  onProgress?: ProgressCallback,
): Promise<GenerateResult> {
  const { rows, cols, path, targetWalls, targetCheckpoints } = input
  const candidates = enumerateCandidateWalls(rows, cols, path)

  if (targetWalls > candidates.length) {
    return {
      success: false,
      attempts: 0,
      error: `Requested ${targetWalls} walls but only ${candidates.length} candidates available`,
    }
  }

  if (targetCheckpoints < 2) {
    return {
      success: false,
      attempts: 0,
      error: 'Need at least 2 checkpoints',
    }
  }

  let totalAttempts = 0

  for (let variation = 0; variation < CHECKPOINT_VARIATIONS; variation++) {
    const offset = variation === 0 ? 0 : (variation % 2 === 1 ? variation : -variation)
    const checkpoints = variation === 0
      ? placeCheckpoints(path, targetCheckpoints)
      : placeCheckpointsWithOffset(path, targetCheckpoints, offset)

    for (let i = 0; i < BUDGET; i++) {
      totalAttempts++
      const walls = sample(candidates, targetWalls)

      const result = solve({
        rows,
        cols,
        walls,
        checkpoints,
        maxSolutions: 2,
      })

      if (result.solutions.length === 1) {
        const numbers: Record<string, number> = { ...checkpoints }
        const level: Level = {
          id: `level-${Date.now()}`,
          name: 'Unnamed',
          cols,
          rows,
          numbers,
          walls,
          solution: result.solutions[0],
        }
        return { success: true, level, attempts: totalAttempts }
      }

      // Yield to event loop periodically
      if (i % 50 === 49) {
        onProgress?.(totalAttempts, BUDGET * CHECKPOINT_VARIATIONS)
        await new Promise(r => setTimeout(r, 0))
      }
    }
  }

  return {
    success: false,
    attempts: totalAttempts,
    error: `No unique solution found after ${totalAttempts} attempts`,
  }
}

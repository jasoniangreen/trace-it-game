import type { Cell, Wall } from '../types'
import { buildWallSet, hasWall } from '../logic/validation'

interface SolverInput {
  rows: number
  cols: number
  walls: Wall[]
  checkpoints: Record<string, number> // "row,col" -> checkpoint number
  maxSolutions?: number
}

interface SolverResult {
  solutions: Cell[][]
  exhausted: boolean
}

const DIRS: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]]

export function solve(input: SolverInput): SolverResult {
  const { rows, cols, walls, checkpoints, maxSolutions = 2 } = input
  const totalCells = rows * cols
  const wallSet = buildWallSet(walls)

  // Find start cell (checkpoint 1)
  let startCell: Cell | null = null
  const maxCheckpoint = Math.max(...Object.values(checkpoints))
  let endCheckpointKey: string | null = null

  for (const [key, num] of Object.entries(checkpoints)) {
    if (num === 1) {
      const [r, c] = key.split(',').map(Number)
      startCell = [r, c]
    }
    if (num === maxCheckpoint) {
      endCheckpointKey = key
    }
  }

  if (!startCell) return { solutions: [], exhausted: true }

  const solutions: Cell[][] = []
  const visited = new Uint8Array(totalCells)
  const path: Cell[] = []

  // Next checkpoint we must encounter
  // If checkpoint 1 is at start, the next one we're looking for is 2
  let nextRequired = 2

  function idx(r: number, c: number): number {
    return r * cols + c
  }

  function floodCount(excludeIdx: number): number {
    // Count reachable unvisited cells from any single unvisited cell
    // to check connectivity of remaining cells
    let seedR = -1, seedC = -1
    for (let r = 0; r < rows && seedR < 0; r++) {
      for (let c = 0; c < cols && seedR < 0; c++) {
        const i = idx(r, c)
        if (i !== excludeIdx && !visited[i]) {
          seedR = r
          seedC = c
        }
      }
    }
    if (seedR < 0) return 0

    const stack: number[] = [seedR * cols + seedC]
    const seen = new Uint8Array(totalCells)
    seen[seedR * cols + seedC] = 1
    let count = 1

    while (stack.length > 0) {
      const si = stack.pop()!
      const sr = (si / cols) | 0
      const sc = si % cols
      for (const [dr, dc] of DIRS) {
        const nr = sr + dr
        const nc = sc + dc
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue
        const ni = idx(nr, nc)
        if (seen[ni] || visited[ni] || ni === excludeIdx) continue
        if (hasWall(wallSet, sr, sc, nr, nc)) continue
        seen[ni] = 1
        count++
        stack.push(ni)
      }
    }
    return count
  }

  function dfs(r: number, c: number, depth: number, nextReq: number): void {
    if (solutions.length >= maxSolutions) return

    const i = idx(r, c)
    visited[i] = 1
    path.push([r, c])

    const key = `${r},${c}`
    const cpNum = checkpoints[key]
    let updatedReq = nextReq

    // Check checkpoint ordering
    if (cpNum !== undefined) {
      if (cpNum === nextReq) {
        updatedReq = nextReq + 1
      } else if (cpNum > nextReq) {
        // Hit a later checkpoint before required ones — invalid
        visited[i] = 0
        path.pop()
        return
      }
      // cpNum < nextReq means already visited, that's fine (it's checkpoint 1 at start)
    }

    if (depth === totalCells) {
      // Must end on the highest checkpoint
      if (key === endCheckpointKey) {
        solutions.push([...path])
      }
      visited[i] = 0
      path.pop()
      return
    }

    // Connectivity pruning: check that remaining unvisited cells are connected
    const remaining = totalCells - depth
    if (remaining > 1 && depth > totalCells * 0.4) {
      const reachable = floodCount(-1)
      if (reachable !== remaining) {
        visited[i] = 0
        path.pop()
        return
      }
    }

    for (const [dr, dc] of DIRS) {
      const nr = r + dr
      const nc = c + dc
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue
      if (visited[idx(nr, nc)]) continue
      if (hasWall(wallSet, r, c, nr, nc)) continue
      dfs(nr, nc, depth + 1, updatedReq)
      if (solutions.length >= maxSolutions) break
    }

    visited[i] = 0
    path.pop()
  }

  dfs(startCell[0], startCell[1], 1, nextRequired)

  return {
    solutions,
    exhausted: solutions.length < maxSolutions,
  }
}

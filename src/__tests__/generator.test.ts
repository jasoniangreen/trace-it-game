import { describe, it, expect } from 'vitest'
import { generate, getCandidateWallCount } from '../level-planner/generator'
import { solve } from '../level-planner/solver'
import { verifySolution } from '../logic/validation'
import { cellKey } from '../logic/pathUtils'
import type { Cell } from '../types'

// 3x3 snake path covering all cells
const path3x3: Cell[] = [
  [0, 0], [0, 1], [0, 2],
  [1, 2], [1, 1], [1, 0],
  [2, 0], [2, 1], [2, 2],
]

// 4x4 snake path
const path4x4: Cell[] = [
  [0, 0], [0, 1], [0, 2], [0, 3],
  [1, 3], [1, 2], [1, 1], [1, 0],
  [2, 0], [2, 1], [2, 2], [2, 3],
  [3, 3], [3, 2], [3, 1], [3, 0],
]

describe('generator', () => {
  it('output has correct dimensions, wall count, and checkpoint count', async () => {
    const result = await generate({
      rows: 3,
      cols: 3,
      path: path3x3,
      targetWalls: 1,
      targetCheckpoints: 2,
    })
    expect(result.success).toBe(true)
    const lvl = result.level!
    expect(lvl.rows).toBe(3)
    expect(lvl.cols).toBe(3)
    expect(lvl.walls.length).toBe(1)
    expect(Object.keys(lvl.numbers).length).toBe(2)
  })

  it('checkpoint 1 at path start, max at path end', async () => {
    const result = await generate({
      rows: 3,
      cols: 3,
      path: path3x3,
      targetWalls: 1,
      targetCheckpoints: 3,
    })
    expect(result.success).toBe(true)
    const lvl = result.level!
    expect(lvl.numbers[cellKey(path3x3[0])]).toBe(1)
    expect(lvl.numbers[cellKey(path3x3[path3x3.length - 1])]).toBe(3)
  })

  it('generated level is uniquely solvable', async () => {
    const result = await generate({
      rows: 4,
      cols: 4,
      path: path4x4,
      targetWalls: 2,
      targetCheckpoints: 3,
    })
    expect(result.success).toBe(true)
    const lvl = result.level!
    const solverResult = solve({
      rows: lvl.rows,
      cols: lvl.cols,
      walls: lvl.walls,
      checkpoints: lvl.numbers,
      maxSolutions: 2,
    })
    expect(solverResult.solutions.length).toBe(1)
  })

  it("user's original path passes verifySolution on generated level", async () => {
    const result = await generate({
      rows: 3,
      cols: 3,
      path: path3x3,
      targetWalls: 1,
      targetCheckpoints: 2,
    })
    expect(result.success).toBe(true)
    const lvl = result.level!
    // The original path should be valid for the generated level
    // (walls never block consecutive path cells)
    expect(verifySolution(lvl, path3x3)).toBe(true)
  })

  it('no wall blocks consecutive path cells', async () => {
    const result = await generate({
      rows: 4,
      cols: 4,
      path: path4x4,
      targetWalls: 3,
      targetCheckpoints: 3,
    })
    expect(result.success).toBe(true)
    const lvl = result.level!

    // Build set of consecutive path edges
    const pathEdges = new Set<string>()
    for (let i = 0; i < path4x4.length - 1; i++) {
      const a = cellKey(path4x4[i])
      const b = cellKey(path4x4[i + 1])
      pathEdges.add(`${a}|${b}`)
      pathEdges.add(`${b}|${a}`)
    }

    for (const [a, b] of lvl.walls) {
      const ka = cellKey(a)
      const kb = cellKey(b)
      expect(pathEdges.has(`${ka}|${kb}`)).toBe(false)
    }
  })

  it('returns failure gracefully for impossible params', async () => {
    // Request more walls than available candidates
    const maxWalls = getCandidateWallCount(3, 3, path3x3)
    const result = await generate({
      rows: 3,
      cols: 3,
      path: path3x3,
      targetWalls: maxWalls + 1,
      targetCheckpoints: 2,
    })
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })
})

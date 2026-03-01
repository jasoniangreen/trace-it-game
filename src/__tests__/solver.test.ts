import { describe, it, expect } from 'vitest'
import { solve } from '../level-planner/solver'
import { levels } from '../data/levels'
import { verifySolution } from '../logic/validation'
import type { Level, Wall } from '../types'

describe('solver', () => {
  it('finds the known solution for level-1', () => {
    const lvl = levels[0]
    const result = solve({
      rows: lvl.rows,
      cols: lvl.cols,
      walls: lvl.walls,
      checkpoints: lvl.numbers,
      maxSolutions: 10,
    })
    expect(result.solutions.length).toBeGreaterThanOrEqual(1)
    // The known solution must be among them
    const known = JSON.stringify(lvl.solution)
    const found = result.solutions.some(s => JSON.stringify(s) === known)
    expect(found).toBe(true)
  })

  it('returns exactly 1 solution when walls force a unique path', () => {
    // 2x3 grid: only one Hamiltonian path from (0,0) to (1,2)
    // (0,0)→(1,0)→(1,1)→(0,1)→(0,2)→(1,2)
    const checkpoints: Record<string, number> = { '0,0': 1, '1,2': 2 }
    const result = solve({
      rows: 2,
      cols: 3,
      walls: [],
      checkpoints,
      maxSolutions: 10,
    })
    expect(result.solutions.length).toBe(1)
    expect(result.exhausted).toBe(true)
    expect(result.solutions[0]).toEqual([
      [0, 0], [1, 0], [1, 1], [0, 1], [0, 2], [1, 2],
    ])
  })

  it('returns 0 solutions for an unsolvable grid', () => {
    // Block all exits from (0,0) except right, and block (0,1) too
    const walls: Wall[] = [
      [[0, 0], [0, 1]],
      [[0, 0], [1, 0]],
    ]
    const checkpoints: Record<string, number> = { '0,0': 1, '1,1': 2 }
    const result = solve({
      rows: 2,
      cols: 2,
      walls,
      checkpoints,
    })
    expect(result.solutions.length).toBe(0)
    expect(result.exhausted).toBe(true)
  })

  it('respects maxSolutions cap', () => {
    // 3x3 with no walls has many Hamiltonian paths, but cap at 2
    const checkpoints: Record<string, number> = { '0,0': 1, '2,2': 2 }
    const result = solve({
      rows: 3,
      cols: 3,
      walls: [],
      checkpoints,
      maxSolutions: 2,
    })
    expect(result.solutions.length).toBe(2)
    expect(result.exhausted).toBe(false)
  })

  it('enforces checkpoint ordering', () => {
    // 3x3 with checkpoints 1 at (0,0), 2 at (0,2), 3 at (2,2)
    // All solutions must visit (0,2) before (2,2)
    const checkpoints: Record<string, number> = {
      '0,0': 1,
      '0,2': 2,
      '2,2': 3,
    }
    const result = solve({
      rows: 3,
      cols: 3,
      walls: [],
      checkpoints,
      maxSolutions: 100,
    })
    expect(result.solutions.length).toBeGreaterThan(0)
    for (const sol of result.solutions) {
      const idx02 = sol.findIndex(([r, c]) => r === 0 && c === 2)
      const idx22 = sol.findIndex(([r, c]) => r === 2 && c === 2)
      expect(idx02).toBeLessThan(idx22)
      // Must start at (0,0) and end at (2,2)
      expect(sol[0]).toEqual([0, 0])
      expect(sol[sol.length - 1]).toEqual([2, 2])
    }
  })

  it('never crosses walls (cross-check with verifySolution)', () => {
    const lvl = levels[1] // level-2 with walls
    const result = solve({
      rows: lvl.rows,
      cols: lvl.cols,
      walls: lvl.walls,
      checkpoints: lvl.numbers,
      maxSolutions: 10,
    })
    for (const sol of result.solutions) {
      const fakeLevel: Level = { ...lvl, solution: sol }
      expect(verifySolution(fakeLevel, sol)).toBe(true)
    }
  })

  it('completes a 5x5 grid in under 5 seconds', () => {
    const lvl = levels[2] // 5x5 Neon Maze
    const start = performance.now()
    const result = solve({
      rows: lvl.rows,
      cols: lvl.cols,
      walls: lvl.walls,
      checkpoints: lvl.numbers,
      maxSolutions: 2,
    })
    const elapsed = performance.now() - start
    expect(elapsed).toBeLessThan(5000)
    expect(result.solutions.length).toBeGreaterThanOrEqual(1)
  })
})

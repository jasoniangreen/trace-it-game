import { describe, it, expect } from 'vitest'
import {
  isAdjacent,
  buildWallSet,
  hasWall,
  isNumberOrderValid,
  checkWin,
  verifySolution,
} from '../logic/validation'
import type { Cell, Wall, Level } from '../types'

describe('isAdjacent', () => {
  it('returns true for horizontal neighbors', () => {
    expect(isAdjacent([0, 0], [0, 1])).toBe(true)
    expect(isAdjacent([0, 1], [0, 0])).toBe(true)
  })

  it('returns true for vertical neighbors', () => {
    expect(isAdjacent([0, 0], [1, 0])).toBe(true)
    expect(isAdjacent([1, 0], [0, 0])).toBe(true)
  })

  it('returns false for diagonal neighbors', () => {
    expect(isAdjacent([0, 0], [1, 1])).toBe(false)
  })

  it('returns false for same cell', () => {
    expect(isAdjacent([0, 0], [0, 0])).toBe(false)
  })

  it('returns false for non-adjacent cells', () => {
    expect(isAdjacent([0, 0], [0, 2])).toBe(false)
    expect(isAdjacent([0, 0], [2, 0])).toBe(false)
  })
})

describe('buildWallSet / hasWall', () => {
  const walls: Wall[] = [[[1, 1], [1, 2]]]
  const wallSet = buildWallSet(walls)

  it('detects wall in both directions', () => {
    expect(hasWall(wallSet, 1, 1, 1, 2)).toBe(true)
    expect(hasWall(wallSet, 1, 2, 1, 1)).toBe(true)
  })

  it('returns false for non-walled edges', () => {
    expect(hasWall(wallSet, 0, 0, 0, 1)).toBe(false)
  })

  it('handles empty wall set', () => {
    const empty = buildWallSet([])
    expect(hasWall(empty, 0, 0, 0, 1)).toBe(false)
  })
})

describe('isNumberOrderValid', () => {
  const numbers: Record<string, number> = {
    '0,0': 1,
    '1,1': 5,
    '2,2': 9,
  }

  it('allows moving to non-numbered cell', () => {
    const path: Cell[] = [[0, 0]]
    expect(isNumberOrderValid(numbers, path, [0, 1])).toBe(true)
  })

  it('rejects next numbered cell if previous numbered cells not visited', () => {
    // Path only has cell 1, trying to visit cell 9 (skipping 5)
    const path: Cell[] = [[0, 0]]
    expect(isNumberOrderValid(numbers, path, [2, 2])).toBe(false)
  })

  it('allows numbered cell when all previous numbers visited', () => {
    // Path has 1 and 5, can now visit 9
    const path: Cell[] = [[0, 0], [0, 1], [0, 2], [1, 2], [1, 1]]
    expect(isNumberOrderValid(numbers, path, [2, 2])).toBe(true)
  })

  it('allows first move to cell numbered 1', () => {
    const path: Cell[] = []
    expect(isNumberOrderValid(numbers, path, [0, 0])).toBe(true)
  })

  it('rejects starting on a cell that is not numbered 1', () => {
    const path: Cell[] = []
    expect(isNumberOrderValid(numbers, path, [1, 1])).toBe(false)
  })
})

describe('checkWin', () => {
  const level: Level = {
    id: 'test',
    name: 'Test',
    cols: 3,
    rows: 3,
    numbers: { '0,0': 1, '2,2': 9 },
    walls: [],
    solution: [],
  }

  it('returns true when all cells visited and last cell is highest number', () => {
    const path: Cell[] = [
      [0, 0], [0, 1], [0, 2],
      [1, 2], [1, 1], [1, 0],
      [2, 0], [2, 1], [2, 2],
    ]
    expect(checkWin(level, path)).toBe(true)
  })

  it('returns false when not all cells visited', () => {
    const path: Cell[] = [[0, 0], [0, 1]]
    expect(checkWin(level, path)).toBe(false)
  })

  it('returns false when last cell is not highest number', () => {
    const path: Cell[] = [
      [2, 2], [2, 1], [2, 0],
      [1, 0], [1, 1], [1, 2],
      [0, 2], [0, 1], [0, 0],
    ]
    expect(checkWin(level, path)).toBe(false)
  })
})

describe('verifySolution', () => {
  const level: Level = {
    id: 'test',
    name: 'Test',
    cols: 3,
    rows: 3,
    numbers: { '0,0': 1, '2,2': 9 },
    walls: [],
    solution: [
      [0, 0], [0, 1], [0, 2],
      [1, 2], [1, 1], [1, 0],
      [2, 0], [2, 1], [2, 2],
    ],
  }

  it('returns true for valid solution', () => {
    expect(verifySolution(level, level.solution)).toBe(true)
  })

  it('returns false for path with non-adjacent steps', () => {
    const bad: Cell[] = [
      [0, 0], [2, 2], [0, 1],
      [1, 2], [1, 1], [1, 0],
      [2, 0], [2, 1], [0, 2],
    ]
    expect(verifySolution(level, bad)).toBe(false)
  })

  it('returns false for path crossing a wall', () => {
    const walledLevel: Level = {
      ...level,
      walls: [[[0, 0], [0, 1]]],
    }
    expect(verifySolution(walledLevel, level.solution)).toBe(false)
  })

  it('returns false for path with duplicate cells', () => {
    const bad: Cell[] = [
      [0, 0], [0, 1], [0, 0],
      [1, 2], [1, 1], [1, 0],
      [2, 0], [2, 1], [2, 2],
    ]
    expect(verifySolution(level, bad)).toBe(false)
  })

  it('returns false for incomplete path', () => {
    expect(verifySolution(level, [[0, 0], [0, 1]])).toBe(false)
  })
})

import { describe, it, expect } from 'vitest'
import {
  addToPath,
  truncatePath,
  undoPath,
  cellKey,
  buildVisitedSet,
} from '../logic/pathUtils'
import type { Cell } from '../types'

describe('cellKey', () => {
  it('converts cell to string key', () => {
    expect(cellKey([2, 3])).toBe('2,3')
    expect(cellKey([0, 0])).toBe('0,0')
  })
})

describe('addToPath', () => {
  it('adds a cell to empty path', () => {
    const result = addToPath([], [0, 0])
    expect(result).toEqual([[0, 0]])
  })

  it('adds a cell to existing path', () => {
    const path: Cell[] = [[0, 0], [0, 1]]
    const result = addToPath(path, [0, 2])
    expect(result).toEqual([[0, 0], [0, 1], [0, 2]])
  })

  it('does not mutate original path', () => {
    const path: Cell[] = [[0, 0]]
    addToPath(path, [0, 1])
    expect(path).toEqual([[0, 0]])
  })
})

describe('truncatePath', () => {
  it('truncates to a cell in the path', () => {
    const path: Cell[] = [[0, 0], [0, 1], [0, 2], [1, 2]]
    const result = truncatePath(path, [0, 1])
    expect(result).toEqual([[0, 0], [0, 1]])
  })

  it('returns same path if cell is the last one', () => {
    const path: Cell[] = [[0, 0], [0, 1]]
    const result = truncatePath(path, [0, 1])
    expect(result).toEqual([[0, 0], [0, 1]])
  })

  it('returns empty array if cell not found', () => {
    const path: Cell[] = [[0, 0], [0, 1]]
    const result = truncatePath(path, [2, 2])
    expect(result).toEqual([])
  })

  it('does not mutate original path', () => {
    const path: Cell[] = [[0, 0], [0, 1], [0, 2]]
    truncatePath(path, [0, 0])
    expect(path.length).toBe(3)
  })
})

describe('undoPath', () => {
  it('removes last cell', () => {
    const path: Cell[] = [[0, 0], [0, 1], [0, 2]]
    expect(undoPath(path)).toEqual([[0, 0], [0, 1]])
  })

  it('returns empty array from single-cell path', () => {
    expect(undoPath([[0, 0]])).toEqual([])
  })

  it('returns empty array from empty path', () => {
    expect(undoPath([])).toEqual([])
  })

  it('does not mutate original path', () => {
    const path: Cell[] = [[0, 0], [0, 1]]
    undoPath(path)
    expect(path.length).toBe(2)
  })
})

describe('buildVisitedSet', () => {
  it('builds set from path', () => {
    const path: Cell[] = [[0, 0], [0, 1], [1, 1]]
    const visited = buildVisitedSet(path)
    expect(visited.has('0,0')).toBe(true)
    expect(visited.has('0,1')).toBe(true)
    expect(visited.has('1,1')).toBe(true)
    expect(visited.has('2,2')).toBe(false)
  })

  it('returns empty set for empty path', () => {
    expect(buildVisitedSet([]).size).toBe(0)
  })
})

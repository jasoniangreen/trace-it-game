import { describe, it, expect } from 'vitest'
import { pathToPoints, calcPathLength } from '../logic/pathLineUtils'
import type { Cell } from '../types'

const CELL = 72
const GAP = 3

describe('pathToPoints', () => {
  it('returns empty string for empty path', () => {
    expect(pathToPoints([], CELL, GAP)).toBe('')
  })

  it('returns single point for single cell', () => {
    expect(pathToPoints([[0, 0]], CELL, GAP)).toBe('36,36')
  })

  it('handles horizontal segment', () => {
    const path: Cell[] = [[0, 0], [0, 1], [0, 2]]
    expect(pathToPoints(path, CELL, GAP)).toBe('36,36 111,36 186,36')
  })

  it('handles vertical segment', () => {
    const path: Cell[] = [[0, 0], [1, 0], [2, 0]]
    expect(pathToPoints(path, CELL, GAP)).toBe('36,36 36,111 36,186')
  })

  it('handles L-shaped path', () => {
    const path: Cell[] = [[0, 0], [0, 1], [1, 1]]
    expect(pathToPoints(path, CELL, GAP)).toBe('36,36 111,36 111,111')
  })
})

describe('calcPathLength', () => {
  it('returns 0 for empty path', () => {
    expect(calcPathLength([], CELL, GAP)).toBe(0)
  })

  it('returns 0 for single cell', () => {
    expect(calcPathLength([[0, 0]], CELL, GAP)).toBe(0)
  })

  it('calculates horizontal segment length', () => {
    const path: Cell[] = [[0, 0], [0, 1]]
    expect(calcPathLength(path, CELL, GAP)).toBe(75) // cellSize + cellGap
  })

  it('calculates multi-segment length', () => {
    const path: Cell[] = [[0, 0], [0, 1], [0, 2]]
    expect(calcPathLength(path, CELL, GAP)).toBe(150) // 2 * (cellSize + cellGap)
  })

  it('calculates L-shaped path length', () => {
    const path: Cell[] = [[0, 0], [0, 1], [1, 1]]
    // Two segments, each 75px
    expect(calcPathLength(path, CELL, GAP)).toBe(150)
  })
})

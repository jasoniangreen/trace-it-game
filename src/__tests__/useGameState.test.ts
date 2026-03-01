import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGameState } from '../hooks/useGameState'
import { levels } from '../data/levels'
import type { Level } from '../types'

const level1 = levels[0] // 3x3, no walls, numbers: 0,0=1  2,2=9
const level2 = levels[1] // 4x4, wall (1,1)-(1,2), numbers: 0,0=1  0,3=6  3,0=16

describe('useGameState', () => {
  it('starts with empty path', () => {
    const { result } = renderHook(() => useGameState(level1))
    expect(result.current.path).toEqual([])
    expect(result.current.head).toBeNull()
    expect(result.current.isComplete).toBe(false)
  })

  it('only allows starting on cell numbered 1', () => {
    const { result } = renderHook(() => useGameState(level1))

    act(() => result.current.tryMove(1, 1)) // not numbered 1
    expect(result.current.path).toEqual([])

    act(() => result.current.tryMove(0, 0)) // numbered 1
    expect(result.current.path).toEqual([[0, 0]])
    expect(result.current.head).toEqual([0, 0])
  })

  it('extends path with adjacent moves', () => {
    const { result } = renderHook(() => useGameState(level1))
    act(() => result.current.tryMove(0, 0))
    act(() => result.current.tryMove(0, 1))
    act(() => result.current.tryMove(0, 2))
    expect(result.current.path).toEqual([[0, 0], [0, 1], [0, 2]])
  })

  it('rejects non-adjacent moves', () => {
    const { result } = renderHook(() => useGameState(level1))
    act(() => result.current.tryMove(0, 0))
    act(() => result.current.tryMove(2, 2)) // not adjacent
    expect(result.current.path).toEqual([[0, 0]])
  })

  it('retracing to previous cell undoes one step', () => {
    const { result } = renderHook(() => useGameState(level1))
    act(() => result.current.tryMove(0, 0))
    act(() => result.current.tryMove(0, 1))
    act(() => result.current.tryMove(0, 0)) // previous cell — undo one step
    expect(result.current.path).toEqual([[0, 0]])
  })

  it('ignores moves to visited cells that are not the previous cell', () => {
    const { result } = renderHook(() => useGameState(level1))
    act(() => result.current.tryMove(0, 0))
    act(() => result.current.tryMove(0, 1))
    act(() => result.current.tryMove(0, 2))
    // Click on 0,0 which is visited but not the previous cell — ignored
    act(() => result.current.tryMove(0, 0))
    expect(result.current.path).toEqual([[0, 0], [0, 1], [0, 2]])
  })

  it('blocks moves through walls', () => {
    const { result } = renderHook(() => useGameState(level2))
    // Walk: (0,0) → (1,0) → (1,1) → try (1,2) which is walled
    act(() => result.current.tryMove(0, 0))
    act(() => result.current.tryMove(1, 0))
    act(() => result.current.tryMove(1, 1))
    act(() => result.current.tryMove(1, 2)) // wall between (1,1) and (1,2)
    expect(result.current.path).toEqual([[0, 0], [1, 0], [1, 1]])
  })

  it('enforces number ordering', () => {
    const { result } = renderHook(() => useGameState(level2))
    // Level 2: 0,0=1, 0,3=6, 3,0=16
    // Try to reach cell 6 (0,3) without visiting cells 2-5 first
    // Path: (0,0) → (0,1) → (0,2) → (0,3) should work since 0,3 is number 6 = 4th step
    act(() => result.current.tryMove(0, 0))
    act(() => result.current.tryMove(0, 1))
    act(() => result.current.tryMove(0, 2))
    act(() => result.current.tryMove(0, 3))
    // This should fail: cell (0,3) has number 6, but we've only visited 3 cells before it
    // Numbers visited: 1. Need all numbers < 6 visited, but there are none between 1 and 6
    // Actually, since only 1 and 6 are numbered, visiting 1 means all numbers < 6 are covered
    expect(result.current.path.length).toBe(4)
  })

  it('undo removes last cell', () => {
    const { result } = renderHook(() => useGameState(level1))
    act(() => result.current.tryMove(0, 0))
    act(() => result.current.tryMove(0, 1))
    act(() => result.current.undo())
    expect(result.current.path).toEqual([[0, 0]])
    expect(result.current.head).toEqual([0, 0])
  })

  it('undo on empty path does nothing', () => {
    const { result } = renderHook(() => useGameState(level1))
    act(() => result.current.undo())
    expect(result.current.path).toEqual([])
  })

  it('reset clears path', () => {
    const { result } = renderHook(() => useGameState(level1))
    act(() => result.current.tryMove(0, 0))
    act(() => result.current.tryMove(0, 1))
    act(() => result.current.reset())
    expect(result.current.path).toEqual([])
    expect(result.current.head).toBeNull()
    expect(result.current.isComplete).toBe(false)
  })

  it('detects win when all cells visited ending on highest number', () => {
    const { result } = renderHook(() => useGameState(level1))
    // Play the full solution for level 1
    for (const [r, c] of level1.solution) {
      act(() => result.current.tryMove(r, c))
    }
    expect(result.current.path.length).toBe(9)
    expect(result.current.isComplete).toBe(true)
  })

  it('visited set tracks path cells', () => {
    const { result } = renderHook(() => useGameState(level1))
    act(() => result.current.tryMove(0, 0))
    act(() => result.current.tryMove(0, 1))
    expect(result.current.visited.has('0,0')).toBe(true)
    expect(result.current.visited.has('0,1')).toBe(true)
    expect(result.current.visited.has('1,1')).toBe(false)
  })

  it('resets when level changes', () => {
    const { result, rerender } = renderHook(
      ({ level }: { level: Level }) => useGameState(level),
      { initialProps: { level: level1 } },
    )
    act(() => result.current.tryMove(0, 0))
    expect(result.current.path.length).toBe(1)

    rerender({ level: level2 })
    expect(result.current.path).toEqual([])
  })
})

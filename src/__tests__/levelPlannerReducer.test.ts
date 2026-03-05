import { describe, it, expect } from 'vitest'
import { reducer } from '../level-planner/LevelPlanner'
import type { Level } from '../types'

const baseState = {
  started: true,
  rows: 3,
  cols: 3,
  path: [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 2],
    [2, 2],
    [2, 1],
    [2, 0],
    [1, 0],
    [1, 1],
  ] as [number, number][],
  targetWalls: 2,
  targetCheckpoints: 3,
  generatedLevel: null,
  isGenerating: false,
  generateProgress: 0,
  generateError: null,
  manualWalls: [],
  checkpointCells: new Set<string>(),
  editMode: null as null,
}

const mockGeneratedLevel: Level = {
  id: 'test',
  name: 'Test',
  rows: 3,
  cols: 3,
  numbers: { '0,0': 1, '1,1': 3, '0,2': 5 },
  walls: [
    [
      [0, 1],
      [1, 1],
    ],
    [
      [1, 2],
      [2, 2],
    ],
  ],
  solution: [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 2],
    [2, 2],
    [2, 1],
    [2, 0],
    [1, 0],
    [1, 1],
  ],
}

describe('reducer SET_EDIT_MODE', () => {
  it('seeds manualWalls from generatedLevel.walls', () => {
    const state = { ...baseState, generatedLevel: mockGeneratedLevel }
    const next = reducer(state, { type: 'SET_EDIT_MODE', mode: 'walls' })
    expect(next.manualWalls).toEqual(mockGeneratedLevel.walls)
  })

  it('seeds checkpointCells from generatedLevel.numbers keys', () => {
    const state = { ...baseState, generatedLevel: mockGeneratedLevel }
    const next = reducer(state, { type: 'SET_EDIT_MODE', mode: 'numbers' })
    expect(next.checkpointCells).toEqual(new Set(Object.keys(mockGeneratedLevel.numbers)))
  })

  it('clears generatedLevel after entering edit mode', () => {
    const state = { ...baseState, generatedLevel: mockGeneratedLevel }
    const next = reducer(state, { type: 'SET_EDIT_MODE', mode: 'walls' })
    expect(next.generatedLevel).toBeNull()
  })

  it('preserves existing manualWalls when no generatedLevel', () => {
    const existingWalls = [[[0, 0], [0, 1]]] as Level['walls']
    const state = { ...baseState, manualWalls: existingWalls, generatedLevel: null }
    const next = reducer(state, { type: 'SET_EDIT_MODE', mode: 'walls' })
    expect(next.manualWalls).toEqual(existingWalls)
  })

  it('preserves existing checkpointCells when no generatedLevel', () => {
    const existing = new Set(['0,0', '2,2'])
    const state = { ...baseState, checkpointCells: existing, generatedLevel: null }
    const next = reducer(state, { type: 'SET_EDIT_MODE', mode: 'numbers' })
    expect(next.checkpointCells).toEqual(existing)
  })

  it('toggles off when same mode is dispatched', () => {
    const state = { ...baseState, editMode: 'walls' as const }
    const next = reducer(state, { type: 'SET_EDIT_MODE', mode: 'walls' })
    expect(next.editMode).toBeNull()
  })

  it('does not change other state on toggle-off', () => {
    const existingWalls = [[[0, 0], [0, 1]]] as Level['walls']
    const state = { ...baseState, editMode: 'walls' as const, manualWalls: existingWalls }
    const next = reducer(state, { type: 'SET_EDIT_MODE', mode: 'walls' })
    expect(next.manualWalls).toEqual(existingWalls)
    expect(next.generatedLevel).toBeNull()
  })
})

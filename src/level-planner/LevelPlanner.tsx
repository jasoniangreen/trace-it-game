import { useReducer, useCallback, useState, useMemo } from 'react'
import { GridSizeSection } from './SetupPanel'
import { GridSection } from './PathEditor'
import { ConfigSection } from './ConfigPanel'
import { exportLevel } from './exportLevel'
import { encodeLevel } from './levelCodec'
import { cellKey } from '../logic/pathUtils'
import type { Cell, Level, Wall } from '../types'
import './LevelPlanner.css'

export type EditMode = 'walls' | 'numbers' | null

interface State {
  started: boolean
  rows: number
  cols: number
  path: Cell[]
  targetWalls: number
  targetCheckpoints: number
  generatedLevel: Level | null
  isGenerating: boolean
  generateProgress: number
  generateError: string | null
  manualWalls: Wall[]
  checkpointCells: Set<string>
  editMode: EditMode
}

export type Action =
  | { type: 'START_DRAWING'; rows: number; cols: number }
  | { type: 'SET_PATH'; path: Cell[] }
  | { type: 'SET_TARGETS'; targetWalls: number; targetCheckpoints: number }
  | { type: 'START_GENERATE' }
  | { type: 'GENERATE_PROGRESS'; progress: number }
  | { type: 'GENERATE_DONE'; level: Level }
  | { type: 'GENERATE_FAIL'; error: string }
  | { type: 'CLEAR_GENERATED' }
  | { type: 'RESET_ALL' }
  | { type: 'SET_EDIT_MODE'; mode: EditMode }
  | { type: 'TOGGLE_WALL'; wall: Wall }
  | { type: 'TOGGLE_CHECKPOINT'; key: string }

function wallKey(w: Wall): string {
  return `${w[0][0]},${w[0][1]}|${w[1][0]},${w[1][1]}`
}

export function computeManualNumbers(
  path: Cell[],
  checkpointCells: Set<string>,
): Record<string, number> {
  const ordered = path.map(c => cellKey(c)).filter(k => checkpointCells.has(k))
  return Object.fromEntries(ordered.map((k, i) => [k, i + 1]))
}

function init(): State {
  return {
    started: false,
    rows: 5,
    cols: 5,
    path: [],
    targetWalls: 2,
    targetCheckpoints: 3,
    generatedLevel: null,
    isGenerating: false,
    generateProgress: 0,
    generateError: null,
    manualWalls: [],
    checkpointCells: new Set(),
    editMode: null,
  }
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'START_DRAWING':
      return { ...init(), started: true, rows: action.rows, cols: action.cols }
    case 'SET_PATH': {
      const next = state.generatedLevel
        ? { ...state, path: action.path, generatedLevel: null, generateError: null }
        : { ...state, path: action.path }
      return { ...next, manualWalls: [], checkpointCells: new Set(), editMode: null }
    }
    case 'SET_TARGETS':
      return { ...state, targetWalls: action.targetWalls, targetCheckpoints: action.targetCheckpoints }
    case 'START_GENERATE':
      return { ...state, isGenerating: true, generateProgress: 0, generateError: null }
    case 'GENERATE_PROGRESS':
      return { ...state, generateProgress: action.progress }
    case 'GENERATE_DONE':
      return { ...state, generatedLevel: action.level, isGenerating: false, editMode: null }
    case 'GENERATE_FAIL':
      return { ...state, generateError: action.error, isGenerating: false }
    case 'CLEAR_GENERATED':
      return { ...state, generatedLevel: null, generateError: null }
    case 'RESET_ALL':
      return init()
    case 'SET_EDIT_MODE': {
      if (action.mode === state.editMode) {
        return { ...state, editMode: null }
      }

      // Seed manual state from generated level so user can fine-tune it
      const manualWalls = state.generatedLevel ? state.generatedLevel.walls : state.manualWalls
      const checkpointCells = state.generatedLevel
        ? new Set(Object.keys(state.generatedLevel.numbers))
        : state.checkpointCells

      let next = { ...state, editMode: action.mode, generatedLevel: null, manualWalls, checkpointCells }

      if (action.mode === 'numbers' && checkpointCells.size === 0 && state.path.length >= 2) {
        const cells = new Set<string>()
        cells.add(cellKey(state.path[0]))
        cells.add(cellKey(state.path[state.path.length - 1]))
        next = { ...next, checkpointCells: cells }
      }
      return next
    }
    case 'TOGGLE_WALL': {
      const key = wallKey(action.wall)
      const exists = state.manualWalls.some(w => wallKey(w) === key)
      return {
        ...state,
        manualWalls: exists
          ? state.manualWalls.filter(w => wallKey(w) !== key)
          : [...state.manualWalls, action.wall],
        generatedLevel: null,
      }
    }
    case 'TOGGLE_CHECKPOINT': {
      const startKey = state.path.length > 0 ? cellKey(state.path[0]) : ''
      const endKey = state.path.length > 0 ? cellKey(state.path[state.path.length - 1]) : ''
      if (action.key === startKey || action.key === endKey) return state
      const next = new Set(state.checkpointCells)
      if (next.has(action.key)) {
        next.delete(action.key)
      } else {
        next.add(action.key)
      }
      return { ...state, checkpointCells: next, generatedLevel: null }
    }
  }
}

export default function LevelPlanner() {
  const [state, dispatch] = useReducer(reducer, undefined, init)
  const [copied, setCopied] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  const pathComplete = state.path.length === state.rows * state.cols
  const hasGenerated = state.generatedLevel !== null

  const manualNumbers = useMemo(
    () => computeManualNumbers(state.path, state.checkpointCells),
    [state.path, state.checkpointCells],
  )

  const hasManualData = state.manualWalls.length > 0 || state.checkpointCells.size > 0

  const handleBackToGame = useCallback(() => {
    window.location.hash = ''
  }, [])

  const handleStartOver = useCallback(() => {
    if (state.path.length > 0) {
      if (!window.confirm('This will reset everything. Continue?')) return
    }
    dispatch({ type: 'RESET_ALL' })
  }, [state.path.length])

  const handleCopy = useCallback(async () => {
    let level: Level
    if (state.generatedLevel) {
      level = state.generatedLevel
    } else if (pathComplete) {
      level = {
        id: `level-${Date.now()}`,
        name: 'Unnamed',
        cols: state.cols,
        rows: state.rows,
        numbers: manualNumbers,
        walls: state.manualWalls,
        solution: state.path,
      }
    } else {
      return
    }
    const text = exportLevel(level)
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [state.generatedLevel, state.manualWalls, manualNumbers, state.path, state.rows, state.cols, pathComplete])

  const handleCopyShareLink = useCallback(async () => {
    let level: Level
    if (state.generatedLevel) {
      level = state.generatedLevel
    } else if (pathComplete) {
      level = {
        id: `level-${Date.now()}`,
        name: 'Unnamed',
        cols: state.cols,
        rows: state.rows,
        numbers: manualNumbers,
        walls: state.manualWalls,
        solution: state.path,
      }
    } else {
      return
    }
    const encoded = encodeLevel(level)
    const url = `${window.location.origin}${window.location.pathname}#play/${encoded}`
    await navigator.clipboard.writeText(url)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }, [state.generatedLevel, state.manualWalls, manualNumbers, state.path, state.rows, state.cols, pathComplete])

  const handlePlayLevel = useCallback(() => {
    let level: Level
    if (state.generatedLevel) {
      level = state.generatedLevel
    } else if (pathComplete) {
      level = {
        id: `level-${Date.now()}`,
        name: 'Unnamed',
        cols: state.cols,
        rows: state.rows,
        numbers: manualNumbers,
        walls: state.manualWalls,
        solution: state.path,
      }
    } else {
      return
    }
    const encoded = encodeLevel(level)
    window.location.hash = `#play/${encoded}`
  }, [state.generatedLevel, state.manualWalls, manualNumbers, state.path, state.rows, state.cols, pathComplete])

  if (!state.started) {
    return (
      <div className="planner">
        <div className="planner__header">
          <button className="planner__back-btn" onClick={handleBackToGame} aria-label="Back to game">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="planner__title">Level Planner</h1>
        </div>

        <GridSizeSection
          rows={state.rows}
          cols={state.cols}
          onStart={(rows, cols) => dispatch({ type: 'START_DRAWING', rows, cols })}
        />
      </div>
    )
  }

  return (
    <div className="planner">
      <div className="planner__header">
        <button className="planner__back-btn" onClick={handleBackToGame} aria-label="Back to game">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="planner__title">Level Planner</h1>
        <button
          className="planner-btn planner-btn--small planner__start-over"
          onClick={handleStartOver}
          disabled={state.isGenerating}
        >
          Start Over
        </button>
      </div>

      <GridSection
        rows={state.rows}
        cols={state.cols}
        path={state.path}
        generatedLevel={state.generatedLevel}
        isGenerating={state.isGenerating}
        generateProgress={state.generateProgress}
        editMode={state.editMode}
        manualWalls={state.manualWalls}
        manualNumbers={manualNumbers}
        checkpointCells={state.checkpointCells}
        onPathChange={(path) => dispatch({ type: 'SET_PATH', path })}
        dispatch={dispatch}
      />

      <ConfigSection
        rows={state.rows}
        cols={state.cols}
        path={state.path}
        targetWalls={state.targetWalls}
        targetCheckpoints={state.targetCheckpoints}
        isGenerating={state.isGenerating}
        error={state.generateError}
        disabled={!pathComplete}
        hasGenerated={hasGenerated}
        editMode={state.editMode}
        copied={copied}
        copiedLink={copiedLink}
        hasManualData={hasManualData}
        onCopy={handleCopy}
        onCopyShareLink={handleCopyShareLink}
        onPlayLevel={handlePlayLevel}
        dispatch={dispatch}
      />
    </div>
  )
}

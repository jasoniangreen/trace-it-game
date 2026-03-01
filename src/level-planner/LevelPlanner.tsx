import { useReducer, useCallback } from 'react'
import { SetupPanel } from './SetupPanel'
import { PathEditor } from './PathEditor'
import { ConfigPanel } from './ConfigPanel'
import { PreviewPanel } from './PreviewPanel'
import type { Cell, Level } from '../types'
import './LevelPlanner.css'

type Phase = 'setup' | 'drawing' | 'configure' | 'generating' | 'preview'

interface State {
  phase: Phase
  rows: number
  cols: number
  path: Cell[]
  targetWalls: number
  targetCheckpoints: number
  generatedLevel: Level | null
  generateProgress: number
  generateError: string | null
}

type Action =
  | { type: 'START_DRAWING'; rows: number; cols: number }
  | { type: 'SET_PATH'; path: Cell[] }
  | { type: 'DONE_DRAWING' }
  | { type: 'SET_TARGETS'; targetWalls: number; targetCheckpoints: number }
  | { type: 'START_GENERATE' }
  | { type: 'GENERATE_PROGRESS'; progress: number }
  | { type: 'GENERATE_DONE'; level: Level }
  | { type: 'GENERATE_FAIL'; error: string }
  | { type: 'BACK_TO_CONFIGURE' }
  | { type: 'RESET' }

function init(): State {
  return {
    phase: 'setup',
    rows: 5,
    cols: 5,
    path: [],
    targetWalls: 2,
    targetCheckpoints: 3,
    generatedLevel: null,
    generateProgress: 0,
    generateError: null,
  }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'START_DRAWING':
      return { ...init(), phase: 'drawing', rows: action.rows, cols: action.cols }
    case 'SET_PATH':
      return { ...state, path: action.path }
    case 'DONE_DRAWING':
      return { ...state, phase: 'configure' }
    case 'SET_TARGETS':
      return { ...state, targetWalls: action.targetWalls, targetCheckpoints: action.targetCheckpoints }
    case 'START_GENERATE':
      return { ...state, phase: 'generating', generateProgress: 0, generateError: null }
    case 'GENERATE_PROGRESS':
      return { ...state, generateProgress: action.progress }
    case 'GENERATE_DONE':
      return { ...state, phase: 'preview', generatedLevel: action.level }
    case 'GENERATE_FAIL':
      return { ...state, phase: 'configure', generateError: action.error }
    case 'BACK_TO_CONFIGURE':
      return { ...state, phase: 'configure', generateError: null }
    case 'RESET':
      return init()
  }
}

export default function LevelPlanner() {
  const [state, dispatch] = useReducer(reducer, undefined, init)

  const handleBackToGame = useCallback(() => {
    window.location.hash = ''
  }, [])

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

      {state.phase === 'setup' && (
        <SetupPanel
          rows={state.rows}
          cols={state.cols}
          onStart={(rows, cols) => dispatch({ type: 'START_DRAWING', rows, cols })}
        />
      )}

      {state.phase === 'drawing' && (
        <PathEditor
          rows={state.rows}
          cols={state.cols}
          path={state.path}
          onPathChange={(path) => dispatch({ type: 'SET_PATH', path })}
          onDone={() => dispatch({ type: 'DONE_DRAWING' })}
          onBack={() => dispatch({ type: 'RESET' })}
        />
      )}

      {(state.phase === 'configure' || state.phase === 'generating') && (
        <ConfigPanel
          rows={state.rows}
          cols={state.cols}
          path={state.path}
          targetWalls={state.targetWalls}
          targetCheckpoints={state.targetCheckpoints}
          isGenerating={state.phase === 'generating'}
          progress={state.generateProgress}
          error={state.generateError}
          dispatch={dispatch}
        />
      )}

      {state.phase === 'preview' && state.generatedLevel && (
        <PreviewPanel
          level={state.generatedLevel}
          onRegenerate={() => dispatch({ type: 'BACK_TO_CONFIGURE' })}
          onNewLevel={() => dispatch({ type: 'RESET' })}
        />
      )}
    </div>
  )
}

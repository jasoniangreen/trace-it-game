import { useCallback, useRef } from 'react'
import { getCandidateWallCount, generate } from './generator'
import type { Cell } from '../types'

type Action =
  | { type: 'SET_TARGETS'; targetWalls: number; targetCheckpoints: number }
  | { type: 'START_GENERATE' }
  | { type: 'GENERATE_PROGRESS'; progress: number }
  | { type: 'GENERATE_DONE'; level: import('../types').Level }
  | { type: 'GENERATE_FAIL'; error: string }
  | { type: 'RESET' }

interface ConfigPanelProps {
  rows: number
  cols: number
  path: Cell[]
  targetWalls: number
  targetCheckpoints: number
  isGenerating: boolean
  progress: number
  error: string | null
  dispatch: (action: Action) => void
}

export function ConfigPanel({
  rows,
  cols,
  path,
  targetWalls,
  targetCheckpoints,
  isGenerating,
  progress,
  error,
  dispatch,
}: ConfigPanelProps) {
  const totalCells = rows * cols
  const maxCandidateWalls = getCandidateWallCount(rows, cols, path)
  const maxCheckpoints = Math.max(2, Math.floor(totalCells / 3))
  const cancelRef = useRef(false)

  const handleGenerate = useCallback(async () => {
    cancelRef.current = false
    dispatch({ type: 'START_GENERATE' })

    const result = await generate(
      { rows, cols, path, targetWalls, targetCheckpoints },
      (attempts, total) => {
        if (cancelRef.current) return
        dispatch({ type: 'GENERATE_PROGRESS', progress: Math.round((attempts / total) * 100) })
      },
    )

    if (cancelRef.current) return

    if (result.success && result.level) {
      dispatch({ type: 'GENERATE_DONE', level: result.level })
    } else {
      dispatch({ type: 'GENERATE_FAIL', error: result.error ?? 'Generation failed' })
    }
  }, [rows, cols, path, targetWalls, targetCheckpoints, dispatch])

  const handleCancel = useCallback(() => {
    cancelRef.current = true
    dispatch({ type: 'GENERATE_FAIL', error: 'Cancelled' })
  }, [dispatch])

  return (
    <div className="planner-panel">
      <span className="planner-panel__label">Configure Level</span>

      <div className="config-panel__slider-row">
        <span className="config-panel__slider-label">Walls</span>
        <input
          className="config-panel__slider"
          type="range"
          min={0}
          max={maxCandidateWalls}
          value={targetWalls}
          onChange={e => dispatch({
            type: 'SET_TARGETS',
            targetWalls: Number(e.target.value),
            targetCheckpoints,
          })}
          disabled={isGenerating}
        />
        <span className="config-panel__slider-value">{targetWalls}</span>
      </div>

      <div className="config-panel__slider-row">
        <span className="config-panel__slider-label">Checkpoints</span>
        <input
          className="config-panel__slider"
          type="range"
          min={2}
          max={maxCheckpoints}
          value={targetCheckpoints}
          onChange={e => dispatch({
            type: 'SET_TARGETS',
            targetWalls,
            targetCheckpoints: Number(e.target.value),
          })}
          disabled={isGenerating}
        />
        <span className="config-panel__slider-value">{targetCheckpoints}</span>
      </div>

      <span className="config-panel__info">
        {maxCandidateWalls} candidate walls available
      </span>

      {error && <span className="config-panel__error">{error}</span>}

      {isGenerating ? (
        <>
          <span className="config-panel__progress">Searching... {progress}%</span>
          <button className="planner-btn planner-btn--small" onClick={handleCancel}>
            Cancel
          </button>
        </>
      ) : (
        <div className="path-editor__actions">
          <button className="planner-btn planner-btn--small" onClick={() => dispatch({ type: 'RESET' })}>
            Start Over
          </button>
          <button className="planner-btn planner-btn--green" onClick={handleGenerate}>
            Generate
          </button>
        </div>
      )}
    </div>
  )
}

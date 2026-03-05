import { useCallback, useRef } from 'react'
import { getCandidateWallCount, generate } from './generator'
import type { Cell } from '../types'
import type { Action, EditMode } from './LevelPlanner'

interface ConfigSectionProps {
  rows: number
  cols: number
  path: Cell[]
  targetWalls: number
  targetCheckpoints: number
  isGenerating: boolean
  error: string | null
  disabled: boolean
  hasGenerated: boolean
  editMode: EditMode
  copied: boolean
  copiedLink: boolean
  hasManualData: boolean
  onCopy: () => void
  onCopyShareLink: () => void
  onPlayLevel: () => void
  dispatch: (action: Action) => void
}

export function ConfigSection({
  rows,
  cols,
  path,
  targetWalls: _targetWalls,
  targetCheckpoints: _targetCheckpoints,
  isGenerating,
  error,
  disabled,
  hasGenerated,
  editMode,
  copied,
  copiedLink,
  hasManualData,
  onCopy,
  onCopyShareLink,
  onPlayLevel,
  dispatch,
}: ConfigSectionProps) {
  const totalCells = rows * cols
  const maxCandidateWalls = disabled ? 0 : getCandidateWallCount(rows, cols, path)
  const maxCheckpoints = Math.max(2, Math.floor(totalCells / 3))
  const cancelRef = useRef(false)

  const handleRandomise = useCallback(async () => {
    cancelRef.current = false
    const w = Math.floor(Math.random() * (maxCandidateWalls + 1))
    const c = 2 + Math.floor(Math.random() * (maxCheckpoints - 1))
    dispatch({ type: 'SET_EDIT_MODE', mode: null })
    dispatch({ type: 'SET_TARGETS', targetWalls: w, targetCheckpoints: c })
    dispatch({ type: 'START_GENERATE' })

    const result = await generate(
      { rows, cols, path, targetWalls: w, targetCheckpoints: c },
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
  }, [rows, cols, path, maxCandidateWalls, maxCheckpoints, dispatch])

  const handleCancel = useCallback(() => {
    cancelRef.current = true
    dispatch({ type: 'GENERATE_FAIL', error: 'Cancelled' })
  }, [dispatch])

  const canCopy = !disabled && (hasGenerated || hasManualData)

  return (
    <div className="planner-panel">
      <div className="config-panel__toggle-row">
        <button
          className={`planner-btn planner-btn--small config-panel__toggle ${disabled ? 'planner-btn--dim' : ''} ${editMode === 'walls' ? 'config-panel__toggle--active' : ''}`}
          onClick={() => {
            if (disabled) { alert('Draw the path first'); return }
            dispatch({ type: 'SET_EDIT_MODE', mode: editMode === 'walls' ? null : 'walls' })
          }}
          disabled={isGenerating}
        >
          {editMode === 'walls' && <span className="config-panel__check">&#10003;</span>}
          Edit Walls
        </button>
        <button
          className={`planner-btn planner-btn--small config-panel__toggle ${disabled ? 'planner-btn--dim' : ''} ${editMode === 'numbers' ? 'config-panel__toggle--active' : ''}`}
          onClick={() => {
            if (disabled) { alert('Draw the path first'); return }
            dispatch({ type: 'SET_EDIT_MODE', mode: editMode === 'numbers' ? null : 'numbers' })
          }}
          disabled={isGenerating}
        >
          {editMode === 'numbers' && <span className="config-panel__check">&#10003;</span>}
          Edit Numbers
        </button>
        {isGenerating ? (
          <button className="planner-btn planner-btn--small" onClick={handleCancel}>
            Cancel
          </button>
        ) : (
          <button
            className={`planner-btn planner-btn--small ${disabled ? 'planner-btn--dim' : ''}`}
            onClick={() => {
              if (disabled) { alert('Draw the path first'); return }
              handleRandomise()
            }}
          >
            Random
          </button>
        )}
      </div>

      {error && <span className="config-panel__error">{error}</span>}

      {canCopy && (
        <div className="config-panel__toggle-row">
          {import.meta.env.DEV && (
            <button className="planner-btn planner-btn--small planner-btn--green" onClick={onCopy}>
              {copied ? 'Copied!' : 'Copy Data'}
            </button>
          )}
          <button className="planner-btn planner-btn--small planner-btn--green" onClick={onCopyShareLink}>
            {copiedLink ? 'Copied!' : 'Share Link'}
          </button>
          <button className="planner-btn planner-btn--small planner-btn--green" onClick={onPlayLevel}>
            Play Level
          </button>
        </div>
      )}
    </div>
  )
}

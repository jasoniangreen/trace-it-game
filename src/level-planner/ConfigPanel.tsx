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
  dispatch: (action: Action) => void
}

export function ConfigSection({
  rows,
  cols,
  path,
  targetWalls,
  targetCheckpoints,
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
    <div className={`planner-panel ${disabled ? 'planner-section--disabled' : ''}`}>
      <span className="planner-panel__label">Configure Level</span>

      {disabled && (
        <span className="planner-section__hint">Complete the path to configure</span>
      )}

      <div className="config-panel__toggle-row">
        <button
          className={`planner-btn planner-btn--small config-panel__toggle ${editMode === 'walls' ? 'config-panel__toggle--active' : ''}`}
          onClick={() => dispatch({ type: 'SET_EDIT_MODE', mode: editMode === 'walls' ? null : 'walls' })}
          disabled={disabled || isGenerating}
        >
          {editMode === 'walls' && <span className="config-panel__check">&#10003;</span>}
          Edit Walls
        </button>
        <button
          className={`planner-btn planner-btn--small config-panel__toggle ${editMode === 'numbers' ? 'config-panel__toggle--active' : ''}`}
          onClick={() => dispatch({ type: 'SET_EDIT_MODE', mode: editMode === 'numbers' ? null : 'numbers' })}
          disabled={disabled || isGenerating}
        >
          {editMode === 'numbers' && <span className="config-panel__check">&#10003;</span>}
          Edit Numbers
        </button>
      </div>

      {error && <span className="config-panel__error">{error}</span>}

      {isGenerating ? (
        <button className="planner-btn planner-btn--small" onClick={handleCancel}>
          Cancel
        </button>
      ) : (
        <button
          className="planner-btn"
          onClick={handleRandomise}
          disabled={disabled}
        >
          Randomise
        </button>
      )}

      {canCopy && (
        <>
          {import.meta.env.DEV && (
            <button className="planner-btn planner-btn--green" onClick={onCopy}>
              {copied ? 'Copied!' : 'Copy Level Data'}
            </button>
          )}
          <button className="planner-btn planner-btn--green" onClick={onCopyShareLink}>
            {copiedLink ? 'Copied!' : 'Copy Share Link'}
          </button>
        </>
      )}
    </div>
  )
}

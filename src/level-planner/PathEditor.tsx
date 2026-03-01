import { useCallback, useMemo } from 'react'
import { Grid } from '../components/Grid/Grid'
import { useDragInput } from '../hooks/useDragInput'
import { useEditorPath } from './useEditorPath'
import type { Cell, Level } from '../types'

interface PathEditorProps {
  rows: number
  cols: number
  path: Cell[]
  onPathChange: (path: Cell[]) => void
  onDone: () => void
  onBack: () => void
}

export function PathEditor({ rows, cols, path, onPathChange, onDone, onBack }: PathEditorProps) {
  const totalCells = rows * cols
  const isComplete = path.length === totalCells

  const { tryMove, undo, reset, visited, head } = useEditorPath({
    rows,
    cols,
    path,
    onPathChange,
  })

  const onCellEnter = useCallback(
    (row: number, col: number) => tryMove(row, col),
    [tryMove],
  )

  const { gridProps } = useDragInput({ onCellEnter })

  // Synthetic empty level for the Grid component
  const emptyLevel: Level = useMemo(() => ({
    id: 'editor',
    name: 'Editor',
    cols,
    rows,
    numbers: {},
    walls: [],
    solution: [],
  }), [rows, cols])

  const statusClass = `path-editor__status ${isComplete ? 'path-editor__status--complete' : ''}`

  return (
    <div className="planner-panel">
      <span className="planner-panel__label">Draw your path</span>

      <div className={statusClass}>
        <span className="path-editor__status-count">{path.length}</span> / {totalCells} cells
      </div>

      <div {...gridProps}>
        <Grid
          level={emptyLevel}
          path={path}
          visited={visited}
          head={head}
          isComplete={false}
        />
      </div>

      <div className="path-editor__actions">
        <button className="planner-btn planner-btn--small" onClick={onBack}>
          Back
        </button>
        <button className="planner-btn planner-btn--small" onClick={undo} disabled={path.length === 0}>
          Undo
        </button>
        <button className="planner-btn planner-btn--small" onClick={reset} disabled={path.length === 0}>
          Reset
        </button>
        <button
          className="planner-btn planner-btn--green"
          onClick={onDone}
          disabled={!isComplete}
        >
          Done
        </button>
      </div>
    </div>
  )
}

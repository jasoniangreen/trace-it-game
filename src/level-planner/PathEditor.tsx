import { useCallback, useMemo } from 'react'
import { Grid } from '../components/Grid/Grid'
import { useDragInput } from '../hooks/useDragInput'
import { useDynamicCellSize } from '../hooks/useDynamicCellSize'
import { useEditorPath } from './useEditorPath'
import { buildVisitedSet, cellKey } from '../logic/pathUtils'
import { enumerateCandidateWalls } from './generator'
import type { Cell, Level, Wall } from '../types'
import type { EditMode, Action } from './LevelPlanner'

interface GridSectionProps {
  rows: number
  cols: number
  path: Cell[]
  generatedLevel: Level | null
  isGenerating: boolean
  generateProgress: number
  editMode: EditMode
  manualWalls: Wall[]
  manualNumbers: Record<string, number>
  checkpointCells: Set<string>
  onPathChange: (path: Cell[]) => void
  onEditPath: () => void
  dispatch: (action: Action) => void
}

function EditorOverlay({
  rows,
  cols,
  path,
  editMode,
  manualWalls,
  checkpointCells,
  dispatch,
}: {
  rows: number
  cols: number
  path: Cell[]
  editMode: EditMode
  manualWalls: Wall[]
  checkpointCells: Set<string>
  dispatch: (action: Action) => void
}) {
  const candidateWalls = useMemo(
    () => enumerateCandidateWalls(rows, cols, path),
    [rows, cols, path],
  )

  const activeWallKeys = useMemo(() => {
    const set = new Set<string>()
    for (const w of manualWalls) {
      set.add(`${w[0][0]},${w[0][1]}|${w[1][0]},${w[1][1]}`)
    }
    return set
  }, [manualWalls])

  const pathSet = useMemo(() => buildVisitedSet(path), [path])

  const startKey = path.length > 0 ? cellKey(path[0]) : ''
  const endKey = path.length > 0 ? cellKey(path[path.length - 1]) : ''

  if (editMode === 'walls') {
    return (
      <div className="editor-overlay">
        {candidateWalls.map(wall => {
          const [a, b] = wall
          const [r1, c1] = a
          const [r2, c2] = b
          const isHorizontal = r1 !== r2
          const minR = Math.min(r1, r2)
          const minC = Math.min(c1, c2)
          const wKey = `${r1},${c1}|${r2},${c2}`
          const active = activeWallKeys.has(wKey)

          const style: React.CSSProperties = isHorizontal
            ? {
                top: `calc(16px + ${minR + 1} * (var(--cell-size) + var(--cell-gap)) - var(--cell-gap) / 2)`,
                left: `calc(16px + ${minC} * (var(--cell-size) + var(--cell-gap)) + var(--cell-size) / 2)`,
              }
            : {
                top: `calc(16px + ${minR} * (var(--cell-size) + var(--cell-gap)) + var(--cell-size) / 2)`,
                left: `calc(16px + ${minC + 1} * (var(--cell-size) + var(--cell-gap)) - var(--cell-gap) / 2)`,
              }

          return (
            <button
              key={wKey}
              className={`editor-overlay__wall-dot ${active ? 'editor-overlay__wall-dot--active' : ''}`}
              style={style}
              onClick={() => dispatch({ type: 'TOGGLE_WALL', wall })}
            />
          )
        })}
      </div>
    )
  }

  if (editMode === 'numbers') {
    return (
      <div className="editor-overlay">
        {path.map(cell => {
          const key = cellKey(cell)
          if (!pathSet.has(key)) return null
          const [r, c] = cell
          const isFixed = key === startKey || key === endKey
          const isSelected = checkpointCells.has(key)

          return (
            <button
              key={`num-${key}`}
              className={`editor-overlay__number-zone ${isFixed ? 'editor-overlay__number-zone--fixed' : ''} ${isSelected && !isFixed ? 'editor-overlay__number-zone--selected' : ''}`}
              style={{
                top: `calc(16px + ${r} * (var(--cell-size) + var(--cell-gap)))`,
                left: `calc(16px + ${c} * (var(--cell-size) + var(--cell-gap)))`,
                width: 'var(--cell-size)',
                height: 'var(--cell-size)',
              }}
              onClick={() => {
                if (!isFixed) dispatch({ type: 'TOGGLE_CHECKPOINT', key })
              }}
              disabled={isFixed}
            />
          )
        })}
      </div>
    )
  }

  return null
}

export function GridSection({
  rows,
  cols,
  path,
  generatedLevel,
  isGenerating,
  generateProgress,
  editMode,
  manualWalls,
  manualNumbers,
  checkpointCells,
  onPathChange,
  onEditPath,
  dispatch,
}: GridSectionProps) {
  const totalCells = rows * cols
  const hasGenerated = generatedLevel !== null

  const { tryMove, visited: editorVisited, head: editorHead } = useEditorPath({
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
  const cellSize = useDynamicCellSize(cols, rows)

  const emptyLevel: Level = useMemo(() => ({
    id: 'editor',
    name: 'Editor',
    cols,
    rows,
    numbers: manualNumbers,
    walls: manualWalls,
    solution: [],
  }), [rows, cols, manualNumbers, manualWalls])

  const displayLevel = hasGenerated ? generatedLevel : emptyLevel
  const displayPath = hasGenerated ? generatedLevel.solution : path
  const displayVisited = useMemo(
    () => hasGenerated ? buildVisitedSet(generatedLevel.solution) : editorVisited,
    [hasGenerated, generatedLevel, editorVisited],
  )
  const displayHead = hasGenerated
    ? generatedLevel.solution[generatedLevel.solution.length - 1] ?? null
    : editorHead

  const isComplete = path.length === totalCells
  const dragDisabled = hasGenerated || editMode !== null
  const statusClass = `path-editor__status ${isComplete ? 'path-editor__status--complete' : ''}`

  return (
    <div className="planner-panel">
      <span className="planner-panel__label">
        {hasGenerated ? 'Generated Level' : editMode === 'walls' ? 'Tap gaps to toggle walls' : editMode === 'numbers' ? 'Tap cells to add checkpoints' : 'Draw your path'}
      </span>

      {!hasGenerated && !editMode && (
        <div className={statusClass}>
          <span className="path-editor__status-count">{path.length}</span> / {totalCells} cells
        </div>
      )}

      <div className="grid-section__grid-wrapper" style={{ '--cell-size': `${cellSize}px` } as React.CSSProperties}>
        <div {...(dragDisabled ? {} : gridProps)}>
          <Grid
            level={displayLevel}
            path={displayPath}
            visited={displayVisited}
            head={displayHead}
            isComplete={hasGenerated}
          />
        </div>
        {editMode && isComplete && !hasGenerated && (
          <EditorOverlay
            rows={rows}
            cols={cols}
            path={path}
            editMode={editMode}
            manualWalls={manualWalls}
            checkpointCells={checkpointCells}
            dispatch={dispatch}
          />
        )}
        {isGenerating && (
          <div className="grid-section__overlay">
            <span className="grid-section__overlay-text">Generating... {generateProgress}%</span>
          </div>
        )}
      </div>

      {hasGenerated && (
        <div className="path-editor__actions">
          <button className="planner-btn planner-btn--small" onClick={onEditPath}>
            Edit Path
          </button>
        </div>
      )}
    </div>
  )
}

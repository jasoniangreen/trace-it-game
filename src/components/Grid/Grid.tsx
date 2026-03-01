import { useMemo } from 'react'
import { Cell } from '../Cell/Cell'
import { buildWallSet } from '../../logic/validation'
import { cellKey } from '../../logic/pathUtils'
import type { Cell as CellType, Level } from '../../types'
import './Grid.css'

interface GridProps {
  level: Level
  path: CellType[]
  visited: Set<string>
  head: CellType | null
  isComplete: boolean
}

type WallEdge = 'top' | 'bottom' | 'left' | 'right'

function getWallEdges(
  wallSet: Set<string>,
  row: number,
  col: number,
  rows: number,
  cols: number,
): WallEdge[] {
  const edges: WallEdge[] = []
  if (row > 0 && wallSet.has(`${row},${col}|${row - 1},${col}`)) edges.push('top')
  if (row < rows - 1 && wallSet.has(`${row},${col}|${row + 1},${col}`)) edges.push('bottom')
  if (col > 0 && wallSet.has(`${row},${col}|${row},${col - 1}`)) edges.push('left')
  if (col < cols - 1 && wallSet.has(`${row},${col}|${row},${col + 1}`)) edges.push('right')
  return edges
}

export function Grid({ level, path, visited, head, isComplete }: GridProps) {
  const wallSet = useMemo(() => buildWallSet(level.walls), [level.walls])
  const headKey = head ? cellKey(head) : null

  const cells = []
  for (let r = 0; r < level.rows; r++) {
    for (let c = 0; c < level.cols; c++) {
      const key = cellKey([r, c])
      const wallEdges = getWallEdges(wallSet, r, c, level.rows, level.cols)
      const wallClasses = wallEdges.map((e) => `grid__cell--wall-${e}`).join(' ')

      cells.push(
        <div
          key={key}
          className={`grid__cell ${wallClasses}`}
          data-row={r}
          data-col={c}
        >
          <Cell
            row={r}
            col={c}
            number={level.numbers[key]}
            isPath={visited.has(key)}
            isHead={key === headKey}
            isStart={level.numbers[key] === 1}
            isComplete={isComplete && visited.has(key)}
          />
        </div>,
      )
    }
  }

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${level.cols}, var(--cell-size))`,
        gridTemplateRows: `repeat(${level.rows}, var(--cell-size))`,
      }}
    >
      {cells}
    </div>
  )
}

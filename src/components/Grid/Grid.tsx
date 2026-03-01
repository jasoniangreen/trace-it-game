import { useMemo, useRef } from 'react'
import { Cell } from '../Cell/Cell'
import { PathLine } from '../PathLine/PathLine'
import { cellKey } from '../../logic/pathUtils'
import { useGridMetrics } from '../../hooks/useGridMetrics'
import type { Cell as CellType, Level } from '../../types'
import './Grid.css'

interface GridProps {
  level: Level
  path: CellType[]
  visited: Set<string>
  head: CellType | null
  isComplete: boolean
}

export function Grid({ level, path, visited, head, isComplete }: GridProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  const { cellSize, cellGap } = useGridMetrics(gridRef)
  const headKey = head ? cellKey(head) : null

  // Wall overlays absolutely positioned via CSS custom properties
  const wallOverlays = useMemo(() => {
    return level.walls.map(([a, b]) => {
      const [r1, c1] = a
      const [r2, c2] = b
      const isHorizontal = r1 !== r2
      const minR = Math.min(r1, r2)
      const minC = Math.min(c1, c2)
      const key = `wall-${r1},${c1}-${r2},${c2}`

      // Position walls at the edge between the two cells
      // Using CSS calc with var(--cell-size) and var(--cell-gap)
      if (isHorizontal) {
        // Horizontal line between row minR and minR+1, at column minC
        return (
          <div
            key={key}
            className="grid__wall grid__wall--horizontal"
            style={{
              '--wall-top': `calc(${minR + 1} * (var(--cell-size) + var(--cell-gap)) - var(--cell-gap) / 2)`,
              '--wall-left': `calc(${minC} * (var(--cell-size) + var(--cell-gap)))`,
            } as React.CSSProperties}
          />
        )
      } else {
        // Vertical line between col minC and minC+1, at row minR
        return (
          <div
            key={key}
            className="grid__wall grid__wall--vertical"
            style={{
              '--wall-top': `calc(${minR} * (var(--cell-size) + var(--cell-gap)))`,
              '--wall-left': `calc(${minC + 1} * (var(--cell-size) + var(--cell-gap)) - var(--cell-gap) / 2)`,
            } as React.CSSProperties}
          />
        )
      }
    })
  }, [level.walls])

  const cells = []
  for (let r = 0; r < level.rows; r++) {
    for (let c = 0; c < level.cols; c++) {
      const key = cellKey([r, c])
      cells.push(
        <div
          key={key}
          className="grid__cell"
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
      ref={gridRef}
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${level.cols}, var(--cell-size))`,
        gridTemplateRows: `repeat(${level.rows}, var(--cell-size))`,
      }}
    >
      {cells}
      <PathLine
        path={path}
        rows={level.rows}
        cols={level.cols}
        cellSize={cellSize}
        cellGap={cellGap}
        isComplete={isComplete}
      />
      {wallOverlays}
    </div>
  )
}

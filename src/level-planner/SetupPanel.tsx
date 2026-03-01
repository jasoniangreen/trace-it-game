import { useState } from 'react'

interface SetupPanelProps {
  rows: number
  cols: number
  onStart: (rows: number, cols: number) => void
}

const SIZES = [3, 4, 5, 6, 7]

export function SetupPanel({ rows: initRows, cols: initCols, onStart }: SetupPanelProps) {
  const [rows, setRows] = useState(initRows)
  const [cols, setCols] = useState(initCols)

  return (
    <div className="planner-panel">
      <span className="planner-panel__label">Grid Size</span>

      <div className="planner-panel__row">
        <span className="planner-panel__row-label">Rows</span>
        <div className="toggle-group">
          {SIZES.map(n => (
            <button
              key={n}
              className={`toggle-btn ${n === rows ? 'toggle-btn--active' : ''}`}
              onClick={() => setRows(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="planner-panel__row">
        <span className="planner-panel__row-label">Columns</span>
        <div className="toggle-group">
          {SIZES.map(n => (
            <button
              key={n}
              className={`toggle-btn ${n === cols ? 'toggle-btn--active' : ''}`}
              onClick={() => setCols(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <button className="planner-btn" onClick={() => onStart(rows, cols)}>
        Start Drawing
      </button>
    </div>
  )
}

import './Cell.css'

interface CellProps {
  row: number
  col: number
  number?: number
  isPath: boolean
  isHead: boolean
  isStart: boolean
  isComplete: boolean
}

export function Cell({ number, isPath, isHead, isStart, isComplete }: CellProps) {
  const classes = [
    'cell',
    isPath && 'cell--path',
    isHead && 'cell--head',
    isStart && 'cell--start',
    isComplete && 'cell--complete',
    number !== undefined && 'cell--numbered',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes}>
      {number !== undefined && <span className="cell__number">{number}</span>}
      {isPath && <div className="cell__glow" />}
    </div>
  )
}

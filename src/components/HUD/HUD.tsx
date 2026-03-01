import './HUD.css'

interface HUDProps {
  levelName: string
  pathLength: number
  totalCells: number
  onBack: () => void
  onReset: () => void
  onUndo: () => void
}

export function HUD({ levelName, pathLength, totalCells, onBack, onReset, onUndo }: HUDProps) {
  return (
    <div className="hud">
      <button className="hud__btn" onClick={onBack} aria-label="Back to levels">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <div className="hud__info">
        <span className="hud__level-name">{levelName}</span>
        <span className="hud__progress">{pathLength} / {totalCells}</span>
      </div>
      <div className="hud__actions">
        <button className="hud__btn" onClick={onUndo} aria-label="Undo">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 8H13C15.2091 8 17 9.79086 17 12C17 14.2091 15.2091 16 13 16H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 5L4 8L7 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button className="hud__btn" onClick={onReset} aria-label="Reset">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10C17 13.866 13.866 17 10 17C7.87827 17 5.97914 16.0518 4.69649 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M3 6V10H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

import { formatTime } from '../../utils/formatTime'
import './WinModal.css'

interface WinModalProps {
  levelName: string
  elapsed: number
  hasNextLevel: boolean
  onNextLevel: () => void
  onBack: () => void
}

export function WinModal({ levelName, elapsed, hasNextLevel, onNextLevel, onBack }: WinModalProps) {
  return (
    <div className="win-overlay">
      <div className="win-modal">
        <div className="win-modal__glow" />
        <h2 className="win-modal__title">Complete</h2>
        <p className="win-modal__subtitle">{levelName}</p>
        <p className="win-modal__time">{formatTime(elapsed)}</p>
        <div className="win-modal__actions">
          {hasNextLevel && (
            <button className="win-modal__btn win-modal__btn--primary" onClick={onNextLevel}>
              Next Level
            </button>
          )}
          <button className="win-modal__btn win-modal__btn--secondary" onClick={hasNextLevel ? onBack : onNextLevel}>
            Level Select
          </button>
        </div>
      </div>
    </div>
  )
}

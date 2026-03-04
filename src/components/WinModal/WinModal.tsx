import { useState, useCallback } from 'react'
import { formatTime } from '../../utils/formatTime'
import { buildShareText } from '../../utils/shareText'
import './WinModal.css'

interface WinModalProps {
  levelName: string
  elapsed: number
  hasNextLevel: boolean
  onNextLevel: () => void
  onBack: () => void
  shareUrl?: string
}

export function WinModal({ levelName, elapsed, hasNextLevel, onNextLevel, onBack, shareUrl }: WinModalProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = useCallback(async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(buildShareText(elapsed, shareUrl))
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard unavailable — silent failure
    }
  }, [elapsed, shareUrl])

  return (
    <div className="win-overlay">
      <div className="win-modal">
        <div className="win-modal__glow" />
        <h2 className="win-modal__title">Complete</h2>
        <p className="win-modal__subtitle">{levelName}</p>
        <p className="win-modal__time">{formatTime(elapsed)}</p>
        <div className="win-modal__actions">
          {shareUrl && (
            <button className="win-modal__btn win-modal__btn--share" onClick={handleShare}>
              {copied ? 'Copied!' : 'Share'}
            </button>
          )}
          {shareUrl ? (
            <button className="win-modal__btn win-modal__btn--primary" onClick={onNextLevel}>
              Build a level
            </button>
          ) : (
            hasNextLevel && (
              <button className="win-modal__btn win-modal__btn--primary" onClick={onNextLevel}>
                Next Level
              </button>
            )
          )}
          {!shareUrl && (
            <button className="win-modal__btn win-modal__btn--secondary" onClick={onBack}>
              Level Select
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

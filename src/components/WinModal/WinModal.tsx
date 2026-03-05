import { useState, useCallback, useEffect, useRef } from 'react'
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
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
  }, [])

  const handleShare = useCallback(async () => {
    if (!shareUrl) return
    const text = buildShareText(elapsed, shareUrl)
    try {
      if (navigator.share && 'ontouchstart' in window) {
        await navigator.share({ text })
      } else {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
        copyTimeoutRef.current = setTimeout(() => setCopied(false), 1500)
      }
    } catch {
      // user cancelled share sheet or clipboard unavailable
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
              {copied ? 'Copied!' : 'Share Result'}
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
          <button className="win-modal__btn win-modal__btn--secondary" onClick={() => { window.location.hash = '' }}>
            Home
          </button>
        </div>
      </div>
    </div>
  )
}

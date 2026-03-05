import './LoadingScreen.css'

interface LoadingScreenProps {
  onReady: () => void
}

export function LoadingScreen({ onReady }: LoadingScreenProps) {
  return (
    <div className="loading-overlay" role="dialog" aria-label="Get ready">
      <div className="loading-content">
        <h2 className="loading-title">GET READY</h2>

        <ul className="loading-rules">
          <li>Trace a path that visits <strong>every cell</strong></li>
          <li>Follow the <strong>numbered</strong> cells in order</li>
          <li>Walls block your path</li>
        </ul>

        <button className="loading-ready-btn" onClick={onReady}>
          I'm Ready
        </button>
      </div>
    </div>
  )
}

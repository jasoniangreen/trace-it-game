import './LoadingScreen.css'

export function LoadingScreen() {
  return (
    <div className="loading-overlay" role="status" aria-label="Loading level">
      <div className="loading-content">
        <div className="loading-ring" />
        <h2 className="loading-title">GET READY</h2>
        <p className="loading-subtitle">preparing your trace</p>
      </div>
    </div>
  )
}

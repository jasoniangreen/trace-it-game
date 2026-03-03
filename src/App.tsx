import { useState, useCallback, useEffect, useMemo, lazy, Suspense } from 'react'
import { HomeScreen } from './components/LevelSelect/LevelSelect'
import { LevelGrid } from './components/LevelSelect/LevelSelect'
import { GameBoard } from './components/GameBoard/GameBoard'
import { useProgress } from './hooks/useProgress'
import { levels } from './data/levels'
import { decodeLevel } from './level-planner/levelCodec'
import type { Level } from './types'

const LevelPlanner = lazy(() => import('./level-planner/LevelPlanner'))

function getRoute(): string {
  return window.location.hash || ''
}

export default function App() {
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null)
  const [route, setRoute] = useState(getRoute)
  const { markComplete, isComplete } = useProgress()

  const sharedLevel = useMemo(() => {
    if (!route.startsWith('#play/')) return null
    try { return decodeLevel(route.slice(6)) }
    catch { return null }
  }, [route])

  useEffect(() => {
    const onHash = () => {
      setRoute(getRoute())
      setCurrentLevel(null)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const handleSelect = useCallback((level: Level) => {
    setCurrentLevel(level)
  }, [])

  const handleBack = useCallback(() => {
    setCurrentLevel(null)
  }, [])

  const goHome = useCallback(() => {
    window.location.hash = ''
  }, [])

  const handleComplete = useCallback(
    (levelId: string) => {
      markComplete(levelId)
      const idx = levels.findIndex((l) => l.id === levelId)
      if (idx < levels.length - 1) {
        setCurrentLevel(levels[idx + 1])
      } else {
        setCurrentLevel(null)
      }
    },
    [markComplete],
  )

  if (route.startsWith('#play/')) {
    if (!sharedLevel) {
      return (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <h1>Invalid Level</h1>
          <p style={{ margin: '1rem 0', color: '#888' }}>This share link is broken or expired.</p>
          <a href="#" style={{ color: '#4caf50' }}>Back to Home</a>
        </div>
      )
    }
    return <GameBoard key={sharedLevel.id} level={sharedLevel} onBack={goHome} onComplete={goHome} />
  }

  if (route === '#level-planner') {
    return (
      <Suspense fallback={<div className="planner-loading">Loading Level Planner...</div>}>
        <LevelPlanner />
      </Suspense>
    )
  }

  if (route === '#levels') {
    if (currentLevel) {
      return (
        <GameBoard
          key={currentLevel.id}
          level={currentLevel}
          onBack={handleBack}
          onComplete={handleComplete}
        />
      )
    }
    return <LevelGrid onSelect={handleSelect} isComplete={isComplete} />
  }

  return <HomeScreen />
}

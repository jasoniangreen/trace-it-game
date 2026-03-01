import { useState, useCallback, useEffect, lazy, Suspense } from 'react'
import { LevelSelect } from './components/LevelSelect/LevelSelect'
import { GameBoard } from './components/GameBoard/GameBoard'
import { useProgress } from './hooks/useProgress'
import { levels } from './data/levels'
import type { Level } from './types'

const LevelPlanner = import.meta.env.DEV
  ? lazy(() => import('./level-planner/LevelPlanner'))
  : null

export default function App() {
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null)
  const [showPlanner, setShowPlanner] = useState(
    () => import.meta.env.DEV && window.location.hash === '#level-planner',
  )
  const { markComplete, isComplete } = useProgress()

  useEffect(() => {
    if (!import.meta.env.DEV) return
    const onHash = () => setShowPlanner(window.location.hash === '#level-planner')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const handleSelect = useCallback((level: Level) => {
    setCurrentLevel(level)
  }, [])

  const handleBack = useCallback(() => {
    setCurrentLevel(null)
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

  if (showPlanner && LevelPlanner) {
    return (
      <Suspense fallback={<div className="planner-loading">Loading Level Planner...</div>}>
        <LevelPlanner />
      </Suspense>
    )
  }

  if (currentLevel) {
    return (
      <GameBoard
        level={currentLevel}
        onBack={handleBack}
        onComplete={handleComplete}
      />
    )
  }

  return <LevelSelect onSelect={handleSelect} isComplete={isComplete} />
}

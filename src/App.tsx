import { useState, useCallback } from 'react'
import { LevelSelect } from './components/LevelSelect/LevelSelect'
import { GameBoard } from './components/GameBoard/GameBoard'
import { useProgress } from './hooks/useProgress'
import { levels } from './data/levels'
import type { Level } from './types'

export default function App() {
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null)
  const { markComplete, isComplete } = useProgress()

  const handleSelect = useCallback((level: Level) => {
    setCurrentLevel(level)
  }, [])

  const handleBack = useCallback(() => {
    setCurrentLevel(null)
  }, [])

  const handleComplete = useCallback(
    (levelId: string) => {
      markComplete(levelId)
      // Move to next level
      const idx = levels.findIndex((l) => l.id === levelId)
      if (idx < levels.length - 1) {
        setCurrentLevel(levels[idx + 1])
      } else {
        setCurrentLevel(null)
      }
    },
    [markComplete],
  )

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

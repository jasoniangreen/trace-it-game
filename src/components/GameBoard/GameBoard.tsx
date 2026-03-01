import { useCallback } from 'react'
import { Grid } from '../Grid/Grid'
import { HUD } from '../HUD/HUD'
import { WinModal } from '../WinModal/WinModal'
import { useGameState } from '../../hooks/useGameState'
import { useDragInput } from '../../hooks/useDragInput'
import { levels } from '../../data/levels'
import type { Level } from '../../types'
import './GameBoard.css'

interface GameBoardProps {
  level: Level
  onBack: () => void
  onComplete: (levelId: string) => void
}

export function GameBoard({ level, onBack, onComplete }: GameBoardProps) {
  const { path, visited, head, isComplete, tryMove, undo, reset } = useGameState(level)

  const onCellEnter = useCallback(
    (row: number, col: number) => tryMove(row, col),
    [tryMove],
  )

  const { gridProps } = useDragInput({ onCellEnter })

  const levelIdx = levels.findIndex((l) => l.id === level.id)
  const hasNextLevel = levelIdx < levels.length - 1

  const handleNextLevel = useCallback(() => {
    onComplete(level.id)
  }, [level.id, onComplete])

  const handleBack = useCallback(() => {
    onBack()
  }, [onBack])

  return (
    <div className="game-board">
      <HUD
        levelName={level.name}
        pathLength={path.length}
        totalCells={level.rows * level.cols}
        onBack={handleBack}
        onReset={reset}
        onUndo={undo}
      />
      <div className="game-board__grid" {...gridProps}>
        <Grid
          level={level}
          path={path}
          visited={visited}
          head={head}
          isComplete={isComplete}
        />
      </div>
      {isComplete && (
        <WinModal
          levelName={level.name}
          hasNextLevel={hasNextLevel}
          onNextLevel={handleNextLevel}
          onBack={handleBack}
        />
      )}
    </div>
  )
}

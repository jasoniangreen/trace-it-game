import { useCallback, useEffect, useRef, useState } from 'react'
import { Grid } from '../Grid/Grid'
import { HUD } from '../HUD/HUD'
import { WinModal } from '../WinModal/WinModal'
import { LoadingScreen } from '../LoadingScreen/LoadingScreen'
import { useGameState } from '../../hooks/useGameState'
import { useDragInput } from '../../hooks/useDragInput'
import { useDynamicCellSize } from '../../hooks/useDynamicCellSize'
import { levels } from '../../data/levels'
import type { Level } from '../../types'
import './GameBoard.css'

interface GameBoardProps {
  level: Level
  onBack: () => void
  onComplete: (levelId: string) => void
  shareUrl?: string
  initialElapsedMs?: number
  onSolve?: (elapsedMs: number) => void
}

export function GameBoard({ level, onBack, onComplete, shareUrl, initialElapsedMs, onSolve }: GameBoardProps) {
  const { path, visited, head, isComplete, tryMove, undo, reset } = useGameState(level)

  const [phase, setPhase] = useState<'loading' | 'playing' | 'complete'>(
    initialElapsedMs !== undefined ? 'complete' : 'loading',
  )
  const [elapsedMs, setElapsedMs] = useState(initialElapsedMs ?? 0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(0)

  useEffect(() => {
    if (initialElapsedMs !== undefined) return
    const timeout = setTimeout(() => {
      setPhase('playing')
      startTimeRef.current = Date.now()
      intervalRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startTimeRef.current)
      }, 100)
    }, 2000)
    return () => {
      clearTimeout(timeout)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [initialElapsedMs])

  useEffect(() => {
    if (isComplete && phase === 'playing') {
      if (intervalRef.current) clearInterval(intervalRef.current)
      onSolve?.(elapsedMs)
      setPhase('complete')
    }
  }, [isComplete, phase, elapsedMs, onSolve])

  const onCellEnter = useCallback(
    (row: number, col: number) => tryMove(row, col),
    [tryMove],
  )

  const { gridProps } = useDragInput({ onCellEnter })
  const cellSize = useDynamicCellSize(level.cols, level.rows)

  const levelIdx = levels.findIndex((l) => l.id === level.id)
  const hasNextLevel = levelIdx < levels.length - 1

  const handleNextLevel = useCallback(() => {
    onComplete(level.id)
  }, [level.id, onComplete])

  const handleBack = useCallback(() => {
    onBack()
  }, [onBack])

  if (phase === 'loading') {
    return <LoadingScreen />
  }

  return (
    <div className="game-board">
      <HUD
        levelName={level.name}
        pathLength={path.length}
        totalCells={level.rows * level.cols}
        elapsed={elapsedMs}
        onBack={handleBack}
        onReset={reset}
        onUndo={undo}
      />
      <div className="game-board__grid" style={{ '--cell-size': `${cellSize}px` } as React.CSSProperties} {...gridProps}>
        <Grid
          level={level}
          path={path}
          visited={visited}
          head={head}
          isComplete={isComplete}
        />
      </div>
      {phase === 'complete' && (
        <WinModal
          levelName={level.name}
          elapsed={elapsedMs}
          hasNextLevel={hasNextLevel}
          onNextLevel={handleNextLevel}
          onBack={handleBack}
          shareUrl={shareUrl}
        />
      )}
    </div>
  )
}

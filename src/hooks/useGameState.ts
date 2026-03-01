import { useState, useMemo, useCallback, useEffect } from 'react'
import type { Cell, Level } from '../types'
import { isAdjacent, buildWallSet, hasWall, isNumberOrderValid, checkWin } from '../logic/validation'
import { addToPath, truncatePath, undoPath, cellKey, buildVisitedSet } from '../logic/pathUtils'

export function useGameState(level: Level) {
  const [path, setPath] = useState<Cell[]>([])
  const [isComplete, setIsComplete] = useState(false)

  const wallSet = useMemo(() => buildWallSet(level.walls), [level])
  const visited = useMemo(() => buildVisitedSet(path), [path])
  const head = path.length > 0 ? path[path.length - 1] : null

  // Reset when level changes
  useEffect(() => {
    setPath([])
    setIsComplete(false)
  }, [level])

  const tryMove = useCallback(
    (row: number, col: number) => {
      if (isComplete) return

      const cell: Cell = [row, col]
      const key = cellKey(cell)

      // Empty path: must start on cell numbered 1
      if (path.length === 0) {
        if (level.numbers[key] === 1) {
          setPath([cell])
        }
        return
      }

      // Clicked a visited cell: truncate path back to it
      if (visited.has(key)) {
        setPath(truncatePath(path, cell))
        return
      }

      // New cell: validate adjacency, wall, number order
      if (!isAdjacent(head!, cell)) return
      if (hasWall(wallSet, head![0], head![1], row, col)) return
      if (!isNumberOrderValid(level.numbers, path, cell)) return

      const newPath = addToPath(path, cell)
      setPath(newPath)

      if (checkWin(level, newPath)) {
        setIsComplete(true)
      }
    },
    [path, visited, head, wallSet, level, isComplete],
  )

  const undo = useCallback(() => {
    setPath(undoPath(path))
    setIsComplete(false)
  }, [path])

  const reset = useCallback(() => {
    setPath([])
    setIsComplete(false)
  }, [])

  return { path, visited, head, isComplete, tryMove, undo, reset }
}

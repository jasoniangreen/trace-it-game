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

      setPath((currentPath) => {
        const cell: Cell = [row, col]
        const key = cellKey(cell)
        const currentHead = currentPath.length > 0 ? currentPath[currentPath.length - 1] : null

        // Empty path: must start on cell numbered 1
        if (currentPath.length === 0) {
          return level.numbers[key] === 1 ? [cell] : currentPath
        }

        // Clicked a visited cell: truncate path back to it
        if (buildVisitedSet(currentPath).has(key)) {
          return truncatePath(currentPath, cell)
        }

        // New cell: validate adjacency, wall, number order
        if (!isAdjacent(currentHead!, cell)) return currentPath
        if (hasWall(wallSet, currentHead![0], currentHead![1], row, col)) return currentPath
        if (!isNumberOrderValid(level.numbers, currentPath, cell)) return currentPath

        return addToPath(currentPath, cell)
      })
    },
    [wallSet, level, isComplete],
  )

  // Detect win from path changes instead of inside tryMove
  useEffect(() => {
    if (!isComplete && path.length > 0 && checkWin(level, path)) {
      setIsComplete(true)
    }
  }, [path, level, isComplete])

  const undo = useCallback(() => {
    setPath((p) => undoPath(p))
    setIsComplete(false)
  }, [])

  const reset = useCallback(() => {
    setPath([])
    setIsComplete(false)
  }, [])

  return { path, visited, head, isComplete, tryMove, undo, reset }
}

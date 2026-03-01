import { useCallback } from 'react'
import { isAdjacent } from '../logic/validation'
import { cellKey, addToPath, truncatePath, undoPath } from '../logic/pathUtils'
import type { Cell } from '../types'

interface UseEditorPathOptions {
  rows: number
  cols: number
  path: Cell[]
  onPathChange: (path: Cell[]) => void
}

export function useEditorPath({ rows, cols, path, onPathChange }: UseEditorPathOptions) {
  const visited = new Set(path.map(cellKey))
  const head = path.length > 0 ? path[path.length - 1] : null

  const tryMove = useCallback((row: number, col: number) => {
    if (row < 0 || row >= rows || col < 0 || col >= cols) return

    const cell: Cell = [row, col]
    const key = cellKey(cell)

    if (path.length === 0) {
      // First cell: allow any cell
      onPathChange(addToPath(path, cell))
      return
    }

    // If clicking on a visited cell, truncate back to it
    if (visited.has(key)) {
      onPathChange(truncatePath(path, cell))
      return
    }

    // Must be adjacent to head (no wall checking in editor)
    if (head && isAdjacent(head, cell)) {
      onPathChange(addToPath(path, cell))
    }
  }, [rows, cols, path, onPathChange, visited, head])

  const undo = useCallback(() => {
    onPathChange(undoPath(path))
  }, [path, onPathChange])

  const reset = useCallback(() => {
    onPathChange([])
  }, [onPathChange])

  return { tryMove, undo, reset, visited, head }
}

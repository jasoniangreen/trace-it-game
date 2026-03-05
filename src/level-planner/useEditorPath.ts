import { useCallback } from 'react'
import { isAdjacent } from '../logic/validation'
import { cellKey, addToPath, undoPath } from '../logic/pathUtils'
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

    // Retrace: only undo one step by moving back to the previous cell
    if (path.length >= 2) {
      const prev = path[path.length - 2]
      if (prev[0] === row && prev[1] === col) {
        onPathChange(path.slice(0, -1))
        return
      }
    }

    // Ignore moves to any other visited cell
    if (visited.has(key)) return

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

import type { Cell } from '../types'

export function cellKey(cell: Cell): string {
  return `${cell[0]},${cell[1]}`
}

export function addToPath(path: Cell[], cell: Cell): Cell[] {
  return [...path, cell]
}

export function truncatePath(path: Cell[], cell: Cell): Cell[] {
  const key = cellKey(cell)
  const idx = path.findIndex((c) => cellKey(c) === key)
  if (idx === -1) return []
  return path.slice(0, idx + 1)
}

export function undoPath(path: Cell[]): Cell[] {
  if (path.length === 0) return []
  return path.slice(0, -1)
}

export function buildVisitedSet(path: Cell[]): Set<string> {
  return new Set(path.map(cellKey))
}

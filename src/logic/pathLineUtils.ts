import type { Cell } from '../types'

/**
 * Convert a path of cells to an SVG points string.
 * Each cell maps to the center of its grid slot.
 */
export function pathToPoints(
  path: Cell[],
  cellSize: number,
  cellGap: number,
): string {
  return path
    .map(([row, col]) => {
      const x = col * (cellSize + cellGap) + cellSize / 2
      const y = row * (cellSize + cellGap) + cellSize / 2
      return `${x},${y}`
    })
    .join(' ')
}

/**
 * Calculate the total pixel length of the polyline formed by the path.
 */
export function calcPathLength(
  path: Cell[],
  cellSize: number,
  cellGap: number,
): number {
  let len = 0
  for (let i = 1; i < path.length; i++) {
    const [r0, c0] = path[i - 1]
    const [r1, c1] = path[i]
    const dx = (c1 - c0) * (cellSize + cellGap)
    const dy = (r1 - r0) * (cellSize + cellGap)
    len += Math.sqrt(dx * dx + dy * dy)
  }
  return len
}

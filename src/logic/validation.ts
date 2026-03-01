import type { Cell, Wall, Level } from '../types'

export function isAdjacent(a: Cell, b: Cell): boolean {
  const dr = Math.abs(a[0] - b[0])
  const dc = Math.abs(a[1] - b[1])
  return (dr === 1 && dc === 0) || (dr === 0 && dc === 1)
}

export function buildWallSet(walls: Wall[]): Set<string> {
  const set = new Set<string>()
  for (const [a, b] of walls) {
    set.add(`${a[0]},${a[1]}|${b[0]},${b[1]}`)
    set.add(`${b[0]},${b[1]}|${a[0]},${a[1]}`)
  }
  return set
}

export function hasWall(
  wallSet: Set<string>,
  r1: number,
  c1: number,
  r2: number,
  c2: number,
): boolean {
  return wallSet.has(`${r1},${c1}|${r2},${c2}`)
}

export function isNumberOrderValid(
  numbers: Record<string, number>,
  currentPath: Cell[],
  nextCell: Cell,
): boolean {
  const nextKey = `${nextCell[0]},${nextCell[1]}`
  const nextNum = numbers[nextKey]

  if (nextNum === undefined) return true // non-numbered cell, always ok

  // Collect all numbers that have been visited in the path so far
  const visited = new Set<number>()
  for (const cell of currentPath) {
    const num = numbers[`${cell[0]},${cell[1]}`]
    if (num !== undefined) visited.add(num)
  }

  // Find all numbers that should come before nextNum
  const allNums = Object.values(numbers).sort((a, b) => a - b)
  for (const n of allNums) {
    if (n >= nextNum) break
    if (!visited.has(n)) return false
  }

  return true
}

export function checkWin(level: Level, path: Cell[]): boolean {
  const totalCells = level.rows * level.cols
  if (path.length !== totalCells) return false

  // Last cell must be the highest numbered cell
  const maxNum = Math.max(...Object.values(level.numbers))
  const lastCell = path[path.length - 1]
  const lastKey = `${lastCell[0]},${lastCell[1]}`
  return level.numbers[lastKey] === maxNum
}

export function verifySolution(level: Level, path: Cell[]): boolean {
  const totalCells = level.rows * level.cols
  if (path.length !== totalCells) return false

  const wallSet = buildWallSet(level.walls)
  const visited = new Set<string>()

  for (let i = 0; i < path.length; i++) {
    const key = `${path[i][0]},${path[i][1]}`
    if (visited.has(key)) return false // duplicate
    visited.add(key)

    if (i > 0) {
      if (!isAdjacent(path[i - 1], path[i])) return false
      if (hasWall(wallSet, path[i - 1][0], path[i - 1][1], path[i][0], path[i][1]))
        return false
    }

    // Check number ordering
    if (!isNumberOrderValid(level.numbers, path.slice(0, i), path[i]))
      return false
  }

  return checkWin(level, path)
}

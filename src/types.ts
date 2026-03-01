export type Cell = [number, number] // [row, col]
export type Wall = [Cell, Cell] // pair of adjacent cells

export interface Level {
  id: string
  name: string
  cols: number
  rows: number
  numbers: Record<string, number> // "row,col" → number
  walls: Wall[]
  solution: Cell[] // verified path for hints/tests
}

import { useEffect, useState } from 'react'

const MAX_CELL = 72
const MIN_CELL = 28
const CELL_GAP = 3
const H_PAD = 64  // 32px grid padding + 32px outer padding
const V_PAD = 140 // HUD (~60px) + grid padding (32px) + bottom margin (~48px)

function compute(cols: number, rows: number): number {
  const hGaps = (cols - 1) * CELL_GAP
  const vGaps = (rows - 1) * CELL_GAP
  const maxW = Math.floor((window.innerWidth - H_PAD - hGaps) / cols)
  const maxH = Math.floor((window.innerHeight - V_PAD - vGaps) / rows)
  return Math.max(MIN_CELL, Math.min(maxW, maxH, MAX_CELL))
}

export function useDynamicCellSize(cols: number, rows: number): number {
  const [cellSize, setCellSize] = useState(() => compute(cols, rows))

  useEffect(() => {
    const update = () => setCellSize(compute(cols, rows))
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [cols, rows])

  return cellSize
}

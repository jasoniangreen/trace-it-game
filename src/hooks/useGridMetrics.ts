import { useState, useEffect, type RefObject } from 'react'

interface GridMetrics {
  cellSize: number
  cellGap: number
}

const FALLBACK: GridMetrics = { cellSize: 72, cellGap: 3 }

function readMetrics(el: HTMLElement): GridMetrics {
  const style = getComputedStyle(el)
  const cellSize = parseInt(style.getPropertyValue('--cell-size'), 10)
  const cellGap = parseInt(style.getPropertyValue('--cell-gap'), 10)
  if (isNaN(cellSize) || isNaN(cellGap)) return FALLBACK
  return { cellSize, cellGap }
}

export function useGridMetrics(ref: RefObject<HTMLElement | null>): GridMetrics {
  const [metrics, setMetrics] = useState<GridMetrics>(FALLBACK)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    setMetrics(readMetrics(el))

    const observer = new ResizeObserver(() => {
      setMetrics(readMetrics(el))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref])

  return metrics
}

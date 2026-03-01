import { useRef, useCallback } from 'react'

interface UseDragInputOptions {
  onCellEnter: (row: number, col: number) => void
}

function getCellFromPoint(
  gridEl: HTMLElement,
  clientX: number,
  clientY: number,
): [number, number] | null {
  const el = document.elementFromPoint(clientX, clientY)
  if (!el || !gridEl.contains(el)) return null

  // Walk up to find the grid__cell wrapper with data attributes
  let node: HTMLElement | null = el as HTMLElement
  while (node && node !== gridEl) {
    if (node.dataset.row !== undefined && node.dataset.col !== undefined) {
      return [parseInt(node.dataset.row, 10), parseInt(node.dataset.col, 10)]
    }
    node = node.parentElement
  }
  return null
}

export function useDragInput({ onCellEnter }: UseDragInputOptions) {
  const dragging = useRef(false)
  const lastCell = useRef<string | null>(null)

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      dragging.current = true
      lastCell.current = null
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)

      const cell = getCellFromPoint(e.currentTarget, e.clientX, e.clientY)
      if (cell) {
        lastCell.current = `${cell[0]},${cell[1]}`
        onCellEnter(cell[0], cell[1])
      }
    },
    [onCellEnter],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!dragging.current) return

      const cell = getCellFromPoint(e.currentTarget, e.clientX, e.clientY)
      if (!cell) return

      const key = `${cell[0]},${cell[1]}`
      if (key === lastCell.current) return

      lastCell.current = key
      onCellEnter(cell[0], cell[1])
    },
    [onCellEnter],
  )

  const handlePointerUp = useCallback(() => {
    dragging.current = false
    lastCell.current = null
  }, [])

  return {
    gridProps: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerUp,
    },
  }
}

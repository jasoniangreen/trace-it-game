import { useRef, useEffect } from 'react'
import { pathToPoints, calcPathLength } from '../../logic/pathLineUtils'
import type { Cell } from '../../types'
import './PathLine.css'

interface PathLineProps {
  path: Cell[]
  rows: number
  cols: number
  cellSize: number
  cellGap: number
  isComplete: boolean
}

export function PathLine({
  path,
  rows,
  cols,
  cellSize,
  cellGap,
  isComplete,
}: PathLineProps) {
  const prevLenRef = useRef(0)
  const mainRef = useRef<SVGPolylineElement>(null)
  const glowRef = useRef<SVGPolylineElement>(null)

  const points = pathToPoints(path, cellSize, cellGap)
  const totalLen = calcPathLength(path, cellSize, cellGap)

  const w = cols * (cellSize + cellGap) - cellGap
  const h = rows * (cellSize + cellGap) - cellGap

  useEffect(() => {
    const prevLen = prevLenRef.current
    const grew = totalLen > prevLen

    const lines = [mainRef.current, glowRef.current]
    for (const line of lines) {
      if (!line) continue
      if (grew && prevLen > 0) {
        // Animate only the new segment: start with offset, transition to 0
        const newSegLen = totalLen - prevLen
        line.style.transition = 'none'
        line.style.strokeDasharray = `${totalLen}`
        line.style.strokeDashoffset = `${newSegLen}`
        // Force reflow then animate
        line.getBoundingClientRect()
        line.style.transition = 'stroke-dashoffset 0.15s ease-out'
        line.style.strokeDashoffset = '0'
      } else {
        // Snap (initial draw, undo, or truncate)
        line.style.transition = 'none'
        line.style.strokeDasharray = `${totalLen}`
        line.style.strokeDashoffset = '0'
      }
    }

    prevLenRef.current = totalLen
  }, [totalLen])

  if (path.length < 2) return null

  const cls = `path-line${isComplete ? ' path-line--complete' : ''}`

  return (
    <svg
      className={cls}
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
    >
      <defs>
        <linearGradient id="path-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--neon-green)" />
          <stop offset="100%" stopColor="var(--neon-cyan)" />
        </linearGradient>
        <filter id="path-glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Glow layer */}
      <polyline
        ref={glowRef}
        className="path-line__glow"
        points={points}
        fill="none"
        stroke="url(#path-grad)"
        strokeWidth={14}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#path-glow)"
      />
      {/* Main crisp line */}
      <polyline
        ref={mainRef}
        className="path-line__main"
        points={points}
        fill="none"
        stroke="url(#path-grad)"
        strokeWidth={8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

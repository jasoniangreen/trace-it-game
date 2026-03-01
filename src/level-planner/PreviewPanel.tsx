import { useState, useMemo, useCallback } from 'react'
import { Grid } from '../components/Grid/Grid'
import { buildVisitedSet } from '../logic/pathUtils'
import { exportLevel } from './exportLevel'
import type { Level } from '../types'

interface PreviewPanelProps {
  level: Level
  onRegenerate: () => void
  onNewLevel: () => void
}

export function PreviewPanel({ level, onRegenerate, onNewLevel }: PreviewPanelProps) {
  const [copied, setCopied] = useState(false)
  const visited = useMemo(() => buildVisitedSet(level.solution), [level.solution])
  const head = level.solution[level.solution.length - 1] ?? null

  const handleCopy = useCallback(async () => {
    const text = exportLevel(level)
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [level])

  return (
    <div className="planner-panel">
      <span className="planner-panel__label">Generated Level</span>

      <Grid
        level={level}
        path={level.solution}
        visited={visited}
        head={head}
        isComplete={true}
      />

      <div className="preview-panel__actions">
        <button className="planner-btn planner-btn--small" onClick={onNewLevel}>
          New Level
        </button>
        <button className="planner-btn planner-btn--small" onClick={onRegenerate}>
          Regenerate
        </button>
        <button className="planner-btn planner-btn--green" onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy Level Data'}
        </button>
      </div>

      {copied && <span className="preview-panel__copied">Level data copied to clipboard</span>}
    </div>
  )
}

import { useState, useCallback } from 'react'

const STORAGE_KEY = 'trace-it-progress'

function loadProgress(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return new Set(JSON.parse(raw))
  } catch { /* ignore corrupt data */ }
  return new Set()
}

function saveProgress(completed: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]))
}

export function useProgress() {
  const [completed, setCompleted] = useState<Set<string>>(loadProgress)

  const markComplete = useCallback((levelId: string) => {
    setCompleted((prev) => {
      if (prev.has(levelId)) return prev
      const next = new Set(prev)
      next.add(levelId)
      saveProgress(next)
      return next
    })
  }, [])

  const isComplete = useCallback(
    (levelId: string) => completed.has(levelId),
    [completed],
  )

  return { completed, markComplete, isComplete }
}

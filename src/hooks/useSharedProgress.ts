const STORAGE_KEY = 'trace-it-shared'

function readStore(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (typeof parsed === 'object' && parsed !== null) return parsed as Record<string, number>
    return {}
  } catch {
    return {}
  }
}

export function useSharedProgress() {
  function getSharedTime(encoded: string): number | undefined {
    const store = readStore()
    const val = store[encoded]
    return typeof val === 'number' ? val : undefined
  }

  function saveSharedCompletion(encoded: string, elapsedMs: number): void {
    const store = readStore()
    store[encoded] = elapsedMs
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
    } catch {
      // storage full or unavailable — ignore
    }
  }

  return { getSharedTime, saveSharedCompletion }
}

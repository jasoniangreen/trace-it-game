import { describe, it, expect, beforeEach } from 'vitest'
import { useSharedProgress } from '../hooks/useSharedProgress'

beforeEach(() => {
  localStorage.clear()
})

describe('useSharedProgress', () => {
  it('returns undefined for unseen keys', () => {
    const { getSharedTime } = useSharedProgress()
    expect(getSharedTime('unknown')).toBeUndefined()
  })

  it('stores and retrieves elapsed time', () => {
    const { getSharedTime, saveSharedCompletion } = useSharedProgress()
    saveSharedCompletion('abc', 83000)
    expect(getSharedTime('abc')).toBe(83000)
  })

  it('overwrites on second save', () => {
    const { getSharedTime, saveSharedCompletion } = useSharedProgress()
    saveSharedCompletion('abc', 83000)
    saveSharedCompletion('abc', 45000)
    expect(getSharedTime('abc')).toBe(45000)
  })

  it('handles corrupt localStorage gracefully', () => {
    localStorage.setItem('trace-it-shared', 'not-json{{{')
    const { getSharedTime } = useSharedProgress()
    expect(getSharedTime('abc')).toBeUndefined()
  })
})

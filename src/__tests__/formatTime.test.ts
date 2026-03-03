import { describe, it, expect } from 'vitest'
import { formatTime } from '../utils/formatTime'

describe('formatTime', () => {
  it('formats zero as 00:00', () => {
    expect(formatTime(0)).toBe('00:00')
  })

  it('formats seconds only', () => {
    expect(formatTime(5000)).toBe('00:05')
    expect(formatTime(59000)).toBe('00:59')
  })

  it('formats minutes and seconds', () => {
    expect(formatTime(60000)).toBe('01:00')
    expect(formatTime(83000)).toBe('01:23')
  })

  it('formats large values', () => {
    expect(formatTime(3661000)).toBe('61:01')
  })

  it('truncates sub-second ms (does not round)', () => {
    expect(formatTime(1999)).toBe('00:01')
  })
})

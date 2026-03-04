import { describe, it, expect } from 'vitest'
import { buildShareText } from '../utils/shareText'

const ELAPSED = 83000 // 01:23
const URL = 'https://example.com/#play/abc123'

describe('buildShareText', () => {
  it('header line starts with "Trace It ⚡"', () => {
    const lines = buildShareText(ELAPSED, URL).split('\n')
    expect(lines[0]).toBe('Trace It ⚡')
  })

  it('second line is formatted time', () => {
    const lines = buildShareText(ELAPSED, URL).split('\n')
    expect(lines[1]).toBe('01:23')
  })

  it('ends with the share URL', () => {
    const text = buildShareText(ELAPSED, URL)
    expect(text.endsWith(URL)).toBe(true)
  })

  it('contains "Can you beat it?"', () => {
    const text = buildShareText(ELAPSED, URL)
    expect(text).toContain('Can you beat it?')
  })

  it('produces exactly 5 emoji art rows', () => {
    const lines = buildShareText(ELAPSED, URL).split('\n')
    // Format: header, time, blank, 5 art rows, blank, tagline, url
    const artRows = lines.slice(3, 8)
    expect(artRows).toHaveLength(5)
  })

  it('each art row contains only 🟩, ⬛, and spaces', () => {
    const lines = buildShareText(ELAPSED, URL).split('\n')
    const artRows = lines.slice(3, 8)
    for (const row of artRows) {
      // Strip 🟩 and ⬛ and spaces — should leave nothing
      const stripped = row.replace(/🟩|⬛| /g, '')
      expect(stripped).toBe('')
    }
  })
})

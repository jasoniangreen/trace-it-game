import { describe, it, expect } from 'vitest'
import { buildShareText } from '../utils/shareText'

const ELAPSED = 83000 // 83 seconds
const URL = 'https://example.com/#play/abc123'

describe('buildShareText', () => {
  it('header line starts with "Trace It ⚡"', () => {
    const lines = buildShareText(ELAPSED, URL).split('\n')
    expect(lines[0]).toBe('Trace It ⚡')
  })

  it('ends with the share URL', () => {
    const text = buildShareText(ELAPSED, URL)
    expect(text.endsWith(URL)).toBe(true)
  })

  it('contains "Can you beat it?"', () => {
    const text = buildShareText(ELAPSED, URL)
    expect(text).toContain('Can you beat it?')
  })

  it('contains "seconds"', () => {
    const text = buildShareText(ELAPSED, URL)
    expect(text).toContain('seconds')
  })

  it('produces exactly 5 emoji art rows', () => {
    const lines = buildShareText(ELAPSED, URL).split('\n')
    // Format: header, blank, intro, 5 art rows, seconds, blank, tagline, url
    const artRows = lines.slice(3, 8)
    expect(artRows).toHaveLength(5)
  })

  it('each art row contains only 🟩, ⬛, and spaces', () => {
    const lines = buildShareText(ELAPSED, URL).split('\n')
    const artRows = lines.slice(3, 8)
    for (const row of artRows) {
      const stripped = row.replace(/🟩|⬛| /g, '')
      expect(stripped).toBe('')
    }
  })

  it('caps at 999 seconds', () => {
    const lines = buildShareText(1000 * 1000, URL).split('\n')
    // 3 digit glyphs — each row has 3 glyphs separated by spaces
    const artRows = lines.slice(3, 8)
    expect(artRows).toHaveLength(5)
    // Three glyph groups separated by two spaces means two ' ' separators
    expect(artRows[0].split(' ').length).toBe(3)
  })
})

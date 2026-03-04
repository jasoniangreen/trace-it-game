const ON = '🟩'
const OFF = '⬛'

// 5-row × 3-col bitmaps for each digit and colon
const GLYPHS: Record<string, string[][]> = {
  '0': [
    [ON, ON, ON],
    [ON, OFF, ON],
    [ON, OFF, ON],
    [ON, OFF, ON],
    [ON, ON, ON],
  ],
  '1': [
    [OFF, ON, OFF],
    [OFF, ON, OFF],
    [OFF, ON, OFF],
    [OFF, ON, OFF],
    [OFF, ON, OFF],
  ],
  '2': [
    [ON, ON, ON],
    [OFF, OFF, ON],
    [ON, ON, ON],
    [ON, OFF, OFF],
    [ON, ON, ON],
  ],
  '3': [
    [ON, ON, ON],
    [OFF, OFF, ON],
    [ON, ON, ON],
    [OFF, OFF, ON],
    [ON, ON, ON],
  ],
  '4': [
    [ON, OFF, ON],
    [ON, OFF, ON],
    [ON, ON, ON],
    [OFF, OFF, ON],
    [OFF, OFF, ON],
  ],
  '5': [
    [ON, ON, ON],
    [ON, OFF, OFF],
    [ON, ON, ON],
    [OFF, OFF, ON],
    [ON, ON, ON],
  ],
  '6': [
    [ON, ON, ON],
    [ON, OFF, OFF],
    [ON, ON, ON],
    [ON, OFF, ON],
    [ON, ON, ON],
  ],
  '7': [
    [ON, ON, ON],
    [OFF, OFF, ON],
    [OFF, OFF, ON],
    [OFF, OFF, ON],
    [OFF, OFF, ON],
  ],
  '8': [
    [ON, ON, ON],
    [ON, OFF, ON],
    [ON, ON, ON],
    [ON, OFF, ON],
    [ON, ON, ON],
  ],
  '9': [
    [ON, ON, ON],
    [ON, OFF, ON],
    [ON, ON, ON],
    [OFF, OFF, ON],
    [ON, ON, ON],
  ],
  ':': [
    [OFF, OFF, OFF],
    [OFF, ON, OFF],
    [OFF, OFF, OFF],
    [OFF, ON, OFF],
    [OFF, OFF, OFF],
  ],
}

// Cap at 9:99 — times beyond that aren't supported in the share art
const MAX_SHARE_SECS = 9 * 60 + 99

function formatShareTime(ms: number): string {
  const s = Math.min(Math.floor(ms / 1000), MAX_SHARE_SECS)
  const m = Math.min(Math.floor(s / 60), 9)
  const sec = m < 9 ? s % 60 : s - 9 * 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

export function buildShareText(elapsedMs: number, shareUrl: string): string {
  const timeStr = formatShareTime(elapsedMs)
  const chars = timeStr.split('')

  const artRows: string[] = []
  for (let r = 0; r < 5; r++) {
    const rowParts = chars.map((ch) => {
      const glyph = GLYPHS[ch]
      return glyph[r].join('')
    })
    artRows.push(rowParts.join(' '))
  }

  return [
    'Trace It ⚡',
    timeStr,
    '',
    ...artRows,
    '',
    'Can you beat it?',
    shareUrl,
  ].join('\n')
}

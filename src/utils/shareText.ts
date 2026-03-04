const ON = '🟩'
const OFF = '⬛'

// 5-row × 3-col bitmaps for each digit
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
}

// Cap at 999 seconds — 3 digits max for the share art
const MAX_SHARE_SECS = 999

export function buildShareText(elapsedMs: number, shareUrl: string): string {
  const secs = Math.max(0, Math.min(Math.floor(elapsedMs / 1000), MAX_SHARE_SECS))
  const chars = String(secs).split('')

  const artRows: string[] = []
  for (let r = 0; r < 5; r++) {
    const rowParts = chars.map((ch) => GLYPHS[ch][r].join(''))
    artRows.push(rowParts.join(' '))
  }

  return [
    'Trace It ⚡',
    '',
    ...artRows,
    'seconds',
    '',
    'Can you beat it?',
    shareUrl,
  ].join('\n')
}

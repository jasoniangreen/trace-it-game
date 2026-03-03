import type { Level, Cell, Wall } from '../types'

function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(str: string): Uint8Array {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/') +
    '==='.slice(0, (4 - (str.length % 4)) % 4)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

export function encodeLevel(level: Level): string {
  const { rows, cols, walls, numbers } = level

  const checkpoints = Object.entries(numbers)
    .map(([key, num]) => {
      const [r, c] = key.split(',').map(Number)
      return { index: r * cols + c, num }
    })
    .sort((a, b) => a.num - b.num)

  const buf = new Uint8Array(3 + walls.length * 2 + checkpoints.length * 2)
  buf[0] = (rows << 4) | cols
  buf[1] = walls.length
  buf[2] = checkpoints.length

  let offset = 3
  for (const [[r1, c1], [r2, c2]] of walls) {
    buf[offset++] = r1 * cols + c1
    buf[offset++] = r2 * cols + c2
  }
  for (const { index, num } of checkpoints) {
    buf[offset++] = index
    buf[offset++] = num
  }

  return toBase64Url(buf)
}

export function decodeLevel(encoded: string): Level {
  const buf = fromBase64Url(encoded)
  if (buf.length < 3) throw new Error('Invalid level data')

  const rows = buf[0] >> 4
  const cols = buf[0] & 0x0f
  if (rows < 1 || rows > 15 || cols < 1 || cols > 15) {
    throw new Error('Invalid grid dimensions')
  }

  const wallCount = buf[1]
  const checkpointCount = buf[2]
  const expected = 3 + wallCount * 2 + checkpointCount * 2
  if (buf.length !== expected) throw new Error('Invalid level data length')

  const maxIndex = rows * cols
  const walls: Wall[] = []
  let offset = 3
  for (let i = 0; i < wallCount; i++) {
    const a = buf[offset++]
    const b = buf[offset++]
    if (a >= maxIndex || b >= maxIndex) throw new Error('Wall index out of bounds')
    const cellA: Cell = [Math.floor(a / cols), a % cols]
    const cellB: Cell = [Math.floor(b / cols), b % cols]
    walls.push([cellA, cellB])
  }

  const numbers: Record<string, number> = {}
  for (let i = 0; i < checkpointCount; i++) {
    const idx = buf[offset++]
    const num = buf[offset++]
    if (idx >= maxIndex) throw new Error('Checkpoint index out of bounds')
    const r = Math.floor(idx / cols)
    const c = idx % cols
    numbers[`${r},${c}`] = num
  }

  return {
    id: 'shared',
    name: 'Shared Level',
    rows,
    cols,
    walls,
    numbers,
    solution: [],
  }
}

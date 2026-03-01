import type { Level } from '../types'

export function exportLevel(level: Level): string {
  const wallsStr = level.walls
    .map(([a, b]) => `[[${a[0]}, ${a[1]}], [${b[0]}, ${b[1]}]]`)
    .join(', ')

  const numbersEntries = Object.entries(level.numbers)
    .sort(([, a], [, b]) => a - b)
    .map(([k, v]) => `'${k}': ${v}`)
    .join(', ')

  const solutionStr = level.solution
    .map(([r, c]) => `[${r}, ${c}]`)
    .join(', ')

  return `{
  id: '${level.id}',
  name: '${level.name}',
  cols: ${level.cols},
  rows: ${level.rows},
  numbers: { ${numbersEntries} },
  walls: [${wallsStr}],
  solution: [
    ${solutionStr},
  ],
}`
}

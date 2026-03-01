# Trace It

A neon-themed path tracing puzzle game built with React and TypeScript.

Drag to connect numbered cells in order, filling every cell on the grid. Walls block your path — find the route around them.

## Play

https://yourusername.github.io/trace-it-game (deployed via GitHub Pages)

## Features

- Drag/touch input for path drawing with undo support
- SVG neon tube path rendering with animated segments
- 3 levels with increasing grid size and wall complexity
- Responsive design (desktop, tablet, mobile)
- Progress saved to localStorage

## Development

```bash
npm install
npm run dev       # Start dev server
npm run build     # Production build
npx vitest run    # Run tests
```

## Tech

React 19, TypeScript, Vite, Vitest

## Project Structure

```
src/
  logic/          # Pure functions: path operations, validation, coordinate math
  hooks/          # Game state, drag input, grid metrics, progress
  components/     # Grid, Cell, PathLine (SVG overlay), HUD, WinModal
  data/           # Level definitions
```

## Disclaimer

Inspired by path-tracing puzzle games. Built for fun and education.

## License

[MIT](LICENSE)

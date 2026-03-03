# Timer + Interstitial Design

**Date:** 2026-03-03

## Summary

Add a 2-second interstitial loading screen when a level starts, and a live timer that tracks how long the player takes to solve it. The final time displays prominently on the win screen.

## Requirements

- Interstitial shows for 2 seconds when a level loads, with a neon-themed loader and "get ready" message
- Timer starts automatically when the interstitial ends
- Timer displays in the HUD during gameplay (between level name and cell progress)
- Timer keeps running through resets — measures total time including retries
- Final time shows prominently on the win modal

## Architecture

`GameBoard` gains a `phase: 'loading' | 'playing' | 'complete'` state. During `loading`, it renders `<LoadingScreen>` instead of the grid. After 2s, transitions to `playing` and starts the timer. Timer state (`elapsedMs`) lives in `GameBoard` and is passed to `HUD` and `WinModal`.

### State machine

```
phase = 'loading'
  → after 2s → phase = 'playing', startTime = Date.now()
               setInterval updates elapsedMs every 100ms
isComplete = true
  → phase = 'complete', clearInterval
```

## Components

### `<LoadingScreen>` (new)

- Full-screen overlay (same visual language as WinModal: dark blur, neon glow)
- CSS keyframe pulse animation on a neon green ring
- `"GET READY"` in Orbitron + `"preparing your trace"` in Rajdhani
- Fade-in/out transitions
- Auto-dismissed after 2s via `setTimeout` in `GameBoard`

### `HUD` changes

- New optional `elapsed?: number` prop (milliseconds)
- Renders `MM:SS` format between level name and cell count
- Only rendered during `playing` phase
- Styling: Orbitron font, `--text-dim` normally, `--neon-cyan` while active

### `WinModal` changes

- New optional `elapsed?: number` prop
- Displays solve time prominently between title and action buttons
- Styling: large, `--neon-cyan` with glow

## Data Flow

```
GameBoard
  phase, elapsedMs
    ↓ phase = 'loading'   → <LoadingScreen>
    ↓ elapsed=elapsedMs   → <HUD> (phase = 'playing')
    ↓ elapsed=elapsedMs   → <WinModal> (phase = 'complete')
```

## Styling Conventions

Matches existing neon aesthetic:
- Background: `rgba(6, 6, 15, 0.95)`
- Accent: `var(--neon-green)` for loader, `var(--neon-cyan)` for timer
- Fonts: `'Orbitron'` for headings/time, `'Rajdhani'` for subtitle
- Animations: CSS keyframes (consistent with WinModal's `overlay-in`, `modal-in`)

## Files Changed

- `src/components/GameBoard/GameBoard.tsx` — phase state, timer logic
- `src/components/GameBoard/GameBoard.css` — minimal
- `src/components/HUD/HUD.tsx` — elapsed prop + MM:SS display
- `src/components/HUD/HUD.css` — timer styles
- `src/components/WinModal/WinModal.tsx` — elapsed prop + time display
- `src/components/WinModal/WinModal.css` — time display styles
- `src/components/LoadingScreen/LoadingScreen.tsx` — new component
- `src/components/LoadingScreen/LoadingScreen.css` — new styles

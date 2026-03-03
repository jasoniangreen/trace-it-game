# Timer + Interstitial Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a 2-second interstitial loading screen when a level starts, followed by a live timer in the HUD that stops on completion and displays the final solve time on the win modal.

**Architecture:** `GameBoard` gains a `phase: 'loading' | 'playing' | 'complete'` state. During `loading` it renders `<LoadingScreen>` instead of the grid. After 2s, `setTimeout` transitions to `playing` and starts a `setInterval` that ticks `elapsedMs` every 100ms. `isComplete` stops the interval and sets `phase = 'complete'`. Timer state flows down as props to `HUD` and `WinModal`.

**Tech Stack:** React 19, TypeScript, Vitest, React Testing Library (jsdom), CSS modules (plain .css files co-located with components)

---

### Task 1: `formatTime` utility

**Files:**
- Create: `src/utils/formatTime.ts`
- Test: `src/__tests__/formatTime.test.ts`

**Step 1: Write the failing test**

```ts
// src/__tests__/formatTime.test.ts
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
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/formatTime.test.ts`
Expected: FAIL — `Cannot find module '../utils/formatTime'`

**Step 3: Write minimal implementation**

```ts
// src/utils/formatTime.ts
export function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const rem = s % 60
  return `${String(m).padStart(2, '0')}:${String(rem).padStart(2, '0')}`
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/formatTime.test.ts`
Expected: PASS (5 tests)

**Step 5: Commit**

```bash
git add src/utils/formatTime.ts src/__tests__/formatTime.test.ts
git commit -m "feat: add formatTime utility"
```

---

### Task 2: `LoadingScreen` component

**Files:**
- Create: `src/components/LoadingScreen/LoadingScreen.tsx`
- Create: `src/components/LoadingScreen/LoadingScreen.css`
- Test: `src/__tests__/LoadingScreen.test.tsx`

**Step 1: Write the failing test**

```tsx
// src/__tests__/LoadingScreen.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoadingScreen } from '../components/LoadingScreen/LoadingScreen'

describe('LoadingScreen', () => {
  it('renders GET READY heading', () => {
    render(<LoadingScreen />)
    expect(screen.getByText('GET READY')).toBeInTheDocument()
  })

  it('renders the subtitle', () => {
    render(<LoadingScreen />)
    expect(screen.getByText(/preparing your trace/i)).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/LoadingScreen.test.tsx`
Expected: FAIL — `Cannot find module '../components/LoadingScreen/LoadingScreen'`

**Step 3: Create the component and CSS**

```tsx
// src/components/LoadingScreen/LoadingScreen.tsx
import './LoadingScreen.css'

export function LoadingScreen() {
  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="loading-ring" />
        <h2 className="loading-title">GET READY</h2>
        <p className="loading-subtitle">preparing your trace</p>
      </div>
    </div>
  )
}
```

```css
/* src/components/LoadingScreen/LoadingScreen.css */
.loading-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(6, 6, 15, 0.97);
  z-index: 200;
  animation: overlay-in 0.3s ease;
}

@keyframes overlay-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.loading-ring {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 3px solid rgba(0, 255, 136, 0.15);
  border-top-color: var(--neon-green);
  animation: ring-spin 0.9s linear infinite;
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
}

@keyframes ring-spin {
  to { transform: rotate(360deg); }
}

.loading-title {
  font-family: 'Orbitron', sans-serif;
  font-weight: 900;
  font-size: 28px;
  color: var(--neon-green);
  text-shadow: 0 0 12px rgba(0, 255, 136, 0.5), 0 0 30px rgba(0, 255, 136, 0.2);
  text-transform: uppercase;
  letter-spacing: 4px;
}

.loading-subtitle {
  font-family: 'Rajdhani', sans-serif;
  font-weight: 500;
  font-size: 16px;
  color: var(--text-dim);
  letter-spacing: 1px;
  text-transform: lowercase;
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/LoadingScreen.test.tsx`
Expected: PASS (2 tests)

**Step 5: Commit**

```bash
git add src/components/LoadingScreen/ src/__tests__/LoadingScreen.test.tsx
git commit -m "feat: add LoadingScreen component"
```

---

### Task 3: Phase state + timer in `GameBoard`

**Files:**
- Modify: `src/components/GameBoard/GameBoard.tsx`
- Test: `src/__tests__/GameBoard.test.tsx`

**Context:** `GameBoard` currently renders `HUD`, the grid div, and `WinModal` (when `isComplete`). It uses `useGameState` for game logic. We will add `phase` state, a `setTimeout` to transition `loading → playing`, a `setInterval` to tick `elapsedMs`, and clean up both on unmount.

**Step 1: Write the failing tests**

```tsx
// src/__tests__/GameBoard.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { GameBoard } from '../components/GameBoard/GameBoard'
import type { Level } from '../types'

const mockLevel: Level = {
  id: 'test',
  name: 'Test Level',
  rows: 2,
  cols: 2,
  start: [0, 0],
  end: [1, 1],
  walls: [],
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('GameBoard loading phase', () => {
  it('shows loading screen initially', () => {
    render(<GameBoard level={mockLevel} onBack={() => {}} onComplete={() => {}} />)
    expect(screen.getByText('GET READY')).toBeInTheDocument()
  })

  it('hides loading screen after 2 seconds', () => {
    render(<GameBoard level={mockLevel} onBack={() => {}} onComplete={() => {}} />)
    act(() => { vi.advanceTimersByTime(2000) })
    expect(screen.queryByText('GET READY')).not.toBeInTheDocument()
  })
})

describe('GameBoard timer', () => {
  it('shows 00:00 in HUD after loading ends', () => {
    render(<GameBoard level={mockLevel} onBack={() => {}} onComplete={() => {}} />)
    act(() => { vi.advanceTimersByTime(2000) })
    expect(screen.getByText('00:00')).toBeInTheDocument()
  })

  it('timer ticks while playing', () => {
    render(<GameBoard level={mockLevel} onBack={() => {}} onComplete={() => {}} />)
    act(() => { vi.advanceTimersByTime(2000) })   // end loading
    act(() => { vi.advanceTimersByTime(5000) })   // advance 5s
    expect(screen.getByText('00:05')).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/GameBoard.test.tsx`
Expected: FAIL — `GET READY` not found (LoadingScreen not rendered yet)

**Step 3: Update `GameBoard`**

Replace the contents of `src/components/GameBoard/GameBoard.tsx` with:

```tsx
import { useCallback, useEffect, useRef, useState } from 'react'
import { Grid } from '../Grid/Grid'
import { HUD } from '../HUD/HUD'
import { WinModal } from '../WinModal/WinModal'
import { LoadingScreen } from '../LoadingScreen/LoadingScreen'
import { useGameState } from '../../hooks/useGameState'
import { useDragInput } from '../../hooks/useDragInput'
import { levels } from '../../data/levels'
import type { Level } from '../../types'
import './GameBoard.css'

interface GameBoardProps {
  level: Level
  onBack: () => void
  onComplete: (levelId: string) => void
}

export function GameBoard({ level, onBack, onComplete }: GameBoardProps) {
  const { path, visited, head, isComplete, tryMove, undo, reset } = useGameState(level)

  const [phase, setPhase] = useState<'loading' | 'playing' | 'complete'>('loading')
  const [elapsedMs, setElapsedMs] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(0)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPhase('playing')
      startTimeRef.current = Date.now()
      intervalRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startTimeRef.current)
      }, 100)
    }, 2000)
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    if (isComplete && phase === 'playing') {
      if (intervalRef.current) clearInterval(intervalRef.current)
      setElapsedMs(Date.now() - startTimeRef.current)
      setPhase('complete')
    }
  }, [isComplete, phase])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const onCellEnter = useCallback(
    (row: number, col: number) => tryMove(row, col),
    [tryMove],
  )

  const { gridProps } = useDragInput({ onCellEnter })

  const levelIdx = levels.findIndex((l) => l.id === level.id)
  const hasNextLevel = levelIdx < levels.length - 1

  const handleNextLevel = useCallback(() => {
    onComplete(level.id)
  }, [level.id, onComplete])

  const handleBack = useCallback(() => {
    onBack()
  }, [onBack])

  if (phase === 'loading') {
    return <LoadingScreen />
  }

  return (
    <div className="game-board">
      <HUD
        levelName={level.name}
        pathLength={path.length}
        totalCells={level.rows * level.cols}
        elapsed={elapsedMs}
        onBack={handleBack}
        onReset={reset}
        onUndo={undo}
      />
      <div className="game-board__grid" {...gridProps}>
        <Grid
          level={level}
          path={path}
          visited={visited}
          head={head}
          isComplete={isComplete}
        />
      </div>
      {phase === 'complete' && (
        <WinModal
          levelName={level.name}
          elapsed={elapsedMs}
          hasNextLevel={hasNextLevel}
          onNextLevel={handleNextLevel}
          onBack={handleBack}
        />
      )}
    </div>
  )
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/GameBoard.test.tsx`
Expected: PASS (4 tests) — note: HUD and WinModal tests may fail until those components accept `elapsed` prop; TypeScript will also complain. That's fine — we'll fix in the next two tasks.

**Step 5: Commit**

```bash
git add src/components/GameBoard/GameBoard.tsx src/__tests__/GameBoard.test.tsx
git commit -m "feat: add phase state machine and timer to GameBoard"
```

---

### Task 4: HUD timer display

**Files:**
- Modify: `src/components/HUD/HUD.tsx`
- Modify: `src/components/HUD/HUD.css`
- Test: `src/__tests__/HUD.test.tsx`

**Step 1: Write the failing test**

```tsx
// src/__tests__/HUD.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HUD } from '../components/HUD/HUD'

const baseProps = {
  levelName: 'Test Level',
  pathLength: 5,
  totalCells: 16,
  elapsed: 0,
  onBack: () => {},
  onReset: () => {},
  onUndo: () => {},
}

describe('HUD', () => {
  it('renders level name', () => {
    render(<HUD {...baseProps} />)
    expect(screen.getByText('Test Level')).toBeInTheDocument()
  })

  it('renders cell progress', () => {
    render(<HUD {...baseProps} />)
    expect(screen.getByText('5 / 16')).toBeInTheDocument()
  })

  it('renders elapsed time as MM:SS', () => {
    render(<HUD {...baseProps} elapsed={83000} />)
    expect(screen.getByText('01:23')).toBeInTheDocument()
  })

  it('renders 00:00 when elapsed is 0', () => {
    render(<HUD {...baseProps} elapsed={0} />)
    expect(screen.getByText('00:00')).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/HUD.test.tsx`
Expected: FAIL — `elapsed` not in `HUDProps`, time not rendered

**Step 3: Update `HUD`**

```tsx
// src/components/HUD/HUD.tsx
import { formatTime } from '../../utils/formatTime'
import './HUD.css'

interface HUDProps {
  levelName: string
  pathLength: number
  totalCells: number
  elapsed: number
  onBack: () => void
  onReset: () => void
  onUndo: () => void
}

export function HUD({ levelName, pathLength, totalCells, elapsed, onBack, onReset, onUndo }: HUDProps) {
  return (
    <div className="hud">
      <button className="hud__btn" onClick={onBack} aria-label="Back to levels">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <div className="hud__info">
        <span className="hud__level-name">{levelName}</span>
        <div className="hud__meta">
          <span className="hud__timer">{formatTime(elapsed)}</span>
          <span className="hud__progress">{pathLength} / {totalCells}</span>
        </div>
      </div>
      <div className="hud__actions">
        <button className="hud__btn" onClick={onUndo} aria-label="Undo">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 8H13C15.2091 8 17 9.79086 17 12C17 14.2091 15.2091 16 13 16H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 5L4 8L7 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button className="hud__btn" onClick={onReset} aria-label="Reset">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10C17 13.866 13.866 17 10 17C7.87827 17 5.97914 16.0518 4.69649 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M3 6V10H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
```

Add to `src/components/HUD/HUD.css`:

```css
.hud__meta {
  display: flex;
  gap: 10px;
  align-items: center;
}

.hud__timer {
  font-family: 'Orbitron', sans-serif;
  font-weight: 600;
  font-size: 13px;
  color: var(--neon-cyan);
  letter-spacing: 1px;
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/HUD.test.tsx`
Expected: PASS (4 tests)

**Step 5: Commit**

```bash
git add src/components/HUD/HUD.tsx src/components/HUD/HUD.css src/__tests__/HUD.test.tsx
git commit -m "feat: add elapsed timer display to HUD"
```

---

### Task 5: WinModal solve time display

**Files:**
- Modify: `src/components/WinModal/WinModal.tsx`
- Modify: `src/components/WinModal/WinModal.css`
- Test: `src/__tests__/WinModal.test.tsx`

**Step 1: Write the failing test**

```tsx
// src/__tests__/WinModal.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WinModal } from '../components/WinModal/WinModal'

const baseProps = {
  levelName: 'Test Level',
  elapsed: 83000,
  hasNextLevel: true,
  onNextLevel: () => {},
  onBack: () => {},
}

describe('WinModal', () => {
  it('renders Complete title', () => {
    render(<WinModal {...baseProps} />)
    expect(screen.getByText('Complete')).toBeInTheDocument()
  })

  it('renders solve time prominently', () => {
    render(<WinModal {...baseProps} />)
    expect(screen.getByText('01:23')).toBeInTheDocument()
  })

  it('renders Next Level button when hasNextLevel', () => {
    render(<WinModal {...baseProps} />)
    expect(screen.getByText('Next Level')).toBeInTheDocument()
  })

  it('does not render Next Level when no next level', () => {
    render(<WinModal {...baseProps} hasNextLevel={false} />)
    expect(screen.queryByText('Next Level')).not.toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/WinModal.test.tsx`
Expected: FAIL — `elapsed` not in `WinModalProps`, time not rendered

**Step 3: Update `WinModal`**

```tsx
// src/components/WinModal/WinModal.tsx
import { formatTime } from '../../utils/formatTime'
import './WinModal.css'

interface WinModalProps {
  levelName: string
  elapsed: number
  hasNextLevel: boolean
  onNextLevel: () => void
  onBack: () => void
}

export function WinModal({ levelName, elapsed, hasNextLevel, onNextLevel, onBack }: WinModalProps) {
  return (
    <div className="win-overlay">
      <div className="win-modal">
        <div className="win-modal__glow" />
        <h2 className="win-modal__title">Complete</h2>
        <p className="win-modal__subtitle">{levelName}</p>
        <p className="win-modal__time">{formatTime(elapsed)}</p>
        <div className="win-modal__actions">
          {hasNextLevel && (
            <button className="win-modal__btn win-modal__btn--primary" onClick={onNextLevel}>
              Next Level
            </button>
          )}
          <button className="win-modal__btn win-modal__btn--secondary" onClick={hasNextLevel ? onBack : onNextLevel}>
            Level Select
          </button>
        </div>
      </div>
    </div>
  )
}
```

Add to `src/components/WinModal/WinModal.css`:

```css
.win-modal__time {
  position: relative;
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
  font-size: 36px;
  color: var(--neon-cyan);
  text-shadow: 0 0 12px rgba(0, 229, 255, 0.5), 0 0 30px rgba(0, 229, 255, 0.2);
  letter-spacing: 3px;
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/WinModal.test.tsx`
Expected: PASS (4 tests)

**Step 5: Run all tests**

Run: `npx vitest run`
Expected: All tests pass

**Step 6: Commit**

```bash
git add src/components/WinModal/WinModal.tsx src/components/WinModal/WinModal.css src/__tests__/WinModal.test.tsx
git commit -m "feat: show solve time on WinModal"
```

---

### Task 6: Manual verification

**Step 1: Start dev server**

Run: `npm run dev`

**Step 2: Verify loading screen**
- Pick any level — loading screen should appear for 2 seconds with spinning ring and "GET READY" text, then fade into the game

**Step 3: Verify timer**
- Timer should start at 00:00 and tick up in the HUD
- Hitting Reset should not affect the timer

**Step 4: Verify win screen**
- Complete a level — win modal should show the solve time prominently in cyan

**Step 5: TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { GameBoard } from '../components/GameBoard/GameBoard'
import type { Level } from '../types'

const mockLevel: Level = {
  id: 'test',
  name: 'Test Level',
  rows: 2,
  cols: 2,
  numbers: { '0,0': 1, '1,1': 2 },
  walls: [],
  solution: [[0, 0], [0, 1], [1, 1]],
}

beforeEach(() => {
  vi.useFakeTimers()
  localStorage.clear()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('GameBoard get-ready phase', () => {
  it('shows get-ready screen on first visit', () => {
    render(<GameBoard level={mockLevel} onBack={() => {}} onComplete={() => {}} />)
    expect(screen.getByText('GET READY')).toBeInTheDocument()
  })

  it('transitions to playing when I\'m Ready is clicked', () => {
    render(<GameBoard level={mockLevel} onBack={() => {}} onComplete={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /ready/i }))
    expect(screen.queryByText('GET READY')).not.toBeInTheDocument()
    expect(screen.getByText('00:00')).toBeInTheDocument()
  })

  it('skips get-ready on subsequent example levels after rules seen', () => {
    localStorage.setItem('trace-it-rules-seen', '1')
    render(<GameBoard level={mockLevel} onBack={() => {}} onComplete={() => {}} />)
    expect(screen.queryByText('GET READY')).not.toBeInTheDocument()
  })

  it('always shows get-ready for shared play levels', () => {
    localStorage.setItem('trace-it-rules-seen', '1')
    render(<GameBoard level={mockLevel} onBack={() => {}} onComplete={() => {}} shareUrl="https://example.com" />)
    expect(screen.getByText('GET READY')).toBeInTheDocument()
  })
})

describe('GameBoard timer', () => {
  it('timer starts after clicking ready', () => {
    render(<GameBoard level={mockLevel} onBack={() => {}} onComplete={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /ready/i }))
    expect(screen.getByText('00:00')).toBeInTheDocument()
    act(() => { vi.advanceTimersByTime(5000) })
    expect(screen.getByText('00:05')).toBeInTheDocument()
  })
})

describe('GameBoard with initialElapsedMs', () => {
  it('shows WinModal immediately without GET READY screen', () => {
    render(
      <GameBoard
        level={mockLevel}
        onBack={() => {}}
        onComplete={() => {}}
        initialElapsedMs={83000}
      />,
    )
    expect(screen.queryByText('GET READY')).not.toBeInTheDocument()
    expect(screen.getByText('Complete')).toBeInTheDocument()
  })

  it('displays stored time in WinModal', () => {
    render(
      <GameBoard
        level={mockLevel}
        onBack={() => {}}
        onComplete={() => {}}
        initialElapsedMs={83000}
      />,
    )
    const times = screen.getAllByText('01:23')
    expect(times.some((el) => el.classList.contains('win-modal__time'))).toBe(true)
  })

  it('timer does not advance after 5 seconds', () => {
    render(
      <GameBoard
        level={mockLevel}
        onBack={() => {}}
        onComplete={() => {}}
        initialElapsedMs={83000}
      />,
    )
    act(() => { vi.advanceTimersByTime(5000) })
    const times = screen.getAllByText('01:23')
    expect(times.some((el) => el.classList.contains('win-modal__time'))).toBe(true)
  })
})

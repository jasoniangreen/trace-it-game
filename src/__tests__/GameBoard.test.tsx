import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
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

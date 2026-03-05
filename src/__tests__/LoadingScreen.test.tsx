import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoadingScreen } from '../components/LoadingScreen/LoadingScreen'

describe('LoadingScreen', () => {
  it('renders GET READY heading', () => {
    render(<LoadingScreen onReady={() => {}} />)
    expect(screen.getByText('GET READY')).toBeInTheDocument()
  })

  it('renders game rules', () => {
    render(<LoadingScreen onReady={() => {}} />)
    expect(screen.getByText(/every cell/)).toBeInTheDocument()
    expect(screen.getByText(/numbered/)).toBeInTheDocument()
    expect(screen.getByText(/walls block/i)).toBeInTheDocument()
  })

  it('renders I\'m Ready button', () => {
    render(<LoadingScreen onReady={() => {}} />)
    expect(screen.getByRole('button', { name: /ready/i })).toBeInTheDocument()
  })

  it('calls onReady when button clicked', () => {
    const onReady = vi.fn()
    render(<LoadingScreen onReady={onReady} />)
    screen.getByRole('button', { name: /ready/i }).click()
    expect(onReady).toHaveBeenCalledOnce()
  })
})

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

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

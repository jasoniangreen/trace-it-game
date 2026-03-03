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
    const el = screen.getByText('01:23')
    expect(el).toBeInTheDocument()
    expect(el).toHaveClass('win-modal__time')
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

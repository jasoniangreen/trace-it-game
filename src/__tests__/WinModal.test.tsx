import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WinModal } from '../components/WinModal/WinModal'

const baseProps = {
  levelName: 'Test Level',
  elapsed: 83000,
  hasNextLevel: true,
  onNextLevel: () => {},
  onBack: () => {},
}

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

// Spy on the real Clipboard.prototype.writeText (must be called AFTER render,
// since render() via act() activates jsdom's real Clipboard object)
function spyClipboard(resolvedValue?: Error) {
  const proto = Object.getPrototypeOf(navigator.clipboard)
  return resolvedValue instanceof Error
    ? vi.spyOn(proto, 'writeText').mockRejectedValue(resolvedValue)
    : vi.spyOn(proto, 'writeText').mockResolvedValue(undefined)
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

  it('does not render Share button when shareUrl absent', () => {
    render(<WinModal {...baseProps} />)
    expect(screen.queryByText('Share')).not.toBeInTheDocument()
  })

  it('renders Share button when shareUrl provided', () => {
    render(<WinModal {...baseProps} shareUrl="https://example.com/#play/abc" />)
    expect(screen.getByText('Share')).toBeInTheDocument()
  })

  describe('Share button behavior', () => {
    const shareUrl = 'https://example.com/#play/abc'

    it('click copies expected text to clipboard', async () => {
      const user = userEvent.setup()
      render(<WinModal {...baseProps} shareUrl={shareUrl} />)
      // Spy after render — render activates jsdom's real Clipboard object
      const writeText = spyClipboard()
      await user.click(screen.getByText('Share'))
      expect(writeText).toHaveBeenCalledOnce()
      const [text] = writeText.mock.calls[0] as [string]
      expect(text).toContain('Trace It ⚡')
      expect(text).toContain(shareUrl)
    })

    it('shows "Copied!" after click', async () => {
      const user = userEvent.setup()
      render(<WinModal {...baseProps} shareUrl={shareUrl} />)
      spyClipboard()
      await user.click(screen.getByText('Share'))
      expect(screen.getByText('Copied!')).toBeInTheDocument()
    })

    it('reverts to "Share" after 1.5s', async () => {
      vi.useFakeTimers()
      render(<WinModal {...baseProps} shareUrl={shareUrl} />)
      spyClipboard()
      await act(async () => {
        fireEvent.click(screen.getByText('Share'))
        await Promise.resolve()
        await Promise.resolve()
      })
      act(() => { vi.advanceTimersByTime(1500) })
      expect(screen.getByText('Share')).toBeInTheDocument()
    })

    it('silently fails when clipboard unavailable', async () => {
      const user = userEvent.setup()
      render(<WinModal {...baseProps} shareUrl={shareUrl} />)
      spyClipboard(new Error('denied'))
      await expect(user.click(screen.getByText('Share'))).resolves.not.toThrow()
      expect(screen.queryByText('Copied!')).not.toBeInTheDocument()
    })
  })
})

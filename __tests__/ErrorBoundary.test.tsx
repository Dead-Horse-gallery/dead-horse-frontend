import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { ErrorBoundary } from '../src/components/ErrorBoundary'

// Mock component that throws an error
const ThrowingComponent = () => {
  throw new Error('Test error')
}

// Mock component that works normally  
const WorkingComponent = () => <div>Working component</div>

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for these tests since we expect errors
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <WorkingComponent />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Working component')).toBeInTheDocument()
  })

  it('renders error UI when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText(/An unexpected error occurred/)).toBeInTheDocument()
  })

  it('shows reset button when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Try Again')).toBeInTheDocument()
    expect(screen.getByText('Return Home')).toBeInTheDocument()
  })

  it('displays error ID when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    )
    
    expect(screen.getByText(/Error ID:/)).toBeInTheDocument()
  })

  it('calls onError callback when error occurs', () => {
    const onError = jest.fn()
    
    render(
      <ErrorBoundary onError={onError}>
        <ThrowingComponent />
      </ErrorBoundary>
    )
    
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    )
  })

  it('uses custom fallback component when provided', () => {
    const CustomFallback: React.FC<{ error: Error; reset: () => void }> = ({ error, reset }) => (
      <div>
        <h1>Custom Error</h1>
        <p>{error.message}</p>
        <button onClick={reset}>Custom Reset</button>
      </div>
    )

    render(
      <ErrorBoundary fallback={CustomFallback}>
        <ThrowingComponent />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Custom Error')).toBeInTheDocument()
    expect(screen.getByText('Test error')).toBeInTheDocument()
    expect(screen.getByText('Custom Reset')).toBeInTheDocument()
  })
})

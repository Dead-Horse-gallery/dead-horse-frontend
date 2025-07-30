import '@testing-library/jest-dom'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || 'test image'} />
  },
}))

// Mock logger to prevent console noise during tests
jest.mock('./src/lib/logger', () => ({
  log: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    userAction: jest.fn(),
    payment: jest.fn(),
    auth: jest.fn(),
    api: jest.fn(),
    startPerformanceMark: jest.fn(),
    endPerformanceMark: jest.fn(),
    trackPageLoad: jest.fn(),
    trackApiCall: jest.fn(),
    trackAuthEvent: jest.fn(),
    trackPaymentEvent: jest.fn(),
  }
}))

// Mock Web Crypto API for tests
Object.defineProperty(window, 'crypto', {
  value: {
    getRandomValues: (arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256)
      }
      return arr
    },
  },
})

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
  },
})

# Documentation Standards - Dead Horse Gallery

## JSDoc Implementation Guide

This guide establishes documentation standards for the Dead Horse Gallery codebase using JSDoc comments.

## JSDoc Standards

### 1. Function Documentation

```typescript
/**
 * Creates a payment intent for artwork purchase
 * @param amount - Payment amount in cents (USD)
 * @param metadata - Additional payment metadata
 * @returns Promise resolving to payment intent details
 * @throws {Error} When payment intent creation fails
 * @example
 * ```typescript
 * const intent = await createPaymentIntent(1000, { artworkId: '123' });
 * console.log(intent.clientSecret);
 * ```
 */
export async function createPaymentIntent(
  amount: number,
  metadata?: Record<string, string>
): Promise<CreatePaymentIntentResponse> {
  // Implementation...
}
```

### 2. Component Documentation

```typescript
/**
 * ErrorBoundary component for graceful error handling
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI with recovery options.
 * 
 * @component
 * @param props - Component props
 * @param props.children - Child components to wrap with error boundary
 * @param props.fallback - Custom fallback component for error display
 * @param props.onError - Callback function called when error occurs
 * 
 * @example
 * ```tsx
 * <ErrorBoundary onError={(error, errorInfo) => console.log(error)}>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Implementation...
}
```

### 3. Hook Documentation

```typescript
/**
 * Hook for monitoring component performance
 * 
 * Provides methods to start/stop performance measurements and track
 * component render times, user interactions, and custom metrics.
 * 
 * @param options - Configuration options
 * @param options.name - Unique name for the performance measurement
 * @param options.autoStart - Whether to start measurement automatically
 * @param options.metadata - Additional metadata to include with measurements
 * 
 * @returns Performance monitoring interface
 * @returns returns.start - Function to start performance measurement
 * @returns returns.end - Function to end measurement and get results
 * @returns returns.restart - Function to restart the measurement
 * @returns returns.isRunning - Whether measurement is currently active
 * @returns returns.duration - Current duration if measurement is running
 * 
 * @example
 * ```typescript
 * const performance = usePerformanceMonitor({
 *   name: 'artwork-detail-render',
 *   autoStart: true,
 *   metadata: { artworkId: artwork.id }
 * });
 * 
 * // Manual control
 * performance.start();
 * // ... some operation
 * const metric = performance.end();
 * ```
 */
export function usePerformanceMonitor({
  name,
  autoStart = false,
  metadata
}: UsePerformanceMonitorOptions) {
  // Implementation...
}
```

### 4. Type Documentation

```typescript
/**
 * Authentication state for hybrid auth system
 * 
 * Represents the current authentication status and capabilities
 * of a user in the Dead Horse Gallery application.
 * 
 * @typedef {Object} UserAuthState
 * @property {'anonymous'} anonymous - Guest user with no authentication
 * @property {'email'} email - User authenticated via email (Magic Link)
 * @property {'wallet'} wallet - User authenticated via crypto wallet only
 * @property {'hybrid'} hybrid - User with both email and wallet authentication
 */
export type UserAuthState = 'anonymous' | 'email' | 'wallet' | 'hybrid';

/**
 * User profile with authentication and preference data
 * 
 * @interface UserProfile
 * @property {UserAuthState} authState - Current authentication state
 * @property {string|null} email - User's email address if available
 * @property {string|null} walletAddress - Connected wallet address if available
 * @property {boolean} canPurchase - Whether user can make purchases
 * @property {boolean} canMint - Whether user can mint NFTs
 * @property {PreferenceSettings} preferences - User preference settings
 */
export interface UserProfile {
  authState: UserAuthState;
  email: string | null;
  walletAddress: string | null;
  canPurchase: boolean;
  canMint: boolean;
  preferences: PreferenceSettings;
}
```

### 5. API Documentation

```typescript
/**
 * API route handler for creating payment intents
 * 
 * Handles POST requests to create Stripe payment intents for artwork purchases.
 * Validates user authentication and artwork availability before processing.
 * 
 * @route POST /api/create-payment-intent
 * @param {Request} request - HTTP request object
 * @param {Object} request.body - Request body
 * @param {number} request.body.amount - Payment amount in cents
 * @param {string} request.body.artworkId - ID of artwork being purchased
 * @param {Object} request.body.metadata - Additional payment metadata
 * 
 * @returns {Response} JSON response with payment intent details
 * @returns {string} returns.clientSecret - Stripe client secret for payment
 * @returns {string} returns.paymentIntentId - Stripe payment intent ID
 * 
 * @throws {400} Bad Request - Invalid request parameters
 * @throws {401} Unauthorized - User not authenticated
 * @throws {404} Not Found - Artwork not found
 * @throws {500} Internal Server Error - Payment processing failed
 * 
 * @example
 * ```typescript
 * const response = await fetch('/api/create-payment-intent', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     amount: 1000,
 *     artworkId: 'art_123',
 *     metadata: { source: 'gallery' }
 *   })
 * });
 * const { clientSecret } = await response.json();
 * ```
 */
export async function POST(request: Request) {
  // Implementation...
}
```

## Documentation Coverage Goals

### Priority 1 (High Impact)
- [ ] All public API functions
- [ ] React components with complex props
- [ ] Custom hooks
- [ ] Type definitions and interfaces
- [ ] Error handling functions

### Priority 2 (Medium Impact)  
- [ ] Utility functions
- [ ] Configuration objects
- [ ] Complex algorithms
- [ ] Security-related functions
- [ ] Performance-critical code

### Priority 3 (Low Impact)
- [ ] Simple getter/setter functions
- [ ] Internal helper functions
- [ ] Constants and enums
- [ ] Test utilities

## Documentation Tools

### 1. Generate Documentation

Install documentation generator:
```bash
npm install --save-dev jsdoc typedoc
```

Add scripts to package.json:
```json
{
  "scripts": {
    "docs:generate": "typedoc src --out docs",
    "docs:serve": "http-server docs -p 8080"
  }
}
```

### 2. Documentation Linting

Add to ESLint configuration:
```json
{
  "rules": {
    "jsdoc/require-description": "error",
    "jsdoc/require-param": "error",
    "jsdoc/require-returns": "error",
    "jsdoc/require-example": "warn"
  }
}
```

### 3. IDE Integration

Configure VS Code for JSDoc:
```json
{
  "typescript.suggest.includeCompletionsForImportStatements": true,
  "typescript.suggest.autoImports": true,
  "javascript.suggest.names": true,
  "typescript.suggest.names": true
}
```

## Best Practices

### 1. Clear Descriptions
- Use active voice
- Explain the "why" not just the "what"
- Include context and use cases

### 2. Complete Parameter Documentation
- Document all parameters including optional ones
- Specify types even when TypeScript provides them
- Include validation constraints

### 3. Return Value Documentation
- Document return types and possible values
- Explain what different return values mean
- Document Promise resolution/rejection

### 4. Error Documentation
- Document all possible errors/exceptions
- Include error conditions and recovery strategies
- Provide examples of error handling

### 5. Usage Examples
- Include realistic examples
- Show common use cases
- Demonstrate error handling

## Implementation Status

### Current Coverage
- Enhanced Logger: ✅ Fully documented
- ErrorBoundary: ✅ Fully documented  
- Performance Hooks: ✅ Fully documented
- HybridAuthContext: 🔄 In progress
- Payment System: ❌ Needs documentation
- API Routes: ❌ Needs documentation

### Next Steps
1. Document HybridAuthContext methods and properties
2. Add JSDoc to all payment-related functions
3. Document API route handlers
4. Add examples to component documentation
5. Set up automated documentation generation

This documentation standard ensures the Dead Horse Gallery codebase is well-documented, maintainable, and accessible to new developers.

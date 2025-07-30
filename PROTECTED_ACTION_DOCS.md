# ProtectedAction Component Documentation

## Overview

The `ProtectedAction` component is a seamless authentication wrapper that protects any action or button that requires user authentication. It provides a smooth user experience by showing context-aware authentication modals for guest users while allowing authenticated users to execute actions immediately.

## Key Features

- **Seamless UX**: No blocking dialogs or jarring redirects
- **Universal Wrapper**: Wraps any React element (buttons, links, cards, etc.)
- **Context-Aware**: Shows appropriate auth modal based on action intent
- **Access Levels**: Basic email, wallet-only, or hybrid authentication
- **Pass-through Behavior**: Authenticated users execute actions normally
- **Convenience Components**: Pre-configured wrappers for common actions

## Basic Usage

```tsx
import ProtectedAction from '@/components/ProtectedAction';

function MyComponent() {
  const handlePurchase = () => {
    // This will only execute for authenticated users
    console.log('Purchase initiated');
  };

  return (
    <ProtectedAction intent="purchase" onClick={handlePurchase}>
      <button>Buy Now</button>
    </ProtectedAction>
  );
}
```

## Props

### ProtectedActionProps

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `intent` | `Intent` | Yes | - | The user's intent that requires authentication |
| `children` | `React.ReactNode` | Yes | - | The element(s) to wrap and protect |
| `onClick` | `() => void` | No | - | Function to execute when user is authenticated |
| `className` | `string` | No | `''` | Additional CSS classes to apply |
| `disabled` | `boolean` | No | `false` | Whether the action is disabled |
| `requiresAccess` | `AccessLevel` | No | `'basic'` | Required authentication level |

### Intent Types

```typescript
type Intent = 'purchase' | 'save' | 'contact' | 'verify' | 'apply';
```

### Access Levels

```typescript
type AccessLevel = 'basic' | 'wallet' | 'hybrid';
```

- **`basic`**: Requires email authentication only
- **`wallet`**: Requires Web3 wallet connection
- **`hybrid`**: Requires both email and wallet authentication

## Convenience Components

Pre-configured components for common use cases:

### ProtectedPurchase
```tsx
import { ProtectedPurchase } from '@/components/ProtectedAction';

<ProtectedPurchase onClick={handlePurchase}>
  <button>Add to Cart</button>
</ProtectedPurchase>
```
- **Intent**: `purchase`
- **Access Level**: `basic`

### ProtectedSave
```tsx
import { ProtectedSave } from '@/components/ProtectedAction';

<ProtectedSave onClick={handleSave}>
  <button>♥ Save</button>
</ProtectedSave>
```
- **Intent**: `save`
- **Access Level**: `basic`

### ProtectedContact
```tsx
import { ProtectedContact } from '@/components/ProtectedAction';

<ProtectedContact onClick={handleContact}>
  <button>Contact Artist</button>
</ProtectedContact>
```
- **Intent**: `contact`
- **Access Level**: `basic`

### ProtectedVerify
```tsx
import { ProtectedVerify } from '@/components/ProtectedAction';

<ProtectedVerify onClick={handleVerify}>
  <button>Verify Ownership</button>
</ProtectedVerify>
```
- **Intent**: `verify`
- **Access Level**: `wallet`

## Advanced Usage Examples

### Custom Access Requirements

```tsx
// Requires wallet connection
<ProtectedAction 
  intent="purchase" 
  requiresAccess="wallet"
  onClick={handleCryptoPayment}
>
  <button>Pay with Crypto</button>
</ProtectedAction>

// Requires both email and wallet
<ProtectedAction 
  intent="verify" 
  requiresAccess="hybrid"
  onClick={handlePremiumFeature}
>
  <button>Premium Feature</button>
</ProtectedAction>
```

### Wrapping Different Elements

```tsx
// Wrapping a card
<ProtectedAction intent="save" onClick={handleSave}>
  <div className="card">
    <h3>Artwork Title</h3>
    <p>Click anywhere to save</p>
  </div>
</ProtectedAction>

// Wrapping a link
<ProtectedAction intent="contact" onClick={handleContact}>
  <a href="#contact">Contact Form</a>
</ProtectedAction>

// Wrapping an image
<ProtectedAction intent="purchase" onClick={handlePurchase}>
  <img src="/artwork.jpg" alt="Click to purchase" />
</ProtectedAction>
```

### Disabled States

```tsx
<ProtectedAction 
  intent="purchase" 
  disabled={!isAvailable}
  onClick={handlePurchase}
>
  <button>
    {isAvailable ? 'Buy Now' : 'Sold Out'}
  </button>
</ProtectedAction>
```

### Custom Styling

```tsx
<ProtectedAction 
  intent="save"
  className="transform hover:scale-105 transition-transform"
  onClick={handleSave}
>
  <button>Animated Save Button</button>
</ProtectedAction>
```

## Authentication Flow

### For Guest Users (Not Authenticated)
1. User clicks protected action
2. Click is intercepted
3. AuthModal opens with intent-specific messaging
4. User completes authentication
5. Action executes automatically after auth

### For Authenticated Users
1. User clicks protected action
2. Access level is checked
3. If user has required access, action executes immediately
4. If insufficient access, AuthModal opens for upgrade

## Integration with AuthModal

The component automatically integrates with the `AuthModal` component:
- Opens modal with the specified intent
- Handles modal state management
- Executes the onClick handler after successful authentication

## Access Control Logic

```typescript
const hasRequiredAccess = () => {
  switch (requiresAccess) {
    case 'basic':
      return authState !== 'anonymous';
    case 'wallet':
      return authState === 'wallet' || authState === 'hybrid';
    case 'hybrid':
      return authState === 'hybrid';
    default:
      return authState !== 'anonymous';
  }
};
```

## Error Handling

- **Invalid Children**: Non-React elements are automatically wrapped in a button
- **Missing onClick**: Component works as auth trigger without action execution
- **Authentication Errors**: Handled by the AuthModal component
- **Access Denied**: Shows appropriate upgrade messaging

## Performance Considerations

- **Lazy Modal Loading**: AuthModal only renders when needed
- **Event Delegation**: Efficient click handling with proper event management
- **State Management**: Minimal re-renders with optimized state updates
- **Memory Management**: Proper cleanup of event listeners and timeouts

## Accessibility

- **Keyboard Navigation**: Full keyboard support for all wrapped elements
- **Screen Readers**: Proper ARIA labels and descriptions
- **Focus Management**: Maintains focus state through authentication flow
- **Color Contrast**: Supports high contrast themes and accessibility standards

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Support**: iOS Safari, Chrome Mobile, Samsung Internet
- **Graceful Degradation**: Fallback behavior for unsupported features

## Testing

### Test Pages Available
- `/test-protected-action` - Real artwork page example
- `/test-protected-demo` - Comprehensive feature showcase

### Unit Testing

```tsx
import { render, fireEvent } from '@testing-library/react';
import ProtectedAction from '@/components/ProtectedAction';

test('shows auth modal for guest users', () => {
  const onClick = jest.fn();
  const { getByText } = render(
    <ProtectedAction intent="purchase" onClick={onClick}>
      <button>Buy Now</button>
    </ProtectedAction>
  );
  
  fireEvent.click(getByText('Buy Now'));
  expect(onClick).not.toHaveBeenCalled();
  // Assert auth modal is shown
});
```

## Best Practices

1. **Use Convenience Components**: Prefer `ProtectedPurchase`, `ProtectedSave`, etc. for common actions
2. **Appropriate Intent**: Choose the intent that best matches the user's goal
3. **Access Levels**: Use the minimum required access level for each action
4. **Fallback Handling**: Always provide meaningful feedback for disabled states
5. **Performance**: Avoid wrapping large component trees unnecessarily

## Common Patterns

### E-commerce Actions
```tsx
<ProtectedPurchase onClick={addToCart}>
  <button>Add to Cart</button>
</ProtectedPurchase>

<ProtectedPurchase onClick={buyNow} requiresAccess="wallet">
  <button>Buy with Crypto</button>
</ProtectedPurchase>
```

### Social Actions
```tsx
<ProtectedSave onClick={toggleFavorite}>
  <HeartIcon />
</ProtectedSave>

<ProtectedContact onClick={openContactForm}>
  <ChatIcon />
</ProtectedContact>
```

### Verification Actions
```tsx
<ProtectedVerify onClick={verifyOwnership}>
  <button>Verify NFT</button>
</ProtectedVerify>

<ProtectedAction intent="verify" requiresAccess="hybrid" onClick={mintCertificate}>
  <button>Mint Certificate</button>
</ProtectedAction>
```

## Dependencies

- React 18+
- AuthModal component
- HybridAuthContext
- TypeScript (for type safety)

## Related Components

- `AuthModal` - The authentication modal shown for guest users
- `HybridAuthContext` - Provides authentication state and methods
- `LoginForm` - Used within AuthModal for email authentication

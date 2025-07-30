# AuthModal Component Documentation

## Overview

The `AuthModal` component is a comprehensive authentication modal designed for Dead Horse Gallery. It provides a context-aware, multi-step authentication flow that adapts its messaging and benefits based on the user's intent.

## Features

- **Context-Specific Messaging**: Tailors content based on user intent (purchase, save, contact, verify, apply)
- **Two-Step Authentication**: Email first, optional wallet connection
- **Magic.link Integration**: Secure email authentication
- **Web3 Wallet Support**: Optional wallet connection for enhanced features
- **Guest Mode**: "Continue as Guest" option with clear limitations
- **Clean Design**: Black/white aesthetic matching gallery brand
- **Responsive**: Works on all device sizes
- **Dismissible**: Easy to close with proper state management

## Usage

```tsx
import AuthModal from '@/components/AuthModal';

function MyComponent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authIntent, setAuthIntent] = useState<Intent>(null);

  const handleAction = (intent: Intent) => {
    setAuthIntent(intent);
    setIsModalOpen(true);
  };

  return (
    <>
      <button onClick={() => handleAction('purchase')}>
        Buy Artwork
      </button>
      
      <AuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        intent={authIntent}
      />
    </>
  );
}
```

## Props

### AuthModalProps

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | `boolean` | Yes | Controls modal visibility |
| `onClose` | `() => void` | Yes | Callback when modal is closed |
| `intent` | `Intent` | Yes | User's intent that triggered authentication |

### Intent Types

```typescript
type Intent = 'purchase' | 'save' | 'contact' | 'verify' | 'apply' | null;
```

#### Intent-Specific Behavior

1. **Purchase** (`'purchase'`)
   - Emphasizes secure payment processing
   - Highlights purchase history and receipts
   - Shows NFT certificate eligibility
   - Cannot proceed as guest

2. **Save** (`'save'`)
   - Focuses on building personal collections
   - Shows notification and recommendation features
   - Allows unlimited favorites
   - Cannot save as guest

3. **Contact** (`'contact'`)
   - Highlights community access
   - Shows artist communication features
   - Mentions gallery events and invitations
   - Cannot contact as guest

4. **Verify** (`'verify'`)
   - Provides direct wallet connection option
   - Emphasizes ownership verification
   - Shows holder-only benefits
   - Requires wallet connection

5. **Apply** (`'apply'`)
   - Focuses on artist application process
   - Shows portfolio submission features
   - Highlights exhibition opportunities
   - Cannot apply as guest

## Modal Steps

The modal follows a multi-step flow:

1. **Intent Step**: Shows benefits and authentication options
2. **Email Step**: Email input and Magic.link authentication
3. **Wallet Step**: Web3 wallet connection (for verify intent)
4. **Success Step**: Welcome message with account status
5. **Guest Step**: Shows limitations of guest access

## Authentication Flow

### Email Authentication
1. User enters email address
2. Magic.link sends secure login link
3. User clicks link to authenticate
4. Returns to success state

### Wallet Authentication
1. User clicks "Connect Wallet"
2. Web3 wallet connection initiated
3. User approves connection
4. Wallet linked to account

### Guest Mode
1. User selects "Continue as Guest"
2. Shows specific limitations for the intent
3. Offers option to create account instead
4. Allows proceeding with limited access

## Integration with HybridAuthContext

The modal integrates with the `HybridAuthContext` to:
- Check current authentication state
- Perform email login via Magic.link
- Connect Web3 wallets
- Handle authentication errors
- Update user state

```tsx
const { user, login, connectWallet, authState } = useHybridAuth();
```

## Styling

The component uses Tailwind CSS with a clean black/white aesthetic:
- Primary actions: Black background (`bg-black`)
- Secondary actions: White with borders
- Success states: Green accents
- Warning states: Amber accents
- Error states: Red accents

## Error Handling

The modal handles various error scenarios:
- Invalid email addresses
- Authentication failures
- Wallet connection errors
- Network issues

Errors are displayed with appropriate icons and messaging.

## Accessibility

- Keyboard navigation support
- Screen reader friendly
- Proper ARIA labels
- Focus management
- Color contrast compliance

## State Management

The modal manages its own internal state:
- Current step in the flow
- Email input value
- Loading states
- Error messages
- User authentication status

## Examples

### Basic Integration

```tsx
// In an artwork component
const handlePurchase = () => {
  if (!user) {
    setAuthIntent('purchase');
    setIsAuthModalOpen(true);
  } else {
    // Proceed with purchase
    initiatePurchase();
  }
};
```

### With Access Control

```tsx
const handleAction = (intent: Intent) => {
  const requiredAccess = intent === 'verify' ? 'wallet' : 'basic';
  
  if (!checkAccess(requiredAccess)) {
    setAuthIntent(intent);
    setIsAuthModalOpen(true);
  } else {
    executeAction(intent);
  }
};
```

## Testing

Test the modal with the demo page:
```
/test-auth-modal
```

This page provides buttons for each intent type and shows how the modal adapts its messaging accordingly.

## Dependencies

- React 18+
- Next.js 14+
- Heroicons
- Tailwind CSS
- HybridAuthContext
- Magic.link SDK

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Lazy loading of wallet connection libraries
- Minimal re-renders with proper state management
- Optimized for Core Web Vitals
- Fast modal open/close animations

## Security

- CSRF protection via auth-utils
- Rate limiting for authentication attempts
- Secure email authentication via Magic.link
- Wallet connection validation
- No sensitive data stored in component state

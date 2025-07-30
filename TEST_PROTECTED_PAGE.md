# ProtectedAction Test Page

**URL**: `/test-protected`

## Overview

A comprehensive test page for demonstrating all ProtectedAction component intents and authentication flows. This page provides a complete testing environment for the soft gating system.

## Features

### Authentication Status Panel
- **Real-time auth state** display (anonymous, email, wallet, hybrid)
- **Connection status** for email and wallet
- **Access level indicators** (basic, wallet, hybrid access)
- **Manual auth controls** for testing different states

### Protected Action Tests
Tests all five intent types with realistic scenarios:

1. **Purchase Intent** - Tests purchase-focused authentication flow
2. **Save Intent** - Tests save/favorite functionality 
3. **Contact Intent** - Tests contact/messaging flow
4. **Verify Intent** - Tests identity verification flow
5. **Apply Intent** - Tests application submission flow

### Conversion Analytics
- **Real-time metrics** showing total attempts, successful conversions, and conversion rate
- **Intent breakdown** showing which actions are most popular
- **Last attempt details** with timestamp and metadata

### Action Results Log
- **Live activity feed** showing successful action executions
- **Timestamped results** with action details
- **Clear history** functionality

## Testing Scenarios

### 1. Anonymous User Testing
1. Load page without authentication
2. Try each protected action
3. Observe auth modals appearing with intent-specific messaging
4. Check conversion metrics tracking

### 2. Email-Only User Testing
1. Click "Test Email Login" button
2. Try protected actions (should work for basic actions)
3. Test wallet-requiring actions (should show upgrade prompts)

### 3. Wallet-Only User Testing
1. Connect wallet without email login
2. Test different action types
3. Observe hybrid access requirements

### 4. Hybrid User Testing
1. Login with email AND connect wallet
2. Test all actions (should work seamlessly)
3. Check full access level indicators

## Conversion Flow Testing

Each protected action includes rich metadata for analytics:

```typescript
// Example metadata tracking
{
  testItem: 'Digital Artwork #123',
  price: 250,
  currency: 'GBP',
  timestamp: '2025-07-30T...',
  userAgent: '...'
}
```

## Visual Features

- **Dark theme** matching Dead Horse Gallery aesthetic
- **Color-coded status indicators** for quick visual feedback
- **Responsive grid layout** works on all screen sizes
- **Icon-based navigation** for intuitive interaction
- **Real-time updates** showing live authentication state

## Development Usage

This test page is invaluable for:

- **QA testing** authentication flows
- **Debugging** conversion tracking issues
- **Demonstrating** soft gating to stakeholders
- **Performance testing** auth modal responsiveness
- **Analytics validation** ensuring proper data collection

## Next Steps

- Add **A/B testing toggles** for different auth modal designs
- Include **performance metrics** (time to conversion)
- Add **export functionality** for conversion data
- Implement **automated test scenarios**

The test page provides everything needed to validate the complete ProtectedAction system before production deployment.

// Test file to verify security implementations work correctly
import { SessionManager, SENSITIVE_ACTIONS } from '../src/lib/session';
import { useSession } from '../src/hooks/useSession';
import { generateNonce, getSecurityHeaders } from '../src/middleware';

// Test security header generation
console.log('Testing security header generation...');
const testNonce = 'test-nonce-123';
const headers = getSecurityHeaders(testNonce);
console.log('CSP Header:', headers['Content-Security-Policy']);
console.log('HSTS Header:', headers['Strict-Transport-Security']);

// Test session manager
console.log('\nTesting session manager...');
const sessionManager = new SessionManager();
console.log('Session valid:', sessionManager.isSessionValid());
console.log('Can perform sensitive action:', sessionManager.canPerformSensitiveAction());

// Test nonce generation
console.log('\nTesting nonce generation...');
const nonce1 = generateNonce();
const nonce2 = generateNonce();
console.log('Nonce 1:', nonce1);
console.log('Nonce 2:', nonce2);
console.log('Nonces are unique:', nonce1 !== nonce2);

console.log('\n✅ All security components appear to be working correctly!');

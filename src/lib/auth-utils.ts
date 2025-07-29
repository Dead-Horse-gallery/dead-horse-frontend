import { AuthError } from '../types/auth';

const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_TIMEOUT = 15 * 60 * 1000; // 15 minutes

interface LoginAttempt {
  count: number;
  firstAttempt: number;
  locked: boolean;
}

const loginAttempts = new Map<string, LoginAttempt>();

export function checkLoginAttempts(email: string): AuthError | null {
  const now = Date.now();
  const attempt = loginAttempts.get(email) || { count: 0, firstAttempt: now, locked: false };

  // Reset attempts if timeout has passed
  if (now - attempt.firstAttempt > LOGIN_TIMEOUT) {
    loginAttempts.set(email, { count: 0, firstAttempt: now, locked: false });
    return null;
  }

  // Check if account is locked
  if (attempt.locked) {
    const remainingTime = Math.ceil((LOGIN_TIMEOUT - (now - attempt.firstAttempt)) / 60000);
    return {
      code: 'LOGIN_ERROR',
      message: `Too many login attempts. Please try again in ${remainingTime} minutes.`
    };
  }

  // Increment attempt count
  attempt.count++;
  
  // Lock account if max attempts reached
  if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
    attempt.locked = true;
    loginAttempts.set(email, attempt);
    return {
      code: 'LOGIN_ERROR',
      message: 'Too many login attempts. Please try again in 15 minutes.'
    };
  }

  loginAttempts.set(email, attempt);
  return null;
}

export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function storeCSRFToken(token: string): void {
  sessionStorage.setItem('csrf_token', token);
}

export function validateCSRFToken(token: string): boolean {
  const storedToken = sessionStorage.getItem('csrf_token');
  if (!storedToken || storedToken !== token) {
    return false;
  }
  sessionStorage.removeItem('csrf_token');
  return true;
}

export function clearLoginAttempts(email: string): void {
  loginAttempts.delete(email);
}

export const SESSION_DURATION = 3600000; // 1 hour in milliseconds

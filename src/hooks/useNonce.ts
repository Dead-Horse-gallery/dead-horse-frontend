import { headers } from 'next/headers';
import { logger } from '@/lib/logger';

/**
 * Hook to get the current request's CSP nonce
 * This can be used in server components to access the nonce for inline scripts
 */
export async function useNonce(): Promise<string | null> {
  try {
    // This works in server components during the request
    const headersList = await headers();
    return headersList.get('x-nonce') || null;
  } catch (error) {
    // This will fail on client-side or outside of request context
    logger.debug('Nonce not available in current context:', error);
    return null;
  }
}

/**
 * Get nonce for use in server actions or API routes
 */
export function getNonceFromRequest(request: Request): string | null {
  try {
    return request.headers.get('x-nonce') || null;
  } catch (error) {
    logger.debug('Could not extract nonce from request:', error);
    return null;
  }
}

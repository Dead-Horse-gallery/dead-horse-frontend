import { Magic } from 'magic-sdk';

// Initialize Magic only on the client side
export const createMagic = () => {
  return typeof window !== 'undefined'
    ? new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY!)
    : null;
};

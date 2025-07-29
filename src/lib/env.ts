import { z } from 'zod';

const envSchema = z.object({
  // Application Configuration
  NEXT_PUBLIC_APP_URL: z.string().url(),

  // Magic.link Configuration
  NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY: z.string().min(1),
  MAGIC_SECRET_KEY: z.string().min(1),

  // Stripe Configuration
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().regex(/^pk_(test|live)_/, { message: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must start with 'pk_test_' or 'pk_live_'" }),
  STRIPE_SECRET_KEY: z.string().regex(/^sk_(test|live)_/, { message: "STRIPE_SECRET_KEY must start with 'sk_test_' or 'sk_live_'" }),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),

  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_KEY: z.string().min(1),
});

/**
 * This ensures your environment variables are properly typed and present at runtime.
 * Prevents runtime errors from missing or invalid environment variables.
 */
const getEnvVariables = () => {
  try {
    return envSchema.parse({
      // Application Configuration
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,

      // Magic.link
      NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY,
      MAGIC_SECRET_KEY: process.env.MAGIC_SECRET_KEY,

      // Stripe
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,

      // Supabase
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .map(err => err.path.join('.'))
        .join(', ');
      throw new Error(
        `❌ Invalid environment variables: ${missingVars}\n` +
        'Please check your .env.local file.\n' +
        'See .env.local.example for required variables.'
      );
    }
    throw error;
  }
};

export const env = getEnvVariables();

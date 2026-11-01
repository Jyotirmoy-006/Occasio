/**
 * Environment variable validation using Zod.
 * Fails fast at boot if configuration is invalid.
 */
import { z } from 'zod';

const nodeEnvEnum = z.enum(['development', 'test', 'production']);

const envSchema = z.object({
  GEMINI_API_KEY: z
    .string()
    .optional()
    .transform((s) => (s && s.trim().length >= 5 ? s.trim() : undefined)),
  NODE_ENV: nodeEnvEnum.default('development'),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(60),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('Invalid environment variables:', _env.error.flatten());
  // In test environment, don't necessarily exit
  if (process.env.NODE_ENV !== 'test') {
    process.exit(1);
  }
}

function parseNodeEnv(val?: string): 'development' | 'test' | 'production' {
  if (val === 'production' || val === 'test') return val;
  return 'development';
}

export const env = _env.success
  ? _env.data
  : {
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      NODE_ENV: parseNodeEnv(process.env.NODE_ENV),
      RATE_LIMIT_MAX: 60,
      RATE_LIMIT_WINDOW_MS: 60000,
    };

export const IS_DEMO_MODE = !env.GEMINI_API_KEY;

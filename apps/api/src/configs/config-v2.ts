import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  PORT: z
    .string()
    .default('3000')
    .transform((val) => Number(val)),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),

  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:')
  console.error(parsed.error.format())
  process.exit(1)
}

export const config = parsed.data

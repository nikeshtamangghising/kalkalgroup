import { z } from 'zod';

/**
 * Environment variable validation schema
 * This ensures all required environment variables are present and valid at startup
 */
const envSchema = z.object({
    // Database
    DATABASE_URL: z.string().url().min(1, 'DATABASE_URL is required'),

    // Supabase (optional - for client-side SDK usage)
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),

    // NextAuth
    NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
    NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),

    // Payment Gateways (optional in development)
    ESEWA_MERCHANT_ID: z.string().optional(),
    ESEWA_SECRET_KEY: z.string().optional(),
    ESEWA_BASE_URL: z.string().url().optional(),

    KHALTI_PUBLIC_KEY: z.string().optional(),
    KHALTI_SECRET_KEY: z.string().optional(),
    KHALTI_BASE_URL: z.string().url().optional(),

    // Payment URLs
    PAYMENT_SUCCESS_URL: z.string().url().optional(),
    PAYMENT_FAILURE_URL: z.string().url().optional(),

    // Email
    RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required'),

    // Cloudinary (optional)
    CLOUDINARY_URL: z.string().optional(),
    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),

    // Node environment
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

/**
 * Validated environment variables
 * Use this instead of process.env for type-safe access
 */
export const env = envSchema.parse(process.env);

/**
 * Type-safe environment variable access
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Validate environment variables
 * Call this at application startup to fail fast if configuration is invalid
 */
export function validateEnv(): void {
    try {
        envSchema.parse(process.env);
        console.log('✅ Environment variables validated successfully');
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('❌ Invalid environment variables:');
            error.errors.forEach((err) => {
                console.error(`  - ${err.path.join('.')}: ${err.message}`);
            });
            process.exit(1);
        }
        throw error;
    }
}

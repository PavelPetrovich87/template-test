import dotenv from 'dotenv'

dotenv.config()

interface EnvConfig {
  PORT: number
  NODE_ENV: string
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string
  SUPABASE_JWT_SECRET: string
  CORS_ORIGIN: string
}

const getEnvVar = (key: string, defaultValue: string | undefined, required: boolean): string => {
  const value = process.env[key]
  if (!value && !defaultValue && required) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  if (value) {
    return value
  }
  if (defaultValue !== undefined) {
    return defaultValue
  }
  return ''
}

export const env: EnvConfig = {
  PORT: parseInt(getEnvVar('PORT', '3000', false), 10),
  NODE_ENV: getEnvVar('NODE_ENV', 'development', false),
  SUPABASE_URL: getEnvVar('SUPABASE_URL', '', false),
  SUPABASE_ANON_KEY: getEnvVar('SUPABASE_ANON_KEY', '', false),
  SUPABASE_SERVICE_ROLE_KEY: getEnvVar('SUPABASE_SERVICE_ROLE_KEY', '', false),
  SUPABASE_JWT_SECRET: getEnvVar('SUPABASE_JWT_SECRET', undefined, true),
  CORS_ORIGIN: getEnvVar('CORS_ORIGIN', '*', false)
}

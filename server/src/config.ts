import 'dotenv/config'

export const config = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/matsya-sathi',
  jwtSecret: process.env.JWT_SECRET || 'local-development-only-secret',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  seaProviderKey: process.env.SEA_PROVIDER_API_KEY || '',
}

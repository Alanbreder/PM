import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/product_os',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID || 'product-os',
  allowDevMockAuth: process.env.ALLOW_DEV_MOCK_AUTH === 'true',
  nodeEnv: process.env.NODE_ENV || 'development',
};

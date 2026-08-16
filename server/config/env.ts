import dotenv from 'dotenv';
dotenv.config();

const isTest = process.env.NODE_ENV === 'test';
const isProd = process.env.NODE_ENV === 'production';

let databaseUrl = process.env.DATABASE_URL || '';
if (!databaseUrl && isTest) {
  databaseUrl = 'postgresql://postgres:postgres@localhost:5432/product_os_test';
}

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  databaseUrl,
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID || 'product-os',
  allowDevMockAuth: process.env.ALLOW_DEV_MOCK_AUTH === 'true',
  nodeEnv: process.env.NODE_ENV || 'development',
};

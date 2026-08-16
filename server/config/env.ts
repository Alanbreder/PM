import dotenv from 'dotenv';
dotenv.config();

const isTest = process.env.NODE_ENV === 'test';
const isProd = process.env.NODE_ENV === 'production';

let databaseUrl = process.env.DATABASE_URL || '';
if (!databaseUrl && isTest) {
  databaseUrl = 'postgresql://postgres:postgres@localhost:5432/product_os_test';
}

if (isProd && !databaseUrl) {
  throw new Error('FATAL: DATABASE_URL must be defined in production environment');
}

const firebaseProjectId = process.env.FIREBASE_PROJECT_ID || (isTest ? 'product-os-test' : (isProd ? '' : 'product-os'));
if (isProd && !firebaseProjectId) {
  throw new Error('FATAL: FIREBASE_PROJECT_ID must be defined in production environment');
}

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  databaseUrl,
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  firebaseProjectId: firebaseProjectId || 'product-os',
  allowDevMockAuth: isTest && process.env.ALLOW_DEV_MOCK_AUTH === 'true',
  nodeEnv: process.env.NODE_ENV || 'development',
};

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

const isDev = (process.env.NODE_ENV || 'development') === 'development';
const allowDevAdmin = isDev && process.env.ALLOW_DEV_ADMIN === 'true';

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  databaseUrl,
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  firebaseProjectId: firebaseProjectId || 'product-os',
  allowDevMockAuth: isTest && process.env.ALLOW_DEV_MOCK_AUTH === 'true',
  allowDevAdmin,
  devAdminUid: process.env.DEV_ADMIN_UID || 'dev_admin_local_uid',
  devAdminEmail: process.env.DEV_ADMIN_EMAIL || 'dev-admin@local.test',
  devAdminKey: process.env.DEV_ADMIN_KEY || 'dev-admin-secret-local-key',
  nodeEnv: process.env.NODE_ENV || 'development',
};

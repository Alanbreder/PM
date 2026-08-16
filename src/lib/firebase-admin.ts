import admin from 'firebase-admin';

const isProd = process.env.NODE_ENV === 'production';
const projectId = process.env.FIREBASE_PROJECT_ID;

if (isProd && !projectId) {
  throw new Error('FATAL: FIREBASE_PROJECT_ID environment variable is required in production');
}

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: projectId || 'product-os',
  });
}

export const adminAuth = admin.auth();

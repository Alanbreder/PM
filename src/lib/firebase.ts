import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDummyKeyForPreviewModeOnly12345",
  authDomain: `${process.env.FIREBASE_PROJECT_ID || 'product-os'}.firebaseapp.com`,
  projectId: process.env.FIREBASE_PROJECT_ID || 'product-os',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

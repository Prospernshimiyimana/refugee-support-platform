import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyB5Eu9TuzuMnLK3eETiIpg25YsqY5vAklU",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "refugee-support-platform.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "refugee-support-platform",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "refugee-support-platform.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "675063532707",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:675063532707:web:feb328c00ba3ef5adb0316",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-BJ9Q93T82C"
};

// Validate required Firebase config
const requiredConfigVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
];

const missingConfigVars = requiredConfigVars.filter(varName => !process.env[varName]);

if (missingConfigVars.length > 0 && process.env.NODE_ENV === 'production') {
  console.error('Missing required Firebase environment variables:', missingConfigVars);
  throw new Error(`Missing Firebase configuration: ${missingConfigVars.join(', ')}`);
}

// Initialize Firebase
console.log('🔥 Firebase: Initializing Firebase app...');
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
console.log('🔥 Firebase: Firebase app initialized successfully');
export const auth = getAuth(app);
console.log('🔥 Firebase: Auth instance created');

// Configure auth persistence
import { browserLocalPersistence } from 'firebase/auth';
console.log('🔥 Firebase: Setting auth persistence to browserLocalPersistence');
auth.setPersistence(browserLocalPersistence).then(() => {
  console.log('🔥 Firebase: Auth persistence set successfully');
}).catch((error) => {
  console.error('🔥 Firebase: Failed to set auth persistence:', error);
});

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Analytics only in browser environment
let analytics = null;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Analytics initialization failed:', error);
  }
}

export default app;
export { analytics };

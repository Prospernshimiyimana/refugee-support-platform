import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, browserLocalPersistence } from 'firebase/auth';
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

// Log warnings for missing environment variables instead of throwing errors
if (missingConfigVars.length > 0) {
  console.warn('🔥 Firebase Warning: Missing environment variables:', missingConfigVars);
  console.warn('🔥 Firebase: Using fallback values for development');
  
  if (process.env.NODE_ENV === 'production') {
    console.warn('🔥 Firebase Production: Some features may not work correctly without proper environment variables');
    console.warn('🔥 Firebase: Please set these variables in your Vercel dashboard:', missingConfigVars.join(', '));
  }
}

// Only initialize Firebase if we have the minimum required configuration
const hasMinimumConfig = process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
                        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && 
                        process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

let firebaseApp: ReturnType<typeof initializeApp> | null = null;

if (hasMinimumConfig) {
  try {
    console.log('🔥 Firebase: Initializing Firebase app...');
    firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    console.log('🔥 Firebase: Firebase app initialized successfully');
  } catch (error) {
    console.error('🔥 Firebase: Failed to initialize Firebase:', error);
    console.warn('🔥 Firebase: App will run in limited mode without Firebase functionality');
  }
} else {
  console.warn('🔥 Firebase: Skipping initialization - missing required configuration');
  console.warn('🔥 Firebase: App will run in demo mode without Firebase functionality');
}

// Export Firebase instances (null if initialization failed)
export const app = firebaseApp;
export const auth = firebaseApp ? getAuth(firebaseApp) : null;
export const db = firebaseApp ? getFirestore(firebaseApp) : null;

if (firebaseApp) {
  console.log('🔥 Firebase: Auth instance created');
  console.log('🔥 Firebase: Firestore instance created');
  
  // Configure auth persistence only in browser environment
  if (typeof window !== 'undefined') {
    console.log('🔥 Firebase: Setting auth persistence to browserLocalPersistence');
    auth!.setPersistence(browserLocalPersistence).then(() => {
      console.log('🔥 Firebase: Auth persistence set successfully');
    }).catch((error: unknown) => {
      console.error('🔥 Firebase: Failed to set auth persistence:', error);
    });
  }
}

// Initialize Analytics only in browser environment
let analytics = null;
if (typeof window !== 'undefined' && firebaseApp) {
  try {
    analytics = getAnalytics(firebaseApp);
  } catch (error) {
    console.warn('Analytics initialization failed:', error);
  }
}

export default app;
export { analytics };

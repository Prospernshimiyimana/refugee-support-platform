/**
 * Robust Authentication Service
 * Ensures Firestore user documents are always created and maintained
 * Uses Firebase modular SDK (v9+) with proper TypeScript safety
 */

import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  Unsubscribe
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { userDocumentManager } from './userDocumentManager';

// Enhanced User Document interface with timestamps
export interface EnhancedUserDocument {
  uid: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  lastLoginAt?: Timestamp;
}

// Auth Result interface
export interface AuthResult {
  success: boolean;
  user?: User;
  userDoc?: EnhancedUserDocument;
  error?: string;
}

/**
 * Sign up a new user with automatic Firestore document creation
 * @param email User's email address
 * @param password User's password (minimum 6 characters)
 * @returns Promise<AuthResult> with success status, user data, user document, or error message
 */
export async function signUp(email: string, password: string): Promise<AuthResult> {
  console.log('🔐 RobustAuth: Starting signup process for email:', email);
  
  try {
    // Input validation
    if (!email || !password) {
      return {
        success: false,
        error: 'Email and password are required'
      };
    }

    if (password.length < 6) {
      return {
        success: false,
        error: 'Password must be at least 6 characters long'
      };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        success: false,
        error: 'Please enter a valid email address'
      };
    }

    console.log('🔐 RobustAuth: Creating Firebase auth user...');
    
    // Create Firebase auth user
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );
    
    console.log('🔐 RobustAuth: Firebase auth user created! UID:', userCredential.user.uid);
    
    // Create enhanced user document in Firestore
    const userDoc = await createEnhancedUserDocument(userCredential.user);
    
    if (!userDoc) {
      console.error('🔐 RobustAuth: Failed to create user document after successful auth');
      // Don't fail auth - user can still be created, document can be created later
      return {
        success: true,
        user: userCredential.user
      };
    }

    console.log('🔐 RobustAuth: User document created successfully');
    
    return {
      success: true,
      user: userCredential.user,
      userDoc
    };
    
  } catch (error: unknown) {
    console.error('🔐 RobustAuth: Signup error:', error);
    
    let errorMessage = 'An error occurred during sign up';
    
    if (error && typeof error === 'object' && 'code' in error) {
      const errorCode = (error as { code: string }).code;
      
      switch (errorCode) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered. Please sign in instead.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please choose a stronger password (at least 6 characters).';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Please try again later.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password sign-up is not enabled. Please contact support.';
          break;
        default:
          errorMessage = `Sign up error: ${errorCode}. Please try again or contact support.`;
      }
    }

    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Log in an existing user with automatic Firestore document verification/creation
 * @param email User's email address
 * @param password User's password
 * @returns Promise<AuthResult> with success status, user data, user document, or error message
 */
export async function login(email: string, password: string): Promise<AuthResult> {
  console.log('🔐 RobustAuth: Starting login process for email:', email);
  
  try {
    // Input validation
    if (!email || !password) {
      return {
        success: false,
        error: 'Email and password are required'
      };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        success: false,
        error: 'Please enter a valid email address'
      };
    }

    if (password.length < 1) {
      return {
        success: false,
        error: 'Password cannot be empty'
      };
    }

    console.log('🔐 RobustAuth: Authenticating user...');
    
    // Authenticate user
    const userCredential: UserCredential = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );
    
    console.log('🔐 RobustAuth: Login successful! UID:', userCredential.user.uid);

    // Ensure user document exists (self-healing)
    const userDoc = await ensureUserDocumentOnLogin(userCredential.user);
    
    if (!userDoc) {
      console.error('🔐 RobustAuth: Failed to ensure user document after login');
      // Don't fail login - user is authenticated, document issues can be handled separately
      return {
        success: true,
        user: userCredential.user
      };
    }

    console.log('🔐 RobustAuth: User document verified/created successfully');

    return {
      success: true,
      user: userCredential.user,
      userDoc
    };
    
  } catch (error: unknown) {
    console.error('🔐 RobustAuth: Login error:', error);
    
    let errorMessage = 'An error occurred during login';
    
    if (error && typeof error === 'object' && 'code' in error) {
      const errorCode = (error as { code: string }).code;
      
      switch (errorCode) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email. Please sign up first.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password sign-in is not enabled. Please contact support.';
          break;
        default:
          errorMessage = `Login error: ${errorCode}. Please try again or contact support.`;
      }
    }

    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Log out the current user
 * @returns Promise<AuthResult> with success status or error message
 */
export async function logout(): Promise<AuthResult> {
  try {
    await signOut(auth);
    
    return {
      success: true
    };
  } catch (error: unknown) {
    let errorMessage = 'An error occurred during logout';
    
    if (error && typeof error === 'object' && 'code' in error) {
      const errorCode = (error as { code: string }).code;
      switch (errorCode) {
        case 'auth/network-request-failed':
          errorMessage = 'Network error during logout';
          break;
        default:
          errorMessage = `Logout error: ${errorCode}`;
      }
    }

    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Get the currently authenticated user
 * @returns User | null - Current user or null if not authenticated
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/**
 * Create enhanced user document with timestamps
 * @param user Firebase auth user
 * @returns Promise<EnhancedUserDocument | null>
 */
async function createEnhancedUserDocument(user: User): Promise<EnhancedUserDocument | null> {
  try {
    console.log('🔐 RobustAuth: Creating enhanced user document for UID:', user.uid);
    
    const userRef = doc(db, 'users', user.uid);
    const now = serverTimestamp();
    
    const userDoc: EnhancedUserDocument = {
      uid: user.uid,
      email: user.email || '',
      role: 'user', // Default role
      createdAt: now as Timestamp,
      updatedAt: now as Timestamp,
      lastLoginAt: now as Timestamp
    };
    
    await setDoc(userRef, userDoc);
    console.log('🔐 RobustAuth: Enhanced user document created successfully');
    
    return userDoc;
  } catch (error) {
    console.error('🔐 RobustAuth: Error creating enhanced user document:', error);
    return null;
  }
}

/**
 * Ensure user document exists on login (self-healing)
 * @param user Firebase auth user
 * @returns Promise<EnhancedUserDocument | null>
 */
async function ensureUserDocumentOnLogin(user: User): Promise<EnhancedUserDocument | null> {
  try {
    console.log('🔐 RobustAuth: Ensuring user document exists for UID:', user.uid);
    
    // Use userDocumentManager to ensure document exists
    const result = await userDocumentManager.ensureUserDocument(user.uid, user.email || '');
    
    if (!result.success || !result.userDoc) {
      console.error('🔐 RobustAuth: UserDocumentManager failed to ensure document');
      return null;
    }
    
    // Update last login timestamp
    await updateLastLogin(user.uid);
    
    // Convert to enhanced format
    const enhancedDoc: EnhancedUserDocument = {
      ...result.userDoc,
      createdAt: result.userDoc.createdAt || serverTimestamp() as Timestamp,
      lastLoginAt: serverTimestamp() as Timestamp
    };
    
    console.log('🔐 RobustAuth: User document ensured and updated for UID:', user.uid);
    return enhancedDoc;
    
  } catch (error) {
    console.error('🔐 RobustAuth: Error ensuring user document on login:', error);
    return null;
  }
}

/**
 * Update user's last login timestamp
 * @param uid User ID
 */
async function updateLastLogin(uid: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    console.log('🔐 RobustAuth: Last login updated for UID:', uid);
  } catch (error) {
    console.error('🔐 RobustAuth: Error updating last login:', error);
    // Don't throw - this is not critical
  }
}

/**
 * Enhanced auth state listener with automatic user document management
 * @param callback Function to call when auth state changes
 * @returns Unsubscribe function to stop listening
 */
export function onAuthStateChanged(callback: (user: User | null, userDoc?: EnhancedUserDocument | null) => void): Unsubscribe {
  console.log('🔐 RobustAuth: Setting up enhanced auth state listener');
  
  const unsubscribe = firebaseOnAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log('🔐 RobustAuth: User authenticated - UID:', user.uid);
      
      // Ensure user document exists (self-healing for existing users)
      try {
        const userDoc = await ensureUserDocumentOnLogin(user);
        callback(user, userDoc);
      } catch (error) {
        console.error('🔐 RobustAuth: Error in auth state listener:', error);
        callback(user, null); // Still call callback with user but no doc
      }
    } else {
      console.log('🔐 RobustAuth: No user authenticated');
      callback(null, null);
    }
  });
  
  console.log('🔐 RobustAuth: Enhanced auth state listener set up successfully');
  return unsubscribe;
}

/**
 * Get current user document with automatic creation if missing
 * @returns Promise<EnhancedUserDocument | null>
 */
export async function getCurrentUserDocument(): Promise<EnhancedUserDocument | null> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    console.log('🔐 RobustAuth: No authenticated user');
    return null;
  }

  return ensureUserDocumentOnLogin(currentUser);
}

/**
 * Check if current user is admin
 * @returns Promise<boolean>
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const userDoc = await getCurrentUserDocument();
  return userDoc?.role === 'admin';
}

/**
 * Update user role (admin only function)
 * @param uid User ID to update
 * @param role New role
 * @returns Promise<{ success: boolean; error?: string }>
 */
export async function updateUserRole(uid: string, role: 'admin' | 'user'): Promise<{ success: boolean; error?: string }> {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      role,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    console.log(`🔐 RobustAuth: User role updated successfully for UID: ${uid} to: ${role}`);
    return { success: true };
  } catch (error) {
    console.error(`🔐 RobustAuth: Error updating user role for UID: ${uid}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

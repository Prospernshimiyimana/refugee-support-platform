import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
  onAuthStateChanged as firebaseOnAuthStateChanged
} from 'firebase/auth';
import { auth } from './firebase';
import { createUserDocument } from './userService';

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

/**
 * Sign up a new user with email and password
 * @param email User's email address
 * @param password User's password (minimum 6 characters)
 * @returns Promise<AuthResult> with success status, user data, or error message
 */
export async function signUp(email: string, password: string): Promise<AuthResult> {
  console.log('🔐 Auth: Starting signup process for email:', email);
  console.log('🔐 Auth: Password length:', password.length);
  
  try {
    // Input validation
    if (!email || !password) {
      console.log('🔐 Auth: Signup failed - missing email or password');
      return {
        success: false,
        error: 'Email and password are required'
      };
    }

    if (password.length < 6) {
      console.log('🔐 Auth: Signup failed - password too short');
      return {
        success: false,
        error: 'Password must be at least 6 characters long'
      };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.log('🔐 Auth: Signup failed - invalid email format');
      return {
        success: false,
        error: 'Please enter a valid email address'
      };
    }

    console.log('🔐 Auth: Calling createUserWithEmailAndPassword...');
    console.log('🔐 Auth: Firebase auth instance:', auth ? 'Available' : 'Not available');
    
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );
    
    console.log('🔐 Auth: User created successfully! UID:', userCredential.user.uid);
    
    // Create user document in Firestore - this is required for permissions
    console.log('🔐 Auth: Creating user document in Firestore...');
    await createUserDocument({
      uid: userCredential.user.uid,
      email: userCredential.user.email || email
    });
    console.log('🔐 Auth: User document created successfully');

    return {
      success: true,
      user: userCredential.user
    };
  } catch (error: unknown) {
    console.error('🔐 Auth: Signup error:', error);
    
    let errorMessage = 'An error occurred during sign up';
    
    if (error && typeof error === 'object' && 'code' in error) {
      const errorCode = (error as { code: string }).code;
      console.error('🔐 Auth: Firebase error code:', errorCode);
      
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
        case 'permission-denied':
        case 'FirebaseError: Missing or insufficient permissions.':
          errorMessage = 'Failed to create user account due to permission issues. Please contact support.';
          break;
        default:
          errorMessage = `Sign up error: ${errorCode}. Please try again or contact support.`;
      }
    } else if (error instanceof Error) {
      console.error('🔐 Auth: Error message:', error.message);
      if (error.message.includes('permission-denied') || error.message.includes('Missing or insufficient permissions')) {
        errorMessage = 'Failed to create user account due to permission issues. Please contact support.';
      } else {
        errorMessage = `Sign up error: ${error.message}. Please try again.`;
      }
    } else {
      console.error('🔐 Auth: Unknown error type:', typeof error);
      errorMessage = 'An unexpected error occurred during sign up. Please try again.';
    }

    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Log in an existing user with email and password
 * @param email User's email address
 * @param password User's password
 * @returns Promise<AuthResult> with success status, user data, or error message
 */
export async function login(email: string, password: string): Promise<AuthResult> {
  console.log('🔐 Auth: Starting login process for email:', email);
  console.log('🔐 Auth: Password length:', password.length);
  
  try {
    // Input validation
    if (!email || !password) {
      console.log('🔐 Auth: Login failed - missing email or password');
      return {
        success: false,
        error: 'Email and password are required'
      };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.log('🔐 Auth: Login failed - invalid email format');
      return {
        success: false,
        error: 'Please enter a valid email address'
      };
    }

    if (password.length < 1) {
      console.log('🔐 Auth: Login failed - empty password');
      return {
        success: false,
        error: 'Password cannot be empty'
      };
    }

    console.log('🔐 Auth: Calling signInWithEmailAndPassword...');
    console.log('🔐 Auth: Firebase auth instance:', auth ? 'Available' : 'Not available');
    
    const userCredential: UserCredential = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );
    
    console.log('🔐 Auth: Login successful! User ID:', userCredential.user.uid);
    console.log('🔐 Auth: User email:', userCredential.user.email);
    console.log('🔐 Auth: User email verified:', userCredential.user.emailVerified);

    // Ensure user document exists for existing users
    try {
      console.log('🔐 Auth: Ensuring user document exists...');
      await createUserDocument({
        uid: userCredential.user.uid,
        email: userCredential.user.email || email
      });
      console.log('🔐 Auth: User document ensured successfully');
    } catch (firestoreError) {
      console.error('🔐 Auth: Warning - Failed to ensure user document:', firestoreError);
      // Don't fail login - user can still log in, document creation will be retried on next operation
    }

    return {
      success: true,
      user: userCredential.user
    };
  } catch (error: unknown) {
    console.error('🔐 Auth: Login error:', error);
    
    let errorMessage = 'An error occurred during login';
    
    if (error && typeof error === 'object' && 'code' in error) {
      const errorCode = (error as { code: string }).code;
      console.error('🔐 Auth: Firebase error code:', errorCode);
      
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
    } else {
      console.error('🔐 Auth: Unknown error type:', typeof error);
      errorMessage = 'An unexpected error occurred. Please try again.';
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
 * Create a test user for development purposes
 * @param email Test email address
 * @param password Test password
 * @returns Promise<AuthResult> with success status, user data, or error message
 */
export async function createTestUser(email: string, password: string): Promise<AuthResult> {
  console.log('🔐 Auth: Creating test user for email:', email);
  return signUp(email, password);
}

/**
 * Listen to authentication state changes
 * @param callback Function to call when auth state changes
 * @returns Unsubscribe function to stop listening
 */
export function onAuthStateChanged(callback: (user: User | null) => void) {
  console.log('🔐 Auth: Setting up onAuthStateChanged listener');
  
  const unsubscribe = firebaseOnAuthStateChanged(auth, (user: User | null) => {
    if (user) {
      console.log('🔐 Auth: User is signed in - UID:', user.uid);
      console.log('🔐 Auth: User email:', user.email);
      console.log('🔐 Auth: User email verified:', user.emailVerified);
      console.log('🔐 Auth: User display name:', user.displayName);
    } else {
      console.log('🔐 Auth: No user is signed in');
    }
    
    callback(user);
  });
  
  console.log('🔐 Auth: onAuthStateChanged listener set up successfully');
  return unsubscribe;
}

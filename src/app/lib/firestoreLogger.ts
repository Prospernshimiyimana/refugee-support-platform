import { getAuth } from 'firebase/auth';
import { doc, getDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';

// Comprehensive Firestore logging system
export class FirestoreLogger {
  private static instance: FirestoreLogger;
  private auth = getAuth();

  static getInstance(): FirestoreLogger {
    if (!FirestoreLogger.instance) {
      FirestoreLogger.instance = new FirestoreLogger();
    }
    return FirestoreLogger.instance;
  }

  // Log authentication state before any Firestore operation
  logAuthState(operation: string, collection: string) {
    const currentUser = this.auth.currentUser;
    console.log(`🔥 FirestoreLogger [${operation}] - Auth State:`, {
      operation,
      collection,
      isAuthenticated: !!currentUser,
      uid: currentUser?.uid || 'none',
      email: currentUser?.email || 'none',
      isEmailVerified: currentUser?.emailVerified || false,
      timestamp: new Date().toISOString()
    });

    if (!currentUser) {
      console.warn(`🔥 FirestoreLogger [${operation}] - No authenticated user found for ${collection} operation`);
    }
  }

  // Log user document existence check
  async logUserDocumentCheck(uid: string) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      console.log(`🔥 FirestoreLogger - User Document Check:`, {
        uid,
        exists: userDoc.exists(),
        data: userDoc.exists() ? userDoc.data() : null,
        timestamp: new Date().toISOString()
      });

      if (!userDoc.exists()) {
        console.warn(`🔥 FirestoreLogger - User document does not exist for UID: ${uid}`);
      }

      return userDoc.exists();
    } catch (error) {
      console.error(`🔥 FirestoreLogger - Error checking user document:`, error);
      return false;
    }
  }

  // Log permission test before actual operation
  async testPermission(collection: string, operation: 'read' | 'list' | 'write' | 'create' | 'update' | 'delete'): Promise<boolean> {
    console.log(`🔥 FirestoreLogger - Testing ${operation} permission on ${collection}`);
    
    try {
      switch (operation) {
        case 'list':
          const listQuery = query(collection(db, collection), limit(1));
          await getDocs(listQuery);
          break;
        case 'read':
          // Try to read first document
          const readQuery = query(collection(db, collection), limit(1));
          const readSnapshot = await getDocs(readQuery);
          if (!readSnapshot.empty) {
            await getDoc(readSnapshot.docs[0].ref);
          }
          break;
        default:
          console.warn(`🔥 FirestoreLogger - Permission test not implemented for ${operation}`);
          return false;
      }

      console.log(`🔥 FirestoreLogger - Permission test PASSED for ${operation} on ${collection}`);
      return true;
    } catch (error) {
      console.error(`🔥 FirestoreLogger - Permission test FAILED for ${operation} on ${collection}:`, error);
      return false;
    }
  }

  // Log detailed error information
  logError(operation: string, collection: string, error: any) {
    const errorDetails = {
      operation,
      collection,
      errorMessage: error.message || 'Unknown error',
      errorCode: error.code || 'NO_CODE',
      errorStack: error.stack || 'NO_STACK',
      authState: {
        isAuthenticated: !!this.auth.currentUser,
        uid: this.auth.currentUser?.uid || 'none',
        email: this.auth.currentUser?.email || 'none'
      },
      timestamp: new Date().toISOString()
    };

    console.error(`🔥 FirestoreLogger - Detailed Error:`, errorDetails);

    // Specific permission error logging
    if (error.message?.includes('Missing or insufficient permissions')) {
      console.error(`🔥 FirestoreLogger - PERMISSION DENIED:`, {
        ...errorDetails,
        suggestion: 'Check if user is authenticated and has proper role in users collection'
      });
    }
  }
}

// Export singleton instance
export const firestoreLogger = FirestoreLogger.getInstance();

// Higher-order function to wrap Firestore operations with logging
export function withFirestoreLogging<T extends any[], R>(
  operation: string,
  collection: string,
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    firestoreLogger.logAuthState(operation, collection);
    
    try {
      const result = await fn(...args);
      console.log(`🔥 FirestoreLogger - ${operation} on ${collection} SUCCESS`);
      return result;
    } catch (error) {
      firestoreLogger.logError(operation, collection, error);
      throw error;
    }
  };
}

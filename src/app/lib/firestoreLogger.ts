import { getAuth } from 'firebase/auth';
import { doc, getDoc, collection, getDocs, query, limit } from 'firebase/firestore';
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
  async testPermission(collectionName: string, operation: 'read' | 'list' | 'write' | 'create' | 'update' | 'delete'): Promise<boolean> {
    console.log(`🔥 FirestoreLogger - Testing ${operation} permission on ${collectionName}`);
    
    try {
      switch (operation) {
        case 'list':
          const listQuery = query(collection(db, collectionName), limit(1));
          await getDocs(listQuery);
          break;
        case 'read':
          // Try to read first document
          const readQuery = query(collection(db, collectionName), limit(1));
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
  logError(operation: string, collection: string, error: unknown) {
    // Type guard to safely extract error properties
    const getErrorMessage = (err: unknown): string => {
      if (err instanceof Error) return err.message;
      if (typeof err === 'object' && err !== null && 'message' in err) {
        return String(err.message);
      }
      return String(err);
    };

    const getErrorCode = (err: unknown): string => {
      if (typeof err === 'object' && err !== null && 'code' in err) {
        return String(err.code);
      }
      return 'NO_CODE';
    };

    const getErrorStack = (err: unknown): string => {
      if (err instanceof Error) return err.stack || 'NO_STACK';
      if (typeof err === 'object' && err !== null && 'stack' in err) {
        return String(err.stack);
      }
      return 'NO_STACK';
    };

    const errorMessage = getErrorMessage(error);
    
    const errorDetails = {
      operation,
      collection,
      errorMessage,
      errorCode: getErrorCode(error),
      errorStack: getErrorStack(error),
      authState: {
        isAuthenticated: !!this.auth.currentUser,
        uid: this.auth.currentUser?.uid || 'none',
        email: this.auth.currentUser?.email || 'none'
      },
      timestamp: new Date().toISOString()
    };

    console.error(`🔥 FirestoreLogger - Detailed Error:`, errorDetails);

    // Specific permission error logging
    if (errorMessage.includes('Missing or insufficient permissions')) {
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
export function withFirestoreLogging<T extends unknown[], R>(
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

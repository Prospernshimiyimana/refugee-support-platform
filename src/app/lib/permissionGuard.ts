import { getAuth } from 'firebase/auth';
import { doc, getDoc, collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from './firebase';
import { logPermissionError } from './errorLogger';
import { userDocumentManager } from './userDocumentManager';
import { UserDocument } from './userService';

/**
 * Comprehensive permission guard system
 * Prevents unauthorized Firestore requests and provides detailed logging
 */
export class PermissionGuard {
  private static instance: PermissionGuard;
  private auth = getAuth();
  private permissionCache = new Map<string, boolean>();

  static getInstance(): PermissionGuard {
    if (!PermissionGuard.instance) {
      PermissionGuard.instance = new PermissionGuard();
    }
    return PermissionGuard.instance;
  }

  /**
   * Check if user is authenticated and ready for Firestore operations
   */
  isUserAuthenticated(): { authenticated: boolean; uid?: string; email?: string; reason?: string } {
    const currentUser = this.auth.currentUser;
    
    if (!currentUser) {
      return { 
        authenticated: false, 
        reason: 'No authenticated user found' 
      };
    }

    if (!currentUser.email) {
      return { 
        authenticated: false, 
        uid: currentUser.uid,
        reason: 'User email not available' 
      };
    }

    return { 
      authenticated: true, 
      uid: currentUser.uid, 
      email: currentUser.email 
    };
  }

  /**
   * Check if user document exists in Firestore, and create it if missing
   */
  async checkUserDocumentExists(uid: string): Promise<{ exists: boolean; data?: UserDocument; error?: string }> {
    try {
      console.log(`🔒 PermissionGuard: Checking if user document exists for UID: ${uid}`);
      
      // Use user document manager to ensure document exists
      const result = await userDocumentManager.ensureUserDocument(uid);
      
      if (result.success && result.userDoc) {
        console.log(`🔒 PermissionGuard: User document exists for UID: ${uid}`, result.userDoc);
        return { 
          exists: true, 
          data: result.userDoc 
        };
      } else {
        console.error(`🔒 PermissionGuard: Failed to ensure user document for UID: ${uid}:`, result.error);
        return { 
          exists: false, 
          error: result.error || 'User document could not be created or verified' 
        };
      }
    } catch (error) {
      console.error(`🔒 PermissionGuard: Error checking user document:`, error);
      return { 
        exists: false, 
        error: `Error checking user document: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  /**
   * Test specific permission before making the actual request
   */
  async testPermission(
    collectionName: string, 
    operation: 'read' | 'list' | 'write' | 'create' | 'update' | 'delete',
    documentId?: string
  ): Promise<{ allowed: boolean; reason?: string; details?: { uid?: string; email?: string; operation: string; collection?: string; error?: string } }> {
    const authStatus = this.isUserAuthenticated();
    
    // Allow public read and list operations on news collection
    if (!authStatus.authenticated) {
      if (collectionName === 'news' && (operation === 'read' || operation === 'list')) {
        console.log(`🔒 PermissionGuard: Allowing public ${operation} on ${collectionName}`);
        return { 
          allowed: true,
          reason: `Public ${operation} access allowed for news` 
        };
      }
      
      return { 
        allowed: false, 
        reason: authStatus.reason || 'User not authenticated' 
      };
    }

    // Check cache first
    const cacheKey = `${collectionName}-${operation}-${documentId || 'list'}`;
    if (this.permissionCache.has(cacheKey)) {
      const cachedValue = this.permissionCache.get(cacheKey);
      return { 
        allowed: cachedValue !== undefined ? cachedValue : false
      };
    }

    // Ensure user document exists before testing permissions
    if (authStatus.authenticated && authStatus.uid) {
      console.log(`🔒 PermissionGuard: Ensuring user document exists for UID: ${authStatus.uid}`);
      const userDocCheck = await this.checkUserDocumentExists(authStatus.uid);
      
      if (!userDocCheck.exists) {
        console.error(`🔒 PermissionGuard: User document missing for UID: ${authStatus.uid}, cannot test permissions`);
        return { 
          allowed: false, 
          reason: userDocCheck.error || 'User document missing - permissions cannot be verified' 
        };
      }
      
      console.log(`🔒 PermissionGuard: User document exists with role: ${userDocCheck.data?.role || 'unknown'}`);
    }

    try {
      console.log(`🔒 PermissionGuard: Testing ${operation} permission on ${collectionName}`);
      
      switch (operation) {
        case 'list':
          // Test list permission by trying to query with limit 1
          const collectionRef = collection(db, collectionName);
          const listQuery = query(collectionRef, limit(1));
          await getDocs(listQuery);
          break;
          
        case 'read':
          if (documentId) {
            // Test read permission on specific document
            const docRef = doc(db, collectionName, documentId);
            await getDoc(docRef);
          } else {
            // Test read permission by querying first document
            const collectionRef = collection(db, collectionName);
            const readQuery = query(collectionRef, limit(1));
            const snapshot = await getDocs(readQuery);
            if (!snapshot.empty) {
              await getDoc(snapshot.docs[0].ref);
            }
          }
          break;
          
        case 'write':
        case 'create':
        case 'update':
        case 'delete':
          // Write operations can't be safely tested without modifying data
          // We'll check user document and authentication status instead
          if (!authStatus.uid) {
            return { 
              allowed: false, 
              reason: 'User UID not available for permission check' 
            };
          }
          const userDocCheck = await this.checkUserDocumentExists(authStatus.uid);
          if (!userDocCheck.exists) {
            return { 
              allowed: false, 
              reason: 'User document does not exist - role-based rules will fail' 
            };
          }
          break;
          
        default:
          return { 
            allowed: false, 
            reason: `Unknown operation: ${operation}` 
          };
      }

      // Cache successful permission test
      this.permissionCache.set(cacheKey, true);
      
      return { 
        allowed: true,
        details: {
          uid: authStatus.uid,
          email: authStatus.email,
          operation,
          collection: collectionName
        }
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Cache failed permission test
      this.permissionCache.set(cacheKey, false);
      
      // Log detailed permission error
      logPermissionError(
        operation,
        collectionName,
        error,
        authStatus,
        undefined, // userDocumentExists - will be checked separately
        undefined, // userRole - will be checked separately
        undefined, // documentId
        undefined // requestDetails
      );
      
      console.error(`🔒 PermissionGuard: Permission test failed for ${operation} on ${collectionName}:`, error);
      
      return { 
        allowed: false, 
        reason: errorMessage,
        details: {
          uid: authStatus.uid,
          email: authStatus.email,
          operation,
          collection: collectionName,
          error: errorMessage
        }
      };
    }
  }

  /**
   * Wrapper function for Firestore operations with permission checking
   */
  async withPermissionCheck<T>(
    collectionName: string,
    operation: 'read' | 'list' | 'write' | 'create' | 'update' | 'delete',
    documentId: string | undefined,
    firestoreOperation: () => Promise<T>
  ): Promise<T> {
    // Check authentication first
    const authStatus = this.isUserAuthenticated();
    if (!authStatus.authenticated) {
      // Allow public read and list operations on news collection
      if (collectionName === 'news' && (operation === 'read' || operation === 'list')) {
        console.log(`🔒 PermissionGuard: Allowing public ${operation} on ${collectionName}`);
      } else {
        const error = new Error(`Operation blocked: ${authStatus.reason}`);
        console.error(`🔒 PermissionGuard: ${operation} on ${collectionName} blocked - ${authStatus.reason}`);
        throw error;
      }
    }

    // Test permission
    const permissionResult = await this.testPermission(collectionName, operation, documentId);
    
    if (!permissionResult.allowed) {
      const error = new Error(`Permission denied: ${permissionResult.reason}`);
      console.error(`🔒 PermissionGuard: ${operation} on ${collectionName} denied - ${permissionResult.reason}`, permissionResult.details);
      throw error;
    }

    console.log(`🔒 PermissionGuard: ${operation} on ${collectionName} allowed${authStatus.email ? ` for user ${authStatus.email}` : ' for public access'}`);
    
    // Execute the actual Firestore operation
    try {
      const result = await firestoreOperation();
      console.log(`🔒 PermissionGuard: ${operation} on ${collectionName} completed successfully`);
      return result;
    } catch (error) {
      console.error(`🔒 PermissionGuard: ${operation} on ${collectionName} failed despite permission check:`, error);
      throw error;
    }
  }

  /**
   * Clear permission cache (useful when user role changes)
   */
  clearCache(): void {
    this.permissionCache.clear();
    console.log('🔒 PermissionGuard: Permission cache cleared');
  }

  /**
   * Get current user role from user document
   */
  async getUserRole(uid: string): Promise<{ role: 'admin' | 'user' | null; error?: string }> {
    try {
      const userDocCheck = await this.checkUserDocumentExists(uid);
      
      if (!userDocCheck.exists) {
        return { role: null, error: userDocCheck.error };
      }
      
      const userData = userDocCheck.data;
      return { role: userData?.role || 'user' };
    } catch (error) {
      return { 
        role: null, 
        error: `Error getting user role: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
}

// Export singleton instance
export const permissionGuard = PermissionGuard.getInstance();

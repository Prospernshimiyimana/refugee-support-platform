/**
 * Comprehensive user document management system
 * Ensures user documents are always created and properly maintained
 */

import { getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { createUserDocument, getUserDocument, UserDocument } from './userService';

export class UserDocumentManager {
  private static instance: UserDocumentManager;
  private auth = getAuth();
  private creationInProgress = new Map<string, Promise<UserDocument | null>>();

  static getInstance(): UserDocumentManager {
    if (!UserDocumentManager.instance) {
      UserDocumentManager.instance = new UserDocumentManager();
    }
    return UserDocumentManager.instance;
  }

  /**
   * Ensure user document exists, create if missing
   * Uses caching to prevent multiple simultaneous creation attempts
   */
  async ensureUserDocument(uid: string, email?: string): Promise<{ success: boolean; userDoc: UserDocument | null; error?: string }> {
    // Check if creation is already in progress for this UID
    if (this.creationInProgress.has(uid)) {
      console.log(`👤 UserDocumentManager: User document creation already in progress for UID: ${uid}`);
      const result = await this.creationInProgress.get(uid);
      return { 
        success: !!result, 
        userDoc: result 
      };
    }

    // Create a promise for this creation attempt
    const creationPromise = this.createUserDocumentInternal(uid, email);
    this.creationInProgress.set(uid, creationPromise);

    try {
      const userDoc = await creationPromise;
      return { 
        success: !!userDoc, 
        userDoc 
      };
    } catch (error) {
      return { 
        success: false, 
        userDoc: null, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    } finally {
      // Clean up the promise from the cache
      this.creationInProgress.delete(uid);
    }
  }

  /**
   * Internal method to create user document
   */
  private async createUserDocumentInternal(uid: string, email?: string): Promise<UserDocument | null> {
    console.log(`👤 UserDocumentManager: Ensuring user document exists for UID: ${uid}`);

    try {
      // First, try to get existing document
      const existingDoc = await getUserDocument(uid);
      if (existingDoc) {
        console.log(`👤 UserDocumentManager: User document already exists for UID: ${uid}`);
        return existingDoc;
      }

      console.log(`👤 UserDocumentManager: Creating new user document for UID: ${uid}`);
      
      // Get email from current user or parameter
      const currentUser = this.auth.currentUser;
      const userEmail = email || currentUser?.email || '';
      
      // Create the user document
      await createUserDocument({
        uid,
        email: userEmail
      });

      console.log(`👤 UserDocumentManager: User document created successfully for UID: ${uid}`);

      // Verify the document was created
      const newDoc = await getUserDocument(uid);
      if (newDoc) {
        console.log(`👤 UserDocumentManager: User document verified for UID: ${uid}`, newDoc);
        return newDoc;
      } else {
        throw new Error('User document creation verification failed');
      }

    } catch (error) {
      console.error(`👤 UserDocumentManager: Error ensuring user document for UID: ${uid}:`, error);
      
      // Try to create a minimal user document as fallback
      try {
        console.log(`👤 UserDocumentManager: Attempting fallback user document creation for UID: ${uid}`);
        const userRef = doc(db, 'users', uid);
        const currentUser = this.auth.currentUser;
        const userEmail = email || currentUser?.email || '';
        
        const minimalDoc: UserDocument = {
          uid,
          email: userEmail,
          role: 'user'
        };
        
        await setDoc(userRef, minimalDoc);
        console.log(`👤 UserDocumentManager: Fallback user document created for UID: ${uid}`);
        
        return minimalDoc;
      } catch (fallbackError) {
        console.error(`👤 UserDocumentManager: Fallback creation also failed for UID: ${uid}:`, fallbackError);
        throw error; // Throw the original error
      }
    }
  }

  /**
   * Get user document with automatic creation if missing
   */
  async getUserDocumentWithAutoCreate(uid: string, email?: string): Promise<UserDocument | null> {
    const result = await this.ensureUserDocument(uid, email);
    return result.userDoc;
  }

  /**
   * Update user role
   */
  async updateUserRole(uid: string, role: 'admin' | 'user'): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`👤 UserDocumentManager: Updating user role for UID: ${uid} to: ${role}`);
      
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, {
        role,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      console.log(`👤 UserDocumentManager: User role updated successfully for UID: ${uid}`);
      return { success: true };
    } catch (error) {
      console.error(`👤 UserDocumentManager: Error updating user role for UID: ${uid}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Check if user is admin
   */
  async isUserAdmin(uid: string): Promise<boolean> {
    try {
      const userDoc = await this.getUserDocumentWithAutoCreate(uid);
      return userDoc?.role === 'admin';
    } catch (error) {
      console.error(`👤 UserDocumentManager: Error checking admin status for UID: ${uid}:`, error);
      return false;
    }
  }

  /**
   * Get current authenticated user's document
   */
  async getCurrentUserDocument(): Promise<UserDocument | null> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) {
      console.log(`👤 UserDocumentManager: No authenticated user`);
      return null;
    }

    return this.getUserDocumentWithAutoCreate(currentUser.uid, currentUser.email || '');
  }

  /**
   * Clear creation cache (useful for testing)
   */
  clearCache(): void {
    this.creationInProgress.clear();
    console.log(`👤 UserDocumentManager: Creation cache cleared`);
  }
}

// Export singleton instance
export const userDocumentManager = UserDocumentManager.getInstance();

/**
 * Helper function to ensure user document exists
 */
export async function ensureUserDocument(uid: string, email?: string): Promise<{ success: boolean; userDoc: UserDocument | null; error?: string }> {
  return userDocumentManager.ensureUserDocument(uid, email);
}

/**
 * Helper function to get current user document with auto-creation
 */
export async function getCurrentUserDocument(): Promise<UserDocument | null> {
  return userDocumentManager.getCurrentUserDocument();
}

import { UserDocument } from '../lib/userService';

/**
 * Check if a user has admin privileges based on Firestore role
 * @param userDoc - User document from Firestore
 * @returns boolean - true if user is admin
 */
export function isAdmin(userDoc: UserDocument | null): boolean {
  if (!userDoc) return false;
  return userDoc.role === 'admin';
}

/**
 * Check if current user is admin based on role
 * @param role - User role from AuthContext
 * @returns boolean - true if user is admin
 */
export function isUserAdmin(role: 'admin' | 'user' | null): boolean {
  return role === 'admin';
}

/**
 * Get admin status for a user based on Firestore document
 * @param userDoc - User document from Firestore
 * @returns object with admin status and user info
 */
export function getUserRole(userDoc: UserDocument | null) {
  if (!userDoc) {
    return { role: 'guest', isAdmin: false, email: null };
  }
  
  const adminStatus = isAdmin(userDoc);
  return {
    role: userDoc.role,
    isAdmin: adminStatus,
    email: userDoc.email,
    uid: userDoc.uid
  };
}

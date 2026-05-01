import { UserDocument } from '../app/lib/userService';

/**
 * Check if user is admin and show unauthorized message if not
 * @param userDoc - User document from Firestore
 * @returns boolean - true if user is admin, false otherwise
 */
export function checkAdminAccess(userDoc: UserDocument | null): boolean {
  if (!userDoc || userDoc.role !== 'admin') {
    alert('Unauthorized: Admin access required');
    return false;
  }
  
  return true;
}

/**
 * Check if user is admin by role
 * @param role - User role from AuthContext
 * @returns boolean - true if user is admin, false otherwise
 */
export function checkAdminAccessByRole(role: 'admin' | 'user' | null): boolean {
  if (role !== 'admin') {
    alert('Unauthorized: Admin access required');
    return false;
  }
  
  return true;
}

/**
 * Higher-order function to protect admin-only operations
 * @param userDoc - User document from Firestore
 * @param operation - Function to execute if user is admin
 * @returns Promise with operation result or undefined if unauthorized
 */
export async function withAdminProtection<T>(
  userDoc: UserDocument | null,
  operation: () => Promise<T>
): Promise<T | undefined> {
  if (!userDoc || userDoc.role !== 'admin') {
    alert('Unauthorized: Admin access required');
    return undefined;
  }
  
  try {
    return await operation();
  } catch (error) {
    console.error('Admin operation failed:', error);
    throw error;
  }
}

/**
 * Higher-order function to protect admin-only operations by role
 * @param role - User role from AuthContext
 * @param operation - Function to execute if user is admin
 * @returns Promise with operation result or undefined if unauthorized
 */
export async function withAdminProtectionByRole<T>(
  role: 'admin' | 'user' | null,
  operation: () => Promise<T>
): Promise<T | undefined> {
  if (role !== 'admin') {
    alert('Unauthorized: Admin access required');
    return undefined;
  }
  
  try {
    return await operation();
  } catch (error) {
    console.error('Admin operation failed:', error);
    throw error;
  }
}

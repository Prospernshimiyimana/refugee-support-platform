/**
 * Role-based utility functions for admin/user separation
 */

export const isAdmin = (role: 'admin' | 'user' | null): boolean => {
  return role === 'admin';
};

export const requireAdmin = (role: 'admin' | 'user' | null, onRedirect?: () => void): boolean => {
  if (!isAdmin(role)) {
    if (onRedirect) {
      onRedirect();
    }
    return false;
  }
  return true;
};

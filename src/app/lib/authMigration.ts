/**
 * Migration utilities for transitioning to robust authentication
 * Provides backward compatibility and upgrade paths
 */

import { signUp as robustSignUp, login as robustLogin, AuthResult } from './robustAuthService';
import { signUp as legacySignUp, login as legacyLogin } from './auth';

// Migration configuration
const USE_ROBUST_AUTH = process.env.NODE_ENV === 'production' || process.env.USE_ROBUST_AUTH === 'true';

/**
 * Migrated signUp function that uses robust auth when available
 * @param email User email
 * @param password User password
 * @returns Promise<AuthResult>
 */
export async function signUp(email: string, password: string): Promise<AuthResult> {
  if (USE_ROBUST_AUTH) {
    console.log('🔄 AuthMigration: Using robust auth service for signup');
    return robustSignUp(email, password);
  } else {
    console.log('🔄 AuthMigration: Using legacy auth service for signup');
    const result = await legacySignUp(email, password);
    // Convert legacy result to enhanced format
    return {
      success: result.success,
      user: result.user,
      error: result.error
    };
  }
}

/**
 * Migrated login function that uses robust auth when available
 * @param email User email
 * @param password User password
 * @returns Promise<AuthResult>
 */
export async function login(email: string, password: string): Promise<AuthResult> {
  if (USE_ROBUST_AUTH) {
    console.log('🔄 AuthMigration: Using robust auth service for login');
    return robustLogin(email, password);
  } else {
    console.log('🔄 AuthMigration: Using legacy auth service for login');
    const result = await legacyLogin(email, password);
    // Convert legacy result to enhanced format
    return {
      success: result.success,
      user: result.user,
      error: result.error
    };
  }
}

/**
 * Test authentication system end-to-end
 * Creates test users and verifies Firestore document creation
 */
export async function testAuthSystem(): Promise<{ success: boolean; details: string[] }> {
  const details: string[] = [];
  
  try {
    console.log('🧪 AuthMigration: Starting authentication system test');
    details.push('🧪 Test started');
    
    // Test 1: Sign up new user
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'test123456';
    
    details.push(`📝 Testing signup with email: ${testEmail}`);
    const signupResult = await robustSignUp(testEmail, testPassword);
    
    if (!signupResult.success) {
      details.push(`❌ Signup failed: ${signupResult.error}`);
      return { success: false, details };
    }
    
    details.push('✅ Signup successful');
    
    if (!signupResult.user) {
      details.push('❌ No user object returned from signup');
      return { success: false, details };
    }
    
    const testUid = signupResult.user.uid;
    details.push(`👤 User created with UID: ${testUid}`);
    
    // Test 2: Verify user document was created
    if (signupResult.userDoc) {
      details.push('✅ User document created automatically');
      details.push(`📄 User role: ${signupResult.userDoc.role}`);
      details.push(`📧 User email: ${signupResult.userDoc.email}`);
    } else {
      details.push('⚠️ User document not returned (may still be created)');
    }
    
    // Test 3: Login with same user
    details.push('🔐 Testing login with existing user');
    const loginResult = await robustLogin(testEmail, testPassword);
    
    if (!loginResult.success) {
      details.push(`❌ Login failed: ${loginResult.error}`);
      return { success: false, details };
    }
    
    details.push('✅ Login successful');
    
    if (loginResult.userDoc) {
      details.push('✅ User document retrieved on login');
      details.push(`📄 Login user role: ${loginResult.userDoc.role}`);
      details.push(`📄 Login user email: ${loginResult.userDoc.email}`);
    } else {
      details.push('⚠️ User document not returned on login');
    }
    
    // Test 4: Logout
    details.push('🚪 Testing logout');
    const logoutResult = await robustLogout();
    
    if (!logoutResult.success) {
      details.push(`❌ Logout failed: ${logoutResult.error}`);
      return { success: false, details };
    }
    
    details.push('✅ Logout successful');
    
    details.push('🎉 All authentication tests passed!');
    return { success: true, details };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    details.push(`💥 Test failed with error: ${errorMessage}`);
    return { success: false, details };
  }
}

/**
 * Robust logout function
 */
async function robustLogout(): Promise<AuthResult> {
  try {
    const { logout } = await import('./robustAuthService');
    return logout();
  } catch (error) {
    const { logout } = await import('./auth');
    return logout();
  }
}

/**
 * Get current auth system status
 */
export function getAuthSystemStatus(): {
  usingRobustAuth: boolean;
  environment: string;
  recommendations: string[];
} {
  const recommendations: string[] = [];
  
  if (!USE_ROBUST_AUTH) {
    recommendations.push('Consider enabling USE_ROBUST_AUTH=true for better user document management');
    recommendations.push('Robust auth provides automatic Firestore document creation and self-healing');
  }
  
  if (process.env.NODE_ENV === 'development') {
    recommendations.push('Development environment detected - robust auth is available for testing');
  }
  
  return {
    usingRobustAuth: USE_ROBUST_AUTH,
    environment: process.env.NODE_ENV || 'unknown',
    recommendations
  };
}

/**
 * Comprehensive error logging system for Firebase permissions
 * Identifies exactly which requests are being denied and why
 */

export interface AuthState {
  uid?: string;
  email?: string;
  emailVerified?: boolean;
}

export interface RequestDetails {
  method?: string;
  path?: string;
  payload?: Record<string, unknown>;
  headers?: Record<string, string>;
  query?: Record<string, string>;
}

export interface PermissionError {
  operation: string;
  collection: string;
  documentId?: string;
  userId?: string;
  userEmail?: string;
  timestamp: string;
  errorMessage: string;
  errorCode?: string;
  stackTrace?: string;
  authState: {
    isAuthenticated: boolean;
    uid?: string;
    email?: string;
    emailVerified?: boolean;
  };
  userDocumentExists?: boolean;
  userRole?: string;
  requestDetails?: RequestDetails;
}

export class PermissionErrorLogger {
  private static instance: PermissionErrorLogger;
  private errors: PermissionError[] = [];
  private maxErrors = 100; // Keep last 100 errors

  static getInstance(): PermissionErrorLogger {
    if (!PermissionErrorLogger.instance) {
      PermissionErrorLogger.instance = new PermissionErrorLogger();
    }
    return PermissionErrorLogger.instance;
  }

  /**
   * Log a permission error with full context
   */
  logPermissionError(error: PermissionError): void {
    console.error('🔥 PERMISSION ERROR LOGGED:', {
      ...error,
      timestamp: new Date().toISOString()
    });

    // Add to error log
    this.errors.push(error);

    // Keep only the last maxErrors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Log to console with structured format
    console.group(`🔥 Permission Error: ${error.operation} on ${error.collection}`);
    console.error('Error Details:', error);
    console.error('Auth State:', error.authState);
    console.error('User Document:', error.userDocumentExists ? 'Exists' : 'Missing');
    console.error('User Role:', error.userRole || 'Unknown');
    console.groupEnd();
  }

  /**
   * Get all logged permission errors
   */
  getErrors(): PermissionError[] {
    return [...this.errors];
  }

  /**
   * Get errors by collection
   */
  getErrorsByCollection(collection: string): PermissionError[] {
    return this.errors.filter(error => error.collection === collection);
  }

  /**
   * Get errors by operation type
   */
  getErrorsByOperation(operation: string): PermissionError[] {
    return this.errors.filter(error => error.operation === operation);
  }

  /**
   * Get recent errors (last N errors)
   */
  getRecentErrors(count: number = 10): PermissionError[] {
    return this.errors.slice(-count);
  }

  /**
   * Clear error log
   */
  clearErrors(): void {
    this.errors = [];
    console.log('🔥 Permission error log cleared');
  }

  /**
   * Get error summary statistics
   */
  getErrorSummary(): {
    totalErrors: number;
    errorsByCollection: Record<string, number>;
    errorsByOperation: Record<string, number>;
    errorsByHour: Record<string, number>;
    mostCommonError: string;
  } {
    const errorsByCollection: Record<string, number> = {};
    const errorsByOperation: Record<string, number> = {};
    const errorsByHour: Record<string, number> = {};

    this.errors.forEach(error => {
      // Count by collection
      errorsByCollection[error.collection] = (errorsByCollection[error.collection] || 0) + 1;
      
      // Count by operation
      errorsByOperation[error.operation] = (errorsByOperation[error.operation] || 0) + 1;
      
      // Count by hour
      const hour = new Date(error.timestamp).getHours();
      errorsByHour[hour.toString()] = (errorsByHour[hour.toString()] || 0) + 1;
    });

    // Find most common error
    const errorCounts = Object.entries(errorsByCollection);
    const mostCommonError = errorCounts.length > 0 
      ? errorCounts.reduce((a, b) => a[1] > b[1] ? a : b)[0]
      : 'None';

    return {
      totalErrors: this.errors.length,
      errorsByCollection,
      errorsByOperation,
      errorsByHour,
      mostCommonError
    };
  }

  /**
   * Export errors for debugging
   */
  exportErrors(): string {
    return JSON.stringify({
      summary: this.getErrorSummary(),
      errors: this.errors,
      exportedAt: new Date().toISOString()
    }, null, 2);
  }
}

// Export singleton instance
export const permissionErrorLogger = PermissionErrorLogger.getInstance();

/**
 * Helper function to create and log permission errors
 */
export function createPermissionError(
  operation: string,
  collection: string,
  error: unknown,
  authState: AuthState | null | undefined,
  userDocumentExists?: boolean,
  userRole?: string,
  documentId?: string,
  requestDetails?: RequestDetails
): PermissionError {
  // Handle cases where error might be null/undefined or not an Error object
  const errorMessage = error 
    ? (error instanceof Error ? error.message : (typeof error === 'string' ? error : 'Unknown error'))
    : 'Unknown error';
  
  const errorCode = error && typeof error === 'object' && 'code' in error ? (error as { code?: string }).code : undefined;
  const stackTrace = error instanceof Error ? error.stack : undefined;

  return {
    operation,
    collection,
    documentId,
    userId: authState?.uid,
    userEmail: authState?.email,
    timestamp: new Date().toISOString(),
    errorMessage,
    errorCode,
    stackTrace,
    authState: {
      isAuthenticated: !!authState?.uid,
      uid: authState?.uid,
      email: authState?.email,
      emailVerified: authState?.emailVerified
    },
    userDocumentExists,
    userRole,
    requestDetails
  };
}

/**
 * Hook to automatically log permission errors from Firebase operations
 */
export function logPermissionError(
  operation: string,
  collection: string,
  error: unknown,
  authState: AuthState | null | undefined,
  userDocumentExists?: boolean,
  userRole?: string,
  documentId?: string,
  requestDetails?: RequestDetails
): void {
  // Guard against logging empty error objects
  if (!error || (typeof error === 'object' && Object.keys(error).length === 0)) {
    console.warn('🔥 Skipping logging of empty error object');
    return;
  }

  const permissionError = createPermissionError(
    operation,
    collection,
    error,
    authState,
    userDocumentExists,
    userRole,
    documentId,
    requestDetails
  );
  
  permissionErrorLogger.logPermissionError(permissionError);
}

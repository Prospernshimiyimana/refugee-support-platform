import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  where, 
  onSnapshot,
  Timestamp,
  getDocs,
  limit
} from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { auth } from '@/app/lib/firebase';

export interface AuditLog {
  id?: string;
  action: string;
  userEmail: string;
  timestamp: Timestamp;
  details?: string;
  metadata?: Record<string, unknown>;
}

export type AuditAction = 
  | 'CREATE_CASE'
  | 'UPDATE_CASE'
  | 'DELETE_CASE'
  | 'CREATE_NEWS'
  | 'UPDATE_NEWS'
  | 'DELETE_NEWS'
  | 'CREATE_USER'
  | 'UPDATE_USER_ROLE'
  | 'DELETE_USER'
  | 'LOGIN'
  | 'LOGOUT'
  | 'EXPORT_DATA'
  | 'SYSTEM_UPDATE';

class AuditService {
  private collection = db ? collection(db, 'logs') : null;

  // Get current user email
  private getCurrentUserEmail(): string {
    if (!auth) {
      return 'unknown@system.com';
    }
    
    const currentUser = auth.currentUser;
    return currentUser?.email || 'unknown@system.com';
  }

  // Create an audit log entry
  async logAction(
    action: AuditAction,
    details?: string,
    metadata?: Record<string, unknown>
  ): Promise<string> {
    try {
      if (!this.collection) {
        console.error('AuditService: Database not available');
        throw new Error('Database not available');
      }
      
      const logEntry: Omit<AuditLog, 'id'> = {
        action,
        userEmail: this.getCurrentUserEmail(),
        timestamp: Timestamp.now(),
        details,
        metadata
      };

      const docRef = await addDoc(this.collection, logEntry);
      console.log(`Audit log created: ${action} by ${this.getCurrentUserEmail()}`);
      return docRef.id;
    } catch (error) {
      console.error('Error creating audit log:', error);
      throw error;
    }
  }

  // Log case creation
  async logCaseCreation(caseId: string, caseTitle: string): Promise<string> {
    return this.logAction('CREATE_CASE', `Case "${caseTitle}" created`, {
      caseId,
      caseTitle
    });
  }

  // Log case update
  async logCaseUpdate(caseId: string, caseTitle: string, changes: Record<string, unknown>): Promise<string> {
    return this.logAction('UPDATE_CASE', `Case "${caseTitle}" updated`, {
      caseId,
      caseTitle,
      changes
    });
  }

  // Log case deletion
  async logCaseDeletion(caseId: string, caseTitle: string): Promise<string> {
    return this.logAction('DELETE_CASE', `Case "${caseTitle}" deleted`, {
      caseId,
      caseTitle
    });
  }

  // Log news creation
  async logNewsCreation(newsId: string, newsTitle: string): Promise<string> {
    return this.logAction('CREATE_NEWS', `News article "${newsTitle}" created`, {
      newsId,
      newsTitle
    });
  }

  // Log news update
  async logNewsUpdate(newsId: string, newsTitle: string, changes: Record<string, unknown>): Promise<string> {
    return this.logAction('UPDATE_NEWS', `News article "${newsTitle}" updated`, {
      newsId,
      newsTitle,
      changes
    });
  }

  // Log news deletion
  async logNewsDeletion(newsId: string, newsTitle: string): Promise<string> {
    return this.logAction('DELETE_NEWS', `News article "${newsTitle}" deleted`, {
      newsId,
      newsTitle
    });
  }

  // Log user role change
  async logUserRoleChange(userEmail: string, oldRole: string, newRole: string): Promise<string> {
    return this.logAction('UPDATE_USER_ROLE', `User role changed for ${userEmail}`, {
      targetUserEmail: userEmail,
      oldRole,
      newRole
    });
  }

  // Log user creation
  async logUserCreation(userEmail: string, role: string): Promise<string> {
    return this.logAction('CREATE_USER', `User ${userEmail} created with role ${role}`, {
      targetUserEmail: userEmail,
      role
    });
  }

  // Log user deletion
  async logUserDeletion(userEmail: string): Promise<string> {
    return this.logAction('DELETE_USER', `User ${userEmail} deleted`, {
      targetUserEmail: userEmail
    });
  }

  // Log login
  async logLogin(): Promise<string> {
    return this.logAction('LOGIN', 'User logged in');
  }

  // Log logout
  async logLogout(): Promise<string> {
    return this.logAction('LOGOUT', 'User logged out');
  }

  // Log data export
  async logDataExport(dataType: string, recordCount: number): Promise<string> {
    return this.logAction('EXPORT_DATA', `Exported ${dataType} data (${recordCount} records)`, {
      dataType,
      recordCount
    });
  }

  // Log system update
  async logSystemUpdate(description: string): Promise<string> {
    return this.logAction('SYSTEM_UPDATE', description);
  }

  // Get recent audit logs (real-time)
  subscribeToAuditLogs(
    callback: (logs: AuditLog[]) => void,
    limitCount: number = 100
  ): () => void {
    if (!this.collection) {
      console.error('AuditService: Database not available');
      callback([]);
      return () => {}; // Return empty unsubscribe function
    }
    
    const q = query(
      this.collection, 
      orderBy('timestamp', 'desc'), 
      limit(limitCount)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const logs: AuditLog[] = [];
        snapshot.forEach((doc) => {
          logs.push({
            id: doc.id,
            ...doc.data()
          } as AuditLog);
        });
        callback(logs);
      },
      (error) => {
        console.error('Real-time audit logs error:', error);
      }
    );

    return unsubscribe;
  }

  // Get audit logs by action type
  subscribeToAuditLogsByAction(
    action: AuditAction,
    callback: (logs: AuditLog[]) => void,
    limitCount: number = 50
  ): () => void {
    if (!this.collection) {
      console.error('AuditService: Database not available');
      callback([]);
      return () => {}; // Return empty unsubscribe function
    }
    
    const q = query(
      this.collection, 
      where('action', '==', action),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const logs: AuditLog[] = [];
        snapshot.forEach((doc) => {
          logs.push({
            id: doc.id,
            ...doc.data()
          } as AuditLog);
        });
        callback(logs);
      },
      (error) => {
        console.error(`Real-time audit logs error for ${action}:`, error);
      }
    );

    return unsubscribe;
  }

  // Get audit logs by user
  subscribeToAuditLogsByUser(
    userEmail: string,
    callback: (logs: AuditLog[]) => void,
    limitCount: number = 50
  ): () => void {
    if (!this.collection) {
      console.error('AuditService: Database not available');
      callback([]);
      return () => {}; // Return empty unsubscribe function
    }
    
    const q = query(
      this.collection, 
      where('userEmail', '==', userEmail),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const logs: AuditLog[] = [];
        snapshot.forEach((doc) => {
          logs.push({
            id: doc.id,
            ...doc.data()
          } as AuditLog);
        });
        callback(logs);
      },
      (error) => {
        console.error(`Real-time audit logs error for user ${userEmail}:`, error);
      }
    );

    return unsubscribe;
  }

  // Get audit logs by date range
  async getAuditLogsByDateRange(
    startDate: Date,
    endDate: Date,
    limitCount: number = 100
  ): Promise<AuditLog[]> {
    try {
      if (!this.collection) {
        console.error('AuditService: Database not available');
        throw new Error('Database not available');
      }
      
      const startTimestamp = Timestamp.fromDate(startDate);
      const endTimestamp = Timestamp.fromDate(endDate);
      
      const q = query(
        this.collection,
        where('timestamp', '>=', startTimestamp),
        where('timestamp', '<=', endTimestamp),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      const logs: AuditLog[] = [];
      
      snapshot.forEach((doc) => {
        logs.push({
          id: doc.id,
          ...doc.data()
        } as AuditLog);
      });
      
      return logs;
    } catch (error) {
      console.error('Error getting audit logs by date range:', error);
      throw error;
    }
  }

  // Get audit statistics
  async getAuditStats(): Promise<{
    totalLogs: number;
    actionCounts: Record<AuditAction, number>;
    userCounts: Record<string, number>;
    recentActivity: AuditLog[];
  }> {
    try {
      if (!this.collection) {
        console.error('AuditService: Database not available');
        throw new Error('Database not available');
      }
      
      const q = query(this.collection, orderBy('timestamp', 'desc'), limit(1000));
      const snapshot = await getDocs(q);
      
      const logs: AuditLog[] = [];
      snapshot.forEach((doc) => {
        logs.push({
          id: doc.id,
          ...doc.data()
        } as AuditLog);
      });

      const actionCounts: Record<string, number> = {};
      const userCounts: Record<string, number> = {};

      logs.forEach(log => {
        actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
        userCounts[log.userEmail] = (userCounts[log.userEmail] || 0) + 1;
      });

      return {
        totalLogs: logs.length,
        actionCounts: actionCounts as Record<AuditAction, number>,
        userCounts,
        recentActivity: logs.slice(0, 10)
      };
    } catch (error) {
      console.error('Error getting audit stats:', error);
      throw error;
    }
  }

  // Clean up old audit logs (older than 90 days)
  async cleanupOldLogs(): Promise<void> {
    try {
      if (!this.collection) {
        console.error('AuditService: Database not available');
        return;
      }
      
      const ninetyDaysAgo = Timestamp.fromDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000));
      const q = query(this.collection, where('timestamp', '<', ninetyDaysAgo));
      const snapshot = await getDocs(q);
      
      const deletePromises = snapshot.docs.map(doc => 
        // Note: You can't delete documents in a batch without the doc reference
        // This would need to be implemented with individual delete calls
        console.log(`Would delete log: ${doc.id}`)
      );
      
      console.log(`Found ${snapshot.size} old audit logs to clean up`);
      // Note: Implement actual deletion if needed
    } catch (error) {
      console.error('Error cleaning up old audit logs:', error);
    }
  }
}

export const auditService = new AuditService();

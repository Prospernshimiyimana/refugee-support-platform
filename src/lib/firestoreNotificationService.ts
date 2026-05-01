import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  where, 
  onSnapshot,
  Timestamp,
  getDocs,
  limit
} from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { getAuth } from 'firebase/auth';

export interface FirestoreNotification {
  id?: string;
  message: string;
  createdAt: Timestamp;
  read: boolean;
  type: 'case' | 'news' | 'system';
  actionUrl?: string;
  title?: string;
}

class FirestoreNotificationService {
  private collection = collection(db, 'notifications');

  // Create a new notification
  async createNotification(notification: Omit<FirestoreNotification, 'id' | 'createdAt' | 'read'>): Promise<string> {
    try {
      const docRef = await addDoc(this.collection, {
        ...notification,
        createdAt: Timestamp.now(),
        read: false
      });
      console.log('Notification created successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Create notification for new case
  async createCaseNotification(caseId: string, caseTitle: string): Promise<string> {
    return this.createNotification({
      message: `New case "${caseTitle}" has been created`,
      type: 'case',
      actionUrl: `/dashboard/cases/${caseId}`,
      title: 'New case created'
    });
  }

  // Create notification for new news article
  async createNewsNotification(newsId: string, newsTitle: string): Promise<string> {
    return this.createNotification({
      message: `New news article "${newsTitle}" has been published`,
      type: 'news',
      actionUrl: `/dashboard/news/${newsId}`,
      title: 'News article published'
    });
  }

  // Create notification for system updates
  async createSystemNotification(message: string, actionUrl?: string): Promise<string> {
    return this.createNotification({
      message,
      type: 'system',
      actionUrl,
      title: 'System update'
    });
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, { read: true });
      console.log('Notification marked as read:', notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    try {
      const q = query(this.collection, where('read', '==', false));
      const snapshot = await getDocs(q);
      
      const updatePromises = snapshot.docs.map(doc => 
        updateDoc(doc.ref, { read: true })
      );
      
      await Promise.all(updatePromises);
      console.log('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await deleteDoc(notificationRef);
      console.log('Notification deleted:', notificationId);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Get unread notifications count
  async getUnreadCount(): Promise<number> {
    try {
      const q = query(this.collection, where('read', '==', false));
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  // Get recent notifications (real-time)
  subscribeToNotifications(
    callback: (notifications: FirestoreNotification[]) => void,
    limitCount: number = 50
  ): () => void {
    // Check if user is authenticated
    const auth = getAuth();
    if (!auth.currentUser) {
      console.warn('Cannot subscribe to notifications: User not authenticated');
      return () => {}; // Return empty unsubscribe function
    }

    const q = query(
      this.collection, 
      orderBy('createdAt', 'desc'), 
      limit(limitCount)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notifications: FirestoreNotification[] = [];
        snapshot.forEach((doc) => {
          notifications.push({
            id: doc.id,
            ...doc.data()
          } as FirestoreNotification);
        });
        callback(notifications);
      },
      (error) => {
        console.error('Real-time notifications error:', error);
      }
    );

    return unsubscribe;
  }

  // Get unread notifications (real-time)
  subscribeToUnreadNotifications(
    callback: (notifications: FirestoreNotification[]) => void
  ): () => void {
    // Check if user is authenticated
    const auth = getAuth();
    if (!auth.currentUser) {
      console.warn('Cannot subscribe to unread notifications: User not authenticated');
      return () => {}; // Return empty unsubscribe function
    }

    const q = query(
      this.collection, 
      where('read', '==', false),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notifications: FirestoreNotification[] = [];
        snapshot.forEach((doc) => {
          notifications.push({
            id: doc.id,
            ...doc.data()
          } as FirestoreNotification);
        });
        callback(notifications);
      },
      (error) => {
        console.error('Real-time unread notifications error:', error);
      }
    );

    return unsubscribe;
  }

  // Clean up old notifications (older than 30 days)
  async cleanupOldNotifications(): Promise<void> {
    try {
      const thirtyDaysAgo = Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
      const q = query(this.collection, where('createdAt', '<', thirtyDaysAgo));
      const snapshot = await getDocs(q);
      
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      console.log(`Cleaned up ${snapshot.size} old notifications`);
    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
    }
  }
}

export const firestoreNotificationService = new FirestoreNotificationService();

import { firestoreNotificationService, FirestoreNotification } from './firestoreNotificationService';

export interface Notification {
  id: string;
  title: string;
  message?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

// Convert Firestore notification to UI notification
const convertFirestoreNotification = (firestoreNotif: FirestoreNotification): Notification => {
  const typeMap: Record<string, Notification['type']> = {
    'news': 'success', 
    'system': 'warning'
  };

  if (!firestoreNotif.id) {
    throw new Error('Firestore notification missing required id field');
  }

  return {
    id: firestoreNotif.id,
    title: firestoreNotif.title || 'Notification',
    message: firestoreNotif.message,
    type: typeMap[firestoreNotif.type] || 'info',
    timestamp: firestoreNotif.createdAt.toDate(),
    read: firestoreNotif.read,
    actionUrl: firestoreNotif.actionUrl
  };
};

class NotificationService {
  private notifications: Notification[] = [];
  private listeners: ((notifications: Notification[]) => void)[] = [];
  private unsubscribe: (() => void) | null = null;

  // Initialize real-time subscription
  private initializeRealtimeSubscription() {
    if (this.unsubscribe) {
      return; // Already subscribed
    }

    this.unsubscribe = firestoreNotificationService.subscribeToNotifications(
      (firestoreNotifications) => {
        this.notifications = firestoreNotifications.map(convertFirestoreNotification);
        this.notifyListeners();
      }
    );
  }

  // Subscribe to notification changes
  subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.push(listener);
    
    // Initialize real-time subscription on first subscriber
    if (this.listeners.length === 1) {
      this.initializeRealtimeSubscription();
    }
    
    listener(this.notifications);
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
      
      // Cleanup if no more listeners
      if (this.listeners.length === 0 && this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
    };
  }

  // Notify all listeners
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.notifications));
  }

  // Get all notifications
  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  // Get unread notifications
  getUnreadNotifications(): Notification[] {
    return this.notifications.filter(n => !n.read);
  }

  // Get unread count
  getUnreadCount(): number {
    return this.getUnreadNotifications().length;
  }

  // Mark notification as read
  async markAsRead(id: string) {
    try {
      await firestoreNotificationService.markAsRead(id);
      // Real-time subscription will update the UI
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      await firestoreNotificationService.markAllAsRead();
      // Real-time subscription will update the UI
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  // Add new notification
  async addNotification(notification: Omit<Notification, 'id'>) {
    try {
      // Convert to Firestore format and create
      const typeMap: Record<string, 'news' | 'system'> = {
        'info': 'system',
        'success': 'system', 
        'warning': 'system',
        'error': 'system'
      };

      const id = await firestoreNotificationService.createNotification({
        message: notification.message || notification.title,
        type: typeMap[notification.type] || 'system',
        actionUrl: notification.actionUrl || undefined,
        title: notification.title
      });
      
      // Real-time subscription will update the UI
      return { id, ...notification };
    } catch (error) {
      console.error('Error adding notification:', error);
      throw error;
    }
  }

  // Remove notification
  async removeNotification(id: string) {
    try {
      await firestoreNotificationService.deleteNotification(id);
      // Real-time subscription will update the UI
    } catch (error) {
      console.error('Error removing notification:', error);
    }
  }

  // Clear all notifications
  async clearAll() {
    try {
      // Get all notifications and delete them
      const deletePromises = this.notifications.map(n => 
        firestoreNotificationService.deleteNotification(n.id)
      );
      await Promise.all(deletePromises);
      // Real-time subscription will update the UI
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }
}

export const notificationService = new NotificationService();

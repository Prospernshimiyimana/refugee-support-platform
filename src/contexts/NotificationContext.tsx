'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { notificationService, Notification } from '../lib/notificationService';
import { useAuth } from '../app/contexts/AuthContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id'>) => Promise<Notification>;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    // Only subscribe to notifications if user is authenticated
    let unsubscribe: (() => void) | null = null;
    
    if (user && !authLoading) {
      unsubscribe = notificationService.subscribe(setNotifications);
    }
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, authLoading]);

  const contextValue: NotificationContextType = {
    notifications,
    unreadCount: notificationService.getUnreadCount(),
    markAsRead: notificationService.markAsRead.bind(notificationService),
    markAllAsRead: notificationService.markAllAsRead.bind(notificationService),
    addNotification: notificationService.addNotification.bind(notificationService),
    removeNotification: notificationService.removeNotification.bind(notificationService),
    clearAll: notificationService.clearAll.bind(notificationService),
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

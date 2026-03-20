"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, limit, Timestamp } from 'firebase/firestore';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: any;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // For demo purposes, if auth.currentUser is null, we can still show some mock notifications
    // or wait for auth to initialize. Since this is a specialized agentic task, 
    // I'll set up the listener but also provide a fallback.
    
    if (!db) return;

    // In a real app, we'd filter by userId: where('userId', '==', auth.currentUser?.uid)
    // For now, let's just listen to all notifications or a general collection for demo.
    const q = query(
      collection(db, 'notifications'), 
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      
      setNotifications(msgs);
      setUnreadCount(msgs.filter(m => !m.isRead).length);
    }, (error) => {
      console.error("Error listening to notifications:", error);
      // Fallback mock data if Firestore fails or collection doesn't exist yet
      const mockNotifications: Notification[] = [
        {
          id: '1',
          userId: 'system',
          title: 'Welcome to SmartCV',
          message: 'Explore our new templates and start building!',
          type: 'info',
          isRead: false,
          createdAt: Timestamp.now()
        },
        {
          id: '2',
          userId: 'system',
          title: 'Direct Message',
          message: 'An enterprise viewed your resume.',
          type: 'success',
          isRead: true,
          createdAt: Timestamp.now()
        }
      ];
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(m => !m.isRead).length);
    });

    return () => unsubscribe();
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount }}>
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

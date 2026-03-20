"use client";
import React from 'react';
import { useNotifications, Notification } from '@/context/NotificationContext';
import { Bell, CheckCircle2, Info, AlertTriangle, XCircle, Clock } from 'lucide-react';

export default function NotificationList() {
  const { notifications } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 size={16} className="text-primary" />;
      case 'warning': return <AlertTriangle size={16} className="text-amber-500" />;
      case 'error': return <XCircle size={16} className="text-red-500" />;
      default: return <Info size={16} className="text-blue-500" />;
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="absolute top-full right-0 mt-2 w-80 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">Notifications</h3>
        <button className="text-[10px] font-bold text-primary hover:underline">Mark all as read</button>
      </div>
      
      <div className="max-h-[320px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-10 text-center">
            <Bell size={24} className="mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground font-medium">No new notifications</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`px-4 py-3 border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer relative ${!notif.isRead ? 'bg-primary/5' : ''}`}
            >
              {!notif.isRead && (
                <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-primary" />
              )}
              <div className="flex gap-3">
                <div className="mt-0.5">{getIcon(notif.type)}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[13px] font-bold text-foreground line-clamp-1">{notif.title}</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">{notif.message}</p>
                  <div className="flex items-center gap-1 mt-2 text-[9px] text-muted-foreground/50 font-medium">
                    <Clock size={10} />
                    {formatTime(notif.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="px-4 py-2 border-t border-border bg-muted/10 text-center">
        <button className="text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors">
          View all notifications
        </button>
      </div>
    </div>
  );
}

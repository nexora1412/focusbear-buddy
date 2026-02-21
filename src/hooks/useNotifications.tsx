import { useEffect, useCallback, useRef } from 'react';
import { toast } from '@/hooks/use-toast';

export function useNotifications() {
  const permissionRef = useRef<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      permissionRef.current = Notification.permission;
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return false;
    const result = await Notification.requestPermission();
    permissionRef.current = result;
    return result === 'granted';
  }, []);

  const sendNotification = useCallback((title: string, body: string) => {
    // In-app toast
    toast({ title, description: body });

    // Browser push notification
    if ('Notification' in window && permissionRef.current === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    }
  }, []);

  const scheduleReminder = useCallback((title: string, body: string, delayMs: number) => {
    const timeout = setTimeout(() => sendNotification(title, body), delayMs);
    return () => clearTimeout(timeout);
  }, [sendNotification]);

  return { requestPermission, sendNotification, scheduleReminder };
}

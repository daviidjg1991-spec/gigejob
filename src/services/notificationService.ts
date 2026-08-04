import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { Badge } from '@capawesome/capacitor-badge';

export interface NotificationPayload {
  title: string;
  body: string;
  id?: number;
  badgeCount?: number;
  data?: Record<string, any>;
}

/**
 * Initializes notification permissions and channels for iOS & Android
 */
export async function initNotifications(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    console.log('[NotificationService] Not running on native platform.');
    return false;
  }

  try {
    // 1. Request Local Notification permissions
    const localPerms = await LocalNotifications.checkPermissions();
    if (localPerms.display !== 'granted') {
      const request = await LocalNotifications.requestPermissions();
      if (request.display !== 'granted') {
        console.warn('[NotificationService] Local notification permission denied.');
      }
    }

    // 2. Create Notification Channel for Android
    if (Capacitor.getPlatform() === 'android') {
      await LocalNotifications.createChannel({
        id: 'gigejob_notifications',
        name: 'Gigejob Notificaciones',
        description: 'Notificaciones de solicitudes y mensajes',
        importance: 5, // max importance for notification bar popups
        visibility: 1, // public
        sound: 'beep.wav',
        vibration: true,
      });
    }

    // 3. Request Push Notification permissions
    const pushPerms = await PushNotifications.checkPermissions();
    if (pushPerms.receive !== 'granted') {
      await PushNotifications.requestPermissions();
    }
    await PushNotifications.register().catch(err => {
      console.log('[NotificationService] Push registration notice:', err);
    });

    return true;
  } catch (error) {
    console.error('[NotificationService] Initialization error:', error);
    return false;
  }
}

/**
 * Sets the badge count on the application icon (globos en el icono)
 */
export async function setAppBadgeCount(count: number): Promise<void> {
  try {
    const isSupported = await Badge.isSupported();
    if (isSupported.isSupported) {
      const sanitizedCount = Math.max(0, count);
      await Badge.set({ count: sanitizedCount });
      console.log(`[NotificationService] App icon badge set to ${sanitizedCount}`);
    }
  } catch (error) {
    console.warn('[NotificationService] Error setting badge count:', error);
  }
}

/**
 * Clears the app icon badge count
 */
export async function clearAppBadgeCount(): Promise<void> {
  await setAppBadgeCount(0);
}

/**
 * Trigger a notification in the notification bar (barra de notificaciones)
 * and update the app icon badge count.
 */
export async function triggerNotificationBanner(payload: NotificationPayload): Promise<void> {
  const notifId = payload.id || Math.floor(Math.random() * 1000000) + 1;

  // Update app icon badge if count is provided
  if (typeof payload.badgeCount === 'number') {
    await setAppBadgeCount(payload.badgeCount);
  }

  // Trigger web notification fallback if non-native
  if (!Capacitor.isNativePlatform()) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(payload.title, { body: payload.body, data: payload.data });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(payload.title, { body: payload.body, data: payload.data });
        }
      });
    }
    return;
  }

  // Schedule native Local Notification in the system notification bar
  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          title: payload.title,
          body: payload.body,
          id: notifId,
          schedule: { at: new Date(Date.now() + 100) }, // fire immediately
          sound: 'beep.wav',
          channelId: 'gigejob_notifications',
          extra: payload.data || {},
        },
      ],
    });
    console.log(`[NotificationService] System notification scheduled: ${payload.title}`);
  } catch (error) {
    console.error('[NotificationService] Error scheduling local notification:', error);
  }
}

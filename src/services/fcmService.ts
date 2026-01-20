import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import {Platform, Alert, PermissionsAndroid} from 'react-native';
import * as Notifications from 'expo-notifications';

/**
 * Request FCM permissions (Android 13+)
 */
export async function requestFCMPermissions(): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true; // Auto-granted on Android < 13
    }

    // iOS
    const authStatus = await messaging().requestPermission();
    return (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    );
  } catch (error) {
    console.error('Error requesting FCM permissions:', error);
    return false;
  }
}

/**
 * Get FCM token
 */
export async function getFCMToken(): Promise<string | null> {
  try {
    // Check if device supports FCM
    if (!messaging().isDeviceRegisteredForRemoteMessages) {
      await messaging().registerDeviceForRemoteMessages();
    }

    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

/**
 * Delete FCM token (for logout)
 */
export async function deleteFCMToken(): Promise<void> {
  try {
    await messaging().deleteToken();
    console.log('FCM token deleted');
  } catch (error) {
    console.error('Error deleting FCM token:', error);
  }
}

/**
 * Setup FCM listeners
 */
export function setupFCMListeners(
  onMessageReceived?: (message: FirebaseMessagingTypes.RemoteMessage) => void,
  onNotificationOpened?: (
    message: FirebaseMessagingTypes.RemoteMessage,
  ) => void,
) {
  // Foreground message handler
  const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
    console.log('FCM Message received in foreground:', remoteMessage);

    // Display local notification when app is in foreground
    if (remoteMessage.notification) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: remoteMessage.notification.title || 'New Notification',
          body: remoteMessage.notification.body || '',
          data: remoteMessage.data || {},
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });
    }

    if (onMessageReceived) {
      onMessageReceived(remoteMessage);
    }
  });

  // Background/Quit message handler
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('FCM Message handled in background:', remoteMessage);

    if (onMessageReceived) {
      onMessageReceived(remoteMessage);
    }
  });

  // Notification opened app from background/quit state
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('Notification opened app from background:', remoteMessage);

    if (onNotificationOpened) {
      onNotificationOpened(remoteMessage);
    }
  });

  // Check if app was opened by a notification (when app was completely quit)
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log('Notification opened app from quit state:', remoteMessage);

        if (onNotificationOpened) {
          onNotificationOpened(remoteMessage);
        }
      }
    });

  // Token refresh listener
  const unsubscribeTokenRefresh = messaging().onTokenRefresh(async token => {
    console.log('FCM Token refreshed:', token);
    // TODO: Send new token to your backend
  });

  // Return cleanup function
  return () => {
    unsubscribeForeground();
    unsubscribeTokenRefresh();
  };
}

/**
 * Subscribe to a topic
 */
export async function subscribeToTopic(topic: string): Promise<void> {
  try {
    await messaging().subscribeToTopic(topic);
    console.log(`Subscribed to topic: ${topic}`);
  } catch (error) {
    console.error(`Error subscribing to topic ${topic}:`, error);
  }
}

/**
 * Unsubscribe from a topic
 */
export async function unsubscribeFromTopic(topic: string): Promise<void> {
  try {
    await messaging().unsubscribeFromTopic(topic);
    console.log(`Unsubscribed from topic: ${topic}`);
  } catch (error) {
    console.error(`Error unsubscribing from topic ${topic}:`, error);
  }
}

/**
 * Check if app has notification permission
 */
export async function checkNotificationPermission(): Promise<boolean> {
  const authStatus = await messaging().hasPermission();
  return (
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL
  );
}

/**
 * Send FCM token to backend
 */
export async function sendFCMTokenToServer(
  userId: string,
  fcmToken: string,
  apiToken: string,
): Promise<boolean> {
  try {
    const {saveFCMToken} = await import('./api');
    const response = await saveFCMToken(
      userId,
      apiToken,
      fcmToken,
      Platform.OS,
    );
    return response.status === 'success';
  } catch (error) {
    console.error('Error sending FCM token to server:', error);
    return false;
  }
}

/**
 * Get notification badge count
 */
export async function getBadgeCount(): Promise<number> {
  try {
    if (Platform.OS === 'ios') {
      return (await messaging().getAPNSToken()) ? 0 : 0; // iOS badge handling
    }
    return 0;
  } catch (error) {
    console.error('Error getting badge count:', error);
    return 0;
  }
}

/**
 * Set notification badge count
 */
export async function setBadgeCount(count: number): Promise<void> {
  try {
    if (Platform.OS === 'ios') {
      await messaging().setAPNSToken(count.toString());
    }
    // Android badge is handled by notification channels
  } catch (error) {
    console.error('Error setting badge count:', error);
  }
}

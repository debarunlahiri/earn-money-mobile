import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import {Platform, Alert} from 'react-native';
import Constants from 'expo-constants';

// Configure how notifications should be handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Register for push notifications and get the Expo push token
 * @returns Promise<string | null> - Returns the push token or null if registration fails
 */
export async function registerForPushNotificationsAsync(): Promise<
  string | null
> {
  let token: string | null = null;

  if (Platform.OS === 'android') {
    // Set up Android notification channel
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#D4AF37',
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
    });

    // Create additional channels for different notification types
    await Notifications.setNotificationChannelAsync('leads', {
      name: 'New Leads',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4CAF50',
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
    });

    await Notifications.setNotificationChannelAsync('earnings', {
      name: 'Earnings Updates',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FFD700',
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
    });

    await Notifications.setNotificationChannelAsync('announcements', {
      name: 'Announcements',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2196F3',
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
    });
  }

  if (Device.isDevice) {
    const {status: existingStatus} = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const {status} = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert(
        'Notification Permission Required',
        'Please enable notifications in your device settings to receive important updates about leads and earnings.',
        [{text: 'OK'}],
      );
      return null;
    }

    try {
      // Get the Expo push token
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;

      if (!projectId) {
        console.error('Project ID not found in app.json');
        return null;
      }

      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;

      console.log('Expo Push Token:', token);
    } catch (error) {
      console.error('Error getting push token:', error);
      Alert.alert(
        'Error',
        'Failed to get push notification token. Please try again later.',
      );
    }
  } else {
    Alert.alert(
      'Error',
      'Push notifications only work on physical devices, not simulators/emulators.',
    );
  }

  return token;
}

/**
 * Schedule a local notification (for testing purposes)
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: any,
  channelId: string = 'default',
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: 'default',
      priority: Notifications.AndroidNotificationPriority.HIGH,
      vibrate: [0, 250, 250, 250],
    },
    trigger: null, // null means show immediately
  });
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get notification badge count
 */
export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

/**
 * Set notification badge count
 */
export async function setBadgeCount(count: number) {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Clear all notifications from the notification tray
 */
export async function dismissAllNotifications() {
  await Notifications.dismissAllNotificationsAsync();
}

/**
 * Add notification received listener
 * This is called when a notification is received while the app is in foreground
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void,
) {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Add notification response listener
 * This is called when user taps on a notification
 */
export function addNotificationResponseReceivedListener(
  callback: (response: Notifications.NotificationResponse) => void,
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Send push token to your backend server
 * You should call this after getting the token
 */
export async function sendPushTokenToServer(
  userId: string,
  token: string,
  apiToken: string,
): Promise<boolean> {
  try {
    // Replace with your actual API endpoint
    const response = await fetch('YOUR_API_ENDPOINT/save-push-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        userid: userId,
        push_token: token,
        device_type: Platform.OS,
        device_info: {
          brand: Device.brand,
          modelName: Device.modelName,
          osVersion: Device.osVersion,
        },
      }),
    });

    const data = await response.json();
    return data.status === 'success';
  } catch (error) {
    console.error('Error sending push token to server:', error);
    return false;
  }
}

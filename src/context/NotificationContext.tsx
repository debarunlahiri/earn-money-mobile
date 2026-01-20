import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import {
  registerForPushNotificationsAsync,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  setBadgeCount,
} from '../services/notificationService';
import {
  requestFCMPermissions,
  getFCMToken,
  setupFCMListeners,
  subscribeToTopic,
  sendFCMTokenToServer,
} from '../services/fcmService';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  expoPushToken: string | null;
  fcmToken: string | null;
  notification: Notifications.Notification | null;
  fcmMessage: FirebaseMessagingTypes.RemoteMessage | null;
  notificationCount: number;
  resetNotificationCount: () => void;
  refreshPushToken: () => Promise<void>;
  refreshFCMToken: () => Promise<void>;
  subscribeToNotificationTopic: (topic: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  expoPushToken: null,
  fcmToken: null,
  notification: null,
  fcmMessage: null,
  notificationCount: 0,
  resetNotificationCount: () => {},
  refreshPushToken: async () => {},
  refreshFCMToken: async () => {},
  subscribeToNotificationTopic: async () => {},
});

export const useNotifications = () => useContext(NotificationContext);

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [fcmMessage, setFcmMessage] = useState<FirebaseMessagingTypes.RemoteMessage | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const { userData } = useAuth();

  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const fcmUnsubscribe = useRef<(() => void) | null>(null);

  // Refresh Expo Push Token
  const refreshPushToken = async () => {
    const token = await registerForPushNotificationsAsync();
    if (token) {
      setExpoPushToken(token);
      console.log('Expo Push token registered:', token);
    }
  };

  // Refresh FCM Token
  const refreshFCMToken = async () => {
    const hasPermission = await requestFCMPermissions();
    if (hasPermission) {
      const token = await getFCMToken();
      if (token) {
        setFcmToken(token);
        console.log('FCM token registered:', token);
        
        // Send FCM token to backend
        if (userData?.userid && userData?.token) {
          await sendFCMTokenToServer(userData.userid, token, userData.token);
        }
      }
    }
  };

  // Subscribe to notification topic
  const subscribeToNotificationTopic = async (topic: string) => {
    await subscribeToTopic(topic);
  };

  const resetNotificationCount = () => {
    setNotificationCount(0);
    setBadgeCount(0);
  };

  useEffect(() => {
    // Register for both Expo and FCM push notifications
    refreshPushToken();
    refreshFCMToken();

    // Setup Expo notification listeners
    notificationListener.current = addNotificationReceivedListener((notification) => {
      console.log('Expo notification received in foreground:', notification);
      setNotification(notification);
      setNotificationCount((prev) => prev + 1);
    });

    responseListener.current = addNotificationResponseReceivedListener((response) => {
      console.log('Expo notification tapped:', response);
      const data = response.notification.request.content.data;
      
      // Handle navigation based on notification type
      // TODO: Add your navigation logic here
      // Example:
      // if (data.type === 'new_lead') {
      //   navigation.navigate('MyLeads', { leadId: data.leadId });
      // }
      
      resetNotificationCount();
    });

    // Setup FCM listeners
    fcmUnsubscribe.current = setupFCMListeners(
      // On message received
      (message) => {
        console.log('FCM message received:', message);
        setFcmMessage(message);
        setNotificationCount((prev) => prev + 1);
      },
      // On notification opened
      (message) => {
        console.log('FCM notification opened:', message);
        
        // Handle navigation based on notification data
        const data = message.data;
        // TODO: Add your navigation logic here
        // Example:
        // if (data?.type === 'new_lead') {
        //   navigation.navigate('MyLeads', { leadId: data.leadId });
        // }
        
        resetNotificationCount();
      }
    );

    // Cleanup listeners on unmount
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
      if (fcmUnsubscribe.current) {
        fcmUnsubscribe.current();
      }
    };
  }, []);

  // Update tokens when user logs in
  useEffect(() => {
    if (userData?.userid && userData?.token) {
      console.log('User authenticated, syncing tokens...');
      
      // Refresh both tokens when user logs in
      if (!expoPushToken) {
        refreshPushToken();
      }
      if (!fcmToken) {
        refreshFCMToken();
      }
      
      // Subscribe to user-specific topics
      if (fcmToken) {
        subscribeToNotificationTopic(`user_${userData.userid}`);
        subscribeToNotificationTopic('all_users');
      }
    }
  }, [userData]);

  const value: NotificationContextType = {
    expoPushToken,
    fcmToken,
    notification,
    fcmMessage,
    notificationCount,
    resetNotificationCount,
    refreshPushToken,
    refreshFCMToken,
    subscribeToNotificationTopic,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

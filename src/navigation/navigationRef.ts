import {createNavigationContainerRef} from '@react-navigation/native';
import type {RootStackParamList} from '../types/navigation';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

let pendingNotificationNavigation = false;

export const navigateToNotifications = () => {
  if (navigationRef.isReady()) {
    navigationRef.navigate('Home', {
      screen: 'NotificationTab',
    });
    pendingNotificationNavigation = false;
    return;
  }

  pendingNotificationNavigation = true;
};

export const flushPendingNotificationNavigation = () => {
  if (!pendingNotificationNavigation || !navigationRef.isReady()) {
    return;
  }

  navigationRef.navigate('Home', {
    screen: 'NotificationTab',
  });
  pendingNotificationNavigation = false;
};

import {DeviceEventEmitter} from 'react-native';

export const AUTH_EVENTS = {
  LOGOUT_REQUIRED: 'AUTH_LOGOUT_REQUIRED',
};

// Store the pending logout message for display
let pendingLogoutMessage: string | null = null;

/**
 * Emits a logout event when API returns 401 (Invalid user or token)
 * This event is listened by AuthContext to trigger automatic logout
 */
export const emitLogoutRequired = (message?: string) => {
  pendingLogoutMessage =
    message || 'Your session has expired. Please login again.';
  DeviceEventEmitter.emit(AUTH_EVENTS.LOGOUT_REQUIRED, {
    message: pendingLogoutMessage,
  });
};

/**
 * Subscribe to logout required events
 * Returns a cleanup function to remove the listener
 */
export const subscribeToLogoutRequired = (
  callback: (data: {message?: string}) => void,
) => {
  const subscription = DeviceEventEmitter.addListener(
    AUTH_EVENTS.LOGOUT_REQUIRED,
    callback,
  );
  return () => subscription.remove();
};

/**
 * Get and clear the pending logout message
 */
export const getPendingLogoutMessage = (): string | null => {
  const message = pendingLogoutMessage;
  pendingLogoutMessage = null;
  return message;
};

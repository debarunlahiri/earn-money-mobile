import {Platform} from 'react-native';
import * as Location from 'expo-location';

type LocationErrorCode =
  | 'SERVICES_DISABLED'
  | 'PERMISSION_DENIED'
  | 'TIMEOUT'
  | 'UNAVAILABLE'
  | 'UNKNOWN';

type LocationError = Error & {code?: LocationErrorCode};

const createLocationError = (
  code: LocationErrorCode,
  message: string,
): LocationError => {
  const error = new Error(message) as LocationError;
  error.code = code;
  return error;
};

const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number,
): Promise<T> => {
  let timeoutRef: ReturnType<typeof setTimeout> | null = null;

  try {
    return await Promise.race<T>([
      promise,
      new Promise<T>((_, reject) => {
        timeoutRef = setTimeout(() => {
          reject(createLocationError('TIMEOUT', 'Location timeout'));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutRef) {
      clearTimeout(timeoutRef);
    }
  }
};

export interface ReliableLocationResult {
  location: Location.LocationObject;
  source: 'fresh' | 'lastKnown';
}

/**
 * Attempts to fetch location with fallbacks tuned for devices that frequently
 * fail to get a fresh GPS fix (for example some Realme/Oppo/Vivo models).
 */
export const getReliableCurrentLocation = async (): Promise<ReliableLocationResult> => {
  const isLocationEnabled = await Location.hasServicesEnabledAsync();
  if (!isLocationEnabled) {
    throw createLocationError(
      'SERVICES_DISABLED',
      'Location services are disabled',
    );
  }

  const {status: currentStatus} = await Location.getForegroundPermissionsAsync();
  let finalStatus = currentStatus;
  if (finalStatus !== 'granted') {
    const {status: requestedStatus} =
      await Location.requestForegroundPermissionsAsync();
    finalStatus = requestedStatus;
  }

  if (finalStatus !== 'granted') {
    throw createLocationError(
      'PERMISSION_DENIED',
      'Location permission not granted',
    );
  }

  // On Android, ask to enable network provider for better low-accuracy fixes.
  if (Platform.OS === 'android') {
    try {
      const provider = await Location.getProviderStatusAsync();
      if (!provider.gpsAvailable && !provider.networkAvailable) {
        await withTimeout(Location.enableNetworkProviderAsync(), 8000);
      }
    } catch (error) {
      // Non-fatal, continue with fallback attempts.
      console.log('Network provider prompt failed or dismissed:', error);
    }
  }

  // Best fallback for problematic devices: use any recent cached location.
  try {
    const lastKnown = await Location.getLastKnownPositionAsync({
      maxAge: 24 * 60 * 60 * 1000,
      requiredAccuracy: 100000,
    });
    if (lastKnown?.coords) {
      return {location: lastKnown, source: 'lastKnown'};
    }
  } catch (error) {
    console.log('No usable cached location:', error);
  }

  const attempts = [
    {accuracy: Location.Accuracy.Lowest, timeoutMs: 12000},
    {accuracy: Location.Accuracy.Low, timeoutMs: 16000},
    {accuracy: Location.Accuracy.Balanced, timeoutMs: 22000},
  ];

  for (const attempt of attempts) {
    try {
      const location = await withTimeout(
        Location.getCurrentPositionAsync({
          accuracy: attempt.accuracy,
          mayShowUserSettingsDialog: true,
        }),
        attempt.timeoutMs,
      );

      if (location?.coords) {
        return {location, source: 'fresh'};
      }
    } catch (error) {
      console.log('Location attempt failed:', error);
    }
  }

  // Final fallback: subscribe to updates and capture first reading.
  try {
    const watchedLocation = await new Promise<Location.LocationObject>(
      (resolve, reject) => {
        let resolved = false;
        let subscription: Location.LocationSubscription | null = null;

        const timeoutRef = setTimeout(() => {
          if (!resolved) {
            subscription?.remove();
            reject(createLocationError('TIMEOUT', 'Location watch timeout'));
          }
        }, 25000);

        Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 1000,
            distanceInterval: 0,
          },
          loc => {
            if (resolved) {
              return;
            }
            if (loc?.coords) {
              resolved = true;
              clearTimeout(timeoutRef);
              subscription?.remove();
              resolve(loc);
            }
          },
        )
          .then(sub => {
            subscription = sub;
          })
          .catch(error => {
            if (!resolved) {
              clearTimeout(timeoutRef);
              reject(error);
            }
          });
      },
    );

    return {location: watchedLocation, source: 'fresh'};
  } catch (error) {
    console.log('Watch position fallback failed:', error);
  }

  throw createLocationError('UNAVAILABLE', 'Unable to fetch location');
};

export const getFriendlyLocationErrorMessage = (error: any): string => {
  const code: LocationErrorCode | undefined = error?.code;
  const message = (error?.message || '').toLowerCase();

  if (code === 'SERVICES_DISABLED') {
    return 'Enable Location Services and try again.';
  }

  if (code === 'PERMISSION_DENIED') {
    return 'Location permission denied. Enable it from app settings.';
  }

  if (
    code === 'TIMEOUT' ||
    message.includes('timeout') ||
    message.includes('timed out')
  ) {
    return (
      'Location request timed out. Turn on High Accuracy, disable battery optimization for this app, and try again.'
    );
  }

  if (
    code === 'UNAVAILABLE' ||
    message.includes('unavailable') ||
    message.includes('provider')
  ) {
    return (
      'Unable to get GPS location. Ensure GPS is ON, mobile data/Wi-Fi is available, then try again.'
    );
  }

  return 'Failed to fetch location. Please enter address manually.';
};

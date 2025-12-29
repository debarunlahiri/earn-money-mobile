import React, {createContext, useContext, useEffect, useState, ReactNode} from 'react';

interface AccelerometerData {
  x: number;
  y: number;
  z: number;
}

interface AccelerometerContextType {
  acceleration: AccelerometerData;
  isAvailable: boolean;
}

const AccelerometerContext = createContext<AccelerometerContextType>({
  acceleration: {x: 0, y: 0, z: 0},
  isAvailable: false,
});

export const useAccelerometer = () => useContext(AccelerometerContext);

interface AccelerometerProviderProps {
  children: ReactNode;
}

export const AccelerometerProvider: React.FC<AccelerometerProviderProps> = ({children}) => {
  const [acceleration, setAcceleration] = useState<AccelerometerData>({x: 0, y: 0, z: 0});
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    let Accelerometer: any = null;
    let subscription: any = null;
    let mounted = true;

    const setupAccelerometer = async () => {
      try {
        // Dynamically import only the Accelerometer to avoid loading other sensors
        // that may have unavailable native modules (like Pedometer)
        let Accel: any;
        try {
          // Use require to load the module with error handling
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const sensorsModule = require('expo-sensors');
          Accel = sensorsModule?.Accelerometer;
        } catch (importError: any) {
          // Check if it's a native module error
          if (importError?.message?.includes('native module') || 
              importError?.message?.includes('ExponentPedometer')) {
            console.log('expo-sensors native modules not available (development build required)');
          } else {
            console.log('Could not import expo-sensors:', importError?.message || importError);
          }
          setIsAvailable(false);
          return;
        }

        Accelerometer = Accel;

        if (!Accelerometer) {
          setIsAvailable(false);
          return;
        }

        if (Accelerometer.isAvailableAsync) {
          try {
            const available = await Accelerometer.isAvailableAsync();
            if (available && mounted) {
              setIsAvailable(true);
              Accelerometer.setUpdateInterval(100);
              subscription = Accelerometer.addListener((data: AccelerometerData) => {
                if (mounted) {
                  setAcceleration({
                    x: data.x || 0,
                    y: data.y || 0,
                    z: data.z || 0,
                  });
                }
              });
            } else {
              setIsAvailable(false);
            }
          } catch (availabilityError: any) {
            // Handle native module errors gracefully
            if (availabilityError?.message?.includes('native module')) {
              console.log('Accelerometer native module not available (development build required)');
            } else {
              console.log('Accelerometer availability check failed:', availabilityError?.message || availabilityError);
            }
            setIsAvailable(false);
          }
        } else {
          setIsAvailable(false);
        }
      } catch (error: any) {
        // Catch-all for any unexpected errors
        if (error?.message?.includes('native module') || error?.message?.includes('Exponent')) {
          console.log('Sensor native modules not available (development build required)');
        } else {
          console.log('Accelerometer setup failed, using static values:', error?.message || error);
        }
        setIsAvailable(false);
      }
    };

    setupAccelerometer();

    return () => {
      mounted = false;
      if (subscription && subscription.remove) {
        try {
          subscription.remove();
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  return (
    <AccelerometerContext.Provider value={{acceleration, isAvailable}}>
      {children}
    </AccelerometerContext.Provider>
  );
};


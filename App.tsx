import React from 'react';
import {StatusBar} from 'react-native';
import {ThemeProvider, useTheme} from './src/theme/ThemeContext';
import {AuthProvider} from './src/context/AuthContext';
import {NotificationProvider} from './src/context/NotificationContext';
import {AccelerometerProvider} from './src/components/AccelerometerContext';
import {ScrollVisibilityProvider} from './src/context/ScrollVisibilityContext';
import {DialogProvider} from './src/context/DialogContext';
import {SessionExpiredHandler} from './src/components/SessionExpiredHandler';
import {AppNavigator} from './src/navigation/AppNavigator';

const AppContent = () => {
  const {theme, isDark} = useTheme();

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <AppNavigator />
    </>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <DialogProvider>
            <AccelerometerProvider>
              <ScrollVisibilityProvider>
                <AppContent />
                <SessionExpiredHandler />
              </ScrollVisibilityProvider>
            </AccelerometerProvider>
          </DialogProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

import React from 'react';
import {StatusBar} from 'react-native';
import {ThemeProvider, useTheme} from './src/theme/ThemeContext';
import {AuthProvider} from './src/context/AuthContext';
import {AccelerometerProvider} from './src/components/AccelerometerContext';
import {ScrollVisibilityProvider} from './src/context/ScrollVisibilityContext';
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
        <AccelerometerProvider>
          <ScrollVisibilityProvider>
      <AppContent />
          </ScrollVisibilityProvider>
        </AccelerometerProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

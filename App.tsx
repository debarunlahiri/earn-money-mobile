import React from 'react';
import {StatusBar} from 'react-native';
import {ThemeProvider, useTheme} from './src/theme/ThemeContext';
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
      <AppContent />
    </ThemeProvider>
  );
};

export default App;

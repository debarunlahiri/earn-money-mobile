import React from 'react';
import {Image, View, StyleSheet, ActivityIndicator} from 'react-native';
import {useLogo} from '../context/LogoContext';
import {useTheme} from '../theme/ThemeContext';
import {DefaultLogo} from './DefaultLogo';

interface LogoProps {
  size?: number;
  style?: any;
  showFallbackOnError?: boolean;
  preferLocal?: boolean;
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center';
}

export const Logo: React.FC<LogoProps> = ({size = 60, style, showFallbackOnError = true, preferLocal = false, resizeMode = 'contain'}) => {
  const {logoUrl, isLoading, error} = useLogo();
  const {theme} = useTheme();

  // Local logo as primary fallback
  const localLogo = require('../../assets/logo/logo.jpg');

  if (isLoading && !preferLocal) {
    return (
      <View style={[styles.container, {width: size, height: size}, style]}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }

  // If preferLocal is true or no API logo available, use local logo
  if (preferLocal || !logoUrl || error) {
    return (
      <Image
        source={localLogo}
        style={[styles.image, {width: size, height: size}, style]}
        resizeMode={resizeMode}
        onError={(e) => {
          console.log('Local logo image load error:', e.nativeEvent.error);
        }}
      />
    );
  }

  // Use API logo if available
  return (
    <Image
      source={{uri: logoUrl}}
      style={[styles.image, {width: size, height: size}, style]}
      resizeMode={resizeMode}
      onError={(e) => {
        console.log('API logo image load error:', e.nativeEvent.error);
      }}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    borderRadius: 8,
  },
});

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '../theme/ThemeContext';

interface DefaultLogoProps {
  size?: number;
  style?: any;
}

export const DefaultLogo: React.FC<DefaultLogoProps> = ({size = 60, style}) => {
  const {theme} = useTheme();

  return (
    <View style={[styles.container, {width: size, height: size}, style]}>
      <View style={[styles.logoCircle, {backgroundColor: theme.colors.primary}]}>
        <Text style={[styles.logoText, {color: '#FFFFFF', fontSize: size * 0.4}]}>
          PLF
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoText: {
    fontWeight: '700',
    textAlign: 'center',
  },
});

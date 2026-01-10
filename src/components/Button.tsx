import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {useTheme} from '../theme/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const {theme} = useTheme();

  const renderButton = () => {
    if (variant === 'primary') {
      return (
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: theme.colors.primary,
              opacity: disabled || loading ? 0.6 : 1,
            },
            style,
          ]}
          onPress={onPress}
          disabled={disabled || loading}
          hitSlop={{top: 5, bottom: 5, left: 5, right: 5}}>
          {loading ? (
            <ActivityIndicator color={theme.colors.background} />
          ) : (
            <>
              {icon && <>{icon}</>}
              <Text style={[styles.primaryText, textStyle]}>{title}</Text>
            </>
          )}
        </TouchableOpacity>
      );
    }

    if (variant === 'outline') {
      return (
        <TouchableOpacity
          style={[
            styles.button,
            styles.outlineButton,
            {
              borderColor: theme.colors.primary,
              opacity: disabled || loading ? 0.6 : 1,
            },
            style,
          ]}
          onPress={onPress}
          disabled={disabled || loading}
          hitSlop={{top: 5, bottom: 5, left: 5, right: 5}}>
          {loading ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : (
            <>
              {icon && <>{icon}</>}
              <Text
                style={[
                  styles.outlineText,
                  {color: theme.colors.primary},
                  textStyle,
                ]}>
                {title}
              </Text>
            </>
          )}
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={[
          styles.button,
          styles.secondaryButton,
          {
            backgroundColor: theme.colors.surface,
            opacity: disabled || loading ? 0.6 : 1,
          },
          style,
        ]}
        onPress={onPress}
        disabled={disabled || loading}
        hitSlop={{top: 5, bottom: 5, left: 5, right: 5}}>
        {loading ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : (
          <>
            {icon && <>{icon}</>}
            <Text
              style={[
                styles.secondaryText,
                {color: theme.colors.text},
                textStyle,
              ]}>
              {title}
            </Text>
          </>
        )}
      </TouchableOpacity>
    );
  };

  return renderButton();
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minHeight: 56,
  },
  outlineButton: {
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  secondaryButton: {
    backgroundColor: '#F5F5F5',
  },
  primaryText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
    marginLeft: 8,
  },
  outlineText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

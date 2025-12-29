import React from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import {useTheme} from '../theme/ThemeContext';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  leftIcon,
  rightIcon,
  style,
  ...props
}) => {
  const {theme} = useTheme();

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, {color: theme.colors.text}]}>{label}</Text>
      )}
      <View
        style={[
          styles.blurWrapper,
          {
            borderColor: error
              ? theme.colors.error
              : 'rgba(212, 175, 55, 0.5)',
          },
        ]}>
        <View
          style={[
            styles.inputContainer,
            {
              borderColor: 'rgba(255, 255, 255, 0.15)',
            },
          ]}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={[
            styles.input,
            {
              color: theme.colors.text,
              paddingLeft: leftIcon ? 0 : 16,
            },
            style,
          ]}
          placeholderTextColor={theme.colors.textSecondary}
          {...props}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </View>
      </View>
      {error && (
        <Text style={[styles.errorText, {color: theme.colors.error}]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  blurWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(139, 69, 19, 0.12)',
    borderWidth: 1.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 50,
    backgroundColor: 'rgba(139, 69, 19, 0.08)',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leftIcon: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  rightIcon: {
    paddingRight: 16,
    paddingLeft: 8,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});

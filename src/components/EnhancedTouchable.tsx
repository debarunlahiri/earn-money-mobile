import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native';

interface EnhancedTouchableProps extends TouchableOpacityProps {
  /**
   * Custom hit slop values. Defaults to {top: 5, bottom: 5, left: 5, right: 5}
   */
  customHitSlop?: {top: number; bottom: number; left: number; right: number};
  /**
   * Size variant for predefined hit slop values
   * - small: {top: 2, bottom: 2, left: 2, right: 2} - for list items
   * - medium: {top: 5, bottom: 5, left: 5, right: 5} - default
   * - large: {top: 10, bottom: 10, left: 10, right: 10} - for FABs, important buttons
   */
  hitSlopSize?: 'small' | 'medium' | 'large';
}

/**
 * Enhanced TouchableOpacity component with built-in fixes for ColorOS/FuntouchOS devices
 * (Realme, Oppo, Vivo).
 *
 * This component automatically adds:
 * - collapsable={false} to prevent view hierarchy optimization issues
 * - hitSlop for better touch target sizes
 *
 * Usage:
 * ```tsx
 * <EnhancedTouchable onPress={handlePress}>
 *   <Text>Click me</Text>
 * </EnhancedTouchable>
 * ```
 *
 * With custom hit slop:
 * ```tsx
 * <EnhancedTouchable
 *   onPress={handlePress}
 *   hitSlopSize="large"
 * >
 *   <Icon name="add" />
 * </EnhancedTouchable>
 * ```
 */
export const EnhancedTouchable: React.FC<EnhancedTouchableProps> = ({
  children,
  customHitSlop,
  hitSlopSize = 'medium',
  hitSlop,
  ...rest
}) => {
  // Predefined hit slop sizes
  const hitSlopSizes = {
    small: {top: 2, bottom: 2, left: 2, right: 2},
    medium: {top: 5, bottom: 5, left: 5, right: 5},
    large: {top: 10, bottom: 10, left: 10, right: 10},
  };

  // Determine which hit slop to use
  const finalHitSlop =
    customHitSlop || hitSlop || hitSlopSizes[hitSlopSize];

  return (
    <TouchableOpacity
      {...rest}
      hitSlop={finalHitSlop}
    >
      <View collapsable={false}>
        {children}
      </View>
    </TouchableOpacity>
  );
};

/**
 * Example usage in a component:
 *
 * import { EnhancedTouchable } from '../components/EnhancedTouchable';
 *
 * // Basic usage
 * <EnhancedTouchable onPress={handlePress}>
 *   <Text>Click me</Text>
 * </EnhancedTouchable>
 *
 * // With size variant
 * <EnhancedTouchable onPress={handlePress} hitSlopSize="large">
 *   <Icon name="add" size={24} />
 * </EnhancedTouchable>
 *
 * // With custom hit slop
 * <EnhancedTouchable
 *   onPress={handlePress}
 *   customHitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
 * >
 *   <Text>Custom touch area</Text>
 * </EnhancedTouchable>
 *
 * // With all TouchableOpacity props
 * <EnhancedTouchable
 *   onPress={handlePress}
 *   activeOpacity={0.7}
 *   disabled={isLoading}
 *   style={styles.button}
 * >
 *   <Text>Submit</Text>
 * </EnhancedTouchable>
 */

import React from 'react';
import {TouchableOpacity, View, StyleSheet, ViewStyle} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useTheme} from '../theme/ThemeContext';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

interface FABProps {
  onPress: () => void;
  icon?: string;
  style?: ViewStyle;
}

// Tab bar height is approximately 60-70px
const TAB_BAR_HEIGHT = 70;

export const FAB: React.FC<FABProps> = ({onPress, icon = 'add', style}) => {
  const {theme} = useTheme();
  const insets = useSafeAreaInsets();
  
  // Position FAB above the tab bar with some additional spacing
  const bottomOffset = TAB_BAR_HEIGHT + Math.max(insets.bottom, 16) + 16;

  return (
    <TouchableOpacity
      style={[
        styles.fab, 
        {
          backgroundColor: theme.colors.primary,
          bottom: bottomOffset,
        }, 
        style
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
      <View style={styles.iconContainer} collapsable={false}>
        <Icon name={icon} size={28} color="#FFFFFF" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 1000,
  },
  iconContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

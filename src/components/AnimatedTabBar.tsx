import React from 'react';
import {Animated, View, StyleSheet} from 'react-native';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {BottomTabBar} from '@react-navigation/bottom-tabs';
import {BlurView} from '@react-native-community/blur';
import {useScrollVisibility} from '../context/ScrollVisibilityContext';

export const AnimatedTabBar: React.FC<BottomTabBarProps> = (props) => {
  const {bottomNavTranslateY} = useScrollVisibility();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{translateY: bottomNavTranslateY}],
        },
      ]}>
      {/* Blur background */}
      <BlurView
        style={StyleSheet.absoluteFillObject}
        blurType="dark"
        blurAmount={20}
        reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.9)"
      />
      {/* Subtle overlay for better contrast */}
      <View style={styles.overlay} />
      <BottomTabBar {...props} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.2)',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
});

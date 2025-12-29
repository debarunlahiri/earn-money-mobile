import React from 'react';
import {Animated} from 'react-native';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {BottomTabBar} from '@react-navigation/bottom-tabs';
import {useScrollVisibility} from '../context/ScrollVisibilityContext';

export const AnimatedTabBar: React.FC<BottomTabBarProps> = (props) => {
  const {bottomNavTranslateY} = useScrollVisibility();

  return (
    <Animated.View
      style={{
        transform: [{translateY: bottomNavTranslateY}],
      }}>
      <BottomTabBar {...props} />
    </Animated.View>
  );
};


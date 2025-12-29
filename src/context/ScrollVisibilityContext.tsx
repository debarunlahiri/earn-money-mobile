import React, {createContext, useContext, useRef, ReactNode} from 'react';
import {Animated} from 'react-native';

interface ScrollVisibilityContextType {
  headerTranslateY: Animated.Value;
  bottomNavTranslateY: Animated.Value;
  handleScroll: (event: any) => void;
}

const ScrollVisibilityContext = createContext<ScrollVisibilityContextType>({
  headerTranslateY: new Animated.Value(0),
  bottomNavTranslateY: new Animated.Value(0),
  handleScroll: () => {},
});

export const useScrollVisibility = () => useContext(ScrollVisibilityContext);

interface ScrollVisibilityProviderProps {
  children: ReactNode;
}

export const ScrollVisibilityProvider: React.FC<ScrollVisibilityProviderProps> = ({
  children,
}) => {
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const bottomNavTranslateY = useRef(new Animated.Value(0)).current;
  const isHeaderVisible = useRef(true);
  const isBottomNavVisible = useRef(true);
  const lastScrollY = useRef(0);
  const scrollThreshold = 10;

  const animateHeader = (visible: boolean) => {
    if (isHeaderVisible.current === visible) return;
    isHeaderVisible.current = visible;
    Animated.timing(headerTranslateY, {
      toValue: visible ? 0 : -200,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const animateBottomNav = (visible: boolean) => {
    if (isBottomNavVisible.current === visible) return;
    isBottomNavVisible.current = visible;
    Animated.timing(bottomNavTranslateY, {
      toValue: visible ? 0 : 100,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Disabled - header and bottom nav stay visible at all times
  const handleScroll = (_event: any) => {
    // No-op - scroll hide/show behavior disabled
  };

  return (
    <ScrollVisibilityContext.Provider
      value={{
        headerTranslateY,
        bottomNavTranslateY,
        handleScroll,
      }}>
      {children}
    </ScrollVisibilityContext.Provider>
  );
};


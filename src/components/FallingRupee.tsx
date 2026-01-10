import React, {useEffect, useRef, useMemo, memo} from 'react';
import {View, Animated, StyleSheet, Image, Dimensions} from 'react-native';

interface FadingRupeeProps {
  delay: number;
  fadeDuration: number;
  holdDuration: number;
  initialX: number;
  initialY: number;
  size: number;
}

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const RupeeImage: React.FC<{size: number}> = memo(({size}) => {
  return (
    <Image
      source={require('../../assets/images/rupee.png')}
      style={{width: size, height: size}}
      resizeMode="contain"
    />
  );
});

export const FadingRupee: React.FC<FadingRupeeProps> = memo(({
  delay,
  fadeDuration,
  holdDuration,
  initialX,
  initialY,
  size,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const positionX = useRef(new Animated.Value(initialX)).current;
  const positionY = useRef(new Animated.Value(initialY)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    
    const runAnimationLoop = () => {
      if (!isMounted.current) return;

      // Get new random position
      const newX = Math.random() * (SCREEN_WIDTH - 50);
      const newY = Math.random() * (SCREEN_HEIGHT - 150);

      animationRef.current = Animated.sequence([
        Animated.delay(delay),
        // Fade in
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: fadeDuration,
          useNativeDriver: true,
        }),
        // Hold
        Animated.delay(holdDuration),
        // Fade out
        Animated.timing(opacity, {
          toValue: 0,
          duration: fadeDuration,
          useNativeDriver: true,
        }),
        // Move to new position while invisible (no animation, instant)
        Animated.parallel([
          Animated.timing(positionX, {
            toValue: newX,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(positionY, {
            toValue: newY,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        // Small delay before next cycle
        Animated.delay(100),
      ]);

      animationRef.current.start(({finished}) => {
        if (finished && isMounted.current) {
          // Continue looping without initial delay
          runContinuousLoop();
        }
      });
    };

    const runContinuousLoop = () => {
      if (!isMounted.current) return;

      const newX = Math.random() * (SCREEN_WIDTH - 50);
      const newY = Math.random() * (SCREEN_HEIGHT - 150);

      animationRef.current = Animated.sequence([
        // Fade in
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: fadeDuration,
          useNativeDriver: true,
        }),
        // Hold
        Animated.delay(holdDuration),
        // Fade out
        Animated.timing(opacity, {
          toValue: 0,
          duration: fadeDuration,
          useNativeDriver: true,
        }),
        // Move to new position while invisible
        Animated.parallel([
          Animated.timing(positionX, {
            toValue: newX,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(positionY, {
            toValue: newY,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(100),
      ]);

      animationRef.current.start(({finished}) => {
        if (finished && isMounted.current) {
          runContinuousLoop();
        }
      });
    };

    runAnimationLoop();

    return () => {
      isMounted.current = false;
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [delay, fadeDuration, holdDuration, opacity, positionX, positionY]);

  return (
    <Animated.View
      style={[
        styles.rupeeContainer,
        {
          transform: [
            {translateX: positionX},
            {translateY: positionY},
          ],
          opacity,
        },
      ]}>
      <RupeeImage size={size} />
    </Animated.View>
  );
});

// Keep the old export name for backward compatibility
export const FallingRupee = FadingRupee;

interface RupeeConfig {
  id: number;
  delay: number;
  fadeDuration: number;
  holdDuration: number;
  initialX: number;
  initialY: number;
  size: number;
}

interface FallingRupeesProps {
  count?: number;
}

export const FallingRupees: React.FC<FallingRupeesProps> = memo(({count = 8}) => {
  // Generate rupee configs once using useMemo to prevent re-creation
  const rupees = useMemo<RupeeConfig[]>(() => {
    return Array.from({length: count}, (_, i) => ({
      id: i,
      delay: i * 400 + Math.random() * 600, // Staggered start
      fadeDuration: 1000 + Math.random() * 500, // 1000-1500ms fade
      holdDuration: 2000 + Math.random() * 1500, // 2000-3500ms hold
      initialX: Math.random() * (SCREEN_WIDTH - 50),
      initialY: Math.random() * (SCREEN_HEIGHT - 150),
      size: 22 + Math.random() * 12, // 22-34px size
    }));
  }, [count]);

  return (
    <View style={styles.container} pointerEvents="none">
      {rupees.map((rupee) => (
        <FadingRupee
          key={rupee.id}
          delay={rupee.delay}
          fadeDuration={rupee.fadeDuration}
          holdDuration={rupee.holdDuration}
          initialX={rupee.initialX}
          initialY={rupee.initialY}
          size={rupee.size}
        />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  rupeeContainer: {
    position: 'absolute',
  },
});


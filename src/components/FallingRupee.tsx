import React, {useEffect, useRef, useState, useCallback} from 'react';
import {View, Animated, StyleSheet, Image, Dimensions} from 'react-native';

interface FadingRupeeProps {
  delay: number;
  fadeDuration: number;
  holdDuration: number;
}

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const RupeeImage: React.FC<{size: number}> = ({size}) => {
  return (
    <Image
      source={require('../../assets/images/rupee.png')}
      style={{width: size, height: size}}
      resizeMode="contain"
    />
  );
};

export const FadingRupee: React.FC<FadingRupeeProps> = ({
  delay,
  fadeDuration,
  holdDuration,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const [position, setPosition] = useState({
    x: Math.random() * (SCREEN_WIDTH - 40),
    y: Math.random() * (SCREEN_HEIGHT - 100),
  });
  const [size] = useState(20 + Math.random() * 15);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const isMounted = useRef(true);

  const getRandomPosition = useCallback(() => {
    return {
      x: Math.random() * (SCREEN_WIDTH - 40),
      y: Math.random() * (SCREEN_HEIGHT - 100),
    };
  }, []);

  const runAnimation = useCallback(() => {
    if (!isMounted.current) return;

    // Fade in -> Hold -> Fade out -> Move to new position -> Repeat
    animationRef.current = Animated.sequence([
      Animated.delay(delay),
      // Fade in
      Animated.timing(opacity, {
        toValue: 0.8,
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
      // Small delay before repositioning
      Animated.delay(200),
    ]);

    animationRef.current.start(({finished}) => {
      if (finished && isMounted.current) {
        // Move to new random position
        setPosition(getRandomPosition());
        // Run animation again with no initial delay
        runAnimationLoop();
      }
    });
  }, [delay, fadeDuration, holdDuration, opacity, getRandomPosition]);

  const runAnimationLoop = useCallback(() => {
    if (!isMounted.current) return;

    animationRef.current = Animated.sequence([
      // Fade in
      Animated.timing(opacity, {
        toValue: 0.8,
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
      // Small delay before repositioning
      Animated.delay(200),
    ]);

    animationRef.current.start(({finished}) => {
      if (finished && isMounted.current) {
        setPosition(getRandomPosition());
        runAnimationLoop();
      }
    });
  }, [fadeDuration, holdDuration, opacity, getRandomPosition]);

  useEffect(() => {
    isMounted.current = true;
    runAnimation();

    return () => {
      isMounted.current = false;
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [runAnimation]);

  return (
    <Animated.View
      style={[
        styles.rupeeContainer,
        {
          left: position.x,
          top: position.y,
          opacity,
        },
      ]}>
      <RupeeImage size={size} />
    </Animated.View>
  );
};

// Keep the old export name for backward compatibility
export const FallingRupee = FadingRupee;

interface FallingRupeesProps {
  count?: number;
}

export const FallingRupees: React.FC<FallingRupeesProps> = ({count = 15}) => {
  const [rupees, setRupees] = useState<Array<{
    id: number;
    delay: number;
    fadeDuration: number;
    holdDuration: number;
  }>>([]);

  useEffect(() => {
    const newRupees = Array.from({length: count}, (_, i) => ({
      id: i,
      delay: i * 300 + Math.random() * 500, // Staggered start
      fadeDuration: 800 + Math.random() * 400, // 800-1200ms fade
      holdDuration: 1500 + Math.random() * 1000, // 1500-2500ms hold
    }));
    setRupees(newRupees);
  }, [count]);

  return (
    <View style={styles.container} pointerEvents="none">
      {rupees.map((rupee) => (
        <FadingRupee
          key={rupee.id}
          delay={rupee.delay}
          fadeDuration={rupee.fadeDuration}
          holdDuration={rupee.holdDuration}
        />
      ))}
    </View>
  );
};

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


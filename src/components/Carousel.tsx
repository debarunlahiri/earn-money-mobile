import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  ScrollView,
  Dimensions,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

export interface CarouselItem {
  id: string;
  image?: ImageSourcePropType;
  gradient?: readonly [string, string, ...string[]];
  component?: React.ReactNode;
}

interface CarouselProps {
  items: CarouselItem[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  height?: number;
  showPagination?: boolean;
  onItemPress?: (item: CarouselItem, index: number) => void;
}

export const Carousel: React.FC<CarouselProps> = ({
  items,
  autoPlay = true,
  autoPlayInterval = 3000,
  height = 200,
  showPagination = true,
  onItemPress,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Card spacing and sizing
  const HORIZONTAL_PADDING = 8;
  const CARD_SPACING = 12;
  const cardWidth = SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_SPACING;

  useEffect(() => {
    if (autoPlay && items.length > 1) {
      startAutoPlay();
    }

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, [autoPlay, items.length, currentIndex]);

  const startAutoPlay = () => {
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
    }

    autoPlayTimerRef.current = setInterval(() => {
      const nextIndex = (currentIndex + 1) % items.length;
      scrollToIndex(nextIndex);
    }, autoPlayInterval);
  };

  const scrollToIndex = (index: number) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: index * SCREEN_WIDTH,
        animated: true,
      });
      setCurrentIndex(index);
    }
  };

  const handleScroll = Animated.event(
    [{nativeEvent: {contentOffset: {x: scrollX}}}],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / SCREEN_WIDTH);
        setCurrentIndex(index);
      },
    }
  );

  const handleMomentumScrollEnd = () => {
    if (autoPlay) {
      startAutoPlay();
    }
  };

  const handleScrollBeginDrag = () => {
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        decelerationRate="fast">
        {items.map((item, index) => {
          const inputRange = [
            (index - 1) * SCREEN_WIDTH,
            index * SCREEN_WIDTH,
            (index + 1) * SCREEN_WIDTH,
          ];

          // Smooth scale effect
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.92, 1, 0.92],
            extrapolate: 'clamp',
          });

          // Fade effect
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.7, 1, 0.7],
            extrapolate: 'clamp',
          });

          // Subtle vertical movement
          const translateY = scrollX.interpolate({
            inputRange,
            outputRange: [10, 0, 10],
            extrapolate: 'clamp',
          });

          return (
            <View key={item.id} style={{width: SCREEN_WIDTH, paddingHorizontal: HORIZONTAL_PADDING}}>
              <Animated.View
                style={[
                  styles.cardContainer,
                  {
                    width: cardWidth,
                    height,
                    transform: [
                      {scale},
                      {translateY},
                    ],
                    opacity,
                  },
                ]}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => onItemPress?.(item, index)}
                  style={styles.cardTouchable}>
                  {/* Gradient border with glow */}
                  <LinearGradient
                    colors={
                      item.gradient || [
                        'rgba(212, 175, 55, 0.6)',
                        'rgba(212, 175, 55, 0.3)',
                        'rgba(212, 175, 55, 0.6)',
                      ] as const
                    }
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={styles.gradientBorder}>
                    <View style={styles.card}>
                      {/* Subtle glass overlay */}
                      <View style={styles.glassOverlay} />
                      
                      {/* Content */}
                      <View style={styles.contentContainer}>
                        {item.component ? (
                          item.component
                        ) : item.image ? (
                          <Image
                            source={item.image}
                            style={styles.cardImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <LinearGradient
                            colors={
                              item.gradient || [
                                'rgba(212, 175, 55, 0.25)',
                                'rgba(139, 69, 19, 0.15)',
                                'rgba(212, 175, 55, 0.1)',
                              ] as const
                            }
                            start={{x: 0, y: 0}}
                            end={{x: 1, y: 1}}
                            style={styles.defaultGradient}
                          />
                        )}
                      </View>
                      
                      {/* Subtle inner highlight */}
                      <View style={styles.innerHighlight} />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>
          );
        })}
      </ScrollView>

      {showPagination && items.length > 1 && (
        <View style={styles.pagination}>
          {items.map((_, index) => {
            const inputRange = [
              (index - 1) * SCREEN_WIDTH,
              index * SCREEN_WIDTH,
              (index + 1) * SCREEN_WIDTH,
            ];

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 28, 8],
              extrapolate: 'clamp',
            });

            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.4, 1, 0.4],
              extrapolate: 'clamp',
            });

            const dotScale = scrollX.interpolate({
              inputRange,
              outputRange: [1, 1.15, 1],
              extrapolate: 'clamp',
            });

            return (
              <TouchableOpacity
                key={index}
                onPress={() => scrollToIndex(index)}
                activeOpacity={0.8}
                style={styles.dotTouchable}>
                <Animated.View
                  style={[
                    styles.dotContainer,
                    {
                      transform: [{scale: dotScale}],
                    },
                  ]}>
                  {/* Active dot background glow */}
                  {index === currentIndex && (
                    <View style={styles.activeDotGlow} />
                  )}
                  {/* Main dot */}
                  <Animated.View
                    style={[
                      styles.dot,
                      {
                        width: dotWidth,
                        opacity: dotOpacity,
                        backgroundColor: index === currentIndex ? '#D4AF37' : 'rgba(212, 175, 55, 0.5)',
                      },
                    ]}
                  />
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    marginHorizontal: -24,
  },
  cardContainer: {
    alignSelf: 'center',
  },
  cardTouchable: {
    flex: 1,
  },
  gradientBorder: {
    flex: 1,
    borderRadius: 20,
    padding: 2,
    shadowColor: '#D4AF37',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  card: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'rgba(20, 20, 25, 0.95)',
  },
  glassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  contentContainer: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  defaultGradient: {
    flex: 1,
  },
  innerHighlight: {
    position: 'absolute',
    top: 1,
    left: 1,
    right: 1,
    bottom: 1,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.15)',
    pointerEvents: 'none',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    gap: 8,
  },
  dotTouchable: {
    padding: 4,
  },
  dotContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeDotGlow: {
    position: 'absolute',
    width: 32,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#D4AF37',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D4AF37',
  },
});

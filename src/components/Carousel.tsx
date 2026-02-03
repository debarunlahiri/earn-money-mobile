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
  height = 180,
  showPagination = true,
  onItemPress,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

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
      scrollViewRef.current?.scrollTo({
        x: nextIndex * SCREEN_WIDTH,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    }, autoPlayInterval);
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

  const handleScrollBeginDrag = () => {
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
    }
  };

  const handleMomentumScrollEnd = () => {
    if (autoPlay) {
      startAutoPlay();
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
        decelerationRate="fast"
        snapToInterval={SCREEN_WIDTH}
        snapToAlignment="center">
        {items.map((item, index) => {
          const inputRange = [
            (index - 1) * SCREEN_WIDTH,
            index * SCREEN_WIDTH,
            (index + 1) * SCREEN_WIDTH,
          ];

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.9, 1, 0.9],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.7, 1, 0.7],
            extrapolate: 'clamp',
          });

          return (
            <View key={item.id} style={styles.slide}>
              <Animated.View
                style={[
                  styles.card,
                  {
                    height,
                    transform: [{scale}],
                    opacity,
                  },
                ]}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => onItemPress?.(item, index)}
                  style={styles.touchable}>
                  <LinearGradient
                    colors={[
                      'rgba(212, 175, 55, 0.4)',
                      'rgba(212, 175, 55, 0.2)',
                      'rgba(212, 175, 55, 0.4)',
                    ]}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={styles.gradientBorder}>
                    <View style={styles.cardContent}>
                      {item.component ? (
                        item.component
                      ) : item.image ? (
                        <Image
                          source={item.image}
                          style={styles.image}
                          resizeMode="cover"
                        />
                      ) : (
                        <LinearGradient
                          colors={
                            item.gradient || [
                              'rgba(212, 175, 55, 0.25)',
                              'rgba(139, 69, 19, 0.15)',
                              'rgba(212, 175, 55, 0.1)',
                            ]
                          }
                          start={{x: 0, y: 0}}
                          end={{x: 1, y: 1}}
                          style={styles.defaultGradient}
                        />
                      )}
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
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });

            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.4, 1, 0.4],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity: dotOpacity,
                    backgroundColor:
                      index === currentIndex
                        ? '#D4AF37'
                        : 'rgba(212, 175, 55, 0.4)',
                  },
                ]}
              />
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
  slide: {
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: SCREEN_WIDTH - 48,
  },
  touchable: {
    flex: 1,
  },
  gradientBorder: {
    flex: 1,
    borderRadius: 16,
    padding: 2,
    shadowColor: '#D4AF37',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cardContent: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(20, 20, 25, 0.95)',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  defaultGradient: {
    flex: 1,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
});

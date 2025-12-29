import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Easing,
  Dimensions,
  ImageBackground,
  StatusBar,
  Image,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../theme/ThemeContext';
import {Button} from '../components/Button';
import {TextInput} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {LinearGradient} from 'expo-linear-gradient';
import {FallingRupees} from '../components/FallingRupee';
import {formatIndianPhoneNumber, isValidIndianPhoneNumber, formatPhoneNumberForDisplay, getFullPhoneNumber} from '../utils/phoneUtils';
import {verifyMobile} from '../services/api';
import {Alert, ActivityIndicator} from 'react-native';

const {width, height} = Dimensions.get('window');

interface RegisterScreenProps {
  navigation: any;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({navigation}) => {
  const {theme, isDark} = useTheme();
  const insets = useSafeAreaInsets();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const inputScaleAnim = useRef(new Animated.Value(1)).current;
  const inputBorderAnim = useRef(new Animated.Value(0)).current;
  const inputIconOpacityAnim = useRef(new Animated.Value(1)).current;
  const checkIconOpacityAnim = useRef(new Animated.Value(0)).current;
  const imageOpacityAnim = useRef(new Animated.Value(0)).current;
  const circle1Anim = useRef(new Animated.Value(0)).current;
  const circle2Anim = useRef(new Animated.Value(0)).current;
  const circle3Anim = useRef(new Animated.Value(0)).current;
  const rupee1Anim = useRef(new Animated.Value(0)).current;
  const rupee2Anim = useRef(new Animated.Value(0)).current;
  const rupee3Anim = useRef(new Animated.Value(0)).current;
  const rupee4Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(imageOpacityAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    const circle1Animation = Animated.loop(
      Animated.sequence([
        Animated.timing(circle1Anim, {
          toValue: 1,
          duration: 12000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(circle1Anim, {
          toValue: 0,
          duration: 12000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    circle1Animation.start();

    const circle2Animation = Animated.loop(
      Animated.sequence([
        Animated.timing(circle2Anim, {
          toValue: 1,
          duration: 16000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(circle2Anim, {
          toValue: 0,
          duration: 16000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    circle2Animation.start();

    const circle3Animation = Animated.loop(
      Animated.sequence([
        Animated.timing(circle3Anim, {
          toValue: 1,
          duration: 20000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(circle3Anim, {
          toValue: 0,
          duration: 20000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    circle3Animation.start();

    const rupee1Animation = Animated.loop(
      Animated.sequence([
        Animated.timing(rupee1Anim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rupee1Anim, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    rupee1Animation.start();

    const rupee2Animation = Animated.loop(
      Animated.sequence([
        Animated.timing(rupee2Anim, {
          toValue: 1,
          duration: 5000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rupee2Anim, {
          toValue: 0,
          duration: 5000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    rupee2Animation.start();

    const rupee3Animation = Animated.loop(
      Animated.sequence([
        Animated.timing(rupee3Anim, {
          toValue: 1,
          duration: 6000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rupee3Anim, {
          toValue: 0,
          duration: 6000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    rupee3Animation.start();

    const rupee4Animation = Animated.loop(
      Animated.sequence([
        Animated.timing(rupee4Anim, {
          toValue: 1,
          duration: 4500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rupee4Anim, {
          toValue: 0,
          duration: 4500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    rupee4Animation.start();
  }, []);

  const handlePhoneNumberChange = (text: string) => {
    const formatted = formatIndianPhoneNumber(text);
    setPhoneNumber(formatted);
  };

  const displayPhoneNumber = formatPhoneNumberForDisplay(phoneNumber);
  const isValidPhone = isValidIndianPhoneNumber(phoneNumber);

  useEffect(() => {
    if (isValidPhone) {
      Animated.parallel([
        Animated.spring(inputScaleAnim, {
          toValue: 1.02,
          tension: 100,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(inputBorderAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(inputIconOpacityAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(checkIconOpacityAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(inputScaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(inputBorderAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(inputIconOpacityAnim, {
          toValue: 0.6,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(checkIconOpacityAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [phoneNumber, isValidPhone]);

  const handleFocus = () => {
    setIsFocused(true);
    Animated.spring(inputScaleAnim, {
      toValue: 1.02,
      tension: 100,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!isValidPhone) {
      Animated.spring(inputScaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleRegister = async () => {
    if (isValidPhone) {
      setIsLoading(true);
      try {
        const fullPhoneNumber = getFullPhoneNumber(phoneNumber);
        // Remove +91 prefix for API call (API expects just the 10-digit number)
        const mobileNumber = phoneNumber;
        
        const response = await verifyMobile(mobileNumber);
        
        if (response.status === 'success' && response.status_code === 200) {
      navigation.navigate('OTPVerification', {
            phoneNumber: fullPhoneNumber,
        isRegister: true,
      });
        } else {
          Alert.alert('Error', response.message || 'Failed to send OTP');
        }
      } catch (error: any) {
        console.error('Error sending OTP:', error);
        Alert.alert('Error', error.message || 'Failed to send OTP. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const borderColor = inputBorderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      theme.colors.border,
      theme.colors.primary,
    ],
  });

  const borderWidth = inputBorderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1.5, 2.5],
  });

  const circle1Scale = circle1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  const circle1Opacity = circle1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0.8],
  });

  const circle2Scale = circle2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  const circle2Opacity = circle2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.7],
  });

  const circle3Scale = circle3Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });

  const circle3Opacity = circle3Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  const rupee1TranslateY = rupee1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const rupee1Rotation = rupee1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '10deg'],
  });

  const rupee1Opacity = rupee1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.15, 0.3],
  });

  const rupee2TranslateY = rupee2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  const rupee2Rotation = rupee2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-8deg'],
  });

  const rupee2Opacity = rupee2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.12, 0.25],
  });

  const rupee3TranslateY = rupee3Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -25],
  });

  const rupee3Rotation = rupee3Anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '12deg'],
  });

  const rupee3Opacity = rupee3Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 0.2],
  });

  const rupee4TranslateY = rupee4Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -18],
  });

  const rupee4Rotation = rupee4Anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-10deg'],
  });

  const rupee4Opacity = rupee4Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.13, 0.22],
  });

  return (
    <View style={styles.fullScreenContainer}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <Animated.View style={[styles.fullScreenBackground, {opacity: imageOpacityAnim}]}>
        <ImageBackground
          source={require('../../assets/images/bg_image_second.png')}
          style={styles.backgroundImage}
          resizeMode="cover">
          <Animated.View
            style={[
              styles.gradientCircle,
              styles.circle1,
              {
                transform: [{scale: circle1Scale}],
                opacity: circle1Opacity,
                zIndex: 1,
              },
            ]}>
            <LinearGradient
              colors={['rgba(212,175,55,0.6)', 'rgba(139,69,19,0.4)', 'rgba(212,175,55,0.2)']}
              style={styles.circleGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.gradientCircle,
              styles.circle2,
              {
                transform: [{scale: circle2Scale}],
                opacity: circle2Opacity,
                zIndex: 1,
              },
            ]}>
            <LinearGradient
              colors={['rgba(139,69,19,0.5)', 'rgba(212,175,55,0.3)', 'rgba(139,69,19,0.15)']}
              style={styles.circleGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.gradientCircle,
              styles.circle3,
              {
                transform: [{scale: circle3Scale}],
                opacity: circle3Opacity,
                zIndex: 1,
              },
            ]}>
            <LinearGradient
              colors={['rgba(212,175,55,0.4)', 'rgba(139,69,19,0.3)', 'rgba(212,175,55,0.1)']}
              style={styles.circleGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
            />
          </Animated.View>

          <FallingRupees count={12} />

          <View style={styles.overlay} />
        </ImageBackground>
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <ScrollView
          style={{backgroundColor: 'transparent', flex: 1}}
          contentContainerStyle={[
            styles.scrollContent,
            {paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20, backgroundColor: 'transparent'},
          ]}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag">
          <Animated.View
            style={[
              styles.translucentCard,
              {
                opacity: fadeAnim,
                transform: [{translateY: slideAnim}],
              },
            ]}>
            <View style={styles.glassContainer}>
              <View style={styles.glassBaseLayer} />
              <View style={styles.glassFrostLayer} />
              <View style={styles.glassHighlight} />
              <View style={styles.glassInnerBorder} />
              <View style={styles.glassContent}>
            <Text style={[styles.title, {color: theme.colors.text}]}>
              Create Account
            </Text>
            <Text style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
              Get started by entering your phone number
            </Text>

            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <Animated.View
                  style={[
                    styles.inputWrapper,
                    {
                      transform: [{scale: inputScaleAnim}],
                    },
                  ]}>
                  <Animated.View
                    style={[
                      styles.inputContainer,
                      {
                        backgroundColor: isDark
                          ? 'rgba(44, 44, 46, 0.9)'
                          : 'rgba(255, 255, 255, 0.95)',
                        borderColor: borderColor,
                        borderWidth: borderWidth,
                      },
                    ]}>
                    <Animated.View
                      style={[
                        styles.iconContainer,
                        {
                          opacity: inputIconOpacityAnim,
                        },
                      ]}>
                      <Icon
                        name="phone"
                        size={22}
                        color={
                          isValidPhone
                            ? theme.colors.primary
                            : theme.colors.textSecondary
                        }
                        style={styles.inputIcon}
                      />
                    </Animated.View>
                    <View style={styles.phoneInputContainer}>
                      <Text style={[styles.countryCode, {color: theme.colors.text}]}>
                        +91
                      </Text>
                    <TextInput
                      style={[styles.input, {color: theme.colors.text}]}
                        placeholder="XXXXX XXXXX"
                      placeholderTextColor={theme.colors.textSecondary}
                        value={displayPhoneNumber.replace('+91 ', '')}
                        onChangeText={handlePhoneNumberChange}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      keyboardType="phone-pad"
                        maxLength={12}
                    />
                    </View>
                    <Animated.View
                      style={[
                        styles.checkIcon,
                        {
                          opacity: checkIconOpacityAnim,
                        },
                      ]}>
                      <Icon
                        name="check-circle"
                        size={24}
                        color={theme.colors.success}
                      />
                    </Animated.View>
                  </Animated.View>
                </Animated.View>
              </View>

              <Button
                title={isLoading ? 'Sending OTP...' : 'Continue'}
                onPress={handleRegister}
                disabled={!isValidPhone || isLoading}
                style={styles.button}
              />
              {isLoading && (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.primary}
                  style={styles.loader}
                />
              )}
            </View>

            <View style={styles.footer}>
              <Text
                style={[styles.footerText, {color: theme.colors.textSecondary}]}>
                Already have an account?{' '}
              </Text>
              <Text
                style={[styles.linkText, {color: theme.colors.primary}]}
                onPress={() => navigation.navigate('Login')}>
                Sign In
              </Text>
            </View>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  fullScreenBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  keyboardView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
    minHeight: height,
    backgroundColor: 'transparent',
  },
  translucentCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: 'visible',
  },
  glassContainer: {
    borderRadius: 24,
    overflow: 'visible',
    backgroundColor: 'rgba(139, 69, 19, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    position: 'relative',
  },
  glassBaseLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(139, 69, 19, 0.12)',
    borderRadius: 24,
    pointerEvents: 'none',
  },
  glassFrostLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 24,
    pointerEvents: 'none',
  },
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    pointerEvents: 'none',
  },
  glassInnerBorder: {
    position: 'absolute',
    top: 0.5,
    left: 0.5,
    right: 0.5,
    bottom: 0.5,
    borderRadius: 23.5,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.3)',
    pointerEvents: 'none',
  },
  glassContent: {
    padding: 24,
    position: 'relative',
    zIndex: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  gradientCircle: {
    position: 'absolute',
    borderRadius: 1000,
  },
  circleGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 1000,
  },
  circle1: {
    width: 300,
    height: 300,
    top: 50,
    left: -60,
  },
  circle2: {
    width: 250,
    height: 250,
    top: 100,
    right: -50,
  },
  circle3: {
    width: 200,
    height: 200,
    top: height * 0.4,
    left: width * 0.2,
  },
  rupeeIcon: {
    position: 'absolute',
    zIndex: 2,
  },
  rupeeImage: {
    width: 80,
    height: 80,
  },
  rupee1: {
    top: height * 0.15,
    left: width * 0.1,
  },
  rupee2: {
    top: height * 0.25,
    right: width * 0.15,
  },
  rupee3: {
    top: height * 0.6,
    left: width * 0.15,
  },
  rupee4: {
    top: height * 0.7,
    right: width * 0.1,
  },
  title: {
    fontSize: 38,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: -1.5,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 26,
    marginBottom: 48,
    opacity: 0.75,
  },
  formSection: {
    marginTop: 12,
  },
  inputGroup: {
    marginBottom: 28,
  },
  inputWrapper: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    paddingHorizontal: 20,
    minHeight: 64,
  },
  iconContainer: {
    marginRight: 14,
  },
  inputIcon: {
    marginRight: 0,
  },
  phoneInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCode: {
    fontSize: 17,
    fontWeight: '600',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 17,
    paddingVertical: 0,
    minHeight: 64,
    fontWeight: '500',
  },
  checkIcon: {
    marginLeft: 12,
  },
  button: {
    marginTop: 12,
  },
  loader: {
    marginTop: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
    paddingTop: 20,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 16,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

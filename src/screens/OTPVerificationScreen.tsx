import React, {useState, useRef, useEffect, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  useWindowDimensions,
} from 'react-native';
import {useTheme} from '../theme/ThemeContext';
import {useAuth} from '../context/AuthContext';
import {Button} from '../components/Button';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {FallingRupees} from '../components/FallingRupee';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ImageBackground, Alert, ActivityIndicator} from 'react-native';
import {verifyOTP, verifyMobile} from '../services/api';
import {formatIndianPhoneNumber} from '../utils/phoneUtils';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

interface OTPVerificationScreenProps {
  navigation: any;
  route: any;
}

export const OTPVerificationScreen: React.FC<OTPVerificationScreenProps> = ({
  navigation,
  route,
}) => {
  const {theme} = useTheme();
  const {login} = useAuth();
  const insets = useSafeAreaInsets();
  const {width: windowWidth} = useWindowDimensions();
  const {phoneNumber, isRegister = false} = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Calculate responsive OTP box dimensions based on screen width
  const otpBoxDimensions = useMemo(() => {
    // Available width = screen width - (horizontal padding * 2) - (glass container padding * 2)
    const horizontalPadding = 20; // scrollContent paddingHorizontal
    const glassContentPadding = 24; // glassContent padding
    const totalHorizontalPadding = (horizontalPadding + glassContentPadding) * 2;
    
    // Calculate available width for OTP boxes
    const availableWidth = windowWidth - totalHorizontalPadding;
    
    // 6 boxes with 5 gaps between them
    const numberOfBoxes = 6;
    const numberOfGaps = 5;
    const gapSize = Math.min(8, availableWidth * 0.02); // Responsive gap, max 8px
    const totalGapWidth = gapSize * numberOfGaps;
    
    // Calculate box width
    const boxWidth = Math.floor((availableWidth - totalGapWidth) / numberOfBoxes);
    
    // Constrain box dimensions (min 40, max 56)
    const constrainedWidth = Math.max(40, Math.min(56, boxWidth));
    const boxHeight = Math.round(constrainedWidth * 1.25); // Slightly taller than wide
    
    // Font size scales with box size
    const fontSize = Math.max(18, Math.min(24, constrainedWidth * 0.5));
    
    return {
      width: constrainedWidth,
      height: boxHeight,
      gap: gapSize,
      fontSize: fontSize,
      borderRadius: Math.max(10, constrainedWidth * 0.22),
    };
  }, [windowWidth]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length === 6) {
      setIsVerifying(true);
      try {
        // Extract mobile number from phoneNumber (remove +91 if present)
        const mobileNumber = formatIndianPhoneNumber(phoneNumber);
        
        const response = await verifyOTP(mobileNumber, otpString);
        
        if (response.status === 'success' && response.status_code === 200) {
          // Store user data with is_new flag in AuthContext
          const userDataWithFlag = {
            username: response.userdata?.username ?? null,
            mobile: response.userdata?.mobile || mobileNumber,
            token: response.userdata?.token || 0,
            userid: response.userdata?.userid || 0,
            is_new: response.is_new,
          };
          await login(userDataWithFlag);
          
          // Check if user is new - redirect to RegisterDetails if profile is incomplete
          if (response.is_new === 'yes') {
            navigation.replace('RegisterDetails', {
              phoneNumber,
              userData: userDataWithFlag,
            });
          }
          // If not new, auth state change will automatically show Home screen
        } else {
          Alert.alert('Error', response.message || 'Invalid OTP. Please try again.');
        }
      } catch (error: any) {
        console.error('Error verifying OTP:', error);
        Alert.alert('Error', error.message || 'Failed to verify OTP. Please try again.');
      } finally {
        setIsVerifying(false);
      }
    }
  };

  const handleResend = async () => {
    try {
      const mobileNumber = formatIndianPhoneNumber(phoneNumber);
      const response = await verifyMobile(mobileNumber);
      
      if (response.status === 'success' && response.status_code === 200) {
    setTimer(60);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
        Alert.alert('Success', 'OTP sent successfully');
      } else {
        Alert.alert('Error', response.message || 'Failed to resend OTP');
      }
    } catch (error: any) {
      console.error('Error resending OTP:', error);
      Alert.alert('Error', error.message || 'Failed to resend OTP. Please try again.');
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/bg_image_second.png')}
      style={styles.container}
      resizeMode="cover">
      <View style={styles.overlay} />
      <FallingRupees count={8} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, {paddingTop: insets.top + 20}]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          removeClippedSubviews={false}
          overScrollMode="never"
          bounces={false}>
      <View style={styles.content}>
          <View style={styles.glassContainer}>
            <View style={styles.glassBaseLayer} />
            <View style={styles.glassFrostLayer} />
            <View style={styles.glassHighlight} />
            <View style={styles.glassInnerBorder} />
            <View style={styles.glassContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <View
            style={[
              styles.iconContainer,
              {backgroundColor: theme.colors.surface},
            ]}>
            <Icon name="lock" size={32} color={theme.colors.primary} />
          </View>
          <Text style={[styles.title, {color: theme.colors.text}]}>
            OTP Verification
          </Text>
          <Text style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
            Enter the 6-digit code sent to{'\n'}
            <Text style={{fontWeight: '600'}}>{phoneNumber}</Text>
          </Text>
        </View>

        <View style={[styles.otpContainer, {gap: otpBoxDimensions.gap}]}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => (inputRefs.current[index] = ref)}
              style={[
                styles.otpInput,
                {
                  width: otpBoxDimensions.width,
                  height: otpBoxDimensions.height,
                  fontSize: otpBoxDimensions.fontSize,
                  borderRadius: otpBoxDimensions.borderRadius,
                  backgroundColor: theme.colors.surface,
                  borderColor: digit
                    ? theme.colors.primary
                    : theme.colors.border,
                  color: theme.colors.text,
                },
              ]}
              value={digit}
              onChangeText={value => handleOtpChange(value, index)}
              onKeyPress={({nativeEvent}) =>
                handleKeyPress(nativeEvent.key, index)
              }
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        <Button
          title={isVerifying ? 'Verifying...' : 'Verify OTP'}
          onPress={handleVerify}
          disabled={otp.join('').length !== 6 || isVerifying}
          style={styles.button}
        />
        {isVerifying && (
          <ActivityIndicator
            size="small"
            color={theme.colors.primary}
            style={styles.loader}
          />
        )}

        <View style={styles.resendContainer}>
          <Text
            style={[styles.resendText, {color: theme.colors.textSecondary}]}>
            Didn't receive the code?{' '}
          </Text>
          {canResend ? (
            <TouchableOpacity onPress={handleResend}>
              <Text style={[styles.resendLink, {color: theme.colors.primary}]}>
                Resend
              </Text>
            </TouchableOpacity>
          ) : (
            <Text
              style={[styles.timerText, {color: theme.colors.textSecondary}]}>
              Resend in {timer}s
            </Text>
          )}
        </View>
            </View>
        </View>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    minHeight: '100%',
  },
  glassContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(139, 69, 19, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    position: 'relative',
    marginBottom: 20,
    marginTop: 40,
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
    paddingBottom: 32,
    position: 'relative',
    zIndex: 1,
    borderRadius: 24,
  },
  backButton: {
    marginTop: 20,
    marginBottom: 20,
    width: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 8,
    paddingHorizontal: 0,
    flexWrap: 'nowrap',
    width: '100%',
  },
  otpInput: {
    borderWidth: 2,
    textAlign: 'center',
    fontWeight: '600',
  },
  button: {
    marginBottom: 24,
  },
  loader: {
    marginTop: 12,
    marginBottom: 24,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  timerText: {
    fontSize: 14,
  },
});

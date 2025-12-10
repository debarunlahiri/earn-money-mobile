import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {useTheme} from '../theme/ThemeContext';
import {Button} from '../components/Button';
import {TextInput} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface RegisterScreenProps {
  navigation: any;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({navigation}) => {
  const {theme} = useTheme();
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleRegister = () => {
    if (phoneNumber && phoneNumber.length >= 10) {
      navigation.navigate('OTPVerification', {
        phoneNumber,
        isRegister: true,
      });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.topSection}>
          <View style={styles.decorativeCircle} />
          <View
            style={[
              styles.iconWrapper,
              {backgroundColor: theme.colors.primary},
            ]}>
            <Icon name="person-add" size={32} color="#FFFFFF" />
          </View>
        </View>

        <View style={styles.contentSection}>
          <Text style={[styles.title, {color: theme.colors.text}]}>
            Create Account
          </Text>
          <Text style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
            Get started by entering your phone number
          </Text>

          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor:
                      phoneNumber.length >= 10
                        ? theme.colors.primary
                        : theme.colors.border,
                  },
                ]}>
                <Icon
                  name="phone"
                  size={20}
                  color={
                    phoneNumber.length >= 10
                      ? theme.colors.primary
                      : theme.colors.textSecondary
                  }
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, {color: theme.colors.text}]}
                  placeholder="Phone number"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  autoFocus
                />
              </View>
            </View>

            <Button
              title="Continue"
              onPress={handleRegister}
              disabled={!phoneNumber || phoneNumber.length < 10}
              style={styles.button}
            />
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  topSection: {
    height: 280,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  decorativeCircle: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: '#007AFF15',
    top: -100,
    left: -50,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  contentSection: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 24,
    marginBottom: 40,
    opacity: 0.7,
  },
  formSection: {
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 18,
    minHeight: 58,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 17,
    paddingVertical: 0,
    minHeight: 58,
  },
  button: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
    paddingTop: 16,
  },
  footerText: {
    fontSize: 16,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

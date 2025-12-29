import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ImageBackground,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../theme/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Button} from '../components/Button';

interface WithdrawMoneyScreenProps {
  navigation: any;
}

export const WithdrawMoneyScreen: React.FC<WithdrawMoneyScreenProps> = ({
  navigation,
}) => {
  const {theme, isDark} = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'bank'>('upi');
  const [amount, setAmount] = useState('5,000');
  const [upiId, setUpiId] = useState('');

  const withdrawableAmount = '15,500';

  return (
    <ImageBackground
      source={require('../../assets/images/bg_image_second.png')}
      style={styles.container}
      resizeMode="cover">
      <View style={styles.overlay} />
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <View style={[styles.header, {paddingTop: insets.top + 20}]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: theme.colors.text}]}>
          Withdraw Money
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}>
        <View style={styles.amountCard}>
          <View style={styles.glassBorder}>
            <Text style={[styles.amountLabel, {color: theme.colors.textSecondary}]}>
              Withdrawable Amount:
            </Text>
            <View style={styles.amountValueContainer}>
              <Icon name="currency-rupee" size={24} color={theme.colors.primary} />
              <Text style={[styles.amountValue, {color: theme.colors.primary}]}>
                {withdrawableAmount}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.methodSection}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
            Withdrawal Method
          </Text>

          <View style={styles.methodWrapper}>
            <TouchableOpacity
              style={[
                styles.methodOption,
                {
                  borderColor:
                    selectedMethod === 'upi'
                      ? 'rgba(212, 175, 55, 0.6)'
                      : 'rgba(212, 175, 55, 0.3)',
                  borderWidth: selectedMethod === 'upi' ? 2 : 1,
                },
              ]}
              onPress={() => setSelectedMethod('upi')}>
              <View style={styles.methodInfo}>
                <Text style={[styles.methodTitle, {color: theme.colors.text}]}>
                  UPI Transfer
                </Text>
                <Text style={[styles.methodSubtitle, {color: theme.colors.textSecondary}]}>
                  Instant
                </Text>
              </View>
              {selectedMethod === 'upi' && (
              <Icon name="check-circle" size={24} color={theme.colors.primary} />
            )}
            </TouchableOpacity>
          </View>

          <View style={styles.methodWrapper}>
            <TouchableOpacity
              style={[
                styles.methodOption,
                {
                  borderColor:
                    selectedMethod === 'bank'
                      ? 'rgba(212, 175, 55, 0.6)'
                      : 'rgba(212, 175, 55, 0.3)',
                  borderWidth: selectedMethod === 'bank' ? 2 : 1,
                },
              ]}
              onPress={() => setSelectedMethod('bank')}>
              <View style={styles.methodInfo}>
                <Text style={[styles.methodTitle, {color: theme.colors.text}]}>
                  Bank Transfer
                </Text>
                <Text style={[styles.methodSubtitle, {color: theme.colors.textSecondary}]}>
                  1-2 Days
                </Text>
              </View>
              {selectedMethod === 'bank' && (
              <Icon name="check-circle" size={24} color={theme.colors.primary} />
            )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputSection}>
          <Text style={[styles.inputLabel, {color: theme.colors.text}]}>
            Enter Amount
          </Text>
          <View style={styles.inputBlurWrapper}>
            <View style={styles.inputGlassBorder}>
              <Icon name="currency-rupee" size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={[styles.input, {color: theme.colors.text}]}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>
          </View>
        </View>

        {selectedMethod === 'upi' && (
          <View style={styles.inputSection}>
            <Text style={[styles.inputLabel, {color: theme.colors.text}]}>
              ENTER UPI ID
            </Text>
            <View style={styles.inputBlurWrapper}>
              <View style={styles.inputGlassBorder}>
                <TextInput
                  style={[styles.input, {color: theme.colors.text}]}
                  value={upiId}
                  onChangeText={setUpiId}
                  placeholder="Enter your UPI ID"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>
            </View>
          </View>
        )}

        <Button
          title="WITHDRAW NOW"
          onPress={() => {
            // Handle withdrawal
          }}
          style={styles.withdrawButton}
        />

        <Text style={[styles.minimumText, {color: theme.colors.textSecondary}]}>
          Minimum withdrawal amount is ₹500
        </Text>
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  amountCard: {
    borderRadius: 16,
    marginBottom: 32,
    overflow: 'hidden',
    backgroundColor: 'rgba(139, 69, 19, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.5)',
  },
  glassBorder: {
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    backgroundColor: 'rgba(139, 69, 19, 0.08)',
  },
  methodWrapper: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(139, 69, 19, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.5)',
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  amountValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '700',
    marginLeft: 4,
  },
  methodSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  methodOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(139, 69, 19, 0.05)',
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  methodSubtitle: {
    fontSize: 14,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputBlurWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(139, 69, 19, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.5)',
  },
  inputGlassBorder: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    minHeight: 50,
    backgroundColor: 'rgba(139, 69, 19, 0.05)',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    marginLeft: 8,
  },
  withdrawButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  minimumText: {
    fontSize: 12,
    textAlign: 'center',
  },
});


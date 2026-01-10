import React, {useState, useEffect} from 'react';
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
import {useAuth} from '../context/AuthContext';
import {submitWithdrawalRequest, getWallet} from '../services/api';
import {ActivityIndicator} from 'react-native';
import {Dialog} from '../components/Dialog';

interface WithdrawMoneyScreenProps {
  navigation: any;
}

export const WithdrawMoneyScreen: React.FC<WithdrawMoneyScreenProps> = ({
  navigation,
}) => {
  const {theme, isDark} = useTheme();
  const insets = useSafeAreaInsets();
  const {userData} = useAuth();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState('0');
  const [isFetchingBalance, setIsFetchingBalance] = useState(true);

  // Dialog states
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogType, setDialogType] = useState<'info' | 'success' | 'error' | 'warning'>('info');
  const [dialogOnConfirm, setDialogOnConfirm] = useState<(() => void) | undefined>(undefined);

  // Fetch wallet balance on mount
  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (!userData?.userid || !userData?.token) {
        setIsFetchingBalance(false);
        return;
      }

      try {
        const response = await getWallet(userData.userid, userData.token);
        if (response.status === 'success' && response.status_code === 200) {
          if (response.userdata) {
            setWalletBalance(response.userdata.amount);
          }
        }
      } catch (error) {
        console.error('Error fetching wallet balance:', error);
      } finally {
        setIsFetchingBalance(false);
      }
    };

    fetchWalletBalance();
  }, [userData]);

  const withdrawableAmount = walletBalance;

  const showDialog = (
    message: string,
    title?: string,
    type: 'info' | 'success' | 'error' | 'warning' = 'info',
    onConfirm?: () => void,
  ) => {
    setDialogTitle(title || '');
    setDialogMessage(message);
    setDialogType(type);
    if (onConfirm) {
      setDialogOnConfirm(() => onConfirm);
    }
    setDialogVisible(true);
  };

  const handleWithdraw = async () => {
    if (!userData?.userid || !userData?.token) {
      showDialog('User not logged in', 'Error', 'error');
      return;
    }

    // Remove commas and validate amount
    const cleanAmount = amount.replace(/,/g, '');
    const amountNum = parseFloat(cleanAmount);

    if (!cleanAmount || isNaN(amountNum) || amountNum <= 0) {
      showDialog('Please enter a valid withdrawal amount', 'Invalid Amount', 'error');
      return;
    }

    if (amountNum < 500) {
      showDialog('Minimum withdrawal amount is ₹500', 'Minimum Amount', 'error');
      return;
    }

    try {
      setIsLoading(true);
      const response = await submitWithdrawalRequest(
        userData.userid,
        userData.token,
        cleanAmount
      );

      if (response.status === 'success' && response.status_code === 200) {
        showDialog(
          response.message,
          'Request Submitted',
          'success',
          () => navigation.goBack()
        );
      } else {
        showDialog(response.message || 'Failed to submit withdrawal request', 'Error', 'error');
      }
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      showDialog('Failed to submit withdrawal request. Please try again.', 'Error', 'error');
    } finally {
      setIsLoading(false);
    }
  };

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
            {isFetchingBalance ? (
              <ActivityIndicator size="small" color={theme.colors.primary} style={{marginTop: 12}} />
            ) : (
              <View style={styles.amountValueContainer}>
                <Icon name="currency-rupee" size={24} color={theme.colors.primary} />
                <Text style={[styles.amountValue, {color: theme.colors.primary}]}>
                  {withdrawableAmount}
                </Text>
              </View>
            )}
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


        <View style={styles.infoCard}>
          <View style={styles.infoGlassBorder}>
            <Icon name="info-outline" size={20} color={theme.colors.primary} />
            <Text style={[styles.infoText, {color: theme.colors.textSecondary}]}>
              This amount will be received in your bank account which you mentioned while registering.
            </Text>
          </View>
        </View>

        <Button
          title={isLoading ? 'PROCESSING...' : 'WITHDRAW NOW'}
          onPress={handleWithdraw}
          style={styles.withdrawButton}
          disabled={isLoading}
        />

        {isLoading && (
          <ActivityIndicator size="small" color={theme.colors.primary} style={styles.loader} />
        )}

        <Text style={[styles.minimumText, {color: theme.colors.textSecondary}]}>
          Minimum withdrawal amount is ₹500
        </Text>
      </ScrollView>

      <Dialog
        visible={dialogVisible}
        title={dialogTitle}
        message={dialogMessage}
        type={dialogType}
        onClose={() => setDialogVisible(false)}
        onConfirm={dialogOnConfirm}
      />
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
  loader: {
    marginVertical: 8,
  },
  infoCard: {
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(139, 69, 19, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.5)',
  },
  infoGlassBorder: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    backgroundColor: 'rgba(139, 69, 19, 0.08)',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  minimumText: {
    fontSize: 12,
    textAlign: 'center',
  },
});


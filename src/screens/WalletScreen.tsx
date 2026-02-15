import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  Animated,
  ActivityIndicator,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../theme/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useScrollVisibility} from '../context/ScrollVisibilityContext';
import {FallingRupees} from '../components/FallingRupee';
import {useAuth} from '../context/AuthContext';
import {getWallet, getPaymentHistory, PaymentHistoryItem} from '../services/api';



interface WalletScreenProps {
  navigation: any;
}

export const WalletScreen: React.FC<WalletScreenProps> = ({navigation}) => {
  const {theme} = useTheme();
  const insets = useSafeAreaInsets();
  const {handleScroll, headerTranslateY} = useScrollVisibility();
  const {userData} = useAuth();

  const [walletBalance, setWalletBalance] = useState<string>('0');
  const [transactions, setTransactions] = useState<PaymentHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchWalletData = async () => {
    if (!userData?.userid || !userData?.token) {
      setError('User not logged in');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Fetch wallet balance and payment history in parallel
      const [walletResponse, historyResponse] = await Promise.all([
        getWallet(userData.userid, userData.token),
        getPaymentHistory(userData.userid, userData.token),
      ]);

      // Handle wallet balance
      if (walletResponse.status === 'success' && walletResponse.status_code === 200) {
        if (walletResponse.userdata) {
          setWalletBalance(walletResponse.userdata.amount);
        }
      }

      // Handle payment history
      if (historyResponse.status === 'success' && historyResponse.status_code === 200) {
        if (Array.isArray(historyResponse.userdata) && historyResponse.userdata.length > 0 && !Array.isArray(historyResponse.userdata[0])) {
          setTransactions(historyResponse.userdata);
        } else {
          setTransactions([]);
        }
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching wallet data:', err);
      setError('Failed to load wallet data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {

    fetchWalletData();
  }, [userData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchWalletData();
    setIsRefreshing(false);
  };

  const renderTransactionItem = (item: PaymentHistoryItem, index: number) => {
    if (!item || !item.status || !item.title) return null;
    const isCredit = item.title === 'credit';
    const isPending = item.status === 'pending';
    const amountColor = isPending ? '#FFA726' : (isCredit ? '#4CAF50' : '#FF5252');
    const statusLabel = item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : '';

    return (
      <View key={index} style={styles.transactionItem}>
        <View style={[styles.transactionIcon, {backgroundColor: isPending ? 'rgba(255, 167, 38, 0.15)' : (isCredit ? 'rgba(76, 175, 80, 0.15)' : 'rgba(255, 82, 82, 0.15)')}]}>
          <Icon
            name={isPending ? 'schedule' : (isCredit ? 'arrow-downward' : 'arrow-upward')}
            size={20}
            color={amountColor}
          />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={[styles.transactionDescription, {color: theme.colors.text}]}>
            {isCredit ? 'Credit' : 'Debit'} - {statusLabel}
          </Text>
          <View style={styles.transactionDateTime}>
            <Icon name="calendar-today" size={10} color={theme.colors.textSecondary} />
            <Text style={[styles.transactionDate, {color: theme.colors.textSecondary}]}>
              {item.date}
            </Text>
            <Icon name="access-time" size={10} color={theme.colors.textSecondary} style={styles.timeIcon} />
            <Text style={[styles.transactionDate, {color: theme.colors.textSecondary}]}>
              {item.time}
            </Text>
          </View>
        </View>
        <Text style={[styles.transactionAmount, {color: amountColor}]}>
          {isCredit ? '+' : '-'}₹{item.mess}
        </Text>
      </View>
    );
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
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 10,
          },
        ]}>
        {/* Blur background */}
        <BlurView
          style={StyleSheet.absoluteFillObject}
          blurType="dark"
          blurAmount={20}
          reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.8)"
        />
        {/* Subtle overlay for better contrast */}
        <View style={styles.headerOverlay} />
        <FallingRupees count={12} />
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, {color: theme.colors.text}]}>
            Wallet
          </Text>
          <TouchableOpacity
            onPress={handleRefresh}
            style={styles.refreshButton}
            disabled={isRefreshing}>
            <Icon
              name="refresh"
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          {paddingTop: insets.top + 100},
        ]}
        onScroll={handleScroll}
        scrollEventThrottle={16}>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.glassContainer}>
            <View style={styles.glassBaseLayer} />
            <View style={styles.glassFrostLayer} />
            <View style={styles.glassHighlight} />
            <View style={styles.glassInnerBorder} />
            <View style={styles.glassContent}>
              {isLoading ? (
                <ActivityIndicator size="large" color={theme.colors.primary} />
              ) : error ? (
                <Text style={[styles.errorText, {color: '#FF6B6B'}]}>{error}</Text>
              ) : (
                <>
                  <View style={styles.balanceRow}>
                    <Text style={[styles.balanceLabel, {color: theme.colors.text}]}>
                      Available Balance:
                    </Text>
                    <View style={styles.balanceValueContainer}>
                      <Icon name="currency-rupee" size={24} color={theme.colors.primary} />
                      <Text style={[styles.balanceValue, {color: theme.colors.primary}]}>
                        {walletBalance}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <View style={styles.buttonGlassContainer}>
            <View style={styles.buttonGlassBaseLayer} />
            <View style={styles.buttonGlassFrostLayer} />
            <View style={styles.buttonGlassHighlight} />
            <View style={styles.buttonGlassInnerBorder} />
            <TouchableOpacity
              style={styles.buttonGlassContent}
              onPress={() => navigation.navigate('WithdrawMoney')}>
              <Text style={styles.withdrawButtonText}>Withdraw Money</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Transaction History Section */}
        <View style={styles.transactionsSection}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
            Transaction History
          </Text>

          <View style={styles.transactionsGlassContainer}>
            <View style={styles.glassBaseLayer} />
            <View style={styles.glassFrostLayer} />
            <View style={styles.glassHighlight} />
            <View style={styles.glassInnerBorder} />
            <View style={styles.transactionsContent}>
              {transactions.length === 0 ? (
                <Text style={[styles.emptyTransactionsText, {color: theme.colors.textSecondary}]}>
                  No transactions yet
                </Text>
              ) : (
                transactions.map((transaction, index) => renderTransactionItem(transaction, index))
              )}
            </View>
          </View>
        </View>
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
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 16,
    zIndex: 100,
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1,
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  refreshButton: {
    padding: 8,
  },
  balanceCard: {
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'visible',
  },
  glassContainer: {
    borderRadius: 20,
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
    borderRadius: 20,
    pointerEvents: 'none',
  },
  glassFrostLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 20,
    pointerEvents: 'none',
  },
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    pointerEvents: 'none',
  },
  glassInnerBorder: {
    position: 'absolute',
    top: 0.5,
    left: 0.5,
    right: 0.5,
    bottom: 0.5,
    borderRadius: 19.5,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.3)',
    pointerEvents: 'none',
  },
  glassContent: {
    padding: 24,
    position: 'relative',
    zIndex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
  },
  balanceRow: {
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  balanceValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: '700',
    marginLeft: 4,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'visible',
  },
  buttonGlassContainer: {
    borderRadius: 16,
    overflow: 'visible',
    backgroundColor: 'rgba(139, 69, 19, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    position: 'relative',
  },
  buttonGlassBaseLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(139, 69, 19, 0.12)',
    borderRadius: 16,
    pointerEvents: 'none',
  },
  buttonGlassFrostLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 16,
    pointerEvents: 'none',
  },
  buttonGlassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    pointerEvents: 'none',
  },
  buttonGlassInnerBorder: {
    position: 'absolute',
    top: 0.5,
    left: 0.5,
    right: 0.5,
    bottom: 0.5,
    borderRadius: 15.5,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.3)',
    pointerEvents: 'none',
  },
  buttonGlassContent: {
    paddingVertical: 16,
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  withdrawButtonText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  transactionsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  transactionsGlassContainer: {
    borderRadius: 20,
    overflow: 'visible',
    backgroundColor: 'rgba(139, 69, 19, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    position: 'relative',
  },
  transactionsContent: {
    padding: 16,
    position: 'relative',
    zIndex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDateTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  timeIcon: {
    marginLeft: 8,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    marginLeft: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyTransactionsText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
});

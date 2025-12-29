import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../theme/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: string;
  description: string;
  date: string;
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'credit',
    amount: '15,000',
    description: 'Success Lead - Amit Verma',
    date: '21 Mar 2024',
  },
  {
    id: '2',
    type: 'debit',
    amount: '5,000',
    description: 'UPI Transfer',
    date: '19 Mar 2024',
  },
  {
    id: '3',
    type: 'credit',
    amount: '2,000',
    description: 'Site Visit Lead - Neha Gupta',
    date: '19 Mar 2024',
  },
];

interface TransactionHistoryScreenProps {
  navigation: any;
}

export const TransactionHistoryScreen: React.FC<TransactionHistoryScreenProps> = ({
  navigation,
}) => {
  const {theme, isDark} = useTheme();
  const insets = useSafeAreaInsets();

  const renderItem = ({item}: {item: Transaction}) => {
    const isCredit = item.type === 'credit';
    const amountColor = isCredit ? theme.colors.primary : '#8B0000';

    return (
      <View style={styles.cardWrapper}>
        <View
          style={[
            styles.transactionCard,
            {
              borderLeftColor: amountColor,
              borderLeftWidth: 4,
            },
          ]}>
          <View style={styles.transactionInfo}>
          <Text style={[styles.transactionDescription, {color: theme.colors.text}]}>
            {item.description}
          </Text>
          <Text style={[styles.transactionDate, {color: theme.colors.textSecondary}]}>
            {item.date}
          </Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={[styles.transactionAmount, {color: amountColor}]}>
            {isCredit ? '+' : '-'}₹{item.amount}
          </Text>
          {isCredit ? (
            <Icon name="arrow-downward" size={20} color={amountColor} />
          ) : (
            <Icon name="arrow-upward" size={20} color={amountColor} />
          )}
        </View>
        </View>
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
      <View style={[styles.header, {paddingTop: insets.top + 20}]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: theme.colors.text}]}>
          Transaction History
        </Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={mockTransactions}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.listContent, {paddingBottom: 100}]}
        showsVerticalScrollIndicator={false}
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
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  cardWrapper: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(139, 69, 19, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.5)',
  },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(139, 69, 19, 0.08)',
  },
  transactionInfo: {
    flex: 1,
    marginRight: 16,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
});


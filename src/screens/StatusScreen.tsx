import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import {useTheme} from '../theme/ThemeContext';
import {Card} from '../components/Card';
import {Status} from '../types';
import Icon from 'react-native-vector-icons/MaterialIcons';

const mockStatuses: Status[] = [
  {
    id: '1',
    title: 'Property Enquiry - Luxury Apartment',
    description:
      'Looking for a spacious 3BHK apartment in downtown area with modern amenities.',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400',
    date: '2024-01-15',
    time: '14:30',
    phoneNumber: '+919205225428',
    enquiryFor: 'Rajesh Kumar',
    email: 'rajesh.kumar@example.com',
    propertySearchFor: 'Purchase',
    propertySearchingIn: 'Downtown, Sector 15, New Delhi',
    minBudget: 5000000,
    maxBudget: 8000000,
    status: 'Active',
  },
  {
    id: '2',
    title: 'Property Enquiry - Commercial Space',
    description:
      'Seeking commercial office space for tech startup with parking facility.',
    image: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e4?w=400',
    date: '2024-01-14',
    time: '10:15',
    phoneNumber: '+919876543210',
    enquiryFor: 'Priya Sharma',
    propertySearchFor: 'Sale',
    propertySearchingIn: 'Business Park, Gurgaon',
    minBudget: 10000000,
    maxBudget: 15000000,
    status: 'Pending',
  },
  {
    id: '3',
    title: 'Property Enquiry - Villa',
    description:
      'Interested in purchasing a villa with garden and swimming pool.',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
    date: '2024-01-13',
    time: '16:45',
    phoneNumber: '+919123456789',
    enquiryFor: 'Amit Patel',
    email: 'amit.patel@example.com',
    propertySearchFor: 'Purchase',
    propertySearchingIn: 'Green Valley, Mumbai Suburbs',
    minBudget: 20000000,
    maxBudget: 30000000,
    status: 'Completed',
  },
  {
    id: '4',
    title: 'Property Enquiry - Studio Apartment',
    description:
      'Looking for a modern studio apartment near IT hub for investment.',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
    date: '2024-01-12',
    time: '09:00',
    phoneNumber: '+919988776655',
    enquiryFor: 'Sneha Reddy',
    propertySearchFor: 'Purchase',
    propertySearchingIn: 'Electronic City, Bangalore',
    minBudget: 3000000,
    maxBudget: 5000000,
    status: 'Cancelled',
  },
];

interface StatusScreenProps {
  navigation: any;
}

export const StatusScreen: React.FC<StatusScreenProps> = ({navigation}) => {
  const {theme} = useTheme();
  const [statuses] = useState<Status[]>(mockStatuses);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleStatusPress = (status: Status) => {
    navigation.navigate('StatusDetails', {status});
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return theme.colors.success;
      case 'Completed':
        return '#4CAF50';
      case 'Pending':
        return '#FF9800';
      case 'Cancelled':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const renderItem = ({item}: {item: Status}) => (
    <Card
      title={item.title}
      description={item.description}
      image={item.image}
      date={item.date}
      time={item.time}
      onPress={() => handleStatusPress(item)}
      badge={
        <View
          style={[
            styles.statusBadge,
            {backgroundColor: getStatusColor(item.status)},
          ]}>
          <Text style={styles.badgeText}>{item.status}</Text>
        </View>
      }
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="inbox" size={64} color={theme.colors.textSecondary} />
      <Text style={[styles.emptyText, {color: theme.colors.textSecondary}]}>
        No status updates yet
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={styles.headerContainer}>
        <View style={[styles.header, {borderBottomColor: theme.colors.border}]}>
          <Text style={[styles.headerTitle, {color: theme.colors.text}]}>
            Status
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              {color: theme.colors.textSecondary},
            ]}>
            Recent updates
          </Text>
        </View>
      </View>
      <FlatList
        data={statuses}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContent,
          statuses.length === 0 && styles.emptyList,
        ]}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    opacity: 0.7,
  },
  listContent: {
    padding: 24,
    paddingBottom: 100,
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 120,
  },
  emptyText: {
    fontSize: 17,
    marginTop: 20,
    opacity: 0.6,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#FFFFFF',
  },
});

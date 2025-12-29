import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return 'check-circle';
      case 'Completed':
        return 'done-all';
      case 'Pending':
        return 'schedule';
      case 'Cancelled':
        return 'cancel';
      default:
        return 'info';
    }
  };

  const renderItem = ({item}: {item: Status}) => {
    const statusColor = getStatusColor(item.status);
    return (
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
              {backgroundColor: statusColor + '20'},
          ]}>
            <Icon name={getStatusIcon(item.status)} size={20} color={statusColor} />
            <Text style={[styles.statusText, {color: statusColor}]}>
              {item.status}
            </Text>
        </View>
      }
    />
  );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="inbox" size={64} color={theme.colors.textSecondary} />
      <Text style={[styles.emptyText, {color: theme.colors.textSecondary}]}>
        No status updates yet
      </Text>
    </View>
  );

  return (
    <View
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 24,
    paddingBottom: 180,
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
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});

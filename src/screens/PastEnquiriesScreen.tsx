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
import {Enquiry} from '../types';
import Icon from 'react-native-vector-icons/MaterialIcons';

const mockEnquiries: Enquiry[] = [
  {
    id: '1',
    title: '2BHK Apartment in Downtown',
    description:
      'Beautiful 2BHK apartment with modern amenities, located in the heart of the city.',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
    date: '2024-01-15',
    time: '14:30',
    phoneNumber: '+1234567890',
    enquiryType: 'buy',
    propertyType: 'Apartment',
    propertyName: 'Downtown Residency',
    propertyPrice: '₹65 Lakhs',
    propertyLocation: 'Downtown, Sector 15, New Delhi',
    propertyArea: '1200 sqft',
    propertyStatus: 'Ready to Move',
    status: 'Completed',
  },
  {
    id: '2',
    title: '3BHK Villa with Garden',
    description: 'Spacious 3BHK villa with private garden and parking space.',
    image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400',
    date: '2024-01-14',
    time: '10:15',
    phoneNumber: '+1234567891',
    enquiryType: 'sell',
    propertyType: 'Villa',
    propertyName: 'Garden View Villa',
    propertyPrice: '₹2.5 Crores',
    propertyLocation: 'Green Valley, Mumbai Suburbs',
    propertyArea: '3500 sqft',
    propertyStatus: 'Under Construction',
    status: 'Cancelled',
  },
  {
    id: '3',
    title: '1BHK Studio Apartment',
    description:
      'Compact and cozy studio apartment perfect for singles or couples.',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
    date: '2024-01-13',
    time: '16:45',
    phoneNumber: '+1234567892',
    enquiryType: 'buy',
    propertyType: 'Studio Apartment',
    propertyName: 'City Center Studios',
    propertyPrice: '₹42 Lakhs',
    propertyLocation: 'Electronic City, Bangalore',
    propertyArea: '600 sqft',
    propertyStatus: 'Ready to Move',
    status: 'Completed',
  },
];

interface PastEnquiriesScreenProps {
  navigation: any;
}

export const PastEnquiriesScreen: React.FC<PastEnquiriesScreenProps> = ({
  navigation,
}) => {
  const {theme} = useTheme();
  const [enquiries] = useState<Enquiry[]>(mockEnquiries);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleEnquiryPress = (enquiry: Enquiry) => {
    navigation.navigate('EnquiryDetails', {enquiry});
  };

  const getEnquiryTypeColor = (type?: string) => {
    switch (type) {
      case 'buy':
        return theme.colors.success;
      case 'sell':
        return theme.colors.primary;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getEnquiryTypeIcon = (type?: string) => {
    switch (type) {
      case 'buy':
        return 'shopping-cart';
      case 'sell':
        return 'attach-money';
      default:
        return 'info';
    }
  };

  const getStatusColor = (status?: string) => {
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

  const getStatusIcon = (status?: string) => {
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

  const renderItem = ({item}: {item: Enquiry}) => {
    const title = item.propertyName || item.title;
    const enquiryColor = item.enquiryType
      ? getEnquiryTypeColor(item.enquiryType)
      : undefined;
    const statusColor = item.status ? getStatusColor(item.status) : undefined;

    return (
    <Card
        title={title}
      description={item.description}
      image={item.image}
      date={item.date}
      time={item.time}
      onPress={() => handleEnquiryPress(item)}
        propertyType={item.propertyType}
        propertyArea={item.propertyArea}
        propertyLocation={item.propertyLocation}
        propertyPrice={item.propertyPrice}
        badge={
          <View style={styles.badgeContainer}>
            {item.status && (
              <View
                style={[
                  styles.statusBadge,
                  {backgroundColor: statusColor + '20', marginRight: 8},
                ]}>
                <Icon
                  name={getStatusIcon(item.status)}
                  size={20}
                  color={statusColor}
                />
                <Text style={[styles.statusText, {color: statusColor}]}>
                  {item.status}
                </Text>
              </View>
            )}
            {item.enquiryType && (
              <View
                style={[
                  styles.enquiryTypeBadge,
                  {backgroundColor: enquiryColor + '20'},
                ]}>
                <Icon
                  name={getEnquiryTypeIcon(item.enquiryType)}
                  size={20}
                  color={enquiryColor}
                />
                <Text style={[styles.enquiryTypeText, {color: enquiryColor}]}>
                  {item.enquiryType === 'buy' ? 'Purchase' : 'Sale'}
                </Text>
              </View>
            )}
          </View>
        }
    />
  );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="inbox" size={64} color={theme.colors.textSecondary} />
      <Text style={[styles.emptyText, {color: theme.colors.textSecondary}]}>
        No enquiries yet
      </Text>
    </View>
  );

  return (
    <View
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <FlatList
        data={enquiries}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContent,
          enquiries.length === 0 && styles.emptyList,
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
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  enquiryTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  enquiryTypeText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});

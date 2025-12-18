import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../theme/ThemeContext';
import {Card} from '../components/Card';
import {Enquiry} from '../types';
import Icon from 'react-native-vector-icons/MaterialIcons';

const sampleProfileImage = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400';

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
  },
];

interface PastEnquiriesScreenProps {
  navigation: any;
}

const getRootNavigation = (navigation: any): any => {
  let nav = navigation;
  while (nav.getParent()) {
    nav = nav.getParent();
  }
  return nav;
};

export const PastEnquiriesScreen: React.FC<PastEnquiriesScreenProps> = ({
  navigation,
}) => {
  const {theme, isDark} = useTheme();
  const insets = useSafeAreaInsets();
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

  const renderItem = ({item}: {item: Enquiry}) => {
    const title = item.propertyName || item.title;
    
    const propertyDetails = [];
    if (item.propertyType) {
      propertyDetails.push(item.propertyType);
    }
    if (item.propertyArea) {
      propertyDetails.push(item.propertyArea);
    }
    if (item.propertyLocation) {
      propertyDetails.push(item.propertyLocation);
    }
    if (item.propertyPrice) {
      propertyDetails.push(item.propertyPrice);
    }
    
    const descriptionText = propertyDetails.length > 0 
      ? propertyDetails.join(' • ') 
      : item.description || '';

    return (
      <Card
        title={title}
        description={descriptionText}
        image={item.image}
        date={item.date}
        time={item.time}
        onPress={() => handleEnquiryPress(item)}
        badge={
          item.enquiryType ? (
            (() => {
              const enquiryColor = getEnquiryTypeColor(item.enquiryType);
              return (
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
                    {item.enquiryType === 'buy' ? 'BUY' : 'SELL'}
                  </Text>
                </View>
              );
            })()
          ) : undefined
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
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <View style={styles.headerContainer}>
        <View
          style={[
            styles.header,
            {
              borderBottomColor: theme.colors.border,
              paddingTop: insets.top,
            },
          ]}>
          <View style={styles.headerContent}>
            <View>
              <Text style={[styles.headerTitle, {color: theme.colors.text}]}>
                Past Enquiries
              </Text>
              <Text
                style={[
                  styles.headerSubtitle,
                  {color: theme.colors.textSecondary},
                ]}>
                Your property enquiries
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                const rootNav = getRootNavigation(navigation);
                rootNav.navigate('Profile');
              }}
              style={styles.profileButton}>
              <Image
                source={{uri: sampleProfileImage}}
                style={styles.profileImage}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
  headerContainer: {
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
  enquiryTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
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

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

  const renderItem = ({item}: {item: Enquiry}) => (
    <Card
      title={item.title}
      description={item.description}
      image={item.image}
      date={item.date}
      time={item.time}
      onPress={() => handleEnquiryPress(item)}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="inbox" size={64} color={theme.colors.textSecondary} />
      <Text style={[styles.emptyText, {color: theme.colors.textSecondary}]}>
        No enquiries yet
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={styles.headerContainer}>
        <View style={[styles.header, {borderBottomColor: theme.colors.border}]}>
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
});

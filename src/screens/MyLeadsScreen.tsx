import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  Animated,
  ActivityIndicator,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../theme/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {FallingRupees} from '../components/FallingRupee';
import {useScrollVisibility} from '../context/ScrollVisibilityContext';
import {useAuth} from '../context/AuthContext';
import {viewLeads, Lead} from '../services/api';

interface MyLeadsScreenProps {
  navigation: any;
  hideHeader?: boolean;
}

export const MyLeadsScreen: React.FC<MyLeadsScreenProps> = ({
  navigation,
  hideHeader = false,
}) => {
  const {theme} = useTheme();
  const insets = useSafeAreaInsets();
  const {userData} = useAuth();
  const {handleScroll, headerTranslateY} = useScrollVisibility();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    if (!userData?.userid || !userData?.token) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await viewLeads(userData.userid, userData.token);

      if (response.status === 'success' && response.data) {
        setLeads(response.data);
      } else {
        setError(response.message || 'Failed to fetch leads');
        setLeads([]);
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError('An error occurred while fetching leads');
      setLeads([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userData]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLeads();
  }, [fetchLeads]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${day}/${month}/${year} at ${hour12}:${minutes} ${ampm}`;
  };

  const renderItem = ({item}: {item: Lead}) => {
    return (
      <TouchableOpacity
        style={styles.leadCard}
        activeOpacity={0.8}
        onPress={() => {
          navigation.navigate('LeadDetails', {lead: item});
        }}>
        <View style={styles.cardHeader}>
          <View style={styles.nameContainer}>
            <Icon name="person" size={20} color="#D4AF37" />
            <Text style={styles.leadName}>{item.name}</Text>
          </View>
          <View style={styles.idBadge}>
            <Text style={styles.idText}>#{item.id}</Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Icon name="phone" size={16} color="#888" />
            <Text style={styles.infoText}>{item.mobile}</Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="location-on" size={16} color="#888" />
            <Text style={styles.infoText} numberOfLines={2}>
              {item.address}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="description" size={16} color="#888" />
            <Text style={styles.infoText} numberOfLines={2}>
              {item.requirement}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Icon name="access-time" size={14} color="#666" />
          <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Icon name="inbox" size={64} color="#666" />
        <Text style={styles.emptyTitle}>No Leads Found</Text>
        <Text style={styles.emptySubtitle}>
          {error || 'Add a new enquiry to see your leads here'}
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddNewEnquiry')}>
          <Icon name="add" size={20} color="#000" />
          <Text style={styles.addButtonText}>Add New Enquiry</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <Text style={styles.totalLeadsText}>
        Total Leads: {leads.length}
      </Text>
    </View>
  );

  const content = (
    <>
      {!hideHeader && (
        <>
          <StatusBar
            barStyle="light-content"
            translucent
            backgroundColor="transparent"
          />
          <Animated.View
            style={[
              styles.header,
              {
                top: insets.top,
                paddingTop: 20,
                transform: [{translateY: headerTranslateY}],
              },
            ]}>
            <FallingRupees count={10} />
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}>
              <Icon name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, {color: theme.colors.text}]}>
              My Leads
            </Text>
            <View style={styles.placeholder} />
          </Animated.View>
        </>
      )}

      {hideHeader && (
        <Animated.View
          style={[
            styles.simpleHeader,
            {
              top: insets.top,
              paddingTop: 20,
              transform: [{translateY: headerTranslateY}],
            },
          ]}>
          <FallingRupees count={10} />
          <Text style={[styles.simpleHeaderTitle, {color: theme.colors.text}]}>
            My Leads
          </Text>
        </Animated.View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loadingText}>Loading leads...</Text>
        </View>
      ) : (
        <FlatList
          data={leads}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={[
            styles.listContent,
            leads.length === 0 && styles.emptyListContent,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#D4AF37"
            />
          }
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          ListHeaderComponent={leads.length > 0 ? renderHeader : null}
          ListEmptyComponent={renderEmpty}
        />
      )}
    </>
  );

  if (hideHeader) {
    return <View style={styles.container}>{content}</View>;
  }

  return (
    <ImageBackground
      source={require('../../assets/images/bg_image_second.png')}
      style={styles.container}
      resizeMode="cover">
      <View style={styles.overlay} />
      {content}
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
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 100,
    overflow: 'hidden',
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
  simpleHeader: {
    paddingHorizontal: 24,
    marginBottom: 16,
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 100,
    overflow: 'hidden',
  },
  simpleHeaderTitle: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 200,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#888',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 140,
    paddingBottom: 100,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  listHeader: {
    marginBottom: 16,
  },
  totalLeadsText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
  },
  leadCard: {
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  leadName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 10,
  },
  idBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  idText: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '600',
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 12,
  },
  cardBody: {
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 14,
    color: '#ccc',
    marginLeft: 10,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4AF37',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 24,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginLeft: 8,
  },
});

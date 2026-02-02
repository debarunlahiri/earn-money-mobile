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
  ActivityIndicator,
  Linking,
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {BlurView} from '@react-native-community/blur';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../theme/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useAuth} from '../context/AuthContext';
import {viewLeads, Lead} from '../services/api';

interface AllLeadsScreenProps {
  navigation: any;
}

export const AllLeadsScreen: React.FC<AllLeadsScreenProps> = ({navigation}) => {
  const {theme} = useTheme();
  const insets = useSafeAreaInsets();
  const {userData} = useAuth();

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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return '#4CAF50';
      case 'contacted':
      case 'processing':
        return '#FF9800';
      case 'converted':
        return '#2196F3';
      case 'cancelled':
        return '#F44336';
      default:
        return '#888';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'contacted':
      case 'processing':
        return 'Contacted';
      case 'new':
        return 'New Lead';
      case 'converted':
        return 'Converted';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  };

  const renderItem = ({item}: {item: Lead}) => {
    return (
      <TouchableOpacity
        style={styles.leadCard}
        onPress={() => navigation.navigate('LeadDetails', {lead: item})}
        activeOpacity={0.7}>
        {/* Blur Background */}
        <BlurView
          style={StyleSheet.absoluteFillObject}
          blurType="dark"
          blurAmount={10}
          reducedTransparencyFallbackColor="rgba(40, 40, 40, 0.95)"
        />
        
        {/* Top Section */}
        <View style={styles.leadCardTop}>
          {/* Left: Avatar and Name */}
          <View style={styles.leadLeftSection}>
            <View style={styles.leadAvatar}>
              <LinearGradient
                colors={['#D4AF37', '#AA8C2C']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.avatarGradient}>
                <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
              </LinearGradient>
            </View>
            <View style={styles.leadNameContainer}>
              <Text style={styles.leadName} numberOfLines={1}>
                {item.name}
              </Text>
            </View>
          </View>

          {/* Right: Status and Date */}
          <View style={styles.leadRightSection}>
            <View style={styles.leadStatusRow}>
              <View
                style={[
                  styles.statusDot,
                  {backgroundColor: getStatusColor(item.status)},
                ]}
              />
              <Text style={[styles.leadStatus, {color: getStatusColor(item.status)}]}>
                {getStatusLabel(item.status)}
              </Text>
            </View>
            <View style={styles.leadTimestamp}>
              <Icon name="access-time" size={12} color="rgba(255, 255, 255, 0.4)" />
              <Text style={styles.timestampText}>{formatTime(item.created_at)}</Text>
            </View>
          </View>
        </View>

        {/* Bottom Section: Requirement */}
        {item.requirement && (
          <View style={styles.leadRequirementSection}>
            <View style={styles.requirementDivider} />
            <View style={styles.requirementContent}>
              <Icon name="description" size={14} color="rgba(212, 175, 55, 0.7)" />
              <Text style={styles.requirementText} numberOfLines={2}>
                {item.requirement}
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <LinearGradient
            colors={['#F5D78E', '#D4AF37']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.emptyIconCircle}>
            <Icon name="inbox" size={60} color="#1a1a1a" />
          </LinearGradient>
        </View>
        <Text style={styles.emptyTitle}>No Leads Found</Text>
        <Text style={styles.emptySubtitle}>
          You don't have any leads yet.{'\n'}Start adding leads to see them here.
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

      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 10,
          },
        ]}>
        <BlurView
          style={StyleSheet.absoluteFillObject}
          blurType="dark"
          blurAmount={20}
          reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.8)"
        />
        <View style={styles.headerOverlay} />

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>All Leads</Text>

        <View style={styles.placeholder} />
      </View>

      {/* Content */}
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
          ListEmptyComponent={renderEmpty}
        />
      )}
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
    paddingBottom: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  placeholder: {
    width: 40,
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
    paddingTop: 120,
    paddingBottom: 100,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  // Lead Card Styles
  leadCard: {
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  leadCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  leadLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  leadRightSection: {
    alignItems: 'flex-end',
    gap: 6,
  },
  leadNameContainer: {
    flex: 1,
  },
  leadAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    marginRight: 12,
  },
  avatarGradient: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    includeFontPadding: false,
  },
  leadName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  leadStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  leadStatus: {
    fontSize: 11,
    fontWeight: '600',
  },
  leadTimestamp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  timestampText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: '500',
  },
  leadRequirementSection: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 14,
  },
  requirementDivider: {
    height: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    marginBottom: 12,
  },
  requirementContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(212, 175, 55, 0.6)',
    gap: 10,
  },
  requirementText: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 19,
    fontWeight: '500',
  },
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 60,
    minHeight: 400,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 22,
  },
});

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
  Linking,
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {BlurView} from '@react-native-community/blur';
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

  const handleCall = (mobile: string) => {
    Linking.openURL(`tel:${mobile}`);
  };

  const handleWhatsApp = (mobile: string) => {
    Linking.openURL(`whatsapp://send?phone=91${mobile}`);
  };

  const renderItem = ({item, index}: {item: Lead; index: number}) => {
    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };

    return (
      <View style={styles.leadCardWrapper}>
        {/* Card with gradient border effect */}
        <LinearGradient
          colors={['rgba(212, 175, 55, 0.4)', 'rgba(212, 175, 55, 0.1)', 'rgba(212, 175, 55, 0.05)']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.cardGradientBorder}>
          <TouchableOpacity
            style={styles.leadCard}
            activeOpacity={0.95}
            onPress={() => {
              navigation.navigate('LeadDetails', {lead: item});
            }}>
            
            {/* Header with gradient background */}
            <LinearGradient
              colors={['rgba(212, 175, 55, 0.15)', 'rgba(212, 175, 55, 0.05)', 'transparent']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.cardHeaderGradient}>
              
              {/* Decorative elements */}
              <View style={styles.decorativeCircle1} />
              <View style={styles.decorativeCircle2} />
              
              <View style={styles.cardHeader}>
                <View style={styles.nameContainer}>
                  {/* Avatar with gradient */}
                  <LinearGradient
                    colors={['#F5D78E', '#D4AF37', '#AA8C2C']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={styles.avatarGradient}>
                    <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
                  </LinearGradient>
                  
                  <View style={styles.nameTextContainer}>
                    <Text style={styles.leadName} numberOfLines={1}>{item.name}</Text>
                    <View style={styles.leadMetaRow}>
                      <View style={styles.statusBadge}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusText}>New Lead</Text>
                      </View>
                    </View>
                  </View>
                </View>
                
                {/* Rank badge */}
                <View style={styles.rankBadgeContainer}>
                  <LinearGradient
                    colors={['rgba(212, 175, 55, 0.3)', 'rgba(212, 175, 55, 0.1)']}
                    style={styles.rankBadge}>
                    <Text style={styles.rankText}>#{leads.length - index}</Text>
                  </LinearGradient>
                </View>
              </View>
            </LinearGradient>

            {/* Info Section */}
            <View style={styles.cardBody}>
              {/* Contact Row */}
              <View style={styles.infoRow}>
                <View style={[styles.infoIconContainer, styles.phoneIconBg]}>
                  <Icon name="phone" size={16} color="#4CAF50" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Contact Number</Text>
                  <Text style={styles.infoValue}>{item.mobile}</Text>
                </View>
                {/* Quick action buttons */}
                <View style={styles.quickActions}>
                  <TouchableOpacity 
                    style={styles.actionBtn}
                    onPress={() => handleCall(item.mobile)}>
                    <Icon name="phone" size={16} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.whatsappBtn]}
                    onPress={() => handleWhatsApp(item.mobile)}>
                    <Icon name="chat" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Divider with glow */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <View style={styles.dividerGlow} />
              </View>

              {/* Location Row */}
              <View style={styles.infoRow}>
                <View style={[styles.infoIconContainer, styles.locationIconBg]}>
                  <Icon name="location-on" size={16} color="#2196F3" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Location</Text>
                  <Text style={styles.infoValue} numberOfLines={1}>{item.address}</Text>
                </View>
              </View>

              {/* Requirement Row */}
              <View style={styles.requirementContainer}>
                <View style={styles.requirementHeader}>
                  <View style={[styles.infoIconContainer, styles.requirementIconBg]}>
                    <Icon name="description" size={16} color="#FF9800" />
                  </View>
                  <Text style={styles.requirementLabel}>Property Requirement</Text>
                </View>
                <View style={styles.requirementBox}>
                  <Text style={styles.requirementText} numberOfLines={2}>
                    {item.requirement}
                  </Text>
                </View>
              </View>
            </View>

            {/* Footer with gradient */}
            <LinearGradient
              colors={['transparent', 'rgba(212, 175, 55, 0.05)']}
              style={styles.cardFooter}>
              <View style={styles.timestampContainer}>
                <Icon name="access-time" size={14} color="rgba(212, 175, 55, 0.8)" />
                <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
              </View>
              <TouchableOpacity 
                style={styles.viewDetailsBtn}
                onPress={() => navigation.navigate('LeadDetails', {lead: item})}>
                <Text style={styles.viewDetailsText}>View Details</Text>
                <Icon name="arrow-forward" size={16} color="#D4AF37" />
              </TouchableOpacity>
            </LinearGradient>
            
          </TouchableOpacity>
        </LinearGradient>
      </View>
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
          </View>
        </>
      )}

      {hideHeader && (
        <View
          style={[
            styles.simpleHeader,
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
          <FallingRupees count={10} />
          <Text style={[styles.simpleHeaderTitle, {color: theme.colors.text}]}>
            My Leads
          </Text>
        </View>
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
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
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
  // Card wrapper and gradient border
  leadCardWrapper: {
    marginBottom: 20,
  },
  cardGradientBorder: {
    borderRadius: 24,
    padding: 1.5,
  },
  leadCard: {
    backgroundColor: 'rgba(15, 15, 20, 0.98)',
    borderRadius: 22,
    overflow: 'hidden',
  },
  
  // Card header with gradient
  cardHeaderGradient: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
  },
  decorativeCircle2: {
    position: 'absolute',
    top: 20,
    right: 30,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
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
  
  // Avatar styles
  avatarGradient: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: 1,
  },
  nameTextContainer: {
    marginLeft: 14,
    flex: 1,
  },
  leadName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  leadMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '600',
  },
  
  // Rank badge
  rankBadgeContainer: {
    marginLeft: 12,
  },
  rankBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  rankText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D4AF37',
  },
  
  // Card body
  cardBody: {
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneIconBg: {
    backgroundColor: 'rgba(76, 175, 80, 0.12)',
  },
  locationIconBg: {
    backgroundColor: 'rgba(33, 150, 243, 0.12)',
  },
  requirementIconBg: {
    backgroundColor: 'rgba(255, 152, 0, 0.12)',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.45)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoValue: {
    fontSize: 15,
    color: '#ffffff',
    marginTop: 3,
    fontWeight: '500',
  },
  
  // Quick action buttons
  quickActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  whatsappBtn: {
    backgroundColor: '#25D366',
    shadowColor: '#25D366',
  },
  
  // Divider
  dividerContainer: {
    height: 1,
    marginVertical: 4,
    position: 'relative',
  },
  dividerLine: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  dividerGlow: {
    position: 'absolute',
    left: '20%',
    right: '20%',
    height: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
  },
  
  // Requirement section
  requirementContainer: {
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    padding: 14,
  },
  requirementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  requirementLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginLeft: 10,
  },
  requirementBox: {
    backgroundColor: 'rgba(255, 152, 0, 0.05)',
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9800',
  },
  requirementText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '400',
    lineHeight: 20,
  },
  
  // Card footer
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: 'rgba(212, 175, 55, 0.7)',
    marginLeft: 6,
    fontWeight: '500',
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  viewDetailsText: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '600',
    marginRight: 4,
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

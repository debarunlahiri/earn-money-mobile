import React, {useState, useEffect, useCallback, useMemo} from 'react';
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
  ScrollView,
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
import {Carousel, CarouselItem} from '../components/Carousel';

interface MyLeadsScreenProps {
  navigation: any;
  hideHeader?: boolean;
}

type FilterType = 'all' | 'new' | 'contacted' | 'converted';
type SortType = 'newest' | 'oldest' | 'name';

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
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('newest');

  // Carousel items for promotional content
  const carouselItems: CarouselItem[] = [
    {
      id: '1',
      gradient: ['rgba(212, 175, 55, 0.2)', 'rgba(212, 175, 55, 0.05)'],
      component: (
        <View style={styles.carouselCard}>
          <ImageBackground
            source={require('../../assets/images/banner_one.png')}
            style={styles.carouselImageBackground}
            resizeMode="stretch">
            <View style={styles.carouselOverlay} />
          </ImageBackground>
        </View>
      ),
    },
    {
      id: '2',
      gradient: ['rgba(76, 175, 80, 0.2)', 'rgba(76, 175, 80, 0.05)'],
      component: (
        <View style={styles.carouselCard}>
          <ImageBackground
            source={require('../../assets/images/banner_two.png')}
            style={styles.carouselImageBackground}
            resizeMode="stretch">
            <View style={styles.carouselOverlay} />
          </ImageBackground>
        </View>
      ),
    },
    {
      id: '3',
      gradient: ['rgba(33, 150, 243, 0.2)', 'rgba(33, 150, 243, 0.05)'],
      component: (
        <View style={styles.carouselCard}>
          <ImageBackground
            source={require('../../assets/images/banner_three.png')}
            style={styles.carouselImageBackground}
            resizeMode="stretch">
            <View style={styles.carouselOverlay} />
          </ImageBackground>
        </View>
      ),
    },
  ];

  // Computed stats
  const stats = useMemo(() => {
    const total = leads.length;
    const newLeads = leads.filter(l => l.status === 'new').length;
    const contacted = leads.filter(l => l.status === 'contacted').length;
    const converted = leads.filter(l => l.status === 'converted').length;
    const conversionRate = total > 0 ? ((converted / total) * 100).toFixed(1) : '0';
    
    return { total, newLeads, contacted, converted, conversionRate };
  }, [leads]);

  // Filtered and sorted leads
  const filteredAndSortedLeads = useMemo(() => {
    let filtered = [...leads];
    
    // Apply filter
    if (filterType !== 'all') {
      filtered = filtered.filter(lead => lead.status === filterType);
    }
    
    // Apply sort
    filtered.sort((a, b) => {
      switch (sortType) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [leads, filterType, sortType]);

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
                      <View style={[
                        styles.statusBadge,
                        item.status === 'converted' && styles.statusBadgeConverted,
                        item.status === 'new' && styles.statusBadgeNew,
                      ]}>
                        <View style={[
                          styles.statusDot,
                          item.status === 'converted' && styles.statusDotConverted,
                          item.status === 'new' && styles.statusDotNew,
                        ]} />
                        <Text style={[
                          styles.statusText,
                          item.status === 'converted' && styles.statusTextConverted,
                          item.status === 'new' && styles.statusTextNew,
                        ]}>{item.status.toUpperCase()}</Text>
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
        {/* Animated background gradients */}
        <View style={styles.emptyBackgroundGradient1} />
        <View style={styles.emptyBackgroundGradient2} />
        <View style={styles.emptyBackgroundGradient3} />
        
        {/* Large central icon with modern design */}
        <View style={styles.emptyMainContent}>
          <View style={styles.emptyIconContainer}>
            {/* Main icon circle */}
            <LinearGradient
              colors={['#F5D78E', '#D4AF37']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.emptyIconCircle}>
              <Icon name="inbox" size={70} color="#1a1a1a" />
            </LinearGradient>
          </View>

          {/* Title section */}
          <View style={styles.emptyTitleSection}>
            <Text style={styles.emptyTitle}>No Leads Yet</Text>
            <Text style={styles.emptySubtitle}>
              Start your earning journey by adding{'\n'}your first property enquiry
            </Text>
          </View>

          {/* Stats preview cards - horizontal layout */}
          <View style={styles.emptyStatsContainer}>
            <LinearGradient
              colors={['rgba(76, 175, 80, 0.15)', 'rgba(76, 175, 80, 0.05)']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.emptyStatCard}>
              <Icon name="verified-user" size={28} color="#4CAF50" />
              <View style={styles.emptyStatTextContainer}>
                <Text style={styles.emptyStatLabel}>Quality Leads</Text>
                <Text style={styles.emptyStatDescription}>Verified enquiries</Text>
              </View>
            </LinearGradient>

            <LinearGradient
              colors={['rgba(212, 175, 55, 0.15)', 'rgba(212, 175, 55, 0.05)']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.emptyStatCard}>
              <Icon name="account-balance-wallet" size={28} color="#D4AF37" />
              <View style={styles.emptyStatTextContainer}>
                <Text style={styles.emptyStatLabel}>Earn More</Text>
                <Text style={styles.emptyStatDescription}>High commissions</Text>
              </View>
            </LinearGradient>

            <LinearGradient
              colors={['rgba(33, 150, 243, 0.15)', 'rgba(33, 150, 243, 0.05)']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.emptyStatCard}>
              <Icon name="headset-mic" size={28} color="#2196F3" />
              <View style={styles.emptyStatTextContainer}>
                <Text style={styles.emptyStatLabel}>24/7 Support</Text>
                <Text style={styles.emptyStatDescription}>Always available</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Bottom hint */}
          <View style={styles.emptyHintContainer}>
            <View style={styles.emptyHintDot} />
            <Text style={styles.emptyHintText}>
              Tap "Add Lead" button above to add property enquiries and start earning
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderHeader = () => {
    return (
      <View style={styles.listHeader}>
        {/* Carousel Section - Always show */}
        <View style={styles.carouselWrapper}>
          <Carousel
            items={carouselItems}
            autoPlay={true}
            autoPlayInterval={4000}
            height={120}
            showPagination={true}
          />
        </View>

        {/* Filter & Sort Controls - Only show when leads exist */}
        {leads.length > 0 && (
          <View style={styles.controlsContainer}>
            {/* Active Filter Display */}
            <View style={styles.activeFilterContainer}>
              <Icon name="filter-list" size={16} color="#D4AF37" />
              <Text style={styles.activeFilterText}>
                {filterType === 'all' ? 'All Leads' : `${filterType.charAt(0).toUpperCase() + filterType.slice(1)} Leads`}
              </Text>
              <Text style={styles.activeFilterCount}>({filteredAndSortedLeads.length})</Text>
            </View>

            {/* Sort Button */}
            <TouchableOpacity
              style={styles.sortButton}
              onPress={() => {
                // Cycle through sort options
                const sortOptions: SortType[] = ['newest', 'oldest', 'name'];
                const currentIndex = sortOptions.indexOf(sortType);
                const nextIndex = (currentIndex + 1) % sortOptions.length;
                setSortType(sortOptions[nextIndex]);
              }}>
              <Icon name="sort" size={16} color="#D4AF37" />
              <Text style={styles.sortButtonText}>
                {sortType === 'newest' ? 'Newest' : sortType === 'oldest' ? 'Oldest' : 'Name'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

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
              Home
            </Text>
            <TouchableOpacity
              style={styles.addLeadButton}
              onPress={() => navigation.navigate('AddNewEnquiry')}
              activeOpacity={0.8}>
              <LinearGradient
                colors={['#F5D78E', '#D4AF37', '#AA8C2C']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.addLeadGradient}>
                <Icon name="add" size={18} color="#000" />
                <Text style={styles.addLeadText}>Add Lead</Text>
              </LinearGradient>
            </TouchableOpacity>
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
          <View style={styles.simpleHeaderContent}>
            <Text style={[styles.simpleHeaderTitle, {color: theme.colors.text}]}>
              Home
            </Text>
            <TouchableOpacity
              style={styles.addLeadButton}
              onPress={() => navigation.navigate('AddNewEnquiry')}
              activeOpacity={0.8}>
              <LinearGradient
                colors={['#F5D78E', '#D4AF37', '#AA8C2C']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.addLeadGradient}>
                <Icon name="add" size={18} color="#000" />
                <Text style={styles.addLeadText}>Add Lead</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loadingText}>Loading leads...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredAndSortedLeads}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={[
            styles.listContent,
            filteredAndSortedLeads.length === 0 && styles.emptyListContent,
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
          ListHeaderComponent={renderHeader}
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
  addLeadButton: {
    shadowColor: '#D4AF37',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addLeadGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  addLeadText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.3,
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
  simpleHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
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
    flexGrow: 1,
  },
  listHeader: {
    marginBottom: 20,
  },
  leadsCountContainer: {
    marginTop: 20,
    marginBottom: 8,
    paddingHorizontal: 24,
  },
  leadsCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  totalLeadsText: {
    fontSize: 14,
    color: '#D4AF37',
    fontWeight: '700',
    marginLeft: 8,
  },
  // Carousel card styles - Enhanced
  carouselCard: {
    flex: 1,
    padding: 0,
    justifyContent: 'center',
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: 'rgba(25, 25, 30, 0.95)',
    shadowColor: '#D4AF37',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  carouselImageBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
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
  statusBadgeNew: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
  },
  statusDotNew: {
    backgroundColor: '#4CAF50',
  },
  statusTextNew: {
    color: '#4CAF50',
  },
  statusBadgeConverted: {
    backgroundColor: 'rgba(33, 150, 243, 0.15)',
  },
  statusDotConverted: {
    backgroundColor: '#2196F3',
  },
  statusTextConverted: {
    color: '#2196F3',
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
  
  // Stats Cards
  statsContainer: {
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
  },
  statCardGradient: {
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 120,
    justifyContent: 'center',
  },
  statIconContainer: {
    marginBottom: 10,
  },
  statIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  conversionBadge: {
    marginTop: 6,
    backgroundColor: 'rgba(156, 39, 176, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  conversionText: {
    fontSize: 10,
    color: '#9C27B0',
    fontWeight: '700',
  },

  // Carousel wrapper
  carouselWrapper: {
    marginBottom: 16,
  },

  // Filter & Sort Controls
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  activeFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  activeFilterText: {
    fontSize: 13,
    color: '#D4AF37',
    fontWeight: '600',
    marginLeft: 6,
  },
  activeFilterCount: {
    fontSize: 12,
    color: 'rgba(212, 175, 55, 0.7)',
    fontWeight: '700',
    marginLeft: 4,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  sortButtonText: {
    fontSize: 13,
    color: '#D4AF37',
    fontWeight: '600',
    marginLeft: 6,
  },

  // Modern Empty State Design
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
    minHeight: 600,
    position: 'relative',
  },
  
  // Background gradients
  emptyBackgroundGradient1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(212, 175, 55, 0.06)',
    opacity: 0.6,
  },
  emptyBackgroundGradient2: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(76, 175, 80, 0.06)',
    opacity: 0.5,
  },
  emptyBackgroundGradient3: {
    position: 'absolute',
    top: '50%',
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(33, 150, 243, 0.05)',
    opacity: 0.4,
  },

  // Main content wrapper
  emptyMainContent: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },

  // Icon container with glow rings
  emptyIconContainer: {
    position: 'relative',
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyGlowRing1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    opacity: 0.6,
  },
  emptyGlowRing2: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.1)',
    opacity: 0.4,
  },
  emptyIconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },

  // Title section
  emptyTitleSection: {
    alignItems: 'center',
    marginBottom: 36,
  },
  emptyTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 12,
    letterSpacing: -1,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
  },

  // Stats container - horizontal cards
  emptyStatsContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 32,
  },
  emptyStatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  emptyStatTextContainer: {
    marginLeft: 14,
    flex: 1,
  },
  emptyStatLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  emptyStatDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '500',
  },

  // CTA Button
  emptyCtaButton: {
    width: '100%',
    marginBottom: 20,
    shadowColor: '#D4AF37',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  emptyCtaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
    gap: 10,
  },
  emptyCtaText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 0.3,
  },

  // Bottom hint
  emptyHintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emptyHintDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(212, 175, 55, 0.6)',
  },
  emptyHintText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '500',
  },
});

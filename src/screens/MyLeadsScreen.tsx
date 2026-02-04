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
  Image,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {LinearGradient} from 'expo-linear-gradient';
import {BlurView} from '@react-native-community/blur';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../theme/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {FallingRupees} from '../components/FallingRupee';
import {useScrollVisibility} from '../context/ScrollVisibilityContext';
import {useAuth} from '../context/AuthContext';
import {viewLeads, Lead, getProfileWithLeads, SliderItem, LeadsSummaryItem} from '../services/api';
import {Carousel, CarouselItem} from '../components/Carousel';
import {Logo} from '../components/Logo';

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
  const [sliderItems, setSliderItems] = useState<SliderItem[]>([]);
  const [leadsSummary, setLeadsSummary] = useState<LeadsSummaryItem[]>([]);
  const [profileName, setProfileName] = useState<string>('');

  // Build carousel items from API slider data
  const carouselItems: CarouselItem[] = useMemo(() => {
    if (sliderItems.length === 0) {
      // Fallback to default banners if API hasn't loaded yet
      return [
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
      ];
    }

    return sliderItems.map((item, index) => ({
      id: index.toString(),
      gradient: [
        index === 0 ? 'rgba(212, 175, 55, 0.2)' : index === 1 ? 'rgba(76, 175, 80, 0.2)' : 'rgba(33, 150, 243, 0.2)',
        index === 0 ? 'rgba(212, 175, 55, 0.05)' : index === 1 ? 'rgba(76, 175, 80, 0.05)' : 'rgba(33, 150, 243, 0.05)',
      ],
      component: (
        <View style={styles.carouselCard}>
          <Image
            source={{uri: item.img}}
            style={styles.carouselImageBackground}
            resizeMode="cover"
          />
          <View style={styles.carouselOverlay}>
            <View style={styles.carouselTextContainer}>
              <Text style={styles.carouselTitle}>{item.title}</Text>
              <Text style={styles.carouselSubtitle}>{item.sub_title}</Text>
            </View>
          </View>
        </View>
      ),
    }));
  }, [sliderItems]);

  // Computed stats from API leads_summary or fallback to computed from leads
  const stats = useMemo(() => {
    if (leadsSummary.length > 0) {
      // Use API data
      const newLeads = leadsSummary.find(item => item.new !== undefined)?.new || 0;
      const processing = leadsSummary.find(item => item.processing !== undefined)?.processing || 0;
      const cancelled = leadsSummary.find(item => item.cancelled !== undefined)?.cancelled || 0;
      const converted = leadsSummary.find(item => item.converted !== undefined)?.converted || 0;
      const total = newLeads + processing + cancelled + converted;
      const conversionRate = total > 0 ? ((converted / total) * 100).toFixed(1) : '0';
      
      return { total, newLeads, contacted: processing, converted, conversionRate, cancelled };
    } else {
      // Fallback to computed from leads array
      const total = leads.length;
      const newLeads = leads.filter(l => l.status === 'new').length;
      const contacted = leads.filter(l => l.status === 'contacted' || l.status === 'processing').length;
      const converted = leads.filter(l => l.status === 'converted').length;
      const cancelled = leads.filter(l => l.status === 'cancelled').length;
      const conversionRate = total > 0 ? ((converted / total) * 100).toFixed(1) : '0';
      
      return { total, newLeads, contacted, converted, conversionRate, cancelled };
    }
  }, [leads, leadsSummary]);

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
      // Use the new profile API that returns everything
      const response = await getProfileWithLeads(userData.userid, userData.token);

      if (response.status === 'success') {
        // Set leads from view_leads
        if (response.view_leads) {
          setLeads(response.view_leads);
        } else {
          setLeads([]);
        }
        
        // Set slider items
        if (response.slider) {
          setSliderItems(response.slider);
        }
        
        // Set leads summary
        if (response.leads_summary) {
          setLeadsSummary(response.leads_summary);
        }
        
        // Set profile name
        if (response.userdata?.username) {
          setProfileName(response.userdata.username);
        }
      } else {
        setError(response.message || 'Failed to fetch data');
        setLeads([]);
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError('An error occurred while fetching data');
      setLeads([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userData]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Refresh leads when screen comes into focus (after adding new lead)
  useFocusEffect(
    useCallback(() => {
      fetchLeads();
    }, [fetchLeads])
  );

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
        {/* Header Background Extension - matches header solid background */}
        <View style={styles.headerBackgroundExtension}>
          {/* Welcome Section */}
          <View style={[styles.welcomeSection, {paddingTop: insets.top + 10}]}>
            <Text style={styles.welcomeText}>Welcome back</Text>
            <Text style={styles.welcomeName}>Hi, {profileName || userData?.username || 'User'} 👋</Text>
          </View>

          {/* Carousel Section - Always show */}
          <View>
            <Carousel
              items={carouselItems}
              autoPlay={true}
              autoPlayInterval={4000}
              height={120}
              showPagination={true}
            />
          </View>
        </View>

        {/* Leads Summary Section - Show when we have data */}
        {leadsSummary.length > 0 && (
          <View style={styles.leadsSummaryContainer}>
            <Text style={styles.leadsSummaryTitle}>Leads Overview</Text>
            
            <View style={styles.summaryCardsRow}>
              {/* New Leads Card */}
              <View style={[styles.summaryCard, styles.summaryCardGreen]}>
                <BlurView
                  style={StyleSheet.absoluteFillObject}
                  blurType="dark"
                  blurAmount={10}
                  reducedTransparencyFallbackColor="rgba(76, 175, 80, 0.2)"
                />
                <View style={styles.summaryCardContent}>
                  <Text style={styles.summaryValue}>{stats.newLeads}</Text>
                  <Text style={styles.summaryLabel}>New Leads</Text>
                </View>
              </View>

              {/* Processing Card */}
              <View style={[styles.summaryCard, styles.summaryCardOrange]}>
                <BlurView
                  style={StyleSheet.absoluteFillObject}
                  blurType="dark"
                  blurAmount={10}
                  reducedTransparencyFallbackColor="rgba(255, 152, 0, 0.2)"
                />
                <View style={styles.summaryCardContent}>
                  <Text style={styles.summaryValue}>{stats.contacted}</Text>
                  <Text style={styles.summaryLabel}>Contacted</Text>
                </View>
              </View>

              {/* Cancelled Card */}
              <View style={[styles.summaryCard, styles.summaryCardPurple]}>
                <BlurView
                  style={StyleSheet.absoluteFillObject}
                  blurType="dark"
                  blurAmount={10}
                  reducedTransparencyFallbackColor="rgba(156, 39, 176, 0.2)"
                />
                <View style={styles.summaryCardContent}>
                  <Text style={styles.summaryValue}>{stats.cancelled || 0}</Text>
                  <Text style={styles.summaryLabel}>Cancelled</Text>
                </View>
              </View>

              {/* Converted Card */}
              <View style={[styles.summaryCard, styles.summaryCardBlue]}>
                <BlurView
                  style={StyleSheet.absoluteFillObject}
                  blurType="dark"
                  blurAmount={10}
                  reducedTransparencyFallbackColor="rgba(33, 150, 243, 0.2)"
                />
                <View style={styles.summaryCardContent}>
                  <Text style={styles.summaryValue}>{stats.converted}</Text>
                  <Text style={styles.summaryLabel}>Converted</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Recent Leads Heading - Only show when leads exist */}
        {leads.length > 0 && (
          <View style={styles.recentLeadsContainer}>
            <Text style={styles.recentLeadsTitle}>Recent Leads</Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('AllLeads')}
              activeOpacity={0.7}>
              <Text style={styles.viewAllText}>View All</Text>
              <Icon name="arrow-forward" size={16} color="#D4AF37" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const content = (
    <>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="rgba(0, 0, 0, 0)"
      />

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

      {/* Floating Add Lead Button */}
      <TouchableOpacity
        style={[
          styles.floatingAddButton,
          {
            bottom: insets.bottom + 80,
          },
        ]}
        onPress={() => navigation.navigate('AddNewEnquiry')}
        activeOpacity={0.8}>
        <LinearGradient
          colors={['#F5D78E', '#D4AF37', '#AA8C2C']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.floatingButtonGradient}>
          <Icon name="add" size={20} color="#000" />
          <Text style={styles.floatingButtonText}>Add Lead</Text>
        </LinearGradient>
      </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 160,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  listHeader: {
    marginBottom: 4,
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
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselTextContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  carouselTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 4,
  },
  carouselSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
  },
  // Header Background Extension - transparent to show background
  headerBackgroundExtension: {
    backgroundColor: 'transparent',
    marginHorizontal: -24,
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  // Welcome Section
  welcomeSection: {
    marginBottom: 16,
  },
  welcomeLogoContainer: {
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  welcomeName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },

  // Leads Summary Section
  leadsSummaryContainer: {
    marginTop: 0,
  },
  leadsSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  summaryCardsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  summaryCardGreen: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  summaryCardOrange: {
    backgroundColor: 'rgba(255, 152, 0, 0.15)',
    borderColor: 'rgba(255, 152, 0, 0.3)',
  },
  summaryCardPurple: {
    backgroundColor: 'rgba(156, 39, 176, 0.15)',
    borderColor: 'rgba(156, 39, 176, 0.3)',
  },
  summaryCardBlue: {
    backgroundColor: 'rgba(33, 150, 243, 0.15)',
    borderColor: 'rgba(33, 150, 243, 0.3)',
  },
  summaryCardContent: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  // Lead Card Styles
  leadCard: {
    marginBottom: 6,
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
    marginBottom: 6,
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
    paddingTop: 2,
    paddingBottom: 14,
  },
  requirementDivider: {
    height: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    marginBottom: 8,
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
  // Card wrapper and gradient border
  leadCardWrapper: {
    marginBottom: 20,
  },
  cardGradientBorder: {
    borderRadius: 24,
    padding: 1.5,
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
  nameTextContainer: {
    marginLeft: 14,
    flex: 1,
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

 

  // Recent Leads Heading
  recentLeadsContainer: {
    marginTop: 2,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentLeadsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 0.3,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D4AF37',
    letterSpacing: 0.2,
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

  // Floating Add Lead Button
  floatingAddButton: {
    position: 'absolute',
    right: 20,
    shadowColor: '#D4AF37',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
    zIndex: 1000,
  },
  floatingButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    gap: 8,
  },
  floatingButtonText: {
    fontSize: 15,
    fontWeight: '700',
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

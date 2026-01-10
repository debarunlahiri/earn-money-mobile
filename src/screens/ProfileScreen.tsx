import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  Animated,
  ActivityIndicator,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../theme/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useScrollVisibility} from '../context/ScrollVisibilityContext';
import {FallingRupees} from '../components/FallingRupee';
import {useAuth} from '../context/AuthContext';
import {getProfile, ProfileData} from '../services/api';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({navigation}) => {
  const {theme, isDark} = useTheme();
  const insets = useSafeAreaInsets();
  const {handleScroll, headerTranslateY} = useScrollVisibility();
  const {userData} = useAuth();
  
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userData?.userid || !userData?.token) {
        console.log('Missing userData:', userData);
        setError('User not logged in');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log('Fetching profile for userid:', userData.userid, 'token:', userData.token);
        const response = await getProfile(userData.userid, userData.token);
        console.log('Profile API response:', JSON.stringify(response));
        
        if (response.status === 'success' && response.status_code === 200) {
          // API returns data in 'userdata' field
          if (response.userdata) {
            setProfileData(response.userdata);
            setError(null);
          } else {
            setError('No profile data found');
          }
        } else {
          console.log('Profile API error:', response.message);
          setError(response.message || 'Failed to load profile');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userData]);

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `+91 ${cleaned.substring(0, 5)} ${cleaned.substring(5)}`;
    }
    return phone;
  };

  const maskAccountNumber = (acNo: string) => {
    if (!acNo || acNo.length < 4) return acNo;
    const lastFour = acNo.slice(-4);
    const masked = '*'.repeat(acNo.length - 4);
    return masked + lastFour;
  };

  const maskIFSC = (ifsc: string) => {
    if (!ifsc || ifsc.length < 4) return ifsc;
    return ifsc.slice(0, 4) + '*'.repeat(ifsc.length - 4);
  };

  const maskAddress = (address: string) => {
    if (!address || address.length < 6) return '*'.repeat(address.length || 5);
    // Show first 3 and last 3 characters
    return address.slice(0, 3) + '*'.repeat(Math.max(address.length - 6, 3)) + address.slice(-3);
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
        <FallingRupees count={12} />
        <Text style={[styles.headerTitle, {color: theme.colors.text}]}>
          Profile
        </Text>
      </View>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, {paddingTop: insets.top + 100}]}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}>
        <View style={styles.profileSection}>
          <View style={styles.profileCardContainer}>
            <View style={styles.profileCardGlassContainer}>
              <View style={styles.profileCardGlassBaseLayer} />
              <View style={styles.profileCardGlassFrostLayer} />
              <View style={styles.profileCardGlassHighlight} />
              <View style={styles.profileCardGlassInnerBorder} />
              <View style={styles.profileCardGlassContent}>
                {isLoading ? (
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                ) : error ? (
                  <Text style={[styles.errorText, {color: theme.colors.error || '#FF6B6B'}]}>
                    {error}
                  </Text>
                ) : (
                  <>
          <View style={styles.profileImageContainer}>
            <View style={styles.initialsContainer}>
              <Text style={styles.initialsText}>
                {(profileData?.username || 'U')
                  .split(' ')
                  .map(word => word.charAt(0))
                  .join('')
                  .substring(0, 2)
                  .toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={[styles.profileName, {color: theme.colors.text}]}>
                        {profileData?.username || 'User'}
          </Text>
          <Text style={[styles.profilePhone, {color: theme.colors.textSecondary}]}>
                        {formatPhoneNumber(profileData?.mobile || '')}
          </Text>
                    {profileData?.wallet && (
                      <View style={styles.walletContainer}>
                        <Icon name="account-balance-wallet" size={20} color={theme.colors.primary} />
                        <Text style={[styles.walletText, {color: theme.colors.primary}]}>
                          ₹{profileData.wallet}
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Details Section */}
        {!isLoading && !error && profileData && (
          <View style={styles.detailsSection}>
            <View style={styles.detailsGlassContainer}>
              <View style={styles.profileCardGlassBaseLayer} />
              <View style={styles.profileCardGlassFrostLayer} />
              <View style={styles.profileCardGlassHighlight} />
              <View style={styles.profileCardGlassInnerBorder} />
              <View style={styles.detailsContent}>
                <View style={styles.detailsHeader}>
                  <Text style={[styles.detailsTitle, {color: theme.colors.text}]}>Account Details</Text>
                  <TouchableOpacity 
                    onPress={() => setShowSensitiveData(!showSensitiveData)}
                    style={styles.visibilityButton}>
                    <Icon 
                      name={showSensitiveData ? 'visibility' : 'visibility-off'} 
                      size={22} 
                      color={theme.colors.primary} 
                    />
                  </TouchableOpacity>
                </View>

                {/* Address */}
                {profileData.address && (
                  <View style={styles.detailRow}>
                    <View style={styles.detailIconContainer}>
                      <Icon name="location-on" size={18} color={theme.colors.primary} />
                    </View>
                    <View style={styles.detailTextContainer}>
                      <Text style={[styles.detailLabel, {color: theme.colors.textSecondary}]}>Address</Text>
                      <Text style={[styles.detailValue, {color: theme.colors.text}]}>
                        {showSensitiveData ? profileData.address : maskAddress(profileData.address)}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Account Number */}
                {profileData.ac_no && (
                  <View style={styles.detailRow}>
                    <View style={styles.detailIconContainer}>
                      <Icon name="account-balance" size={18} color={theme.colors.primary} />
                    </View>
                    <View style={styles.detailTextContainer}>
                      <Text style={[styles.detailLabel, {color: theme.colors.textSecondary}]}>Account Number</Text>
                      <Text style={[styles.detailValue, {color: theme.colors.text}]}>
                        {showSensitiveData ? profileData.ac_no : maskAccountNumber(profileData.ac_no)}
                      </Text>
                    </View>
                  </View>
                )}

                {/* IFSC Code */}
                {profileData.ifsc_code && (
                  <View style={styles.detailRow}>
                    <View style={styles.detailIconContainer}>
                      <Icon name="code" size={18} color={theme.colors.primary} />
                    </View>
                    <View style={styles.detailTextContainer}>
                      <Text style={[styles.detailLabel, {color: theme.colors.textSecondary}]}>IFSC Code</Text>
                      <Text style={[styles.detailValue, {color: theme.colors.text}]}>
                        {showSensitiveData ? profileData.ifsc_code : maskIFSC(profileData.ifsc_code)}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        <View style={styles.menuItemContainer}>
          <View style={styles.menuItemGlassContainer}>
            <View style={styles.menuItemGlassBaseLayer} />
            <View style={styles.menuItemGlassFrostLayer} />
            <View style={styles.menuItemGlassHighlight} />
            <View style={styles.menuItemGlassInnerBorder} />
        <TouchableOpacity
              style={styles.menuItemGlassContent}
          onPress={() => navigation.navigate('Settings')}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.iconContainer, {backgroundColor: 'rgba(212, 175, 55, 0.15)'}]}>
              <Icon name="settings" size={20} color={theme.colors.primary} />
            </View>
            <Text style={[styles.menuItemText, {color: theme.colors.text}]}>
              Settings
            </Text>
          </View>
          <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 16,
    zIndex: 100,
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1,
    marginTop: 10,
  },
  scrollContent: {
    paddingBottom: 100,
    paddingHorizontal: 24,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileCardContainer: {
    borderRadius: 24,
    overflow: 'visible',
    width: '100%',
  },
  profileCardGlassContainer: {
    borderRadius: 24,
    overflow: 'visible',
    backgroundColor: 'rgba(139, 69, 19, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    position: 'relative',
  },
  profileCardGlassBaseLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(139, 69, 19, 0.12)',
    borderRadius: 24,
    pointerEvents: 'none',
  },
  profileCardGlassFrostLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 24,
    pointerEvents: 'none',
  },
  profileCardGlassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    pointerEvents: 'none',
  },
  profileCardGlassInnerBorder: {
    position: 'absolute',
    top: 0.5,
    left: 0.5,
    right: 0.5,
    bottom: 0.5,
    borderRadius: 23.5,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.3)',
    pointerEvents: 'none',
  },
  profileCardGlassContent: {
    padding: 40,
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: 'rgba(212, 175, 55, 0.6)',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  initialsContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#000',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  profilePhone: {
    fontSize: 16,
  },
  menuItemContainer: {
    marginTop: 20,
    borderRadius: 20,
    overflow: 'visible',
  },
  menuItemGlassContainer: {
    borderRadius: 20,
    overflow: 'visible',
    backgroundColor: 'rgba(139, 69, 19, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    position: 'relative',
  },
  menuItemGlassBaseLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(139, 69, 19, 0.12)',
    borderRadius: 20,
    pointerEvents: 'none',
  },
  menuItemGlassFrostLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 20,
    pointerEvents: 'none',
  },
  menuItemGlassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    pointerEvents: 'none',
  },
  menuItemGlassInnerBorder: {
    position: 'absolute',
    top: 0.5,
    left: 0.5,
    right: 0.5,
    bottom: 0.5,
    borderRadius: 19.5,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.3)',
    pointerEvents: 'none',
  },
  menuItemGlassContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    position: 'relative',
    zIndex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  walletContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderRadius: 20,
  },
  walletText: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 8,
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailsGlassContainer: {
    borderRadius: 24,
    overflow: 'visible',
    backgroundColor: 'rgba(139, 69, 19, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    position: 'relative',
  },
  detailsContent: {
    padding: 20,
    position: 'relative',
    zIndex: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  visibilityButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
  },
});


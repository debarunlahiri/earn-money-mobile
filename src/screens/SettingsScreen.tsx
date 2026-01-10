import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  Animated,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../theme/ThemeContext';
import {useAuth} from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {FallingRupees} from '../components/FallingRupee';
import {useScrollVisibility} from '../context/ScrollVisibilityContext';
import {Dialog} from '../components/Dialog';
import {ADMIN_PHONE_NUMBERS} from '../config/firebase';

interface SettingsScreenProps {
  navigation: any;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({navigation}) => {
  const {theme} = useTheme();
  const {logout, userData} = useAuth();
  const insets = useSafeAreaInsets();
  const {handleScroll, headerTranslateY} = useScrollVisibility();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Check if user is admin
  const isAdmin = userData?.mobile && ADMIN_PHONE_NUMBERS.includes(
    userData.mobile.startsWith('+91') ? userData.mobile : `+91${userData.mobile}`
  );

  const handleLogout = async () => {
    await logout();
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: theme.colors.text}]}>
          Settings
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, {paddingTop: insets.top + 100}]}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}>
        
        {/* About */}
        <View style={styles.menuItemContainer}>
          <View style={styles.menuItemGlassContainer}>
            <View style={styles.menuItemGlassBaseLayer} />
            <View style={styles.menuItemGlassFrostLayer} />
            <View style={styles.menuItemGlassHighlight} />
            <View style={styles.menuItemGlassInnerBorder} />
            <TouchableOpacity
              style={styles.menuItemGlassContent}
              onPress={() => navigation.navigate('About')}
              activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, {backgroundColor: 'rgba(33, 150, 243, 0.15)'}]}>
                  <Icon name="info" size={22} color="#2196F3" />
                </View>
                <Text style={[styles.menuItemText, {color: theme.colors.text}]}>
                  About
                </Text>
              </View>
              <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Admin Chat Inbox (Only for admins) */}
        {isAdmin && (
          <View style={styles.menuItemContainer}>
            <View style={styles.menuItemGlassContainer}>
              <View style={styles.menuItemGlassBaseLayer} />
              <View style={styles.menuItemGlassFrostLayer} />
              <View style={styles.menuItemGlassHighlight} />
              <View style={styles.menuItemGlassInnerBorder} />
              <TouchableOpacity
                style={styles.menuItemGlassContent}
                onPress={() => navigation.navigate('AdminChatInbox')}
                activeOpacity={0.7}>
                <View style={styles.menuItemLeft}>
                  <View style={[styles.iconContainer, {backgroundColor: 'rgba(212, 175, 55, 0.15)'}]}>
                    <Icon name="admin-panel-settings" size={22} color="#D4AF37" />
                  </View>
                  <Text style={[styles.menuItemText, {color: theme.colors.text}]}>
                    Admin Chat Inbox
                  </Text>
                </View>
                <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Support */}
        <View style={styles.menuItemContainer}>
          <View style={styles.menuItemGlassContainer}>
            <View style={styles.menuItemGlassBaseLayer} />
            <View style={styles.menuItemGlassFrostLayer} />
            <View style={styles.menuItemGlassHighlight} />
            <View style={styles.menuItemGlassInnerBorder} />
            <TouchableOpacity
              style={styles.menuItemGlassContent}
              onPress={() => navigation.navigate('SupportChat')}
              activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, {backgroundColor: 'rgba(76, 175, 80, 0.15)'}]}>
                  <Icon name="support-agent" size={22} color="#4CAF50" />
                </View>
                <Text style={[styles.menuItemText, {color: theme.colors.text}]}>
                  Support
                </Text>
              </View>
              <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout */}
        <View style={styles.logoutSection}>
          <View style={styles.logoutButtonContainer}>
            <View style={styles.logoutButtonGlassContainer}>
              <View style={styles.logoutButtonGlassBaseLayer} />
              <View style={styles.logoutButtonGlassFrostLayer} />
              <View style={styles.logoutButtonGlassHighlight} />
              <View style={styles.logoutButtonGlassInnerBorder} />
              <TouchableOpacity
                style={styles.logoutButtonGlassContent}
                onPress={() => setShowLogoutDialog(true)}
                activeOpacity={0.7}>
                <View style={styles.menuItemLeft}>
                  <View style={[styles.iconContainer, {backgroundColor: theme.colors.error + '15'}]}>
                    <Icon name="logout" size={22} color={theme.colors.error} />
                  </View>
                  <Text style={[styles.logoutText, {color: theme.colors.error}]}>
                    Logout
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Logout Confirmation Dialog */}
      <Dialog
        visible={showLogoutDialog}
        type="logout"
        title="Goodbye!"
        message="Are you sure you want to logout?"
        showCancel={true}
        cancelText="Stay"
        confirmText="Logout"
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={handleLogout}
      />
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    zIndex: 100,
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
  },
  backButton: {
    width: 40,
  },
  headerTitle: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1,
    marginTop: 10,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  menuItemContainer: {
    marginTop: 8,
    marginBottom: 8,
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
    paddingVertical: 16,
    paddingHorizontal: 20,
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
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  logoutSection: {
    marginTop: 24,
  },
  logoutButtonContainer: {
    borderRadius: 20,
    overflow: 'visible',
  },
  logoutButtonGlassContainer: {
    borderRadius: 20,
    overflow: 'visible',
    backgroundColor: 'rgba(139, 69, 19, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    position: 'relative',
  },
  logoutButtonGlassBaseLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(139, 69, 19, 0.12)',
    borderRadius: 20,
    pointerEvents: 'none',
  },
  logoutButtonGlassFrostLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 20,
    pointerEvents: 'none',
  },
  logoutButtonGlassHighlight: {
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
  logoutButtonGlassInnerBorder: {
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
  logoutButtonGlassContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    position: 'relative',
    zIndex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});

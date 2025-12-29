import React from 'react';
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
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme, ThemeMode} from '../theme/ThemeContext';
import {useAuth} from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {FallingRupees} from '../components/FallingRupee';
import {useScrollVisibility} from '../context/ScrollVisibilityContext';

interface SettingsScreenProps {
  navigation: any;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({navigation}) => {
  const {theme, isDark, themeMode, setThemeMode} = useTheme();
  const {logout} = useAuth();
  const insets = useSafeAreaInsets();
  const {handleScroll, headerTranslateY} = useScrollVisibility();

  const handleLogout = async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{name: 'Login'}],
    });
  };

  const getThemeModeLabel = () => {
    switch (themeMode) {
      case 'light':
        return 'Light Mode';
      case 'dark':
        return 'Dark Mode';
      case 'system':
        return 'System Default';
      default:
        return 'System Default';
    }
  };

  const handleThemeModePress = () => {
    const modes: ThemeMode[] = ['light', 'dark', 'system'];
    const currentIndex = modes.indexOf(themeMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setThemeMode(modes[nextIndex]);
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
      <Animated.View
        style={[
          styles.header,
          {
            top: insets.top,
            paddingTop: 20,
            transform: [{translateY: headerTranslateY}],
          },
        ]}>
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
      </Animated.View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, {paddingTop: insets.top + 100}]}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}>
        <View style={styles.menuItemContainer}>
          <View style={styles.menuItemGlassContainer}>
            <View style={styles.menuItemGlassBaseLayer} />
            <View style={styles.menuItemGlassFrostLayer} />
            <View style={styles.menuItemGlassHighlight} />
            <View style={styles.menuItemGlassInnerBorder} />
        <TouchableOpacity
              style={styles.menuItemGlassContent}
          onPress={handleThemeModePress}
          activeOpacity={0.7}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.iconContainer, {backgroundColor: `${theme.colors.primary}15`}]}>
              <Icon name="brightness-6" size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.themeModeContainer}>
              <Text style={[styles.menuItemText, {color: theme.colors.text}]}>
                Theme
              </Text>
              <Text style={[styles.themeModeLabel, {color: theme.colors.textSecondary}]}>
                {getThemeModeLabel()}
              </Text>
            </View>
          </View>
          <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
          </View>
        </View>

        <View style={styles.logoutSection}>
          <View style={styles.logoutButtonContainer}>
            <View style={styles.logoutButtonGlassContainer}>
              <View style={styles.logoutButtonGlassBaseLayer} />
              <View style={styles.logoutButtonGlassFrostLayer} />
              <View style={styles.logoutButtonGlassHighlight} />
              <View style={styles.logoutButtonGlassInnerBorder} />
          <TouchableOpacity
                style={styles.logoutButtonGlassContent}
            onPress={handleLogout}
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
    paddingHorizontal: 24,
    paddingBottom: 20,
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 100,
    overflow: 'hidden',
  },
  backButton: {
    width: 40,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
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
    marginBottom: 16,
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
  themeModeContainer: {
    flex: 1,
  },
  themeModeLabel: {
    fontSize: 13,
    marginTop: 2,
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


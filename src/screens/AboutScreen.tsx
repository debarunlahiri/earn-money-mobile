import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  Linking,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../theme/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {FallingRupees} from '../components/FallingRupee';
import {Logo} from '../components/Logo';
import appJson from '../../app.json';

const APP_NAME = appJson.expo.name;

interface AboutScreenProps {
  navigation: any;
}

export const AboutScreen: React.FC<AboutScreenProps> = ({navigation}) => {
  const {theme} = useTheme();
  const insets = useSafeAreaInsets();

  const handleEmailPress = () => {
    Linking.openURL('mailto:support@propertyinder.com');
  };

  const handleWebsitePress = () => {
    Linking.openURL('https://www.propertyinder.com');
  };

  const handlePrivacyPress = () => {
    Linking.openURL('https://www.propertyinder.com/privacy');
  };

  const handleTermsPress = () => {
    Linking.openURL('https://www.propertyinder.com/terms');
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
          About
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, {paddingTop: insets.top + 100}]}
        showsVerticalScrollIndicator={false}>
        
        {/* App Info Card */}
        <View style={styles.cardContainer}>
          <View style={styles.glassContainer}>
            <View style={styles.glassBaseLayer} />
            <View style={styles.glassFrostLayer} />
            <View style={styles.glassHighlight} />
            <View style={styles.glassInnerBorder} />
            <View style={styles.cardContent}>
              <View style={styles.appIconContainer}>
                <Logo size={80} style={{borderRadius: 20}} resizeMode="cover" />
              </View>
              <Text style={[styles.appName, {color: theme.colors.text}]}>
                {APP_NAME}
              </Text>
              <Text style={[styles.version, {color: theme.colors.textSecondary}]}>
                Version 1.0.0
              </Text>
              <Text style={[styles.tagline, {color: theme.colors.textSecondary}]}>
                Your trusted platform for real estate leads
              </Text>
            </View>
          </View>
        </View>

        {/* Company Info */}
        <View style={styles.sectionContainer}>
          <View style={styles.glassContainer}>
            <View style={styles.glassBaseLayer} />
            <View style={styles.glassFrostLayer} />
            <View style={styles.glassHighlight} />
            <View style={styles.glassInnerBorder} />
            <View style={styles.sectionContent}>
              <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
                Company Information
              </Text>
              
              <View style={styles.infoRow}>
                <Icon name="business" size={20} color={theme.colors.primary} />
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, {color: theme.colors.textSecondary}]}>
                    Company
                  </Text>
                  <Text style={[styles.infoValue, {color: theme.colors.text}]}>
                    {APP_NAME} Pvt. Ltd.
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.infoRow} onPress={handleEmailPress}>
                <Icon name="email" size={20} color={theme.colors.primary} />
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, {color: theme.colors.textSecondary}]}>
                    Email
                  </Text>
                  <Text style={[styles.infoValue, {color: theme.colors.primary}]}>
                    support@earnmoney.com
                  </Text>
                </View>
                <Icon name="open-in-new" size={18} color={theme.colors.textSecondary} />
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.infoRow} onPress={handleWebsitePress}>
                <Icon name="language" size={20} color={theme.colors.primary} />
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, {color: theme.colors.textSecondary}]}>
                    Website
                  </Text>
                  <Text style={[styles.infoValue, {color: theme.colors.primary}]}>
                    www.earnmoney.com
                  </Text>
                </View>
                <Icon name="open-in-new" size={18} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Legal Links */}
        <View style={styles.sectionContainer}>
          <View style={styles.glassContainer}>
            <View style={styles.glassBaseLayer} />
            <View style={styles.glassFrostLayer} />
            <View style={styles.glassHighlight} />
            <View style={styles.glassInnerBorder} />
            <View style={styles.sectionContent}>
              <TouchableOpacity style={styles.linkRow} onPress={handlePrivacyPress}>
                <View style={styles.linkLeft}>
                  <Icon name="privacy-tip" size={20} color={theme.colors.primary} />
                  <Text style={[styles.linkText, {color: theme.colors.text}]}>
                    Privacy Policy
                  </Text>
                </View>
                <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.linkRow} onPress={handleTermsPress}>
                <View style={styles.linkLeft}>
                  <Icon name="description" size={20} color={theme.colors.primary} />
                  <Text style={[styles.linkText, {color: theme.colors.text}]}>
                    Terms & Conditions
                  </Text>
                </View>
                <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Copyright */}
        <Text style={[styles.copyright, {color: theme.colors.textSecondary}]}>
          © 2024 {APP_NAME} Pvt. Ltd.{'\n'}All rights reserved.
        </Text>
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
  cardContainer: {
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'visible',
  },
  sectionContainer: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'visible',
  },
  glassContainer: {
    borderRadius: 20,
    overflow: 'visible',
    backgroundColor: 'rgba(139, 69, 19, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    position: 'relative',
  },
  glassBaseLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(139, 69, 19, 0.12)',
    borderRadius: 20,
    pointerEvents: 'none',
  },
  glassFrostLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 20,
    pointerEvents: 'none',
  },
  glassHighlight: {
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
  glassInnerBorder: {
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
  cardContent: {
    padding: 32,
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  appIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  version: {
    fontSize: 14,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionContent: {
    padding: 20,
    position: 'relative',
    zIndex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 4,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  linkText: {
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 12,
  },
  copyright: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 18,
  },
});

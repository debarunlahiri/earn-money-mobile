import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Platform,
  ImageBackground,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNotifications } from '../context/NotificationContext';
import { scheduleLocalNotification } from '../services/notificationService';
import { FallingRupees } from '../components/FallingRupee';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationSettingsScreenProps {
  navigation: any;
}

const NOTIFICATION_SETTINGS_KEY = '@notification_settings';

interface NotificationSettings {
  newLeads: boolean;
  earnings: boolean;
  announcements: boolean;
  messages: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

const defaultSettings: NotificationSettings = {
  newLeads: true,
  earnings: true,
  announcements: true,
  messages: true,
  soundEnabled: true,
  vibrationEnabled: true,
};

export const NotificationSettingsScreen: React.FC<NotificationSettingsScreenProps> = ({
  navigation,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { expoPushToken, fcmToken, refreshPushToken, refreshFCMToken } = useNotifications();

  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving notification settings:', error);
      Alert.alert('Error', 'Failed to save notification settings');
    }
  };

  const toggleSetting = (key: keyof NotificationSettings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    saveSettings(newSettings);
  };

  const sendTestNotification = async () => {
    try {
      await scheduleLocalNotification(
        'Test Notification',
        'This is a test notification from Earn Money app! 💰',
        { type: 'test' }
      );
      Alert.alert('Success', 'Test notification sent!');
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  const handleRefreshExpoToken = async () => {
    Alert.alert(
      'Refresh Expo Push Token',
      'This will re-register your device for Expo push notifications. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Refresh',
          onPress: async () => {
            await refreshPushToken();
            Alert.alert('Success', 'Expo push token refreshed successfully!');
          },
        },
      ]
    );
  };

  const handleRefreshFCMToken = async () => {
    Alert.alert(
      'Refresh FCM Token',
      'This will re-register your device for Firebase Cloud Messaging. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Refresh',
          onPress: async () => {
            await refreshFCMToken();
            Alert.alert('Success', 'FCM token refreshed successfully!');
          },
        },
      ]
    );
  };

  const renderSettingItem = (
    icon: string,
    title: string,
    description: string,
    value: boolean,
    onToggle: () => void
  ) => (
    <View style={styles.settingItemContainer}>
      <View style={styles.settingGlassContainer}>
        <View style={styles.glassBaseLayer} />
        <View style={styles.glassFrostLayer} />
        <View style={styles.glassHighlight} />
        <View style={styles.glassInnerBorder} />
        <View style={styles.settingContent}>
          <View style={styles.settingLeft}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
              <Icon name={icon} size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>{title}</Text>
              <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                {description}
              </Text>
            </View>
          </View>
          <Switch
            value={value}
            onValueChange={onToggle}
            trackColor={{ false: '#767577', true: theme.colors.primary + '80' }}
            thumbColor={value ? theme.colors.primary : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
          />
        </View>
      </View>
    </View>
  );

  return (
    <ImageBackground
      source={require('../../assets/images/bg_image_second.png')}
      style={styles.container}
      resizeMode="cover">
      <View style={styles.overlay} />
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}>
        <FallingRupees count={8} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Notification Settings
          </Text>
        </View>

        {/* Push Token Info */}
        {(expoPushToken || fcmToken) && (
          <View style={styles.tokenContainer}>
            {fcmToken && (
              <View style={[styles.tokenGlassContainer, { marginBottom: 12 }]}>
                <View style={styles.glassBaseLayer} />
                <View style={styles.glassFrostLayer} />
                <View style={styles.glassHighlight} />
                <View style={styles.glassInnerBorder} />
                <View style={styles.tokenContent}>
                  <Icon name="verified" size={20} color="#4CAF50" />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.tokenText, { color: theme.colors.text, fontWeight: '600' }]}>
                      FCM Enabled
                    </Text>
                    <Text style={[styles.tokenText, { color: theme.colors.textSecondary, fontSize: 11 }]}>
                      Firebase Cloud Messaging active
                    </Text>
                  </View>
                </View>
              </View>
            )}
            {expoPushToken && (
              <View style={styles.tokenGlassContainer}>
                <View style={styles.glassBaseLayer} />
                <View style={styles.glassFrostLayer} />
                <View style={styles.glassHighlight} />
                <View style={styles.glassInnerBorder} />
                <View style={styles.tokenContent}>
                  <Icon name="verified" size={20} color="#2196F3" />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.tokenText, { color: theme.colors.text, fontWeight: '600' }]}>
                      Expo Push Enabled
                    </Text>
                    <Text style={[styles.tokenText, { color: theme.colors.textSecondary, fontSize: 11 }]}>
                      Expo notifications active
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Notification Types */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Notification Types
        </Text>

        {renderSettingItem(
          'work',
          'New Leads',
          'Get notified when new leads are available',
          settings.newLeads,
          () => toggleSetting('newLeads')
        )}

        {renderSettingItem(
          'account-balance-wallet',
          'Earnings Updates',
          'Notifications about your earnings and payments',
          settings.earnings,
          () => toggleSetting('earnings')
        )}

        {renderSettingItem(
          'campaign',
          'Announcements',
          'Important updates and announcements',
          settings.announcements,
          () => toggleSetting('announcements')
        )}

        {renderSettingItem(
          'message',
          'Messages',
          'Chat messages and support responses',
          settings.messages,
          () => toggleSetting('messages')
        )}

        {/* Notification Behavior */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Notification Behavior
        </Text>

        {renderSettingItem(
          'volume-up',
          'Sound',
          'Play sound for notifications',
          settings.soundEnabled,
          () => toggleSetting('soundEnabled')
        )}

        {renderSettingItem(
          'vibration',
          'Vibration',
          'Vibrate for notifications',
          settings.vibrationEnabled,
          () => toggleSetting('vibrationEnabled')
        )}

        {/* Actions */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Actions</Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={sendTestNotification}
          activeOpacity={0.7}>
          <View style={styles.actionGlassContainer}>
            <View style={styles.glassBaseLayer} />
            <View style={styles.glassFrostLayer} />
            <View style={styles.glassHighlight} />
            <View style={styles.glassInnerBorder} />
            <View style={styles.actionContent}>
              <Icon name="notifications-active" size={24} color={theme.colors.primary} />
              <Text style={[styles.actionText, { color: theme.colors.text }]}>
                Send Test Notification
              </Text>
              <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} />
            </View>
          </View>
        </TouchableOpacity>

        {fcmToken && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleRefreshFCMToken}
            activeOpacity={0.7}>
            <View style={styles.actionGlassContainer}>
              <View style={styles.glassBaseLayer} />
              <View style={styles.glassFrostLayer} />
              <View style={styles.glassHighlight} />
              <View style={styles.glassInnerBorder} />
              <View style={styles.actionContent}>
                <Icon name="cloud-sync" size={24} color={theme.colors.primary} />
                <Text style={[styles.actionText, { color: theme.colors.text }]}>
                  Refresh FCM Token
                </Text>
                <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} />
              </View>
            </View>
          </TouchableOpacity>
        )}

        {expoPushToken && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleRefreshExpoToken}
            activeOpacity={0.7}>
            <View style={styles.actionGlassContainer}>
              <View style={styles.glassBaseLayer} />
              <View style={styles.glassFrostLayer} />
              <View style={styles.glassHighlight} />
              <View style={styles.glassInnerBorder} />
              <View style={styles.actionContent}>
                <Icon name="refresh" size={24} color={theme.colors.primary} />
                <Text style={[styles.actionText, { color: theme.colors.text }]}>
                  Refresh Expo Token
                </Text>
                <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} />
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Info */}
        <View style={styles.infoContainer}>
          <Icon name="info-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            Notification settings are saved locally on your device. Some notifications may still be
            delivered based on your account settings.
          </Text>
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    flex: 1,
  },
  tokenContainer: {
    marginBottom: 24,
  },
  tokenGlassContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  tokenContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  tokenText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 16,
  },
  settingItemContainer: {
    marginBottom: 12,
  },
  settingGlassContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(139, 69, 19, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  glassBaseLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(139, 69, 19, 0.12)',
    borderRadius: 16,
  },
  glassFrostLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 16,
  },
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  glassInnerBorder: {
    position: 'absolute',
    top: 0.5,
    left: 0.5,
    right: 0.5,
    bottom: 0.5,
    borderRadius: 15.5,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.3)',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  actionButton: {
    marginBottom: 12,
  },
  actionGlassContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(139, 69, 19, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 24,
    padding: 12,
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
});

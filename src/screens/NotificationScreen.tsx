import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  ImageBackground,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  ToastAndroid,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../theme/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {FallingRupees} from '../components/FallingRupee';
import {useAuth} from '../context/AuthContext';
import {getNotifications, Notification, updateUnreadNotification} from '../services/api';

interface NotificationScreenProps {
  navigation: any;
}

export const NotificationScreen: React.FC<NotificationScreenProps> = ({navigation}) => {
  const {theme} = useTheme();
  const insets = useSafeAreaInsets();
  const {userData} = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchNotifications = async () => {
    if (!userData?.userid || !userData?.token) {
      setError('User not logged in');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await getNotifications(userData.userid, userData.token);

      if (response.status === 'success' && response.status_code === 200) {
        if (response.userdata) {
          setNotifications(response.userdata);
          setError(null);
        } else {
          setNotifications([]);
        }
      } else {
        setError('Failed to load notifications');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {

    fetchNotifications();
  }, [userData]);

  // Mark notifications as read when screen opens
  useEffect(() => {
    const markAsRead = async () => {
      if (!userData?.userid || !userData?.token) {
        return;
      }

      try {
        await updateUnreadNotification(userData.userid, userData.token);
        // Success - no message needed
      } catch (err) {
        console.error('Error marking notifications as read:', err);
        // Show toast on failure
        if (Platform.OS === 'android') {
          ToastAndroid.show('Failed to update notification status', ToastAndroid.SHORT);
        }
      }
    };

    markAsRead();
  }, [userData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchNotifications();
    setIsRefreshing(false);
  };

  const getNotificationGroup = (dateStr: string): string => {
    const notifDate = new Date(dateStr.split('-').reverse().join('-')); // Convert DD-MM-YYYY to YYYY-MM-DD
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const notifDateOnly = new Date(notifDate);
    notifDateOnly.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - notifDateOnly.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return 'This Week';
    if (diffDays <= 30) return 'This Month';
    return 'Earlier';
  };

  const groupNotifications = () => {
    const groups: { [key: string]: Notification[] } = {
      'Today': [],
      'Yesterday': [],
      'This Week': [],
      'This Month': [],
      'Earlier': []
    };

    notifications.forEach(notification => {
      const group = getNotificationGroup(notification.date);
      groups[group].push(notification);
    });

    return groups;
  };

  const renderNotificationItem = (item: Notification, index: number) => {
    return (
      <View key={index} style={styles.notificationItemContainer}>
        <View style={styles.notificationGlassContainer}>
          <View style={styles.glassBaseLayer} />
          <View style={styles.glassFrostLayer} />
          <View style={styles.glassHighlight} />
          <View style={styles.glassInnerBorder} />
          <View style={styles.notificationContent}>
            <View style={styles.notificationHeader}>
              <View style={styles.iconContainer}>
                <Icon name="notifications" size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.notificationHeaderText}>
                <Text style={[styles.notificationTitle, {color: theme.colors.text}]}>
                  {item.title}
                </Text>
                <View style={styles.dateTimeContainer}>
                  <Icon name="calendar-today" size={12} color={theme.colors.textSecondary} />
                  <Text style={[styles.notificationDate, {color: theme.colors.textSecondary}]}>
                    {item.date}
                  </Text>
                  <Icon name="access-time" size={12} color={theme.colors.textSecondary} style={styles.timeIcon} />
                  <Text style={[styles.notificationTime, {color: theme.colors.textSecondary}]}>
                    {item.time}
                  </Text>
                </View>
              </View>
            </View>
            <Text style={[styles.notificationMessage, {color: theme.colors.text}]}>
              {item.mess}
            </Text>
          </View>
        </View>
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
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, {color: theme.colors.text}]}>
            Notifications
          </Text>
          <TouchableOpacity
            onPress={handleRefresh}
            style={styles.refreshButton}
            disabled={isRefreshing}>
            <Icon
              name="refresh"
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          {paddingTop: insets.top + 100},
        ]}
        showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Icon name="error-outline" size={48} color={theme.colors.error || '#FF6B6B'} />
            <Text style={[styles.errorText, {color: theme.colors.error || '#FF6B6B'}]}>
              {error}
            </Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.centerContainer}>
            <Icon name="notifications-none" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, {color: theme.colors.textSecondary}]}>
              No notifications yet
            </Text>
          </View>
        ) : (
          (() => {
            const groupedNotifications = groupNotifications();
            const orderedGroups = ['Today', 'Yesterday', 'This Week', 'This Month', 'Earlier'];
            
            return orderedGroups.map(groupName => {
              const groupNotifs = groupedNotifications[groupName];
              if (groupNotifs.length === 0) return null;
              
              return (
                <View key={groupName}>
                  <Text style={[styles.sectionHeader, {color: theme.colors.text}]}>
                    {groupName}
                  </Text>
                  {groupNotifs.map((notification, index) => renderNotificationItem(notification, index))}
                </View>
              );
            });
          })()
        )}
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 100,
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1,
    flex: 1,
  },
  refreshButton: {
    padding: 8,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  notificationItemContainer: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'visible',
  },
  notificationGlassContainer: {
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
  notificationContent: {
    padding: 16,
    position: 'relative',
    zIndex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationHeaderText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationDate: {
    fontSize: 12,
    marginLeft: 4,
  },
  timeIcon: {
    marginLeft: 12,
  },
  notificationTime: {
    fontSize: 12,
    marginLeft: 4,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
});

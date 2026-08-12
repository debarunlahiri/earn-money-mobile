import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  StatusBar,
  ImageBackground,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  RefreshControl,
  ToastAndroid,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../theme/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useAuth} from '../context/AuthContext';
import {
  getNotifications,
  Notification,
  updateUnreadNotification,
} from '../services/api';

interface NotificationScreenProps {
  navigation: any;
}

const PAGE_LIMIT = 10;
const NOTIFICATION_GROUPS = [
  'Today',
  'Yesterday',
  'This Week',
  'This Month',
  'Earlier',
];

const getNotificationKey = (notification: Notification) =>
  `${notification.title}|${notification.mess}|${notification.date}|${notification.time}`;

const mergeUniqueNotifications = (
  current: Notification[],
  incoming: Notification[],
) => {
  const notificationsByKey = new Map(
    current.map(notification => [
      getNotificationKey(notification),
      notification,
    ]),
  );

  incoming.forEach(notification => {
    notificationsByKey.set(getNotificationKey(notification), notification);
  });

  return Array.from(notificationsByKey.values());
};

const getNotificationGroup = (dateStr: string): string => {
  const notificationDate = new Date(dateStr.split('-').reverse().join('-'));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  notificationDate.setHours(0, 0, 0, 0);
  const diffTime = today.getTime() - notificationDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays <= 7) return 'This Week';
  if (diffDays <= 30) return 'This Month';
  return 'Earlier';
};

export const NotificationScreen: React.FC<NotificationScreenProps> = ({
  navigation,
}) => {
  const {theme} = useTheme();
  const insets = useSafeAreaInsets();
  const {userData} = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(1);
  const isLoadingMoreRef = useRef(false);

  const fetchNotifications = useCallback(
    async (page = 1, append = false) => {
      if (!userData?.userid || !userData?.token) {
        setError('User not logged in');
        setIsLoading(false);
        return;
      }

      try {
        if (!append) {
          setIsLoading(true);
        }
        const response = await getNotifications(
          userData.userid,
          userData.token,
          page,
          PAGE_LIMIT,
        );

        if (response.status === 'success' && response.status_code === 200) {
          const nextNotifications = response.userdata || [];
          setNotifications(currentNotifications =>
            append
              ? mergeUniqueNotifications(
                  currentNotifications,
                  nextNotifications,
                )
              : mergeUniqueNotifications([], nextNotifications),
          );
          pageRef.current = page;
          setHasMore(nextNotifications.length === PAGE_LIMIT);
          setError(null);

          if (!append && nextNotifications.length === 0) {
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
        setIsRefreshing(false);
        setIsLoadingMore(false);
        isLoadingMoreRef.current = false;
      }
    },
    [userData],
  );

  useEffect(() => {
    pageRef.current = 1;
    setHasMore(true);
    fetchNotifications(1, false);
  }, [fetchNotifications]);

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
          ToastAndroid.show(
            'Failed to update notification status',
            ToastAndroid.SHORT,
          );
        }
      }
    };

    markAsRead();
  }, [userData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    pageRef.current = 1;
    setHasMore(true);
    fetchNotifications(1, false);
  };

  const loadMoreNotifications = useCallback(() => {
    if (isLoading || isRefreshing || isLoadingMoreRef.current || !hasMore) {
      return;
    }

    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);
    fetchNotifications(pageRef.current + 1, true);
  }, [fetchNotifications, hasMore, isLoading, isRefreshing]);

  const sections = useMemo(() => {
    const groups: {[key: string]: Notification[]} = {
      Today: [],
      Yesterday: [],
      'This Week': [],
      'This Month': [],
      Earlier: [],
    };

    notifications.forEach(notification => {
      const group = getNotificationGroup(notification.date);
      groups[group].push(notification);
    });

    return NOTIFICATION_GROUPS.map(title => ({
      title,
      data: groups[title],
    })).filter(section => section.data.length > 0);
  }, [notifications]);

  const renderNotificationItem = useCallback(
    ({item}: {item: Notification}) => (
      <View style={styles.notificationItemContainer}>
        <View style={styles.notificationGlassContainer}>
          <View style={styles.notificationContent}>
            <View style={styles.notificationHeader}>
              <View style={styles.iconContainer}>
                <Icon
                  name="notifications"
                  size={20}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.notificationHeaderText}>
                <Text
                  style={[
                    styles.notificationTitle,
                    {color: theme.colors.text},
                  ]}>
                  {item.title}
                </Text>
                <View style={styles.dateTimeContainer}>
                  <Icon
                    name="calendar-today"
                    size={12}
                    color={theme.colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.notificationDate,
                      {color: theme.colors.textSecondary},
                    ]}>
                    {item.date}
                  </Text>
                  <Icon
                    name="access-time"
                    size={12}
                    color={theme.colors.textSecondary}
                    style={styles.timeIcon}
                  />
                  <Text
                    style={[
                      styles.notificationTime,
                      {color: theme.colors.textSecondary},
                    ]}>
                    {item.time}
                  </Text>
                </View>
              </View>
            </View>
            <Text
              style={[styles.notificationMessage, {color: theme.colors.text}]}>
              {item.mess}
            </Text>
          </View>
        </View>
      </View>
    ),
    [theme.colors.primary, theme.colors.text, theme.colors.textSecondary],
  );

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
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, {color: theme.colors.text}]}>
            Notifications
          </Text>
          <TouchableOpacity
            onPress={handleRefresh}
            style={styles.refreshButton}
            disabled={isRefreshing}>
            <Icon name="refresh" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>
      <SectionList
        sections={sections}
        keyExtractor={getNotificationKey}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          {paddingTop: insets.top + 100},
          notifications.length === 0 && styles.emptyContentContainer,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        onEndReached={loadMoreNotifications}
        onEndReachedThreshold={0.35}
        initialNumToRender={8}
        maxToRenderPerBatch={6}
        updateCellsBatchingPeriod={50}
        windowSize={7}
        removeClippedSubviews
        renderItem={renderNotificationItem}
        renderSectionHeader={({section}) => (
          <Text style={[styles.sectionHeader, {color: theme.colors.text}]}>
            {section.title}
          </Text>
        )}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : error ? (
            <View style={styles.centerContainer}>
              <Icon
                name="error-outline"
                size={48}
                color={theme.colors.error || '#FF6B6B'}
              />
              <Text
                style={[
                  styles.errorText,
                  {color: theme.colors.error || '#FF6B6B'},
                ]}>
                {error}
              </Text>
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.centerContainer}>
              <Icon
                name="notifications-none"
                size={64}
                color={theme.colors.textSecondary}
              />
              <Text
                style={[styles.emptyText, {color: theme.colors.textSecondary}]}>
                No notifications yet
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.paginationLoader}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          ) : null
        }
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  emptyContentContainer: {
    flexGrow: 1,
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
    overflow: 'hidden',
    backgroundColor: 'rgba(28, 24, 20, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
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
  paginationLoader: {
    alignItems: 'center',
    paddingVertical: 20,
  },
});

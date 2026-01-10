import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../theme/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {FallingRupees} from '../components/FallingRupee';
import {useAuth} from '../context/AuthContext';
import {database, ADMIN_PHONE_NUMBERS} from '../config/firebase';
import {ref, onValue, get} from 'firebase/database';

interface ChatListItem {
  userId: string;
  userName: string;
  userPhone: string;
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
  userStatus: 'online' | 'offline';
  userTyping: boolean;
}

interface AdminChatInboxScreenProps {
  navigation: any;
}

export const AdminChatInboxScreen: React.FC<AdminChatInboxScreenProps> = ({navigation}) => {
  const {theme} = useTheme();
  const insets = useSafeAreaInsets();
  const {userData} = useAuth();

  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if current user is admin
  useEffect(() => {
    if (userData?.mobile) {
      const formattedPhone = userData.mobile.startsWith('+91') 
        ? userData.mobile 
        : `+91${userData.mobile}`;
      setIsAdmin(ADMIN_PHONE_NUMBERS.includes(formattedPhone));
    }
  }, [userData]);

  // Fetch all chats for admin
  useEffect(() => {
    if (!isAdmin) {
      setIsLoading(false);
      return;
    }

    const chatsRef = ref(database, 'chats');
    const unsubscribe = onValue(chatsRef, async (snapshot) => {
      if (!snapshot.exists()) {
        setChats([]);
        setIsLoading(false);
        return;
      }

      const chatsList: ChatListItem[] = [];
      const chatsData = snapshot.val();

      for (const userId in chatsData) {
        const chatData = chatsData[userId];
        
        // Get user info
        const userRef = ref(database, `users/${userId}`);
        const userSnapshot = await get(userRef);
        const userInfo = userSnapshot.val() || {};

        // Get messages
        const messages = chatData.messages || {};
        const messagesList = Object.values(messages) as any[];
        
        if (messagesList.length === 0) continue;

        // Sort messages by timestamp
        messagesList.sort((a, b) => a.timestamp - b.timestamp);
        const lastMessage = messagesList[messagesList.length - 1];

        // Count unread messages (messages from user that admin hasn't seen)
        const unreadCount = messagesList.filter(
          (msg: any) => msg.sender === 'user' && !msg.read
        ).length;

        chatsList.push({
          userId,
          userName: userInfo.name || userInfo.username || 'User',
          userPhone: userInfo.mobile || userId,
          lastMessage: lastMessage.text,
          lastMessageTime: lastMessage.timestamp,
          unreadCount,
          userStatus: userInfo.status || 'offline',
          userTyping: chatData.userTyping || false,
        });
      }

      // Sort by last message time (newest first)
      chatsList.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
      
      setChats(chatsList);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const renderChatItem = ({item}: {item: ChatListItem}) => {
    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => navigation.navigate('AdminChatDetail', {userId: item.userId})}
        activeOpacity={0.7}>
        <View style={styles.chatItemGlass}>
          <View style={styles.glassBaseLayer} />
          <View style={styles.glassFrostLayer} />
          <View style={styles.glassHighlight} />
          <View style={styles.glassInnerBorder} />
          
          <View style={styles.chatItemContent}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <View style={[styles.avatar, {backgroundColor: theme.colors.primary}]}>
                <Text style={styles.avatarText}>
                  {item.userName.charAt(0).toUpperCase()}
                </Text>
              </View>
              {/* Online status indicator */}
              {item.userStatus === 'online' && (
                <View style={[styles.onlineIndicator, {borderColor: theme.colors.background}]} />
              )}
            </View>

            {/* Chat info */}
            <View style={styles.chatInfo}>
              <View style={styles.chatHeader}>
                <Text style={[styles.userName, {color: theme.colors.text}]} numberOfLines={1}>
                  {item.userName}
                </Text>
                <Text style={[styles.timeText, {color: theme.colors.textSecondary}]}>
                  {formatTime(item.lastMessageTime)}
                </Text>
              </View>
              
              <View style={styles.messageRow}>
                {item.userTyping ? (
                  <Text style={[styles.typingText, {color: theme.colors.primary}]}>
                    typing...
                  </Text>
                ) : (
                  <Text 
                    style={[
                      styles.lastMessage, 
                      {color: theme.colors.textSecondary},
                      item.unreadCount > 0 && {fontWeight: '600', color: theme.colors.text}
                    ]} 
                    numberOfLines={1}>
                    {item.lastMessage}
                  </Text>
                )}
                
                {item.unreadCount > 0 && (
                  <View style={[styles.unreadBadge, {backgroundColor: theme.colors.primary}]}>
                    <Text style={styles.unreadText}>
                      {item.unreadCount > 99 ? '99+' : item.unreadCount}
                    </Text>
                  </View>
                )}
              </View>

              <Text style={[styles.phoneText, {color: theme.colors.textSecondary}]}>
                {item.userPhone}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (!isAdmin) {
    return (
      <ImageBackground
        source={require('../../assets/images/bg_image_second.png')}
        style={styles.container}
        resizeMode="cover">
        <View style={styles.overlay} />
        <View style={styles.centerContainer}>
          <Icon name="block" size={64} color={theme.colors.error || '#FF6B6B'} />
          <Text style={[styles.errorText, {color: theme.colors.error || '#FF6B6B'}]}>
            Access Denied
          </Text>
          <Text style={[styles.errorSubtext, {color: theme.colors.textSecondary}]}>
            This screen is only accessible to admin users
          </Text>
        </View>
      </ImageBackground>
    );
  }

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
      
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 10,
          },
        ]}>
        <BlurView
          style={StyleSheet.absoluteFillObject}
          blurType="dark"
          blurAmount={20}
          reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.8)"
        />
        <View style={styles.headerOverlay} />
        <FallingRupees count={12} />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, {color: theme.colors.text}]}>
            Admin Inbox
          </Text>
        </View>
        <View style={styles.headerBadge}>
          <Icon name="admin-panel-settings" size={20} color={theme.colors.primary} />
        </View>
      </View>

      {/* Chat List */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, {color: theme.colors.textSecondary}]}>
            Loading chats...
          </Text>
        </View>
      ) : chats.length === 0 ? (
        <View style={styles.centerContainer}>
          <Icon name="chat-bubble-outline" size={64} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyText, {color: theme.colors.textSecondary}]}>
            No conversations yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderChatItem}
          keyExtractor={item => item.userId}
          contentContainerStyle={[
            styles.listContent,
            {paddingTop: insets.top + 100},
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1,
  },
  headerBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  chatItem: {
    marginBottom: 12,
  },
  chatItemGlass: {
    borderRadius: 16,
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
    borderRadius: 16,
    pointerEvents: 'none',
  },
  glassFrostLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 16,
    pointerEvents: 'none',
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
    pointerEvents: 'none',
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
    pointerEvents: 'none',
  },
  chatItemContent: {
    flexDirection: 'row',
    padding: 16,
    position: 'relative',
    zIndex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  timeText: {
    fontSize: 12,
    marginLeft: 8,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    flex: 1,
  },
  typingText: {
    fontSize: 14,
    fontStyle: 'italic',
    flex: 1,
  },
  phoneText: {
    fontSize: 12,
    marginTop: 2,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  unreadText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
  errorText: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
  },
  errorSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});

import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ImageBackground,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../theme/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {FallingRupees} from '../components/FallingRupee';
import {useAuth} from '../context/AuthContext';
import {database} from '../config/firebase';
import {ref, push, onValue, set, query, orderByChild, get, update} from 'firebase/database';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'admin';
  timestamp: number;
  userId: string;
  read?: boolean;
  readAt?: number;
  userName?: string;
}

export interface AdminChatDetailScreenProps {
  navigation: any;
  route: {
    params: {
      userId: string;
    };
  };
}

export const AdminChatDetailScreen = (props: any) => {
  const {navigation, route} = props as AdminChatDetailScreenProps;
  const {theme} = useTheme();
  const insets = useSafeAreaInsets();
  const {userData} = useAuth();
  const flatListRef = useRef<FlatList>(null);
  const {userId} = route.params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [userInfo, setUserInfo] = useState<any>(null);
  const [userStatus, setUserStatus] = useState<'online' | 'offline'>('offline');
  const [userTyping, setUserTyping] = useState(false);

  // Fetch user info
  useEffect(() => {
    const fetchUserInfo = async () => {
      const userRef = ref(database, `users/${userId}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        setUserInfo(snapshot.val());
      }
    };
    fetchUserInfo();
  }, [userId]);

  // Listen to user status
  useEffect(() => {
    const userStatusRef = ref(database, `users/${userId}/status`);
    const unsubscribe = onValue(userStatusRef, (snapshot) => {
      if (snapshot.exists()) {
        setUserStatus(snapshot.val());
      }
    });
    return () => unsubscribe();
  }, [userId]);

  // Listen to user typing
  useEffect(() => {
    const userTypingRef = ref(database, `chats/${userId}/userTyping`);
    const unsubscribe = onValue(userTypingRef, (snapshot) => {
      setUserTyping(snapshot.val() || false);
    });
    return () => unsubscribe();
  }, [userId]);

  // Set up Firebase listener for messages
  useEffect(() => {
    const chatRef = ref(database, `chats/${userId}/messages`);
    const messagesQuery = query(chatRef, orderByChild('timestamp'));

    const unsubscribe = onValue(messagesQuery, (snapshot) => {
      const messagesData: Message[] = [];
      snapshot.forEach((childSnapshot) => {
        const message = childSnapshot.val();
        messagesData.push({
          id: childSnapshot.key!,
          ...message,
        });
      });
      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, [userId]);

  // Set admin typing status
  useEffect(() => {
    const adminTypingRef = ref(database, 'adminStatus/status');
    
    if (inputText.trim().length > 0) {
      set(adminTypingRef, 'typing');
    } else {
      set(adminTypingRef, 'online');
    }
  }, [inputText]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({animated: true});
      }, 100);
    }
  }, [messages]);

  // Mark user messages as read when admin views them
  useEffect(() => {
    const markMessagesAsRead = async () => {
      const chatRef = ref(database, `chats/${userId}/messages`);
      const snapshot = await get(chatRef);

      if (snapshot.exists()) {
        const updates: any = {};
        snapshot.forEach((childSnapshot) => {
          const message = childSnapshot.val();
          // Mark user messages as read by admin
          if (message.sender === 'user' && !message.read) {
            updates[`${childSnapshot.key}/read`] = true;
            updates[`${childSnapshot.key}/readAt`] = Date.now();
          }
        });

        if (Object.keys(updates).length > 0) {
          await update(chatRef, updates);
        }
      }
    };

    if (messages.length > 0) {
      markMessagesAsRead();
    }
  }, [userId, messages]);

  const handleSend = async () => {
    if (inputText.trim() === '') return;

    const chatRef = ref(database, `chats/${userId}/messages`);
    const newMessageRef = push(chatRef);
    const adminStatusRef = ref(database, 'adminStatus/status');

    const newMessage = {
      text: inputText.trim(),
      sender: 'admin',
      timestamp: Date.now(),
      userId: 'admin',
      userName: 'Admin',
    };

    try {
      await set(newMessageRef, newMessage);
      await set(adminStatusRef, 'online'); // Stop typing
      setInputText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  const renderMessage = ({item}: {item: Message}) => {
    const isAdmin = item.sender === 'admin';

    return (
      <View style={[styles.messageContainer, isAdmin ? styles.adminMessageContainer : styles.userMessageContainer]}>
        <View style={isAdmin ? styles.adminBubbleWrapper : styles.userBubbleWrapper}>
          <View style={isAdmin ? styles.adminBubble : styles.userBubble}>
            <View style={styles.glassBaseLayer} />
            <View style={styles.glassFrostLayer} />
            <View style={styles.glassHighlight} />
            <View style={styles.glassInnerBorder} />
            <View style={styles.bubbleContent}>
              <Text style={[styles.messageText, {color: theme.colors.text}]}>
                {item.text}
              </Text>
              <Text style={[styles.timestamp, {color: theme.colors.textSecondary}]}>
                {formatTime(item.timestamp)}
                {isAdmin && (
                  <Text style={styles.readReceipt}>
                    {item.read ? ' ✓✓' : ' ✓'}
                  </Text>
                )}
              </Text>
            </View>
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
            {userInfo?.name || userInfo?.username || 'User'}
          </Text>
          <Text style={[styles.headerSubtitle, {color: theme.colors.textSecondary}]}>
            {userTyping ? (
              <>
                <Text style={{color: theme.colors.primary}}>typing</Text>
                <Text>...</Text>
              </>
            ) : userStatus === 'online' ? (
              <>
                <View style={[styles.statusDot, {backgroundColor: '#4CAF50'}]} />
                <Text> Online</Text>
              </>
            ) : (
              <>
                <View style={[styles.statusDot, {backgroundColor: '#888'}]} />
                <Text> Offline</Text>
              </>
            )}
          </Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 80 : 0}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={[
            styles.messagesList,
            {paddingTop: insets.top + 100, paddingBottom: 20},
          ]}
          showsVerticalScrollIndicator={false}
        />

        <View style={[styles.inputContainer, {paddingBottom: insets.bottom + 10}]}>
          <View style={styles.inputGlassContainer}>
            <View style={styles.inputGlassBaseLayer} />
            <View style={styles.inputGlassFrostLayer} />
            <View style={styles.inputGlassHighlight} />
            <View style={styles.inputGlassInnerBorder} />
            <View style={styles.inputContent}>
              <TextInput
                style={[styles.input, {color: theme.colors.text}]}
                placeholder="Type a message..."
                placeholderTextColor={theme.colors.textSecondary}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[styles.sendButton, {backgroundColor: theme.colors.primary}]}
                onPress={handleSend}
                disabled={inputText.trim() === ''}>
                <Icon name="send" size={20} color="#000" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  placeholder: {
    width: 40,
  },
  keyboardView: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
  },
  messageContainer: {
    marginVertical: 4,
  },
  userMessageContainer: {
    alignItems: 'flex-start',
  },
  adminMessageContainer: {
    alignItems: 'flex-end',
  },
  userBubbleWrapper: {
    maxWidth: '80%',
  },
  adminBubbleWrapper: {
    maxWidth: '80%',
  },
  userBubble: {
    borderRadius: 16,
    borderTopLeftRadius: 4,
    overflow: 'visible',
    backgroundColor: 'rgba(139, 69, 19, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    position: 'relative',
  },
  adminBubble: {
    borderRadius: 16,
    borderTopRightRadius: 4,
    overflow: 'visible',
    backgroundColor: 'rgba(212, 175, 55, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.5)',
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
  bubbleContent: {
    padding: 12,
    position: 'relative',
    zIndex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 11,
    alignSelf: 'flex-end',
  },
  readReceipt: {
    fontSize: 11,
    color: '#4CAF50',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  inputGlassContainer: {
    borderRadius: 24,
    overflow: 'visible',
    backgroundColor: 'rgba(139, 69, 19, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    position: 'relative',
  },
  inputGlassBaseLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(139, 69, 19, 0.12)',
    borderRadius: 24,
    pointerEvents: 'none',
  },
  inputGlassFrostLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 24,
    pointerEvents: 'none',
  },
  inputGlassHighlight: {
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
  inputGlassInnerBorder: {
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
  inputContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    position: 'relative',
    zIndex: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    fontSize: 15,
    maxHeight: 100,
    paddingVertical: 8,
    paddingRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});

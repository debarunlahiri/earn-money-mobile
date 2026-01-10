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
  Animated,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../theme/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {FallingRupees} from '../components/FallingRupee';
import {useScrollVisibility} from '../context/ScrollVisibilityContext';
import {useAuth} from '../context/AuthContext';
import {database} from '../config/firebase';
import {ref, push, onValue, set, query, orderByChild, get, onDisconnect, update} from 'firebase/database';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'admin';
  timestamp: number;
  userId: string;
  userName?: string;
}


interface SupportChatScreenProps {
  navigation: any;
}

export const SupportChatScreen: React.FC<SupportChatScreenProps> = ({navigation}) => {
  const {theme} = useTheme();
  const insets = useSafeAreaInsets();
  const {headerTranslateY} = useScrollVisibility();
  const {userData} = useAuth();
  const flatListRef = useRef<FlatList>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [adminStatus, setAdminStatus] = useState<'online' | 'offline' | 'typing'>('offline');
  const [adminPhones, setAdminPhones] = useState<string[]>([]);

  // Set up Firebase listener for messages
  useEffect(() => {
    if (!userData?.userid) return;

    const chatRef = ref(database, `chats/${userData.userid}/messages`);
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
  }, [userData]);

  // Fetch admin phone numbers from database
  useEffect(() => {
    const adminPhonesRef = ref(database, 'config/adminPhones');
    const unsubscribe = onValue(adminPhonesRef, (snapshot) => {
      if (snapshot.exists()) {
        const phones = snapshot.val();
        setAdminPhones(Array.isArray(phones) ? phones : []);
      } else {
        // Initialize with default admin phones if not exists
        set(adminPhonesRef, ['+919389735755', '+918929607491']);
        setAdminPhones(['+919389735755', '+918929607491']);
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen to admin status (online/offline/typing)
  useEffect(() => {
    const adminStatusRef = ref(database, 'adminStatus/status');
    const unsubscribe = onValue(adminStatusRef, (snapshot) => {
      if (snapshot.exists()) {
        setAdminStatus(snapshot.val());
      }
    });

    return () => unsubscribe();
  }, []);

  // Set user online status and handle disconnect
  useEffect(() => {
    if (!userData?.userid) return;

    const userStatusRef = ref(database, `users/${userData.userid}/status`);
    const userTypingRef = ref(database, `chats/${userData.userid}/userTyping`);

    // Set user as online
    set(userStatusRef, 'online');

    // Set user as offline on disconnect
    onDisconnect(userStatusRef).set('offline');
    onDisconnect(userTypingRef).set(false);

    return () => {
      set(userStatusRef, 'offline');
      set(userTypingRef, false);
    };
  }, [userData]);

  // Mark admin messages as read when screen is focused
  useEffect(() => {
    const markMessagesAsRead = async () => {
      if (!userData?.userid) return;

      const chatRef = ref(database, `chats/${userData.userid}/messages`);
      const snapshot = await get(chatRef);

      if (snapshot.exists()) {
        const updates: any = {};
        snapshot.forEach((childSnapshot) => {
          const message = childSnapshot.val();
          // Mark admin messages as read
          if (message.sender === 'admin' && !message.read) {
            updates[`${childSnapshot.key}/read`] = true;
            updates[`${childSnapshot.key}/readAt`] = Date.now();
          }
        });

        if (Object.keys(updates).length > 0) {
          await update(chatRef, updates);
        }
      }
    };

    markMessagesAsRead();
  }, [userData, messages]);

  // Initialize chat with greeting message if it's a new chat
  useEffect(() => {
    const initializeChat = async () => {
      if (!userData?.userid) return;

      const chatRef = ref(database, `chats/${userData.userid}/messages`);
      const snapshot = await get(chatRef);

      // If no messages exist, add a greeting message
      if (!snapshot.exists()) {
        const greetingMessageRef = push(chatRef);
        const greetingMessage = {
          text: 'Hello! Welcome to Earn Money Support. How can we assist you today? Our support team will respond to your queries shortly.',
          sender: 'admin',
          timestamp: Date.now(),
          userId: 'system',
          userName: 'Admin',
        };
        await set(greetingMessageRef, greetingMessage);
      }
    };

    initializeChat();
  }, [userData]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({animated: true});
      }, 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (inputText.trim() === '' || !userData?.userid) return;

    const chatRef = ref(database, `chats/${userData.userid}/messages`);
    const newMessageRef = push(chatRef);
    const userTypingRef = ref(database, `chats/${userData.userid}/userTyping`);

    const newMessage = {
      text: inputText.trim(),
      sender: 'user',
      timestamp: Date.now(),
      userId: userData.userid,
      userName: userData.username || 'User',
    };

    try {
      await set(newMessageRef, newMessage);
      await set(userTypingRef, false); // Stop typing indicator
      setInputText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Handle typing indicator
  const handleTyping = (text: string) => {
    setInputText(text);
    
    if (!userData?.userid) return;
    
    const userTypingRef = ref(database, `chats/${userData.userid}/userTyping`);
    
    if (text.trim().length > 0) {
      set(userTypingRef, true);
    } else {
      set(userTypingRef, false);
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
    const isUser = item.sender === 'user';

    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.adminMessageContainer]}>
        <View style={isUser ? styles.userBubbleWrapper : styles.adminBubbleWrapper}>
          <View style={isUser ? styles.userBubble : styles.adminBubble}>
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
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, {color: theme.colors.text}]}>
            Support Chat
          </Text>
          <Text style={[styles.headerSubtitle, {color: theme.colors.textSecondary}]}>
            {adminStatus === 'typing' ? (
              <>
                <Text style={{color: theme.colors.primary}}>typing</Text>
                <Text>...</Text>
              </>
            ) : adminStatus === 'online' ? (
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
                onChangeText={handleTyping}
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
    alignItems: 'flex-end',
  },
  adminMessageContainer: {
    alignItems: 'flex-start',
  },
  userBubbleWrapper: {
    maxWidth: '80%',
  },
  adminBubbleWrapper: {
    maxWidth: '80%',
  },
  userBubble: {
    borderRadius: 16,
    borderTopRightRadius: 4,
    overflow: 'visible',
    backgroundColor: 'rgba(212, 175, 55, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.5)',
    position: 'relative',
  },
  adminBubble: {
    borderRadius: 16,
    borderTopLeftRadius: 4,
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

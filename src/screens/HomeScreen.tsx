import React, {useState, useEffect} from 'react';
import {View, StyleSheet, StatusBar, ImageBackground, Text} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useFocusEffect} from '@react-navigation/native';
import {useTheme} from '../theme/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {MyLeadsScreen} from './MyLeadsScreen';
import {ProfileScreen} from './ProfileScreen';
import {WalletScreen} from './WalletScreen';
import {NotificationScreen} from './NotificationScreen';
import {FAB} from '../components/FAB';
import {AnimatedTabBar} from '../components/AnimatedTabBar';
import {useAuth} from '../context/AuthContext';
import {getUnreadNotificationCount} from '../services/api';

const Tab = createBottomTabNavigator();

interface HomeScreenProps {
  navigation: any;
}

const HomeTabContent = ({
  navigation,
}: {
  navigation: any;
}) => {
  return (
    <View style={styles.container}>
      <MyLeadsScreen navigation={navigation} hideHeader={true} />
    </View>
  );
};

const WalletTabContent = ({
  navigation,
}: {
  navigation: any;
}) => {
  return (
    <View style={styles.container}>
      <WalletScreen navigation={navigation} />
    </View>
  );
};

const NotificationTabContent = ({
  navigation,
}: {
  navigation: any;
}) => {
  return (
    <View style={styles.container}>
      <NotificationScreen navigation={navigation} />
    </View>
  );
};

export const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  const {theme, isDark} = useTheme();
  const {userData} = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notification count on mount
  useEffect(() => {
    fetchUnreadCount();
  }, [userData]);

  // Refetch unread count when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchUnreadCount();
    }, [userData])
  );

  const fetchUnreadCount = async () => {
    if (!userData?.userid || !userData?.token) {
      return;
    }

    try {
      const response = await getUnreadNotificationCount(userData.userid, userData.token);
      if (response.status === 'success' && response.status_code === 200) {
        if (response.userdata) {
          setUnreadCount(parseInt(response.userdata.unread_count) || 0);
        }
      }
    } catch (error) {
      console.error('Error fetching unread notification count:', error);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/bg_image_second.png')}
      style={styles.backgroundImage}
      resizeMode="cover">
      <View style={styles.overlay} />
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <Tab.Navigator
        sceneContainerStyle={{backgroundColor: 'transparent'}}
        tabBar={(props) => <AnimatedTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.colors.tabActive,
          tabBarInactiveTintColor: theme.colors.tabInactive,
          tabBarStyle: {
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            paddingBottom: 8,
            paddingTop: 8,
            height: 60,
            elevation: 0,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}>
        <Tab.Screen
          name="Dashboard"
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({color, size}) => (
              <Icon name="home" size={size} color={color} />
            ),
          }}>
          {() => (
            <HomeTabContent
              navigation={navigation}
            />
          )}
        </Tab.Screen>
        <Tab.Screen
          name="WalletTab"
          options={{
            tabBarLabel: 'Wallet',
            tabBarIcon: ({color, size}) => (
              <Icon name="account-balance-wallet" size={size} color={color} />
            ),
          }}>
          {() => (
            <WalletTabContent
              navigation={navigation}
            />
          )}
        </Tab.Screen>
        <Tab.Screen
          name="NotificationTab"
          options={{
            tabBarLabel: 'Notifications',
            tabBarIcon: ({color, size}) => (
              <View style={styles.iconContainer}>
                <Icon name="notifications" size={size} color={color} />
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            ),
          }}>
          {() => (
            <NotificationTabContent
              navigation={navigation}
            />
          )}
        </Tab.Screen>
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarLabel: 'Profile',
            tabBarIcon: ({color, size}) => (
              <Icon name="person" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  iconContainer: {
    width: 24,
    height: 24,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: '#FF5252',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#000',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
});

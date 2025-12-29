import React, {useState} from 'react';
import {View, StyleSheet, StatusBar, ImageBackground} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useTheme} from '../theme/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {MyLeadsScreen} from './MyLeadsScreen';
import {ProfileScreen} from './ProfileScreen';
import {FAB} from '../components/FAB';
import {AnimatedTabBar} from '../components/AnimatedTabBar';

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
      <FAB onPress={() => navigation.navigate('AddNewEnquiry')} icon="add" />
    </View>
  );
};

const LeadsTabContent = ({
  navigation,
}: {
  navigation: any;
}) => {
  return (
    <View style={styles.container}>
      <MyLeadsScreen navigation={navigation} hideHeader={true} />
      <FAB onPress={() => navigation.navigate('AddNewEnquiry')} icon="add" />
    </View>
  );
};

export const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  const {theme, isDark} = useTheme();
  const [activeTab, setActiveTab] = useState<'PastEnquiries' | 'Status' | 'Leads'>('Leads');

  const handleProfilePress = () => {
    navigation.navigate('Profile');
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
            backgroundColor: 'rgba(26, 26, 26, 0.8)',
            borderTopColor: 'rgba(212, 175, 55, 0.3)',
            borderTopWidth: 1,
            paddingBottom: 8,
            paddingTop: 8,
            height: 60,
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
          }}
          listeners={{
            focus: () => {
              setActiveTab('Leads');
            },
          }}>
          {() => (
            <HomeTabContent
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
});

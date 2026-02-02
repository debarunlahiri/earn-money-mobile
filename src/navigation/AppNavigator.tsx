import React from 'react';
import {View, ActivityIndicator} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useAuth} from '../context/AuthContext';
import {useTheme} from '../theme/ThemeContext';
import {LoginScreen} from '../screens/LoginScreen';
import {RegisterScreen} from '../screens/RegisterScreen';
import {OTPVerificationScreen} from '../screens/OTPVerificationScreen';
import {RegisterDetailsScreen} from '../screens/RegisterDetailsScreen';
import {HomeScreen} from '../screens/HomeScreen';
import {EnquiryDetailsScreen} from '../screens/EnquiryDetailsScreen';
import {StatusDetailsScreen} from '../screens/StatusDetailsScreen';
import {SellBuySelectionScreen} from '../screens/SellBuySelectionScreen';
import {PropertyFormScreen} from '../screens/PropertyFormScreen';
import {AddNewEnquiryScreen} from '../screens/AddNewEnquiryScreen';
import {ProfileScreen} from '../screens/ProfileScreen';
import {SettingsScreen} from '../screens/SettingsScreen';
import {WalletScreen} from '../screens/WalletScreen';
import {WithdrawMoneyScreen} from '../screens/WithdrawMoneyScreen';
import {TransactionHistoryScreen} from '../screens/TransactionHistoryScreen';
import {MyLeadsScreen} from '../screens/MyLeadsScreen';
import {AllLeadsScreen} from '../screens/AllLeadsScreen';
import {LeadDetailsScreen} from '../screens/LeadDetailsScreen';
import {SupportChatScreen} from '../screens/SupportChatScreen';
import {AboutScreen} from '../screens/AboutScreen';
import {NotificationScreen} from '../screens/NotificationScreen';
import {AdminChatInboxScreen} from '../screens/AdminChatInboxScreen';
import {AdminChatDetailScreen} from '../screens/AdminChatDetailScreen';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const {isAuthenticated, isLoading, userData} = useAuth();
  const {theme} = useTheme();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.colors.background,
        }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Check if profile is incomplete using is_new flag from API
  const isProfileIncomplete = isAuthenticated && userData && userData.is_new === 'yes';

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 250,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}>
        {!isAuthenticated ? (
          // Auth Stack - shown when not logged in
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                contentStyle: {backgroundColor: 'transparent'},
              }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{
                contentStyle: {backgroundColor: 'transparent'},
              }}
            />
            <Stack.Screen
              name="OTPVerification"
              component={OTPVerificationScreen}
            />
            <Stack.Screen
              name="RegisterDetails"
              component={RegisterDetailsScreen}
            />
          </>
        ) : isProfileIncomplete ? (
          // Registration completion stack
          <>
            <Stack.Screen
              name="RegisterDetails"
              component={RegisterDetailsScreen}
            />
            <Stack.Screen name="Home" component={HomeScreen} />
          </>
        ) : (
          // Main App Stack - shown when logged in with complete profile
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="EnquiryDetails" component={EnquiryDetailsScreen} />
            <Stack.Screen name="StatusDetails" component={StatusDetailsScreen} />
            <Stack.Screen
              name="SellBuySelection"
              component={SellBuySelectionScreen}
            />
            <Stack.Screen name="PropertyForm" component={PropertyFormScreen} />
            <Stack.Screen name="AddNewEnquiry" component={AddNewEnquiryScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Wallet" component={WalletScreen} />
            <Stack.Screen name="WithdrawMoney" component={WithdrawMoneyScreen} />
            <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
            <Stack.Screen name="MyLeads" component={MyLeadsScreen} />
            <Stack.Screen name="AllLeads" component={AllLeadsScreen} />
            <Stack.Screen name="LeadDetails" component={LeadDetailsScreen} />
            <Stack.Screen name="SupportChat" component={SupportChatScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
            <Stack.Screen name="Notifications" component={NotificationScreen} />
            <Stack.Screen name="AdminChatInbox" component={AdminChatInboxScreen} />
            <Stack.Screen name="AdminChatDetail" component={AdminChatDetailScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

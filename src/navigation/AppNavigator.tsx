import React, {useMemo} from 'react';
import {View, ActivityIndicator, Platform} from 'react-native';
import {
  NavigationContainer,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
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
import {EditProfileScreen} from '../screens/EditProfileScreen';
import {SettingsScreen} from '../screens/SettingsScreen';
import {WalletScreen} from '../screens/WalletScreen';
import {WithdrawMoneyScreen} from '../screens/WithdrawMoneyScreen';
import {TransactionHistoryScreen} from '../screens/TransactionHistoryScreen';
import {MyLeadsScreen} from '../screens/MyLeadsScreen';
import {AllLeadsScreen} from '../screens/AllLeadsScreen';
import {LeadDetailsScreen} from '../screens/LeadDetailsScreen';
import {ForwardLeadScreen} from '../screens/ForwardLeadScreen';
import {ForwardLeadDetailsScreen} from '../screens/ForwardLeadDetailsScreen';
import {SupportChatScreen} from '../screens/SupportChatScreen';
import {AboutScreen} from '../screens/AboutScreen';
import {NotificationScreen} from '../screens/NotificationScreen';
import {AdminChatInboxScreen} from '../screens/AdminChatInboxScreen';
import {AdminChatDetailScreen} from '../screens/AdminChatDetailScreen';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const {isAuthenticated, isLoading, userData} = useAuth();
  const {theme} = useTheme();
  const navigationTheme = useMemo(
    () => ({
      ...NavigationDefaultTheme,
      dark: true,
      colors: {
        ...NavigationDefaultTheme.colors,
        primary: theme.colors.primary,
        background: theme.colors.background,
        card: theme.colors.background,
        text: theme.colors.text,
        border: theme.colors.border,
        notification: theme.colors.primary,
      },
    }),
    [theme.colors.background, theme.colors.border, theme.colors.primary, theme.colors.text],
  );

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
  
  console.log('[Navigator] isAuthenticated:', isAuthenticated, '| is_new:', userData?.is_new, '| isProfileIncomplete:', isProfileIncomplete);

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: Platform.OS === 'android' ? 'none' : 'slide_from_right',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          freezeOnBlur: true,
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
        }}>
        {!isAuthenticated ? (
          // Auth Stack - shown when not logged in
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
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
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Wallet" component={WalletScreen} />
            <Stack.Screen name="WithdrawMoney" component={WithdrawMoneyScreen} />
            <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
            <Stack.Screen name="MyLeads" component={MyLeadsScreen} />
            <Stack.Screen name="AllLeads" component={AllLeadsScreen} />
            <Stack.Screen name="LeadDetails" component={LeadDetailsScreen} />
            <Stack.Screen name="ForwardLead" component={ForwardLeadScreen} />
            <Stack.Screen name="ForwardLeadDetails" component={ForwardLeadDetailsScreen} />
            <Stack.Screen name="SupportChat" component={SupportChatScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
            <Stack.Screen name="Notifications" component={NotificationScreen} />
            <Stack.Screen name="AdminChatInbox" component={AdminChatInboxScreen} />
            <Stack.Screen name="AdminChatDetail" component={AdminChatDetailScreen} />
            <Stack.Screen name="RegisterDetails" component={RegisterDetailsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
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

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}>
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
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="EnquiryDetails" component={EnquiryDetailsScreen} />
        <Stack.Screen name="StatusDetails" component={StatusDetailsScreen} />
        <Stack.Screen
          name="SellBuySelection"
          component={SellBuySelectionScreen}
        />
        <Stack.Screen name="PropertyForm" component={PropertyFormScreen} />
        <Stack.Screen name="AddNewEnquiry" component={AddNewEnquiryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

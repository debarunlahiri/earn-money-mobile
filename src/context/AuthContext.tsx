import React, {createContext, useContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {UserData, getProfile} from '../services/api';
import {subscribeToLogoutRequired} from '../utils/authEventEmitter';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userData: UserData | null;
  login: (userData?: UserData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    checkAuthState();
  }, []);

  // Subscribe to logout events (401 errors from API)
  // Note: The custom dialog is shown by SessionExpiredHandler component
  useEffect(() => {
    const unsubscribe = subscribeToLogoutRequired(async (data) => {
      console.log('Received logout required event:', data.message);
      
      // Clear auth state - dialog is shown by SessionExpiredHandler
      try {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('userData');
        setIsAuthenticated(false);
        setUserData(null);
      } catch (error) {
        console.error('Error during forced logout:', error);
      }
    });

    return unsubscribe;
  }, []);

  const checkAuthState = async () => {
    try {
      const authToken = await AsyncStorage.getItem('authToken');
      const storedUserData = await AsyncStorage.getItem('userData');
      
      if (authToken && storedUserData) {
        const parsedUserData = JSON.parse(storedUserData);
        setIsAuthenticated(true);
        
        // Fetch fresh profile data from API to get latest username
        try {
          const response = await getProfile(parsedUserData.userid, parsedUserData.token);
          
          if (response.status === 'success' && response.userdata) {
            // Update stored user data with fresh profile info
            const updatedUserData = {
              ...parsedUserData,
              username: response.userdata.username,
            };
            await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
            setUserData(updatedUserData);
          } else {
            setUserData(parsedUserData);
          }
        } catch (profileError) {
          console.log('Could not fetch fresh profile, using stored data');
          setUserData(parsedUserData);
        }
      } else {
        setIsAuthenticated(false);
        setUserData(null);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      setIsAuthenticated(false);
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userDataParam?: UserData) => {
    try {
      await AsyncStorage.setItem('authToken', 'authenticated');
      if (userDataParam) {
        await AsyncStorage.setItem('userData', JSON.stringify(userDataParam));
        setUserData(userDataParam);
      }
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error saving auth state:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      setIsAuthenticated(false);
      setUserData(null);
    } catch (error) {
      console.error('Error clearing auth state:', error);
    }
  };

  return (
    <AuthContext.Provider value={{isAuthenticated, isLoading, userData, login, logout}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

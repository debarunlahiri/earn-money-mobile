import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import {getLogo} from '../services/api';
import {useAuth} from './AuthContext';

interface LogoContextType {
  logoUrl: string | null;
  isLoading: boolean;
  error: string | null;
  refreshLogo: () => Promise<void>;
}

const LogoContext = createContext<LogoContextType | undefined>(undefined);

export const useLogo = () => {
  const context = useContext(LogoContext);
  if (!context) {
    throw new Error('useLogo must be used within a LogoProvider');
  }
  return context;
};

interface LogoProviderProps {
  children: ReactNode;
}

export const LogoProvider: React.FC<LogoProviderProps> = ({children}) => {
  const {userData} = useAuth();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogo = async () => {
    if (!userData?.userid || !userData?.token) {
      console.log('No user data available for logo fetch');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getLogo(userData.userid, userData.token);
      
      if (response.status === 'success' && response.logo) {
        setLogoUrl(response.logo);
        console.log('Logo loaded successfully:', response.logo);
      } else {
        setError('Failed to load logo');
        console.log('Logo API returned:', response);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching logo:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshLogo = async () => {
    await fetchLogo();
  };

  useEffect(() => {
    if (userData?.userid && userData?.token) {
      fetchLogo();
    }
  }, [userData?.userid, userData?.token]);

  const value: LogoContextType = {
    logoUrl,
    isLoading,
    error,
    refreshLogo,
  };

  return <LogoContext.Provider value={value}>{children}</LogoContext.Provider>;
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { setAuthToken } from '../../../../services/api';
import { AuthRepository } from '../../infrastructure/AuthRepository';

// Create a single instance of AuthRepository
const authRepository = new AuthRepository();

interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

interface AuthContextType {
  accessToken: string | null;
  refreshToken: string | null;
  login: (data: AuthTokens) => void;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Read auth object from localStorage once
  const initialAuth = JSON.parse(localStorage.getItem('auth') || '{}');
  
  const [accessToken, setAccessToken] = useState<string | null>(initialAuth.accessToken || null);
  const [refreshToken, setRefreshToken] = useState<string | null>(initialAuth.refreshToken || null);

  useEffect(() => {
    // Store both tokens together in auth object
    const auth = { accessToken, refreshToken };
    if (accessToken && refreshToken) {
      localStorage.setItem('auth', JSON.stringify(auth));
      setAuthToken(accessToken);
    } else {
      localStorage.removeItem('auth');
      setAuthToken(null);
    }
  }, [accessToken, refreshToken]);

  const login = (data: AuthTokens) => {
    setAccessToken(data.access_token);
    setRefreshToken(data.refresh_token);
  };

  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
  };

  const refreshAccessToken = async () => {
    if (!refreshToken) {
      logout();
      throw new Error('No refresh token available');
    }

    try {
      const response = await authRepository.refreshToken(refreshToken);
      setAccessToken(response.access_token);
      // Some APIs also return a new refresh token
      if (response.refresh_token) {
        setRefreshToken(response.refresh_token);
      }
    } catch (error) {
      logout();
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ accessToken, refreshToken, login, logout, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 
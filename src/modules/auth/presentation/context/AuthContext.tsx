import React, { createContext, useContext, useState, useEffect } from 'react';
import { setAuthToken } from '../../../../services/api';

interface AuthContextType {
  accessToken: string | null;
  login: (data: { access_token: string }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return localStorage.getItem('accessToken');
  });

  // Set token in axios and localStorage when it changes
  useEffect(() => {
    if (accessToken) {
      setAuthToken(accessToken);
      localStorage.setItem('accessToken', accessToken);
    } else {
      setAuthToken(null);
      localStorage.removeItem('accessToken');
    }
  }, [accessToken]);

  const login = (data: { access_token: string }) => {
    setAccessToken(data.access_token);
  };

  const logout = () => {
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider value={{ accessToken, login, logout }}>
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
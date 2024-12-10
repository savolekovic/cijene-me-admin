import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setAuthToken } from '../../../../services/api';

interface AuthContextType {
  accessToken: string | null;
  refreshToken: string | null;
  login: (tokens: { access_token: string; refresh_token: string }) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem('accessToken')
  );
  const [refreshToken, setRefreshToken] = useState<string | null>(
    localStorage.getItem('refreshToken')
  );
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('accessToken'));
  const navigate = useNavigate();

  useEffect(() => {
    if (accessToken) {
      setAuthToken(accessToken);
      setIsAuthenticated(true);
    } else {
      setAuthToken(null);
      setIsAuthenticated(false);
    }
  }, [accessToken]);

  const login = (tokens: { access_token: string; refresh_token: string }) => {
    localStorage.setItem('accessToken', tokens.access_token);
    localStorage.setItem('refreshToken', tokens.refresh_token);
    setAccessToken(tokens.access_token);
    setRefreshToken(tokens.refresh_token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setAccessToken(null);
    setRefreshToken(null);
    setIsAuthenticated(false);
    setAuthToken(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ 
      accessToken, 
      refreshToken, 
      login, 
      logout,
      isAuthenticated 
    }}>
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
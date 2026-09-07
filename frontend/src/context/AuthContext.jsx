import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getAuthToken, setAuthToken, getStoredAdminUser, setStoredAdminUser } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(getAuthToken());
  const [adminUser, setAdminUserState] = useState(getStoredAdminUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyAuth() {
      const currentToken = getAuthToken();
      if (currentToken) {
        try {
          const profile = await api.get('/auth/me');
          setAdminUserState(profile);
          setStoredAdminUser(profile);
        } catch (err) {
          // Token expired or invalid
          setAuthToken(null);
          setStoredAdminUser(null);
          setTokenState(null);
          setAdminUserState(null);
        }
      }
      setLoading(false);
    }

    verifyAuth();

    const handleUnauthorized = () => {
      setTokenState(null);
      setAdminUserState(null);
    };

    window.addEventListener('hgs-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('hgs-unauthorized', handleUnauthorized);
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    setAuthToken(res.token);
    const user = {
      username: res.username,
      fullName: res.fullName,
      email: res.email,
    };
    setStoredAdminUser(user);
    setTokenState(res.token);
    setAdminUserState(user);
    return res;
  };

  const logout = () => {
    setAuthToken(null);
    setStoredAdminUser(null);
    setTokenState(null);
    setAdminUserState(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        adminUser,
        isAuthenticated: !!token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

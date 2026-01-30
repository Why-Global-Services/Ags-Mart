// AuthContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('Token') || null);
  const [permissions, setPermissions] = useState(
    JSON.parse(localStorage.getItem('UserPermissions')) || null
  );
  const navigate = useNavigate();

  // Check token expiration on app load and periodically
  useEffect(() => {
    const checkTokenExpiration = () => {
      if (token) {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now()) {
            logout();
          }
        } catch (error) {
          console.error('Token decode error:', error);
          logout();
        }
      }
    };

    checkTokenExpiration();
    const interval = setInterval(checkTokenExpiration, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [token]);

  const login = (token, userData, userPermissions) => {
    localStorage.setItem('Token', token);
    localStorage.setItem('UserPermissions', JSON.stringify(userPermissions));
    setToken(token);
    setUser(userData);
    setPermissions(userPermissions);
  };

  const logout = () => {
    localStorage.removeItem('Token');
    localStorage.removeItem('UserPermissions');
    setToken(null);
    setUser(null);
    setPermissions(null);
    navigate('/login');
  };

  const isAuthenticated = () => {
    return !!token;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        permissions,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
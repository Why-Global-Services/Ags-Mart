// AuthContext.js
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { setAuthFailureHandler } from '../Interceptor/interceptor';

export const isTokenValid = (rawToken) => {
  if (!rawToken || typeof rawToken !== 'string') return false;
  try {
    const decoded = jwtDecode(rawToken);
    if (!decoded || typeof decoded.exp !== 'number') return false;
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem('Token');
    if (isTokenValid(stored)) {
      return stored;
    }
    if (stored) {
      localStorage.removeItem('Token');
      localStorage.removeItem('UserPermissions');
    }
    return null;
  });

  const [permissions, setPermissions] = useState(() => {
    const storedToken = localStorage.getItem('Token');
    if (!isTokenValid(storedToken)) return null;
    try {
      return JSON.parse(localStorage.getItem('UserPermissions')) || null;
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState(() => {
    const storedToken = localStorage.getItem('Token');
    if (!isTokenValid(storedToken)) return null;
    try {
      const decoded = jwtDecode(storedToken);
      return decoded || null;
    } catch {
      return null;
    }
  });

  const logout = useCallback(() => {
    localStorage.removeItem('Token');
    localStorage.removeItem('UserPermissions');
    setToken(null);
    setUser(null);
    setPermissions(null);
    if (window.location.pathname !== '/') {
      navigate('/');
    }
  }, [navigate]);

  // Connect interceptor auth failure to this context's logout
  useEffect(() => {
    setAuthFailureHandler(() => {
      logout();
    });
    return () => {
      setAuthFailureHandler(null);
    };
  }, [logout]);

  // Check token expiration periodically
  useEffect(() => {
    const checkTokenExpiration = () => {
      if (token && !isTokenValid(token)) {
        logout();
      }
    };

    checkTokenExpiration();
    const interval = setInterval(checkTokenExpiration, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [token, logout]);

  const login = (newToken, userData, userPermissions) => {
    localStorage.setItem('Token', newToken);
    if (userPermissions) {
      localStorage.setItem('UserPermissions', JSON.stringify(userPermissions));
    }
    setToken(newToken);
    setUser(userData || (newToken ? jwtDecode(newToken) : null));
    setPermissions(userPermissions || null);
  };

  const isAuthenticated = useCallback(() => {
    return isTokenValid(token);
  }, [token]);

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
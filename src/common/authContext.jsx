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
      const storedAdmin = localStorage.getItem('AdminData');
      if (storedAdmin) {
        const parsed = JSON.parse(storedAdmin);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
      const decoded = jwtDecode(storedToken);
      return decoded || null;
    } catch {
      return null;
    }
  });

  const logout = useCallback(() => {
    const authKeys = [
      'Token',
      'UserPermissions',
      'AdminData',
      'User',
      'Admin',
      'UserData',
      'adminData',
      'userName',
      'username',
      'name',
      'email',
    ];
    authKeys.forEach((k) => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });
    setToken(null);
    setUser(null);
    setPermissions(null);
    if (window.location.pathname !== '/') {
      navigate('/', { replace: true });
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

  // Sync auth state across browser tabs/windows
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'Token') {
        if (!e.newValue || !isTokenValid(e.newValue)) {
          logout();
        } else if (e.newValue !== token && isTokenValid(e.newValue)) {
          setToken(e.newValue);
          try {
            const storedAdmin = localStorage.getItem('AdminData');
            if (storedAdmin) {
              setUser(JSON.parse(storedAdmin));
            } else {
              setUser(jwtDecode(e.newValue));
            }
          } catch {
            setUser(null);
          }
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [token, logout]);

  // Check token expiration periodically
  useEffect(() => {
    const checkTokenExpiration = () => {
      const stored = localStorage.getItem('Token');
      if (stored && !isTokenValid(stored)) {
        logout();
      } else if (!stored && token) {
        logout();
      }
    };

    checkTokenExpiration();
    const interval = setInterval(checkTokenExpiration, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [token, logout]);

  const login = (newToken, userData, userPermissions) => {
    const authKeys = [
      'Token',
      'UserPermissions',
      'AdminData',
      'User',
      'Admin',
      'UserData',
      'adminData',
      'userName',
      'username',
      'name',
      'email',
    ];
    authKeys.forEach((k) => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });

    localStorage.setItem('Token', newToken);
    if (userPermissions) {
      localStorage.setItem('UserPermissions', JSON.stringify(userPermissions));
    }
    if (userData && typeof userData === 'object') {
      localStorage.setItem('AdminData', JSON.stringify(userData));
      if (
        userData.userName &&
        typeof userData.userName === 'string' &&
        userData.userName.toLowerCase() !== 'oneup'
      ) {
        localStorage.setItem('userName', userData.userName);
      }
    }
    setToken(newToken);
    setUser(userData || (newToken ? jwtDecode(newToken) : null));
    setPermissions(userPermissions || null);
  };

  const isAuthenticated = useCallback(() => {
    const stored = localStorage.getItem('Token');
    if (!stored || !isTokenValid(stored)) return false;
    if (!token || !isTokenValid(token)) return false;
    return true;
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
        loading: false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
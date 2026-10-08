'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { showToast } from '../app/utils/toast';
import { resetSessionExpiryGuard } from '../app/interceptor/interseptor';

const AuthContext = createContext();

// Helper to check if a JWT token is expired (exp in seconds vs Date.now() in ms)
const isTokenValid = (token) => {
  if (!token || typeof token !== 'string') return false;
  try {
    const decoded = jwtDecode(token);
    if (!decoded || typeof decoded.exp !== 'number') return false;
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const expiryTimerRef = useRef(null);
  const lastNotificationRef = useRef(0);

  // Clear any existing token expiry timer
  const clearExpiryTimer = useCallback(() => {
    if (expiryTimerRef.current) {
      clearTimeout(expiryTimerRef.current);
      expiryTimerRef.current = null;
    }
  }, []);

  // Show debounced session-expired toast
  const notifySessionExpired = useCallback(() => {
    const now = Date.now();
    if (now - lastNotificationRef.current > 3000) {
      lastNotificationRef.current = now;
      showToast.error("Your session has expired. Please login again.");
    }
  }, []);

  // Central session expiry handler (preserves guest cart/wishlist)
  const handleSessionExpired = useCallback(({ showNotification = true } = {}) => {
    clearExpiryTimer();

    if (typeof window !== 'undefined') {
      // Preserve current URL (including search params) for redirect after login
      const currentPath = window.location.pathname + window.location.search;
      if (!localStorage.getItem('redirectAfterLogin') && currentPath) {
        localStorage.setItem('redirectAfterLogin', currentPath);
      }

      // Remove token and user only — do NOT remove guest cart/wishlist
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }

    setUser(null);
    setToken(null);

    if (showNotification) {
      notifySessionExpired();
    }

    // Open login modal UI
    setIsAuthModalOpen(true);
  }, [clearExpiryTimer, notifySessionExpired]);

  // Schedule setTimeout to fire automatic logout at EXACT JWT expiration
  const scheduleExpiryTimer = useCallback((jwtToken) => {
    clearExpiryTimer();
    if (!jwtToken) return;

    try {
      const decoded = jwtDecode(jwtToken);
      if (!decoded || typeof decoded.exp !== 'number') return;

      const expiresAt = decoded.exp * 1000;
      const remainingTime = expiresAt - Date.now();

      if (remainingTime <= 0) {
        // Token has already expired
        handleSessionExpired({ showNotification: true });
      } else {
        // Automatically logout at the exact expiry timestamp
        expiryTimerRef.current = setTimeout(() => {
          handleSessionExpired({ showNotification: true });
        }, remainingTime);
      }
    } catch (error) {
      console.error("Failed to decode token for expiry timer:", error);
      handleSessionExpired({ showNotification: true });
    }
  }, [clearExpiryTimer, handleSessionExpired]);

  // Initial token verification on app mount
  useEffect(() => {
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      if (!isTokenValid(savedToken)) {
        // Expired token on startup: clean up immediately, do NOT allow active session
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
      } else {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setToken(savedToken);
          scheduleExpiryTimer(savedToken);
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setToken(null);
        }
      }
    } else {
      if (savedToken && !savedUser) localStorage.removeItem('token');
      if (!savedToken && savedUser) localStorage.removeItem('user');
      setUser(null);
      setToken(null);
    }

    setLoading(false);
  }, [scheduleExpiryTimer]);

  // Listen for global "auth:session-expired" event dispatched by Axios interceptor
  useEffect(() => {
    const onSessionExpired = () => {
      handleSessionExpired({ showNotification: true });
    };

    window.addEventListener('auth:session-expired', onSessionExpired);
    return () => {
      window.removeEventListener('auth:session-expired', onSessionExpired);
    };
  }, [handleSessionExpired]);

  // Multi-tab synchronization via browser storage event
  useEffect(() => {
    const onStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (!storedToken || !storedUser || !isTokenValid(storedToken)) {
          clearExpiryTimer();
          setUser(null);
          setToken(null);
        } else {
          try {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            setToken(storedToken);
            scheduleExpiryTimer(storedToken);
          } catch {
            // ignore JSON parse error
          }
        }
      }
    };

    window.addEventListener('storage', onStorageChange);
    return () => {
      window.removeEventListener('storage', onStorageChange);
    };
  }, [clearExpiryTimer, scheduleExpiryTimer]);

  // Cleanup expiry timer on unmount
  useEffect(() => {
    return () => {
      clearExpiryTimer();
    };
  }, [clearExpiryTimer]);

  // Normal login method (supports login(userData) and login(userData, token))
  const login = (userData, tokenData) => {
    const activeToken = tokenData || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
    setUser(userData);
    setToken(activeToken);

    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(userData));
      if (tokenData) {
        localStorage.setItem('token', tokenData);
      }
    }

    setIsAuthModalOpen(false);
    resetSessionExpiryGuard();

    if (activeToken) {
      scheduleExpiryTimer(activeToken);
    }
  };

  // Normal manual user logout
  const logout = () => {
    clearExpiryTimer();
    setUser(null);
    setToken(null);
    setIsAuthModalOpen(false);
    resetSessionExpiryGuard();

    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('cart');
      localStorage.removeItem('wishlist');
    }
  };

  const openLoginModal = () => setIsAuthModalOpen(true);
  const closeLoginModal = () => setIsAuthModalOpen(false);

  // Both user AND a non-expired token are strictly required for logged-in status
  const isLoggedIn = Boolean(user && token && isTokenValid(token));

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        loading,
        isLoggedIn,
        isAuthModalOpen,
        openLoginModal,
        closeLoginModal,
        handleSessionExpired,
      }}
    >
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
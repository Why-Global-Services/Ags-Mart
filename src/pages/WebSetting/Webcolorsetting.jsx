import { useEffect, useState } from 'react';
import { getWebSettings } from '../../Interceptor/interceptor';
import LoadingSpinner from '../../common/LoadingSpinner';

// Normalize hex color (e.g., convert #FF8 to #FF8800)
const normalizeHexColor = (color) => {
  if (!color || !color.startsWith('#')) return color;
  const hex = color.replace('#', '');
  if (hex.length === 3) {
    return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
  }
  return color;
};

const defaultSettings = {
  colors: {
    primary: '#FF5733',
    secondary: '#C70039',
    tertiary: '#FF8096', // Added default tertiary color
    bodycolor: '#ff8096',
  },
  fontFamily: 'Poppins',
  darkMode: false,
  radius: '8px',
};

// Minimum delay in milliseconds (e.g., 1000ms = 1 second)
const MINIMUM_LOADING_DELAY = 1000;

const AdminColorProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [error, setError] = useState(null);
  const [startTime, setStartTime] = useState(null);

  const fetchAdminSettings = async () => {
    const fetchStartTime = Date.now();
    setStartTime(fetchStartTime);
    setIsLoading(true);
    setError(null);

    try {
      const response = await getWebSettings();
      const adminSettings = response.data.AdminSettings[0];

      // Calculate how long the fetch took
      const fetchDuration = Date.now() - fetchStartTime;
      // Calculate remaining time to reach MINIMUM_LOADING_DELAY
      const remainingDelay = Math.max(0, MINIMUM_LOADING_DELAY - fetchDuration);

      // Wait for the remaining delay time if needed
      await new Promise(resolve => setTimeout(resolve, remainingDelay));

      setSettings({
        colors: {
          primary: normalizeHexColor(adminSettings.ColorScheme.primary) || defaultSettings.colors.primary,
          secondary: normalizeHexColor(adminSettings.ColorScheme.secondary) || defaultSettings.colors.secondary,
          tertiary: normalizeHexColor(adminSettings.ColorScheme.tertiary) || defaultSettings.colors.tertiary,
          bodycolor: normalizeHexColor(adminSettings.ColorScheme.bodycolor) || defaultSettings.colors.bodycolor,
        },
        fontFamily: adminSettings.fontFamily || defaultSettings.fontFamily,
        darkMode: adminSettings.darkMode ?? defaultSettings.darkMode,
        radius: adminSettings.radius || defaultSettings.radius,
      });
    } catch (error) {
      console.error('Failed to fetch admin settings:', error);
      setError(error.message || 'Failed to fetch admin settings');
      setSettings(defaultSettings);

      // Ensure minimum loading time even for errors
      const fetchDuration = Date.now() - fetchStartTime;
      const remainingDelay = Math.max(0, MINIMUM_LOADING_DELAY - fetchDuration);
      await new Promise(resolve => setTimeout(resolve, remainingDelay));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminSettings();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const root = document.documentElement;
      root.style.setProperty('--color-primary', settings.colors.primary);
      root.style.setProperty('--color-secondary', settings.colors.secondary);
      root.style.setProperty('--color-table', settings.colors.tertiary);
      root.style.setProperty('--color-bodycolor', settings.colors.bodycolor);
      root.style.setProperty('--font-family', settings.fontFamily);
      root.style.setProperty('--border-radius', settings.radius);
      if (settings.darkMode) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [settings, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Admin settings error:', error);
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-lg font-[var(--font-family)] text-red-600">
          Error loading settings: {error}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminColorProvider;
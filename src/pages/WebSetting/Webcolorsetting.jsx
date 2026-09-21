import { useEffect, useState } from 'react';
import { getWebSettings } from '../../Interceptor/interceptor';

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
    tertiary: '#FF8096',
    bodycolor: '#ff8096',
  },
  fontFamily: 'Poppins',
  darkMode: false,
  radius: '8px',
};

const applyRootStyles = (settings) => {
  if (typeof document === 'undefined') return;
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
};

const AdminColorProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);

  // Apply default styles immediately so UI is styled and non-blocking
  useEffect(() => {
    applyRootStyles(defaultSettings);
  }, []);

  useEffect(() => {
    const fetchAdminSettings = async () => {
      try {
        const response = await getWebSettings();
        const adminSettings = response?.data?.AdminSettings?.[0] || response?.AdminSettings?.[0];

        if (adminSettings) {
          const loadedSettings = {
            colors: {
              primary: normalizeHexColor(adminSettings?.ColorScheme?.primary) || defaultSettings.colors.primary,
              secondary: normalizeHexColor(adminSettings?.ColorScheme?.secondary) || defaultSettings.colors.secondary,
              tertiary: normalizeHexColor(adminSettings?.ColorScheme?.tertiary) || defaultSettings.colors.tertiary,
              bodycolor: normalizeHexColor(adminSettings?.ColorScheme?.bodycolor) || defaultSettings.colors.bodycolor,
            },
            fontFamily: adminSettings?.fontFamily || defaultSettings.fontFamily,
            darkMode: adminSettings?.darkMode ?? defaultSettings.darkMode,
            radius: adminSettings?.radius || defaultSettings.radius,
          };
          setSettings(loadedSettings);
          applyRootStyles(loadedSettings);
        }
      } catch (error) {
        // Non-blocking: silently fallback to default settings on network or API failure
        console.warn('Web settings unavailable, continuing with default theme:', error.message || error);
      }
    };

    fetchAdminSettings();
  }, []);

  return <>{children || null}</>;
};

export default AdminColorProvider;
import { createContext, useContext, useState, useEffect } from 'react';
import { ConfigProvider, theme } from 'antd';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState('light');

  // Define font family once to ensure consistency
  const fontFamily = "'Cairo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

  // Shared tokens for consistency across themes
  const sharedTokens = {
    fontSize: 14,
    sizeStep: 4,
    sizeUnit: 4,
    borderRadius: 6,
    fontFamily: fontFamily, // Add fontFamily to shared tokens
  };

  const lightTheme = {
    token: {
      ...sharedTokens,
      colorPrimary: "#129990",
      colorSuccess: "#17B978",
      colorWarning: "#EFE0CE",
      colorError: "#CF2E2E",
      colorInfo: "#0B5FB0",
      colorLink: "#0B5FB0",
      colorTextBase: "#000000",
      colorBgBase: "#FFFFFF",
      wireframe: true
    },
    algorithm: theme.defaultAlgorithm,
    components: {
      // Component-level overrides
      Typography: {
        fontFamily: fontFamily,
      },
      Button: {
        fontFamily: fontFamily,
      },
      // Add other components as needed
    }
  };

  const darkTheme = {
    token: {
      ...sharedTokens,
      colorPrimary: "#129990",
      colorSuccess: "#50FA7B",
      colorWarning: "#F1FA8C",
      colorError: "#FF5555",
      colorInfo: "#8BE9FD",
      colorLink: "#129990",
      colorTextBase: "#F8F8F2",
      colorBgBase: "#282A36",
      wireframe: false
    },
    algorithm: theme.darkAlgorithm,
    components: {
      // Same component overrides for dark mode
      Typography: {
        fontFamily: fontFamily,
      },
      Button: {
        fontFamily: fontFamily,
      },
      // Add other components as needed
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    const themeTokens = themeMode === 'light' ? lightTheme.token : darkTheme.token;

    // Apply CSS custom properties with fallbacks
    Object.entries(themeTokens).forEach(([key, value]) => {
      const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVarName, value);
    });

    // Set font-family explicitly as a CSS variable
    root.style.setProperty('--font-family', fontFamily);

    // Smooth theme transitions
    root.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    root.setAttribute('data-theme', themeMode);

    document.body.style.backgroundColor = themeTokens.colorBgBase;
    document.body.style.color = themeTokens.colorTextBase;
    document.body.style.fontFamily = fontFamily; // Set font-family directly on body

    localStorage.setItem('theme-preference', themeMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeMode]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme-preference');
    if (savedTheme) {
      setThemeMode(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setThemeMode('dark');
    }
  }, []);

  const toggleTheme = () => {
    setThemeMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const currentTheme = themeMode === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme }}>
      <ConfigProvider theme={currentTheme}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
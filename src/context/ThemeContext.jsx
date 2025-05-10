import { createContext, useContext, useState, useEffect } from 'react';
import { ConfigProvider, theme } from 'antd';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState('light');

  // Shared tokens for consistency across themes
  const sharedTokens = {
    fontSize: 14,
    sizeStep: 4,
    sizeUnit: 4,
    borderRadius: 6,
  };

  const lightTheme = {
    token: {
      ...sharedTokens,
      colorPrimary: "#0B5FB0",
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
  };

  const darkTheme = {
    token: {
      ...sharedTokens,
      colorPrimary: "#BD93F9", // Dracula Purple, vibrant and accessible
      colorSuccess: "#50FA7B", // Dracula Green, bright and clear
      colorWarning: "#F1FA8C", // Dracula Yellow, high contrast
      colorError: "#FF5555", // Dracula Red, bold and noticeable
      colorInfo: "#8BE9FD", // Dracula Cyan, distinct and modern
      colorLink: "#BD93F9", // Matches primary for consistency
      colorTextBase: "#F8F8F2", // Dracula Foreground, near-white for readability
      colorBgBase: "#282A36", // Dracula Background, dark and sleek
      wireframe: false
    },
    algorithm: theme.darkAlgorithm,
  };

  useEffect(() => {
    const root = document.documentElement;
    const themeTokens = themeMode === 'light' ? lightTheme.token : darkTheme.token;

    // Apply CSS custom properties with fallbacks
    Object.entries(themeTokens).forEach(([key, value]) => {
      const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVarName, value);
    });

    // Smooth theme transitions
    root.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    root.setAttribute('data-theme', themeMode);

    document.body.style.backgroundColor = themeTokens.colorBgBase;
    document.body.style.color = themeTokens.colorTextBase;

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
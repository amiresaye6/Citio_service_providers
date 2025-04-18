import { createContext, useContext, useState, useEffect } from 'react';
import { ConfigProvider, theme } from 'antd';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState('light');

  const lightTheme = {
    "token": {
      "colorPrimary": "#0B5FB0",
      "colorSuccess": "#17B978",
      "colorWarning": "#EFE0CE",
      "colorError": "#CF2E2E",
      "colorInfo": "#0B5FB0",
      "colorLink": "#0B5FB0",
      "colorTextBase": "#000000",
      "colorBgBase": "#FFFFFF",
      "fontSize": 14,
      "sizeStep": 4,
      "sizeUnit": 4,
      "borderRadius": 6,
      "wireframe": true
    },
    algorithm: theme.defaultAlgorithm,
  };

  const darkTheme = {

    "token": {
      "colorPrimary": "#2075B2",
      "colorSuccess": "#2DD992",
      "colorWarning": "#D4A017",
      "colorError": "#E54B4B",
      "colorInfo": "#45A5A7",
      "colorLink": "#2075B2",
      "colorTextBase": "#E0E0E0",
      "colorBgBase": "#1D3A3C",
      "fontSize": 14,
      "sizeStep": 4,
      "sizeUnit": 4,
      "borderRadius": 6,
      "wireframe": false
    },

    algorithm: theme.darkAlgorithm,
  };

  useEffect(() => {
    const root = document.documentElement;
    const themeTokens = themeMode === 'light' ? lightTheme.token : darkTheme.token;

    Object.entries(themeTokens).forEach(([key, value]) => {
      const cssVarName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(`--${cssVarName}`, value);
    });

    document.documentElement.setAttribute('data-theme', themeMode);

    document.body.style.backgroundColor = themeMode === 'light'
      ? lightTheme.token.colorBgBase
      : darkTheme.token.colorBgBase;

    document.body.style.color = themeMode === 'light'
      ? lightTheme.token.colorText
      : darkTheme.token.colorText;

    localStorage.setItem('theme-preference', themeMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeMode]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme-preference');
    if (savedTheme) {
      setThemeMode(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
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

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);
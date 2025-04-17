import { createContext, useContext, useState, useEffect } from 'react';
import { ConfigProvider, theme } from 'antd';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState('light');

  const lightTheme = {
    token: {
      colorPrimary: '#2973B2',
      colorText: '#777777',
      colorTextSecondary: '#54595F',
      colorSuccess: '#17B978',
      colorInfo: '#1696E7',
      colorWarning: '#E0B252',
      colorLink: '#333333',
      colorLinkHover: '#242424',
      colorBgBase: '#F2EFE7',
      colorAccent: '#61CE70',
      colorError: '#CF2E2E',
      borderRadius: 4,
    },
    components: {
      Button: {
        colorPrimary: '#2973B2',
        colorPrimaryHover: '#1F5A8E',
        colorBgContainer: '#F2EFE7',
        colorText: '#777777',
      },
      Menu: {
        itemBg: '#F2EFE7',
        itemColor: '#777777',
        itemHoverColor: '#333333',
        itemActiveBg: '#DDE4EA',
        itemSelectedColor: '#2973B2',
      },
      Result: {
        titleColor: '#333333',
        subtitleColor: '#777777',
        iconColor: '#2973B2',
      },
      Card: {
        colorBgContainer: '#F2EFE7',
        colorText: '#777777',
        colorBorder: '#DDE4EA',
      },
      Layout: {
        colorBgBody: '#F5F5F5',
        colorBgHeader: '#F2EFE7',
        colorBgSider: '#F2EFE7',
        colorBgContent: '#F2EFE7',
        colorText: '#777777',
      },
      Typography: {
        colorText: '#777777',
        colorLink: '#2973B2',
        colorLinkHover: '#1F5A8E',
      },
      Input: {
        colorBgContainer: '#FFFFFF',
        colorText: '#333333',
        colorBorder: '#DDE4EA',
        colorPrimary: '#2973B2',
      },
      Select: {
        colorBgContainer: '#FFFFFF',
        colorText: '#333333',
        colorBorder: '#DDE4EA',
        colorPrimary: '#2973B2',
      },
      Checkbox: {
        colorBgContainer: '#F2EFE7',
        colorText: '#777777',
        colorBorder: '#DDE4EA',
        colorPrimary: '#2973B2',
      },
      Radio: {
        colorBgContainer: '#F2EFE7',
        colorText: '#777777',
        colorBorder: '#DDE4EA',
        colorPrimary: '#2973B2',
      },
      Switch: {
        colorBgContainer: '#F2EFE7',
        colorText: '#777777',
        colorPrimary: '#2973B2',
        colorCheckedBg: '#17B978',
      },
      Table: {
        colorBgContainer: '#F2EFE7',
        colorText: '#777777',
        colorBorder: '#DDE4EA',
        headerColor: '#54595F',
      },
      Badge: {
        colorBgContainer: '#F2EFE7',
        colorText: '#777777',
        colorBorder: '#DDE4EA',
        colorPrimary: '#2973B2',
      },
      Tag: {
        colorBgContainer: '#DDE4EA',
        colorText: '#333333',
        colorBorder: '#DDE4EA',
        colorPrimary: '#2973B2',
      },
      Dropdown: {
        colorBgContainer: '#FFFFFF',
        colorText: '#777777',
        colorBorder: '#DDE4EA',
        colorPrimary: '#2973B2',
      },
      Modal: {
        colorBgContainer: '#FFFFFF',
        colorText: '#777777',
        colorBorder: '#DDE4EA',
        colorPrimary: '#2973B2',
      },
      Drawer: {
        colorBgContainer: '#FFFFFF',
        colorText: '#777777',
        colorBorder: '#DDE4EA',
        colorPrimary: '#2973B2',
      },
      Tooltip: {
        colorBgContainer: '#333333',
        colorText: '#FFFFFF',
      },
      Popover: {
        colorBgContainer: '#FFFFFF',
        colorText: '#777777',
        colorBorder: '#DDE4EA',
      },
    },
    algorithm: theme.defaultAlgorithm,
  };

  const darkTheme = {
    token: {
      colorPrimary: '#4A6A77',
      colorText: '#E0E0E0',
      colorTextSecondary: '#8A8F94',
      colorSuccess: '#2DD992',
      colorInfo: '#3AAFFF',
      colorWarning: '#F7C76A',
      colorLink: '#BBBBBB',
      colorLinkHover: '#DDDDDD',
      colorBgBase: '#1F1F1F',
      colorAccent: '#7DE88A',
      colorError: '#E54B4B',
      borderRadius: 4,
    },
    components: {
      Button: {
        colorPrimary: '#4A6A77',
        colorPrimaryHover: '#3A535F',
        colorBgContainer: '#2A2A2A',
        colorText: '#E0E0E0',
      },
      Menu: {
        itemBg: '#1F1F1F',
        itemColor: '#E0E0E0',
        itemHoverColor: '#DDDDDD',
        itemActiveBg: '#2A2A2A',
        itemSelectedColor: '#4A6A77',
      },
      Result: {
        titleColor: '#E0E0E0',
        subtitleColor: '#8A8F94',
        iconColor: '#4A6A77',
      },
      Card: {
        colorBgContainer: '#2A2A2A',
        colorText: '#E0E0E0',
        colorBorder: '#3A3A3A',
      },
      Layout: {
        colorBgBody: '#121212',
        colorBgHeader: '#1F1F1F',
        colorBgSider: '#1F1F1F',
        colorBgContent: '#1F1F1F',
        colorText: '#E0E0E0',
      },
      Typography: {
        colorText: '#E0E0E0',
        colorLink: '#4A6A77',
        colorLinkHover: '#3A535F',
      },
      Input: {
        colorBgContainer: '#2A2A2A',
        colorText: '#E0E0E0',
        colorBorder: '#3A3A3A',
        colorPrimary: '#4A6A77',
      },
      Select: {
        colorBgContainer: '#2A2A2A',
        colorText: '#E0E0E0',
        colorBorder: '#3A3A3A',
        colorPrimary: '#4A6A77',
      },
      Checkbox: {
        colorBgContainer: '#1F1F1F',
        colorText: '#E0E0E0',
        colorBorder: '#3A3A3A',
        colorPrimary: '#4A6A77',
      },
      Radio: {
        colorBgContainer: '#1F1F1F',
        colorText: '#E0E0E0',
        colorBorder: '#3A3A3A',
        colorPrimary: '#4A6A77',
      },
      Switch: {
        colorBgContainer: '#1F1F1F',
        colorText: '#E0E0E0',
        colorPrimary: '#4A6A77',
        colorCheckedBg: '#2DD992',
      },
      Table: {
        colorBgContainer: '#1F1F1F',
        colorText: '#E0E0E0',
        colorBorder: '#3A3A3A',
        headerColor: '#8A8F94',
      },
      Badge: {
        colorBgContainer: '#1F1F1F',
        colorText: '#E0E0E0',
        colorBorder: '#3A3A3A',
        colorPrimary: '#4A6A77',
      },
      Tag: {
        colorBgContainer: '#2A2A2A',
        colorText: '#E0E0E0',
        colorBorder: '#3A3A3A',
        colorPrimary: '#4A6A77',
      },
      Dropdown: {
        colorBgContainer: '#2A2A2A',
        colorText: '#E0E0E0',
        colorBorder: '#3A3A3A',
        colorPrimary: '#4A6A77',
      },
      Modal: {
        colorBgContainer: '#2A2A2A',
        colorText: '#E0E0E0',
        colorBorder: '#3A3A3A',
        colorPrimary: '#4A6A77',
      },
      Drawer: {
        colorBgContainer: '#2A2A2A',
        colorText: '#E0E0E0',
        colorBorder: '#3A3A3A',
        colorPrimary: '#4A6A77',
      },
      Tooltip: {
        colorBgContainer: '#333333',
        colorText: '#FFFFFF',
      },
      Popover: {
        colorBgContainer: '#2A2A2A',
        colorText: '#E0E0E0',
        colorBorder: '#3A3A3A',
      },
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

export const useTheme = () => useContext(ThemeContext);
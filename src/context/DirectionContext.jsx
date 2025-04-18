import { createContext, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfigProvider } from 'antd';

// Create the context
const DirectionContext = createContext();

// Provider component
export function DirectionProvider({ children }) {
    const { i18n } = useTranslation();

    // RTL languages
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    const isRtl = rtlLanguages.includes(i18n.language);
    const direction = isRtl ? 'rtl' : 'ltr';

    useEffect(() => {
        document.dir = direction;
        document.body.setAttribute('dir', direction);
    }, [direction]);

    return (
        <DirectionContext.Provider value={{ direction, isRtl }}>
            <ConfigProvider direction={direction}>
                {children}
            </ConfigProvider>
        </DirectionContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDirection() {
    const context = useContext(DirectionContext);
    if (context === undefined) {
        throw new Error('useDirection must be used within a DirectionProvider');
    }
    return context;
}
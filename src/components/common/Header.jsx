import { Layout, Select, Avatar, Dropdown, Space, Badge, Switch } from 'antd';
import { UserOutlined, BellOutlined, GlobalOutlined, DownOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

const { Header } = Layout;
const { Option } = Select;

const HeaderComponent = () => {
    const { t, i18n } = useTranslation('common');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const { themeMode, toggleTheme } = useTheme();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLanguageChange = (value) => {
        i18n.changeLanguage(value);
    };

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'ar', name: 'العربية' }
    ];

    const userMenuItems = [
        {
            key: '1',
            label: t('header.profile'),
        },
        {
            key: '2',
            label: t('header.settings'),
        },
        {
            key: '3',
            label: t('header.logout'),
        }
    ];

    return (
        <Header
            style={{
                padding: '0 16px',
                boxShadow: '0 1px 4px rgba(0, 0, 0, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: 64,
                position: 'sticky',
                top: 0,
                zIndex: 1000,
            }}
        >
            <div className="logo" style={{ width: isMobile ? 0 : 200, transition: 'width 0.3s' }}>
                {!isMobile && <h2 style={{ margin: 0 }}>{t('header.appName')}</h2>}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Select
                    defaultValue={i18n.language}
                    style={{ width: isMobile ? 80 : 120 }}
                    onChange={handleLanguageChange}
                    suffixIcon={<GlobalOutlined />}
                    aria-label={t('header.selectLanguage')}
                >
                    {languages.map((lang) => (
                        <Option key={lang.code} value={lang.code}>
                            {isMobile ? lang.code.toUpperCase() : lang.name}
                        </Option>
                    ))}
                </Select>

                <Badge count={5} size="small">
                    <BellOutlined style={{ fontSize: '20px', cursor: 'pointer' }} />
                </Badge>

                <Switch
                    checked={themeMode === 'dark'}
                    onChange={toggleTheme}
                    checkedChildren="Dark"
                    unCheckedChildren="Light"
                />

                <Dropdown
                    menu={{ items: userMenuItems }}
                    placement="bottomRight"
                    arrow
                >
                    <a onClick={(e) => e.preventDefault()}>
                        <Space>
                            <Avatar icon={<UserOutlined />} />
                            {!isMobile && <span>{t('header.username')}</span>}
                            <DownOutlined />
                        </Space>
                    </a>
                </Dropdown>
            </div>
        </Header>
    );
};

export default HeaderComponent;
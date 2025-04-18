import { Layout, Select, Avatar, Dropdown, Space, Badge, Switch } from 'antd';
import { UserOutlined, BellOutlined, GlobalOutlined, DownOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useSelector } from 'react-redux';
// import { logout } from '../../redux/slices/authSlice'; // Import logout action from authSlice
import { useNavigate } from 'react-router-dom';

const { Header } = Layout;
const { Option } = Select;

const HeaderComponent = () => {
    const { t, i18n } = useTranslation('common');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const { themeMode, toggleTheme } = useTheme();
    const { user, isAuthenticated } = useSelector((state) => state.auth); // Get user and auth status from Redux
    // const dispatch = useDispatch();
    const navigate = useNavigate();

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
        { code: 'ar', name: 'العربية' },
    ];

    const handleMenuClick = ({ key }) => {
        if (key === '3') { // Logout
            // dispatch(logout());
            navigate('/login'); // Redirect to login page after logout
        } else if (key === '1') {
            navigate('/profile'); // Example: Navigate to profile page
        } else if (key === '2') {
            navigate('/settings'); // Example: Navigate to settings page
        }
    };

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
        },
    ];

    // Display username or fallback to generic label
    const displayName = isAuthenticated && user?.fullName ? user.fullName : t('header.username');

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
                background: themeMode === 'light'
                    ? '#FFFFFF'
                    : '#1D3A3C', // Match ThemeProvider's colorBgBase
            }}
        >
            <div className="logo" style={{ width: isMobile ? 0 : 200, transition: 'width 0.3s' }}>
                {!isMobile && <h2 style={{ margin: 0, color: themeMode === 'light' ? '#000000' : '#E0E0E0' }}>
                    {t('header.appName')}
                </h2>}
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
                    menu={{ items: userMenuItems, onClick: handleMenuClick }}
                    placement="bottomRight"
                    arrow
                    disabled={!isAuthenticated} // Disable dropdown if not authenticated
                >
                    <a onClick={(e) => e.preventDefault()}>
                        <Space>
                            <Avatar icon={<UserOutlined />} />
                            {!isMobile && <span>{displayName}</span>}
                            <DownOutlined />
                        </Space>
                    </a>
                </Dropdown>
            </div>
        </Header>
    );
};

export default HeaderComponent;
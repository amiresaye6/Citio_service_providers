import React from 'react';
import { Layout, Button, Select, Avatar, Dropdown, Space, Badge, Switch } from 'antd';
import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    UserOutlined,
    BellOutlined,
    GlobalOutlined,
    DownOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { theme } from 'antd';

const { Header } = Layout;
const { Option } = Select;

const HeaderComponent = ({ collapsed, toggleCollapsed, isMobile }) => {
    const { t, i18n } = useTranslation('common');
    const { themeMode, toggleTheme } = useTheme();
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const { token } = theme.useToken();

    const handleLanguageChange = (value) => {
        i18n.changeLanguage(value);
    };

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'ar', name: 'العربية' },
    ];

    const handleMenuClick = ({ key }) => {
        if (key === '3') {
            navigate('/login');
        } else if (key === '1') {
            navigate('/profile');
        } else if (key === '2') {
            navigate('/settings');
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

    const displayName = isAuthenticated && user?.fullName ? user.fullName : t('header.username');

    return (
        <Header style={{
            padding: 0,
            background: token.colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Button
                    type="text"
                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={toggleCollapsed}
                    style={{ fontSize: '16px', width: 64, height: 64 }}
                />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginRight: '20px' }}>
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
                    disabled={!isAuthenticated}
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
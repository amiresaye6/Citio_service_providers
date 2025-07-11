import React, { useEffect, useState } from 'react';
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
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { theme } from 'antd';
import { logout } from '../../redux/slices/authSlice';
import { jwtDecode } from 'jwt-decode';

const { Header } = Layout;
const { Option } = Select;

const HeaderComponent = ({ collapsed, toggleCollapsed, isMobile }) => {
    const { t, i18n } = useTranslation('common');
    const { themeMode, toggleTheme } = useTheme();
    const { isAuthenticated } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { token: antdToken } = theme.useToken();
    const [userName, setUserName] = useState(t('header.username'));

    useEffect(() => {
        if (isAuthenticated) {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const decodedToken = jwtDecode(token);
                    const name = decodedToken.given_name || t('header.username');
                    setUserName(name);
                }
            } catch (error) {
                console.error("Error decoding token:", error);
                setUserName(t('header.username'));
            }
        } else {
            setUserName(t('header.username'));
        }
    }, [isAuthenticated, t]);

    const handleLanguageChange = (value) => {
        i18n.changeLanguage(value);
    };

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'ar', name: 'العربية' },
    ];

    const handleMenuClick = ({ key }) => {
        if (key === '3') {
            dispatch(logout());
            navigate('/login');
        } else if (key === '2') {
            navigate('/settings');
        }
    };

    const userMenuItems = [
        {
            key: '2',
            label: t('header.settings'),
        },
        {
            key: '3',
            label: t('header.logout'),
        },
    ];

    const displayName = userName;

    return (
        <Header
            className="flex items-center justify-between"
            style={{ background: antdToken.colorBgContainer, padding: '0 0 0 15px' }}
        >
            <div className="flex items-center">
                <Button
                    type="text"
                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={toggleCollapsed}
                    className="text-base w-16 h-16"
                />
            </div>

            <div className="flex items-center gap-4 mr-5">
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
                    <BellOutlined className="text-xl cursor-pointer" />
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
                    <a onClick={(e) => e.preventDefault()} className="flex items-center">
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
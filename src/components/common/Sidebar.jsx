import React from 'react';
import { Layout, Menu, Drawer } from 'antd';
import {
    UserOutlined,
    SettingOutlined,
    DashboardOutlined,
    ShopOutlined,
    BellOutlined,
    StarOutlined,
    PictureOutlined,
    CreditCardOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDirection } from '../../context/DirectionContext';
import { useTheme } from '../../context/ThemeContext';

const { Sider } = Layout;

const SideBar = ({ collapsed, visible = false, onClose = () => { }, isMobile = false }) => {
    const { t } = useTranslation('common');
    const { isRtl } = useDirection();
    const { themeMode } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    // Map routes to menu keys for accurate selectedKeys
    const routeToKey = {
        '/': '1',
        '/store': '2',
        '/notifications': '3',
        '/reviews': '4',
        '/images': '5',
        '/services': '6',
        '/payments': '7',
        '/profile': '8',
    };

    const menuItems = [
        {
            key: '1',
            icon: <DashboardOutlined />,
            label: t('sidebar.dashboard'),
            onClick: () => {
                navigate('/');
                if (isMobile) onClose();
            },
        },
        {
            key: '2',
            icon: <ShopOutlined />,
            label: t('sidebar.store'),
            onClick: () => {
                navigate('/store');
                if (isMobile) onClose();
            },
        },
        {
            key: '3',
            icon: <BellOutlined />,
            label: t('sidebar.notifications'),
            onClick: () => {
                navigate('/notifications');
                if (isMobile) onClose();
            },
        },
        {
            key: '4',
            icon: <StarOutlined />,
            label: t('sidebar.reviews'),
            onClick: () => {
                navigate('/reviews');
                if (isMobile) onClose();
            },
        },
        {
            key: '5',
            icon: <PictureOutlined />,
            label: t('sidebar.images'),
            onClick: () => {
                navigate('/images');
                if (isMobile) onClose();
            },
        },
        {
            key: '6',
            icon: <SettingOutlined />,
            label: t('sidebar.services'),
            onClick: () => {
                navigate('/services');
                if (isMobile) onClose();
            },
        },
        {
            key: '7',
            icon: <CreditCardOutlined />,
            label: t('sidebar.payments'),
            onClick: () => {
                navigate('/payments');
                if (isMobile) onClose();
            },
        },
        {
            key: '8',
            icon: <UserOutlined />,
            label: t('sidebar.profile'),
            onClick: () => {
                navigate('/profile');
                if (isMobile) onClose();
            },
        },
    ];

    const menuContent = (
        <>
            <div className="demo-logo-vertical" style={{
                height: 64,
                // margin: '16px 16px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                // justifyContent: collapsed && !isMobile ? 'center' : isRtl ? 'flex-end' : 'flex-start',
            }}>
                <img
                    src="/citio.svg"
                    alt={t('sidebar.logoAlt')}
                    style={{
                        maxWidth: collapsed && !isMobile ? '60px' : '150px',
                        maxHeight: '100px',
                        objectFit: 'contain',
                        transition: 'max-width 0.3s',
                    }}
                />
            </div>
            <Menu
                theme={themeMode === 'light' ? 'light' : 'dark'}
                mode="inline"
                selectedKeys={[routeToKey[location.pathname] || '1']}
                items={menuItems}
            />
        </>
    );

    return isMobile ? (
        <Drawer
            title={
                <img
                    src="/citio.svg"
                    alt={t('sidebar.logoAlt')}
                    style={{
                        maxWidth: '100px',
                        maxHeight: '32px',
                        objectFit: 'contain',
                    }}
                />
            }
            onClose={onClose}
            open={visible}
            width={200}
            bodyStyle={{ padding: 0 }}
            placement={isRtl ? 'right' : 'left'}
        >
            {menuContent}
        </Drawer>
    ) : (
        <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            theme={themeMode === 'light' ? 'light' : 'dark'}
            width={200}
        >
            {menuContent}
        </Sider>
    );
};

export default SideBar;
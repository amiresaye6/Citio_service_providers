import React, { useEffect, useState } from 'react';
import { Layout, Menu, Drawer } from 'antd';
import {
    DashboardOutlined,
    TeamOutlined,
    FileDoneOutlined,
    AppstoreOutlined,
    StarOutlined,
    ShoppingCartOutlined,
    UserOutlined,
    CreditCardOutlined,
    IdcardOutlined,
    BookOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDirection } from '../../context/DirectionContext';
import { useTheme } from '../../context/ThemeContext';
import { useSelector } from 'react-redux';
import {jwtDecode} from 'jwt-decode';

const { Sider } = Layout;

const SideBar = ({ collapsed, visible = false, onClose = () => { }, isMobile = false }) => {
    const { t } = useTranslation('common');
    const { isRtl } = useDirection();
    const { themeMode } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useSelector((state) => state.auth);
    const [userRoles, setUserRoles] = useState([]);

    useEffect(() => {
        if (isAuthenticated) {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const decodedToken = jwtDecode(token);
                    const roles = decodedToken.roles || [];
                    setUserRoles(roles);
                }
            } catch (error) {
                console.error("Error decoding token:", error);
                setUserRoles([]);
            }
        } else {
            setUserRoles([]);
        }
    }, [isAuthenticated]);

    const routeToKey = {
        '/': '1',
        '/admin/vendors': '2',
        '/admin/ratings': '5',
        '/admin/orders': '6',
        '/admin/users': '7',
        '/admin/transactions': '8',
        '/vendor': '9',
        '/vendor/manage-store': '14',
        '/vendor/menu': '11',
        '/vendor/orders': '12',
        '/vendor/ratings': '13',
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
            type: 'admin',
        },
        {
            key: '2',
            icon: <TeamOutlined />,
            label: t('sidebar.vendors'),
            onClick: () => {
                navigate('/admin/vendors');
                if (isMobile) onClose();
            },
            type: 'admin',
        },
        {
            key: '5',
            icon: <StarOutlined />,
            label: t('sidebar.ratings'),
            onClick: () => {
                navigate('/admin/ratings');
                if (isMobile) onClose();
            },
            type: 'admin',
        },
        {
            key: '6',
            icon: <ShoppingCartOutlined />,
            label: t('sidebar.orders'),
            onClick: () => {
                navigate('/admin/orders');
                if (isMobile) onClose();
            },
            type: 'admin',
        },
        {
            key: '7',
            icon: <UserOutlined />,
            label: t('sidebar.users'),
            onClick: () => {
                navigate('/admin/users');
                if (isMobile) onClose();
            },
            type: 'admin',
        },
        {
            key: '8',
            icon: <CreditCardOutlined />,
            label: t('sidebar.transactions'),
            onClick: () => {
                navigate('/admin/transactions');
                if (isMobile) onClose();
            },
            type: 'admin',
        },
        {
            key: '9',
            icon: <DashboardOutlined />,
            label: t('sidebar.vendorDashboard'),
            onClick: () => {
                navigate('/vendor');
                if (isMobile) onClose();
            },
            type: 'vendor',
        },
        {
            key: '14',
            icon: <FileDoneOutlined />,
            label: t('sidebar.manageStore'),
            onClick: () => {
                navigate('/vendor/manage-store');
                if (isMobile) onClose();
            },
            type: 'vendor',
        },
        {
            key: '11',
            icon: <AppstoreOutlined />,
            label: t('sidebar.vendorMenu'),
            onClick: () => {
                navigate('/vendor/menu');
                if (isMobile) onClose();
            },
            type: 'vendor',
        },
        {
            key: '12',
            icon: <ShoppingCartOutlined />,
            label: t('sidebar.vendorOrders'),
            onClick: () => {
                navigate('/vendor/orders');
                if (isMobile) onClose();
            },
            type: 'vendor',
        },
        {
            key: '13',
            icon: <BookOutlined />,
            label: t('sidebar.vendorRatings'),
            onClick: () => {
                navigate('/vendor/ratings');
                if (isMobile) onClose();
            },
            type: 'vendor',
        },
    ];

    // Filter menu items based on roles from the token
    const filteredMenuItems = isAuthenticated
        ? (userRoles.includes("Admin")
            ? menuItems.filter(item => item.type === 'admin')
            : menuItems.filter(item => item.type === 'vendor'))
        : [];

    const menuContent = (
        <>
            <div className="h-16 flex items-center justify-center">
                <img
                    src="/citio.svg"
                    alt={t('sidebar.logoAlt')}
                    className={`max-h-[100px] object-contain transition-all duration-300 ${collapsed && !isMobile ? 'max-w-[60px]' : 'max-w-[150px]'}`}
                />
            </div>
            <Menu
                theme={themeMode === 'light' ? 'light' : 'dark'}
                mode="inline"
                selectedKeys={[routeToKey[location.pathname] || '1']}
                items={filteredMenuItems}
            />
        </>
    );

    return isMobile ? (
        <Drawer
            title={
                <img
                    src="/citio.svg"
                    alt={t('sidebar.logoAlt')}
                    className="max-w-[100px] max-h-8 object-contain"
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
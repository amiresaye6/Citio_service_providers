import React from 'react';
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

const { Sider } = Layout;

const SideBar = ({ collapsed, visible = false, onClose = () => { }, isMobile = false }) => {
    const { t } = useTranslation('common');
    const { isRtl } = useDirection();
    const { themeMode } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const routeToKey = {
        '/': '1',
        '/admin/vendors': '2',
        '/admin/vendor-requests': '3',
        '/admin/menus': '4',
        '/admin/ratings': '5',
        '/admin/orders': '6',
        '/admin/users': '7',
        '/admin/transactions': '8',
        '/vendor': '9',
        '/vendor/profile': '10',
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
        },
        {
            key: '2',
            icon: <TeamOutlined />,
            label: t('sidebar.vendors'),
            onClick: () => {
                navigate('/admin/vendors');
                if (isMobile) onClose();
            },
        },
        {
            key: '3',
            icon: <FileDoneOutlined />,
            label: t('sidebar.vendorRequests'),
            onClick: () => {
                navigate('/admin/vendor-requests');
                if (isMobile) onClose();
            },
        },
        {
            key: '4',
            icon: <AppstoreOutlined />,
            label: t('sidebar.menus'),
            onClick: () => {
                navigate('/admin/menus');
                if (isMobile) onClose();
            },
        },
        {
            key: '5',
            icon: <StarOutlined />,
            label: t('sidebar.ratings'),
            onClick: () => {
                navigate('/admin/ratings');
                if (isMobile) onClose();
            },
        },
        {
            key: '6',
            icon: <ShoppingCartOutlined />,
            label: t('sidebar.orders'),
            onClick: () => {
                navigate('/admin/orders');
                if (isMobile) onClose();
            },
        },
        {
            key: '7',
            icon: <UserOutlined />,
            label: t('sidebar.users'),
            onClick: () => {
                navigate('/admin/users');
                if (isMobile) onClose();
            },
        },
        {
            key: '8',
            icon: <CreditCardOutlined />,
            label: t('sidebar.transactions'),
            onClick: () => {
                navigate('/admin/transactions');
                if (isMobile) onClose();
            },
        },
        {
            key: '9',
            icon: <DashboardOutlined />,
            label: t('sidebar.vendorDashboard'),
            onClick: () => {
                navigate('/vendor');
                if (isMobile) onClose();
            },
        },
        {
            key: '14',
            icon: <FileDoneOutlined />,
            label: t('sidebar.manageStore'),
            onClick: () => {
                navigate('/vendor/manage-store');
                if (isMobile) onClose();
            },
        },
        {
            key: '10',
            icon: <IdcardOutlined />,
            label: t('sidebar.vendorProfile'),
            onClick: () => {
                navigate('/vendor/profile');
                if (isMobile) onClose();
            },
        },
        {
            key: '11',
            icon: <AppstoreOutlined />,
            label: t('sidebar.vendorMenu'),
            onClick: () => {
                navigate('/vendor/menu');
                if (isMobile) onClose();
            },
        },
        {
            key: '12',
            icon: <ShoppingCartOutlined />,
            label: t('sidebar.vendorOrders'),
            onClick: () => {
                navigate('/vendor/orders');
                if (isMobile) onClose();
            },
        },
        {
            key: '13',
            icon: <BookOutlined />,
            label: t('sidebar.vendorRatings'),
            onClick: () => {
                navigate('/vendor/ratings');
                if (isMobile) onClose();
            },
        },
    ];

    const menuContent = (
        <>
            <div className="h-16 flex items-center justify-center">
                <img
                    src="/citio.svg"
                    alt={t('sidebar.logoAlt')}
                    className={`max-h-[100px] object-contain transition-all duration-300 ${collapsed && !isMobile ? 'max-w-[60px]' : 'max-w-[150px]'
                        }`}
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
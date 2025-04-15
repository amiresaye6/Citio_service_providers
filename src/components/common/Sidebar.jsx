import { Layout, Menu, Drawer } from 'antd';
import { UserOutlined, SettingOutlined, DashboardOutlined, ShopOutlined, BellOutlined, StarOutlined, PictureOutlined, CreditCardOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDirection } from '../../context/DirectionContext';

const { Sider } = Layout;

const SideBar = ({ visible = false, onClose = () => { }, isMobile = false }) => {
    const { t } = useTranslation('common');
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const {isRtl } = useDirection();

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
            <div
                style={{
                    height: 32,
                    margin: 16,
                    color: isMobile ? '#000' : '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                    paddingLeft: collapsed && !isMobile ? 0 : 8,
                }}
            >
                {t('sidebar.admin')}
            </div>
            <Menu
                theme="light"
                mode="inline"
                selectedKeys={[menuItems.find(item => item.onClick.toString().includes(location.pathname))?.key || '1']}
                items={menuItems}
            />
        </>
    );

    return isMobile ? (
        <Drawer
            title={t('sidebar.menu')}
            onClose={onClose}
            open={visible}
            width={200}
            bodyStyle={{ padding: 0 }}
            placement={isRtl ? "right" : "left"}
        >
            {menuContent}
        </Drawer>
    ) : (
        <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            theme="light"
            width={200}
        >
            {menuContent}
        </Sider>
    );
};

export default SideBar;
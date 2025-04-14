import { Layout, Menu, Drawer } from 'antd';
import { UserOutlined, SettingOutlined, DashboardOutlined, ShopOutlined, BellOutlined, StarOutlined, PictureOutlined, CreditCardOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;

const SideBar = ({ visible = false, onClose = () => { }, isMobile = false }) => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        {
            key: '1',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
            onClick: () => {
                navigate('/');
                if (isMobile) onClose(); // Close Drawer on mobile after click
            },
        },
        {
            key: '2',
            icon: <ShopOutlined />,
            label: 'Store',
            onClick: () => {
                navigate('/store');
                if (isMobile) onClose();
            },
        },
        {
            key: '3',
            icon: <BellOutlined />,
            label: 'Notifications',
            onClick: () => {
                navigate('/notifications');
                if (isMobile) onClose();
            },
        },
        {
            key: '4',
            icon: <StarOutlined />,
            label: 'Reviews',
            onClick: () => {
                navigate('/reviews');
                if (isMobile) onClose();
            },
        },
        {
            key: '5',
            icon: <PictureOutlined />,
            label: 'Images',
            onClick: () => {
                navigate('/images');
                if (isMobile) onClose();
            },
        },
        {
            key: '6',
            icon: <SettingOutlined />,
            label: 'Services',
            onClick: () => {
                navigate('/services');
                if (isMobile) onClose();
            },
        },
        {
            key: '7',
            icon: <CreditCardOutlined />,
            label: 'Payments',
            onClick: () => {
                navigate('/payments');
                if (isMobile) onClose();
            },
        },
        {
            key: '8',
            icon: <UserOutlined />,
            label: 'My Profile',
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
                Admin
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
            title="Menu"
            placement="left"
            onClose={onClose}
            open={visible}
            width={200}
            bodyStyle={{ padding: 0 }}
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
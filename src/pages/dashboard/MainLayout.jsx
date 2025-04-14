import { Layout, Button } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SideBar from '../../components/common/Sidebar';

const { Content } = Layout;

const MainLayout = () => {
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Update isMobile on window resize
    window.addEventListener('resize', () => {
        setIsMobile(window.innerWidth < 768);
    });

    const toggleDrawer = () => {
        setDrawerVisible(!drawerVisible);
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Hamburger button for mobile */}
            {isMobile && (
                <Button
                    style={{
                        position: 'fixed',
                        top: 16,
                        left: 16,
                        zIndex: 1000,
                    }}
                    icon={<MenuOutlined />}
                    onClick={toggleDrawer}
                />
            )}

            {/* Sidebar: Drawer for mobile, Sider for desktop */}
            {isMobile ? (
                <SideBar
                    visible={drawerVisible}
                    onClose={toggleDrawer}
                    isMobile={isMobile}
                />
            ) : (
                <SideBar />
            )}

            {/* Content area */}
            <Layout>
                <Content
                    style={{
                        margin: isMobile ? '16px' : '16px 16px 16px 16px',
                        background: '#fff',
                        padding: 24,
                        borderRadius: 12,
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
import { Layout, Button } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import SideBar from '../../components/common/Sidebar';
import HeaderComponent from '../../components/common/Header';


const { Content } = Layout;

const MainLayout = () => {
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Update isMobile on window resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
                        zIndex: 1001,
                    }}
                    icon={<MenuOutlined />}
                    onClick={toggleDrawer}
                    aria-label="Toggle menu"
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

            {/* Main content layout */}
            <Layout>
                {/* Header with language selector */}
                <HeaderComponent />

                {/* Content area */}
                <Content
                    style={{
                        margin: '16px',
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
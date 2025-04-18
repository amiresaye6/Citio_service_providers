import React, { useState, useEffect } from 'react';
import { Layout, theme } from 'antd';
import { Outlet } from 'react-router-dom';
import SideBar from '../../components/common/Sidebar';
import HeaderComponent from '../../components/common/Header';

const { Content } = Layout;

const MainLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const { token } = theme.useToken();

    // Update isMobile on window resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth >= 768) {
                setDrawerVisible(false); // Close drawer when switching to desktop view
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Combined toggle function for both sidebar collapse and drawer visibility
    const toggleCollapsed = () => {
        if (isMobile) {
            setDrawerVisible(!drawerVisible);
        } else {
            setCollapsed(!collapsed);
        }
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Sidebar: Drawer for mobile, Sider for desktop */}
            {isMobile ? (
                <SideBar
                    collapsed={collapsed}
                    visible={drawerVisible}
                    onClose={() => setDrawerVisible(false)}
                    isMobile={isMobile}
                />
            ) : (
                <SideBar collapsed={collapsed} />
            )}

            {/* Main content layout */}
            <Layout>
                {/* Header with collapse button and utilities */}
                <HeaderComponent
                    collapsed={isMobile ? !drawerVisible : collapsed}
                    toggleCollapsed={toggleCollapsed}
                    isMobile={isMobile}
                />

                {/* Content area */}
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        background: token.colorBgContainer,
                        borderRadius: token.borderRadiusLG,
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
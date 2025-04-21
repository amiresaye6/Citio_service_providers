import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Button, Space, Typography } from 'antd';
import {
  UserOutlined,
  FileTextOutlined,
  DollarOutlined,
  ShopOutlined,
  ReloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';

// Import reusable components
import PageHeader from '../components/common/PageHeader';
import TableWrapper from '../components/common/TableWrapper';
import StatusTag from '../components/common/StatusTag';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ToastNotifier from '../components/common/ToastNotifier';
import UserCard from '../components/common/UserCard';

const { Text } = Typography;

const OverviewPage = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [vendorsLoading, setVendorsLoading] = useState(true);
  const [stats, setStats] = useState({
    newUsers: 0,
    invoices: 0,
    revenue: 0,
    vendors: 0
  });
  const [topVendors, setTopVendors] = useState([]);

  // Mock data for demonstration
  const mockStats = {
    newUsers: 24,
    invoices: 67,
    revenue: 12850.75,
    vendors: 8
  };

  const mockVendors = [
    { id: 1, name: 'Tech Solutions Inc.', owner: 'John Smith', revenue: 3450.50, growth: 12.5, status: 'active' },
    { id: 2, name: 'Digital Creatives', owner: 'Sarah Johnson', revenue: 2870.25, growth: 8.3, status: 'active' },
    { id: 3, name: 'Marketing Experts', owner: 'Michael Brown', revenue: 2145.00, growth: -2.1, status: 'inactive' },
    { id: 4, name: 'Web Services Pro', owner: 'Emily Davis', revenue: 1980.75, growth: 5.7, status: 'active' },
    { id: 5, name: 'Design Masters', owner: 'Robert Wilson', revenue: 1785.30, growth: 15.2, status: 'active' },
    { id: 6, name: 'Content Kings', owner: 'Jessica Miller', revenue: 1542.60, growth: -3.5, status: 'active' },
    { id: 7, name: 'App Developers Ltd', owner: 'David Clark', revenue: 1325.00, growth: 4.8, status: 'pending' },
    { id: 8, name: 'Cloud Solutions', owner: 'Lisa Moore', revenue: 1240.50, growth: 7.6, status: 'active' },
    { id: 9, name: 'SEO Wizards', owner: 'Kevin Taylor', revenue: 1120.75, growth: 2.3, status: 'active' },
    { id: 10, name: 'AI Innovations', owner: 'Amanda White', revenue: 950.25, growth: 22.7, status: 'active' },
    { id: 11, name: 'Social Media Agency', owner: 'Thomas Brown', revenue: 885.50, growth: -1.8, status: 'inactive' },
    { id: 12, name: 'E-commerce Solutions', owner: 'Rachel Green', revenue: 780.30, growth: 3.9, status: 'active' },
    { id: 13, name: 'Security Systems', owner: 'William Johnson', revenue: 675.40, growth: 6.2, status: 'active' },
    { id: 14, name: 'Data Analytics Pro', owner: 'Jennifer Adams', revenue: 565.25, growth: 9.1, status: 'pending' },
    { id: 15, name: 'Virtual Reality Labs', owner: 'Alexander Lee', revenue: 435.60, growth: 18.5, status: 'active' }
  ];

  // Simulating data loading
  useEffect(() => {
    // Simulating API calls
    const loadData = async () => {
      try {
        // Fetch statistics
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStats(mockStats);
        setStatsLoading(false);

        // Fetch top vendors
        await new Promise(resolve => setTimeout(resolve, 500));
        setTopVendors(mockVendors);
        setVendorsLoading(false);

        setLoading(false);
        ToastNotifier.success('Dashboard data loaded successfully');
      } catch (error) {
        ToastNotifier.error('Failed to load dashboard data', error.message);
        setLoading(false);
        setStatsLoading(false);
        setVendorsLoading(false);
      }
    };

    loadData();
  }, []);

  // Refresh data handler
  const handleRefresh = () => {
    setLoading(true);
    setStatsLoading(true);
    setVendorsLoading(true);

    // Simulate refresh
    setTimeout(() => {
      setStats({
        newUsers: Math.floor(Math.random() * 30) + 10,
        invoices: Math.floor(Math.random() * 70) + 40,
        revenue: Math.floor(Math.random() * 15000) + 10000,
        vendors: Math.floor(Math.random() * 10) + 5
      });
      setStatsLoading(false);

      setTimeout(() => {
        const updatedVendors = [...mockVendors].map(vendor => ({
          ...vendor,
          revenue: vendor.revenue * (Math.random() * 0.2 + 0.9),
          growth: vendor.growth + (Math.random() * 5 - 2.5)
        }));
        setTopVendors(updatedVendors);
        setVendorsLoading(false);
        setLoading(false);

        ToastNotifier.success('Dashboard refreshed');
      }, 500);
    }, 1000);
  };

  // Table columns for top vendors
  const vendorColumns = [
    {
      title: 'Vendor',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <UserCard
          name={record.name}
          email={`contact@${record.name.toLowerCase().replace(/\s+/g, '')}.com`}
          status={record.status}
        />
      ),
    },
    {
      title: 'Owner',
      dataIndex: 'owner',
      key: 'owner',
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (revenue) => `$${revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sorter: (a, b) => a.revenue - b.revenue,
      defaultSortOrder: 'descend',
    },
    {
      title: 'Growth',
      dataIndex: 'growth',
      key: 'growth',
      render: (growth) => (
        <Space>
          {growth >= 0 ? (
            <ArrowUpOutlined style={{ color: '#52c41a' }} />
          ) : (
            <ArrowDownOutlined style={{ color: '#ff4d4f' }} />
          )}
          <span style={{ color: growth >= 0 ? '#52c41a' : '#ff4d4f' }}>
            {Math.abs(growth).toFixed(1)}%
          </span>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusTag status={status} />,
    },
  ];

  return (
    <div className="page-container">
      {/* Page Header */}
      <PageHeader
        title="Dashboard Overview"
        subtitle="Summary of system statistics and top performing vendors"
        actions={
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
          >
            Refresh
          </Button>
        }
      />

      {statsLoading ? (
        <Card className="mb-6">
          <LoadingSpinner text="Loading statistics..." />
        </Card>
      ) : (
        <Row gutter={[16, 16]} className="mb-6">
          {/* Today's statistics */}
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="New Users Today"
                value={stats.newUsers}
                prefix={<UserOutlined className="text-blue-500" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Invoices Today"
                value={stats.invoices}
                prefix={<FileTextOutlined className="text-green-500" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Revenue Today"
                value={stats.revenue}
                precision={2}
                prefix={<DollarOutlined className="text-purple-500" />}
                suffix="USD"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="New Vendors Today"
                value={stats.vendors}
                prefix={<ShopOutlined className="text-orange-500" />}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Top Vendors Table */}
      <Card
        title={
          <div className="flex justify-between items-center">
            <span>Top 15 Vendors by Revenue</span>
            <Text type="secondary">Updated: {new Date().toLocaleString()}</Text>
          </div>
        }
        className="mb-6"
      >
        {vendorsLoading ? (
          <LoadingSpinner text="Loading vendor data..." />
        ) : (
          <TableWrapper
            dataSource={topVendors}
            columns={vendorColumns}
            loading={vendorsLoading}
            pagination={false}
          />
        )}
      </Card>
    </div>
  );
};

export default OverviewPage;
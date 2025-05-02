import React, { useEffect } from 'react';
import { Card, Row, Col, Statistic, Button, Space, Typography } from 'antd';
import {
  UserOutlined,
  FileTextOutlined,
  DollarOutlined,
  ShopOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTodayStats,
  fetchTopVendors,
  fetchProjectSummary,
  clearError,
} from '../redux/slices/adminSlice';
import PageHeader from '../components/common/PageHeader';
import TableWrapper from '../components/common/TableWrapper';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ToastNotifier from '../components/common/ToastNotifier';
import UserCard from '../components/common/UserCard';
import { debounce } from 'lodash';

const { Text } = Typography;

const OverviewPage = () => {
  const dispatch = useDispatch();
  const {
    todayStats,
    topVendors,
    projectSummary,
    loading,
    error,
  } = useSelector((state) => state.admin);

  // Load data on mount
  useEffect(() => {
    dispatch(fetchTodayStats());
    dispatch(fetchTopVendors());
    dispatch(fetchProjectSummary());
  }, [dispatch]);

  // Handle errors
  useEffect(() => {
    if (error) {
      ToastNotifier.error('Failed to load dashboard data', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Debounced refresh handler
  const handleRefresh = debounce(() => {
    dispatch(fetchTodayStats());
    dispatch(fetchTopVendors());
    dispatch(fetchProjectSummary());
    ToastNotifier.success('Dashboard refreshed');
  }, 300);

  // Table columns for top vendors
  const vendorColumns = [
    {
      title: 'Vendor',
      dataIndex: 'businessName',
      key: 'businessName',
      render: (_, record) => (
        <UserCard
          name={record.businessName}
          email={record.fullName.toLowerCase().replace(/\s+/g, '') + '@example.com'} // Placeholder email
          avatar={record.profilePictureUrl}
        />
      ),
    },
    {
      title: 'Owner',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Business Type',
      dataIndex: 'businessType',
      key: 'businessType',
    },
    {
      title: 'Revenue',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      render: (revenue) => `$${revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sorter: (a, b) => a.totalRevenue - b.totalRevenue,
      defaultSortOrder: 'descend',
    },
    {
      title: 'Orders',
      dataIndex: 'totalOrderCount',
      key: 'totalOrderCount',
      sorter: (a, b) => a.totalOrderCount - b.totalOrderCount,
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

      {loading ? (
        <Card className="mb-6">
          <LoadingSpinner text="Loading statistics..." />
        </Card>
      ) : (
        <>
          {/* Today's Statistics */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="New Users Today"
                  value={todayStats.newUsersCount}
                  prefix={<UserOutlined className="text-blue-500" />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Orders Today"
                  value={todayStats.ordersCount}
                  prefix={<FileTextOutlined className="text-green-500" />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Revenue Today"
                  value={todayStats.revenueToday}
                  precision={2}
                  prefix={<DollarOutlined className="text-purple-500" />}
                  suffix="USD"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Vendors Today"
                  value={todayStats.vendorsCount}
                  prefix={<ShopOutlined className="text-orange-500" />}
                />
              </Card>
            </Col>
          </Row>

          {/* Project Summary */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} md={8}>
              <Card>
                <Statistic
                  title="Total Users"
                  value={projectSummary.totalUsersCount}
                  prefix={<UserOutlined className="text-blue-500" />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card>
                <Statistic
                  title="Total Vendors"
                  value={projectSummary.totalVendorsCount}
                  prefix={<ShopOutlined className="text-orange-500" />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card>
                <Statistic
                  title="Total Revenue"
                  value={projectSummary.totalRevenue}
                  precision={2}
                  prefix={<DollarOutlined className="text-purple-500" />}
                  suffix="USD"
                />
              </Card>
            </Col>
          </Row>
        </>
      )}

      {/* Top Vendors Table */}
      <Card
        title={
          <div className="flex justify-between items-center">
            <span>Top Vendors by Revenue</span>
            <Text type="secondary">Updated: {new Date().toLocaleString()}</Text>
          </div>
        }
        className="mb-6"
      >
        {loading ? (
          <LoadingSpinner text="Loading vendor data..." />
        ) : (
          <TableWrapper
            dataSource={topVendors}
            columns={vendorColumns}
            loading={loading}
            pagination={{ pageSize: 5 }}
            rowKey="vendorId"
          />
        )}
      </Card>
    </div>
  );
};

export default OverviewPage;
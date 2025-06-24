import React, { useEffect } from 'react';
import { Card, Row, Col, Statistic, Button, Typography, Tag, Tooltip, Divider, Space } from 'antd';
import {
  UserOutlined,
  FileTextOutlined,
  DollarOutlined,
  ShopOutlined,
  ReloadOutlined,
  TrophyOutlined,
  RiseOutlined,
  UserAddOutlined,
  TeamOutlined,
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

const StatCard = ({ title, value, prefix, suffix, trend, trendType, tooltip }) => (
  <Card
    bordered
    className="shadow transition-shadow hover:shadow-lg h-full"
    bodyStyle={{ padding: 20 }}
  >
    <Row align="middle" gutter={12}>
      <Col>
        <span style={{ fontSize: 30 }}>{prefix}</span>
      </Col>
      <Col flex="auto">
        <Statistic
          title={
            tooltip ? (
              <Tooltip title={tooltip}>
                <span>{title}</span>
              </Tooltip>
            ) : (
              title
            )
          }
          value={value}
          valueStyle={{ fontWeight: 600, fontSize: 22 }}
          suffix={suffix}
        />
        {trend !== undefined && (
          <div className={`text-xs mt-1 ${trendType === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trendType === 'up' ? <RiseOutlined /> : <RiseOutlined style={{ transform: 'rotate(180deg)' }} />}
            {trend}% {trendType === 'up' ? 'Increase' : 'Decrease'}
          </div>
        )}
      </Col>
    </Row>
  </Card>
);

const OverviewPage = () => {
  const dispatch = useDispatch();
  const {
    todayStats,
    topVendors,
    projectSummary,
    loading,
    error,
  } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchTodayStats());
    dispatch(fetchTopVendors());
    dispatch(fetchProjectSummary());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      ToastNotifier.error('Failed to load dashboard data', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleRefresh = debounce(() => {
    dispatch(fetchTodayStats());
    dispatch(fetchTopVendors());
    dispatch(fetchProjectSummary());
    ToastNotifier.success('Dashboard refreshed');
  }, 300);

  const vendorColumns = [
    {
      title: 'Vendor',
      dataIndex: 'businessName',
      key: 'businessName',
      render: (_, record) => (
        <UserCard
          name={record.businessName}
          email={record.fullName.toLowerCase().replace(/\s+/g, '') + '@example.com'}
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
      render: (bt) => <Tag color="blue">{bt}</Tag>,
    },
    {
      title: 'Revenue',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      render: (revenue) => (
        <Text strong style={{ color: '#52c41a' }}>
          ${revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      ),
      sorter: (a, b) => a.totalRevenue - b.totalRevenue,
      defaultSortOrder: 'descend',
    },
    {
      title: 'Orders',
      dataIndex: 'totalOrderCount',
      key: 'totalOrderCount',
      sorter: (a, b) => a.totalOrderCount - b.totalOrderCount,
      render: cnt => <Tag color="gold">{cnt}</Tag>
    },
  ];

  // Highlight the top vendor (optional)
  const topVendor = Array.isArray(topVendors) && topVendors.length > 0 ? topVendors[0] : null;

  return (
    <div className="page-container" style={{ padding: 24 }}>
      <PageHeader
        title="Admin Dashboard"
        subtitle="System summary & top vendors"
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
          {/* Today's Stats + Project Summary in one row for compactness */}
          <Row gutter={[24, 24]} className="mb-6">
            <Col xs={24} sm={12} md={4}>
              <StatCard
                title="New Users Today"
                value={todayStats.newUsersCount}
                prefix={<UserAddOutlined />}
                tooltip="Users registered in the last 24 hours"
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <StatCard
                title="Orders Today"
                value={todayStats.ordersCount}
                prefix={<FileTextOutlined />}
                tooltip="Total orders placed today"
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <StatCard
                title="Revenue Today"
                value={todayStats.revenueToday}
                prefix={<DollarOutlined />}
                suffix="USD"
                tooltip="Gross revenue generated today"
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <StatCard
                title="Vendors Today"
                value={todayStats.vendorsCount}
                prefix={<ShopOutlined />}
                tooltip="Vendors who joined today"
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <StatCard
                title="Total Users"
                value={projectSummary.totalUsersCount}
                prefix={<UserOutlined />}
                tooltip="All users registered on the platform"
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <StatCard
                title="Total Vendors"
                value={projectSummary.totalVendorsCount}
                prefix={<ShopOutlined />}
                tooltip="All vendors registered on the platform"
              />
            </Col>
          </Row>
          <Row gutter={[24, 24]} className="mb-6">
            <Col xs={24} sm={12} md={8}>
              <StatCard
                title="Total Revenue"
                value={projectSummary.totalRevenue}
                prefix={<DollarOutlined />}
                suffix="USD"
                tooltip="Total gross revenue generated"
              />
            </Col>
            {topVendor && (
              <Col xs={24} sm={24} md={16}>
                <Card
                  bordered
                  style={{ height: '100%' }}
                  title={
                    <Space>
                      <TrophyOutlined style={{ color: "#faad14" }} />
                      <Text strong style={{ fontSize: 18 }}>Top Vendor</Text>
                    </Space>
                  }
                >
                  <Row gutter={24} align="middle">
                    <Col xs={24} sm={12} md={8}>
                      <UserCard
                        name={topVendor.businessName}
                        email={topVendor.fullName.toLowerCase().replace(/\s+/g, '') + '@example.com'}
                        avatar={topVendor.profilePictureUrl}
                      />
                      <div>
                        <Tag color="blue">{topVendor.businessType}</Tag>
                      </div>
                    </Col>
                    <Col xs={12} sm={6} md={8}>
                      <Statistic
                        title="Revenue"
                        value={topVendor.totalRevenue}
                        prefix={<DollarOutlined />}
                        valueStyle={{ color: "#52c41a" }}
                        precision={2}
                        suffix="USD"
                      />
                    </Col>
                    <Col xs={12} sm={6} md={8}>
                      <Statistic
                        title="Orders"
                        value={topVendor.totalOrderCount}
                        prefix={<RiseOutlined />}
                        valueStyle={{ color: "#faad14" }}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
            )}
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
        bordered
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
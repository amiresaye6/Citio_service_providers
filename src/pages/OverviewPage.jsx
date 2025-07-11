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
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

const StatCard = ({ title, value, prefix, suffix, trend, trendType, tooltip }) => {
  const { t } = useTranslation('dashboard');

  return (
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
              {trend}% {trendType === 'up' ? t('trends.increase') : t('trends.decrease')}
            </div>
          )}
        </Col>
      </Row>
    </Card>
  );
};

const OverviewPage = () => {
  const { t, i18n } = useTranslation('dashboard');
  const dispatch = useDispatch();
  const {
    todayStats,
    topVendors,
    projectSummary,
    loading,
    error,
  } = useSelector((state) => state.admin);

  const direction = i18n.dir();
  const isRTL = direction === "rtl";

  useEffect(() => {
    dispatch(fetchTodayStats());
    dispatch(fetchTopVendors());
    dispatch(fetchProjectSummary());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      ToastNotifier.error(t('errors.failedToLoad'), error);
      dispatch(clearError());
    }
  }, [error, dispatch, t]);

  const handleRefresh = debounce(() => {
    dispatch(fetchTodayStats());
    dispatch(fetchTopVendors());
    dispatch(fetchProjectSummary());
    ToastNotifier.success(t('notifications.refreshed'));
  }, 300);

  const vendorColumns = [
    {
      title: t('columns.vendor'),
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
      title: t('columns.owner'),
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: t('columns.businessType'),
      dataIndex: 'businessType',
      key: 'businessType',
      render: (bt) => <Tag color="blue">{bt}</Tag>,
    },
    {
      title: t('columns.revenue'),
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
      title: t('columns.orders'),
      dataIndex: 'totalOrderCount',
      key: 'totalOrderCount',
      sorter: (a, b) => a.totalOrderCount - b.totalOrderCount,
      render: cnt => <Tag color="gold">{cnt}</Tag>
    },
  ];

  // Highlight the top vendor (optional)
  const topVendor = Array.isArray(topVendors) && topVendors.length > 0 ? topVendors[0] : null;

  return (
    <div className="page-container" style={{ padding: 24 }} dir={direction}>
      <PageHeader
        title={t('pageHeader.title')}
        subtitle={t('pageHeader.subtitle')}
        actions={
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
          >
            {t('buttons.refresh')}
          </Button>
        }
      />

      {loading ? (
        <Card className="mb-6">
          <LoadingSpinner text={t('loading.statistics')} />
        </Card>
      ) : (
        <>
          {/* Today's Stats + Project Summary in one row for compactness */}
          <Row gutter={[24, 24]} className="mb-6">
            <Col xs={24} sm={12} md={4}>
              <StatCard
                title={t('stats.newUsersToday')}
                value={todayStats.newUsersCount}
                prefix={<UserAddOutlined />}
                tooltip={t('tooltips.newUsersToday')}
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <StatCard
                title={t('stats.ordersToday')}
                value={todayStats.ordersCount}
                prefix={<FileTextOutlined />}
                tooltip={t('tooltips.ordersToday')}
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <StatCard
                title={t('stats.revenueToday')}
                value={todayStats.revenueToday}
                prefix={<DollarOutlined />}
                suffix="USD"
                tooltip={t('tooltips.revenueToday')}
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <StatCard
                title={t('stats.vendorsToday')}
                value={todayStats.vendorsCount}
                prefix={<ShopOutlined />}
                tooltip={t('tooltips.vendorsToday')}
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <StatCard
                title={t('stats.totalUsers')}
                value={projectSummary.totalUsersCount}
                prefix={<UserOutlined />}
                tooltip={t('tooltips.totalUsers')}
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <StatCard
                title={t('stats.totalVendors')}
                value={projectSummary.totalVendorsCount}
                prefix={<ShopOutlined />}
                tooltip={t('tooltips.totalVendors')}
              />
            </Col>
          </Row>
          <Row gutter={[24, 24]} className="mb-6">
            <Col xs={24} sm={12} md={8}>
              <StatCard
                title={t('stats.totalRevenue')}
                value={projectSummary.totalRevenue}
                prefix={<DollarOutlined />}
                suffix="USD"
                tooltip={t('tooltips.totalRevenue')}
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
                      <Text strong style={{ fontSize: 18 }}>{t('topVendor.title')}</Text>
                    </Space>
                  }
                  className={isRTL ? "rtl" : "ltr"}
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
                        title={t('columns.revenue')}
                        value={topVendor.totalRevenue}
                        prefix={<DollarOutlined />}
                        valueStyle={{ color: "#52c41a" }}
                        precision={2}
                        suffix="USD"
                      />
                    </Col>
                    <Col xs={12} sm={6} md={8}>
                      <Statistic
                        title={t('columns.orders')}
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
            <span>{t('tables.topVendors')}</span>
            <Text type="secondary">{t('labels.updated')}: {new Date().toLocaleString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}</Text>
          </div>
        }
        className={`mb-6 ${isRTL ? "rtl" : "ltr"}`}
        bordered
      >
        {loading ? (
          <LoadingSpinner text={t('loading.vendors')} />
        ) : (
          <TableWrapper
            dataSource={topVendors}
            columns={vendorColumns}
            loading={loading}
            pagination={{ pageSize: 5 }}
            rowKey="vendorId"
            dir={direction}
          />
        )}
      </Card>
    </div>
  );
};

export default OverviewPage;
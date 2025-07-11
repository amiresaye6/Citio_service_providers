import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
    Avatar,
    Button,
    Tag,
    Descriptions,
    Row,
    Col,
    Space,
    Divider,
    Empty,
    Typography,
    Table,
    Statistic,
    Spin,
    Alert
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
    ArrowLeftOutlined,
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    CalendarOutlined,
    ShoppingCartOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    CreditCardOutlined
} from '@ant-design/icons';
import {
    fetchUserTransactions,
    clearUserTransactions,
    clearError
} from '../redux/slices/adminSlice';
import PageHeader from '../components/common/PageHeader';
import ToastNotifier from '../components/common/ToastNotifier';
import { useTranslation } from 'react-i18next';

const { Text, Title } = Typography;

const UserDetailsPage = () => {
    const { t, i18n } = useTranslation('userDetails');
    const { userId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const {
        users,
        userTransactions,
        userTransactionsLoading,
        userTransactionsError
    } = useSelector((state) => state.admin);

    const [transactionsPage, setTransactionsPage] = useState(1);
    const [transactionsPageSize, setTransactionsPageSize] = useState(10);

    const direction = i18n.dir();
    const isRTL = direction === "rtl";

    // Get user details from the users list - only use what's available from API
    const userDetails = users?.items?.find(user => user.id === userId);

    useEffect(() => {
        if (userId) {
            dispatch(fetchUserTransactions({
                userId,
                pageNumber: transactionsPage,
                pageSize: transactionsPageSize
            }));
        }

        // Cleanup on unmount
        return () => {
            dispatch(clearUserTransactions());
        };
    }, [dispatch, userId, transactionsPage, transactionsPageSize]);

    useEffect(() => {
        if (userTransactionsError) {
            ToastNotifier.error(t('errors.transactionsLoadFailed'), userTransactionsError);
            dispatch(clearError());
        }
    }, [userTransactionsError, dispatch, t]);

    const handleGoBack = () => {
        navigate('/admin/users');
    };

    const handleTransactionsPaginationChange = (page, pageSize) => {
        setTransactionsPage(page);
        setTransactionsPageSize(pageSize);
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'green';
            case 'pending':
                return 'orange';
            case 'failed':
                return 'red';
            case 'cancelled':
                return 'red';
            case 'refunded':
                return 'blue';
            default:
                return 'default';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return <CheckCircleOutlined />;
            case 'pending':
                return <ClockCircleOutlined />;
            case 'failed':
            case 'cancelled':
                return <CloseCircleOutlined />;
            case 'refunded':
                return <ArrowLeftOutlined />;
            default:
                return <ClockCircleOutlined />;
        }
    };

    const getStatusTranslation = (status) => {
        const statusKey = status?.toLowerCase();
        return t(`status.${statusKey}`, status);
    };

    // Only show columns for data that exists in the API
    const transactionColumns = [
        {
            title: t('table.transactionId'),
            dataIndex: 'id',
            key: 'id',
            width: 120,
            render: (id) => <Text code className="text-xs">{id}</Text>
        },
        {
            title: t('table.orderId'),
            dataIndex: 'orderId',
            key: 'orderId',
            width: 120,
            render: (orderId) => <Text className="text-xs">{orderId}</Text>
        },
        {
            title: t('table.customer'),
            dataIndex: 'applicationUserFullName',
            key: 'applicationUserFullName',
            width: 150,
        },
        {
            title: t('table.totalAmount'),
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            width: 120,
            render: (amount) => (
                <Text strong className="text-green-600">
                    ${amount?.toFixed(2)}
                </Text>
            )
        },
        {
            title: t('table.status'),
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status) => (
                <Tag
                    icon={getStatusIcon(status)}
                    color={getStatusColor(status)}
                >
                    {getStatusTranslation(status)}
                </Tag>
            )
        },
        {
            title: t('table.transactionDate'),
            dataIndex: 'transactionDate',
            key: 'transactionDate',
            width: 150,
            render: (date) => (
                <div>
                    <div>{new Date(date).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}</div>
                    <div className="text-xs text-gray-500">
                        {new Date(date).toLocaleTimeString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}
                    </div>
                </div>
            )
        },
        {
            title: t('table.paymentMethod'),
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            width: 130,
            render: (method) => (
                <Tag icon={<CreditCardOutlined />} color="blue">
                    {method}
                </Tag>
            )
        }
    ];

    // Calculate stats only from real API data
    const userStats = {
        totalTransactions: userTransactions.items?.length || 0,
        completedTransactions: userTransactions.items?.filter(t => t.status?.toLowerCase() === 'completed').length || 0,
        totalSpent: userTransactions.items
            ?.filter(t => t.status?.toLowerCase() === 'completed')
            .reduce((sum, t) => sum + (t.totalAmount || 0), 0) || 0,
        averageOrderValue: (() => {
            const completedTransactions = userTransactions.items?.filter(t => t.status?.toLowerCase() === 'completed') || [];
            if (completedTransactions.length === 0) return 0;
            const total = completedTransactions.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
            return total / completedTransactions.length;
        })()
    };

    // Show loading if user details are not available
    if (!userDetails) {
        return (
            <div className="p-4 md:p-6 min-h-screen" dir={direction}>
                <PageHeader
                    title={t('pageHeader.title')}
                    subtitle={t('pageHeader.loadingSubtitle')}
                    actions={
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={handleGoBack}
                        >
                            {t('buttons.backToUsers')}
                        </Button>
                    }
                />
                <div className="flex items-center justify-center py-12">
                    <Spin size="large" />
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 min-h-screen" dir={direction}>
            <PageHeader
                title={t('pageHeader.title')}
                subtitle={t('pageHeader.userInfoSubtitle', { name: userDetails.fullName })}
                actions={
                    <Space>
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={handleGoBack}
                        >
                            {t('buttons.backToUsers')}
                        </Button>
                    </Space>
                }
            />

            {/* User Information Section */}
            <Row gutter={[24, 24]} className="mb-6">
                {/* Profile Card */}
                <Col xs={24} lg={8}>
                    <Card className="text-center">
                        <div className="mb-4">
                            <Avatar
                                size={120}
                                src={userDetails.imageUrl ? `https://service-provider.runasp.net${userDetails.imageUrl}` : undefined}
                                icon={<UserOutlined />}
                                className="mb-4"
                            />
                        </div>

                        <h2 className="text-xl font-semibold mb-2">
                            {userDetails.fullName}
                        </h2>

                        <p className="text-gray-600 mb-3">
                            {t('profile.customer')}
                        </p>

                        <Divider />

                        <Space direction="vertical" className="w-full">
                            <div className="flex items-center justify-center text-gray-600">
                                <MailOutlined className={isRTL ? "ml-2" : "mr-2"} />
                                <span className="text-sm">{userDetails.email}</span>
                            </div>

                            {userDetails.phoneNumber && (
                                <div className="flex items-center justify-center text-gray-600">
                                    <PhoneOutlined className={isRTL ? "ml-2" : "mr-2"} />
                                    <span className="text-sm">{userDetails.phoneNumber}</span>
                                </div>
                            )}

                            {userDetails.address && (
                                <div className="flex items-center justify-center text-gray-600">
                                    <span className="text-sm text-center">{userDetails.address}</span>
                                </div>
                            )}

                            {userDetails.registrationDate && (
                                <div className="flex items-center justify-center text-gray-600">
                                    <CalendarOutlined className={isRTL ? "ml-2" : "mr-2"} />
                                    <span className="text-sm">
                                        {t('profile.joined')} {new Date(userDetails.registrationDate).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}
                                    </span>
                                </div>
                            )}
                        </Space>
                    </Card>
                </Col>

                {/* User Details Card */}
                <Col xs={24} lg={16}>
                    <Card>
                        <Title level={4} className="mb-4">
                            <UserOutlined className={isRTL ? "ml-2" : "mr-2"} />
                            {t('userInfo.title')}
                        </Title>
                        <Descriptions
                            bordered
                            column={1}
                            size="medium"
                        >
                            <Descriptions.Item label={t('userInfo.userId')}>
                                <Text code copyable className="text-xs">
                                    {userDetails.id}
                                </Text>
                            </Descriptions.Item>

                            <Descriptions.Item label={t('userInfo.fullName')}>
                                {userDetails.fullName}
                            </Descriptions.Item>

                            <Descriptions.Item label={t('userInfo.emailAddress')}>
                                <a href={`mailto:${userDetails.email}`}>
                                    {userDetails.email}
                                </a>
                            </Descriptions.Item>

                            {userDetails.phoneNumber && (
                                <Descriptions.Item label={t('userInfo.phoneNumber')}>
                                    <a href={`tel:${userDetails.phoneNumber}`}>
                                        {userDetails.phoneNumber}
                                    </a>
                                </Descriptions.Item>
                            )}

                            {userDetails.address && (
                                <Descriptions.Item label={t('userInfo.address')}>
                                    {userDetails.address}
                                </Descriptions.Item>
                            )}

                            {userDetails.registrationDate && (
                                <Descriptions.Item label={t('userInfo.registrationDate')}>
                                    {new Date(userDetails.registrationDate).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')} {t('common.at')}{' '}
                                    {new Date(userDetails.registrationDate).toLocaleTimeString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}
                                </Descriptions.Item>
                            )}
                        </Descriptions>
                    </Card>
                </Col>
            </Row>

            {/* Transaction Stats Section */}
            <Card className="mb-6">
                <Title level={4} className="mb-4">
                    <ShoppingCartOutlined className={isRTL ? "ml-2" : "mr-2"} />
                    {t('transactionOverview.title')}
                </Title>
                <Row gutter={[24, 16]}>
                    <Col xs={12} sm={6}>
                        <Statistic
                            title={t('transactionOverview.totalTransactions')}
                            value={userStats.totalTransactions}
                            prefix={<ShoppingCartOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Col>
                    <Col xs={12} sm={6}>
                        <Statistic
                            title={t('transactionOverview.completed')}
                            value={userStats.completedTransactions}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Col>
                    <Col xs={12} sm={6}>
                        <Statistic
                            title={t('transactionOverview.totalSpent')}
                            value={userStats.totalSpent}
                            prefix="$"
                            precision={2}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Col>
                    <Col xs={12} sm={6}>
                        <Statistic
                            title={t('transactionOverview.averageTransaction')}
                            value={userStats.averageOrderValue}
                            prefix="$"
                            precision={2}
                            valueStyle={{ color: '#fa8c16' }}
                        />
                    </Col>
                </Row>
            </Card>

            {/* Transactions Table Section - Full Width */}
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <Title level={4} className="mb-0">
                        <ShoppingCartOutlined className={isRTL ? "ml-2" : "mr-2"} />
                        {t('transactionHistory.title', { count: userTransactions.items?.length || 0 })}
                    </Title>
                </div>

                {userTransactionsLoading ? (
                    <div className="text-center py-12">
                        <Spin size="large" />
                        <p className="mt-4 text-gray-500">{t('loading.transactions')}</p>
                    </div>
                ) : userTransactionsError ? (
                    <Alert
                        message={t('errors.errorLoadingTransactions')}
                        description={t('errors.unableToLoadTransactions')}
                        type="error"
                        showIcon
                        action={
                            <Button
                                size="small"
                                onClick={() => dispatch(fetchUserTransactions({
                                    userId,
                                    pageNumber: transactionsPage,
                                    pageSize: transactionsPageSize
                                }))}
                            >
                                {t('buttons.retry')}
                            </Button>
                        }
                    />
                ) : !userTransactions.items || userTransactions.items.length === 0 ? (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={t('transactionHistory.noTransactions')}
                    />
                ) : (
                    <Table
                        dataSource={userTransactions.items}
                        columns={transactionColumns}
                        rowKey="id"
                        pagination={{
                            current: userTransactions.pageNumber,
                            pageSize: transactionsPageSize,
                            total: userTransactions.totalPages * transactionsPageSize,
                            onChange: handleTransactionsPaginationChange,
                            showSizeChanger: true,
                            showQuickJumper: userTransactions.totalPages > 1,
                            showTotal: (total, range) =>
                                t('pagination.showTotal', { start: range[0], end: range[1], total }),
                            pageSizeOptions: ['5', '10', '20', '50'],
                            disabled: userTransactionsLoading
                        }}
                        scroll={{ x: 'max-content' }}
                        className={isRTL ? "rtl-table" : ""}
                    />
                )}
            </Card>
        </div>
    );
};

export default UserDetailsPage;
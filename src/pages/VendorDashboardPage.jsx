import React, { useEffect, useState } from 'react';
import { Card, Statistic, Rate, Button, Row, Col, Empty, Divider, Tooltip, List, Tag, Space } from 'antd';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell,
    BarChart,
    Bar
} from 'recharts';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVendorDashboard, clearError, fetchVendorOrders, fetchVendorTopSellingProducts, fetchVendorRevenueByPaymentMethod } from '../redux/slices/vendorsSlice';
import PageHeader from '../components/common/PageHeader';
import ToastNotifier from '../components/common/ToastNotifier';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
    ArrowUpOutlined, ArrowDownOutlined, DollarCircleOutlined,
    ShoppingCartOutlined, StarFilled, PlusOutlined, UnorderedListOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

// Enhanced StatsCard with trend
const StatsCard = ({ title, value, suffix, trend, trendType, icon, color }) => (
    <Card className="h-full shadow transition-shadow hover:shadow-lg">
        <Row align="middle" gutter={8}>
            <Col>
                <div style={{
                    backgroundColor: color || '#f5f5f5',
                    borderRadius: '50%',
                    padding: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 8
                }}>
                    {icon}
                </div>
            </Col>
            <Col flex="auto">
                <Statistic
                    title={<span className="text-gray-500">{title}</span>}
                    value={value}
                    suffix={<span className="text-xs text-gray-500">{suffix}</span>}
                    valueStyle={{ fontWeight: 600 }}
                />
                {trend !== undefined &&
                    <div className={`text-xs mt-1 ${trendType === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {trendType === 'up' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                        {trend}% {trendType === 'up' ? 'Increase' : 'Decrease'}
                    </div>
                }
            </Col>
        </Row>
    </Card>
);

const RatingStars = ({ rating }) => (
    <Card bordered className="h-full shadow flex flex-col justify-center items-center hover:shadow-lg">
        <Tooltip title="Average customer rating">
            <div className="mb-2 text-gray-500">Average Rating</div>
            <Rate disabled value={rating} allowHalf />
            <span className="ml-2 text-base font-semibold text-yellow-600">{rating?.toFixed(2) ?? 0}</span>
        </Tooltip>
    </Card>
);

const ChartCard = ({ title, data, yLabel = "Revenue (USD)" }) => (
    <Card bordered title={title} className="shadow h-full" bodyStyle={{ height: 350 }}>
        {(!data || data.length === 0) ? (
            <Empty description="No revenue data available" />
        ) : (
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 10 }} />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={3} activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        )}
    </Card>
);

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00c49f', '#ff6384'];

const PaymentPieChart = ({ data, loading }) => {
    const [view, setView] = useState('pie'); // 'pie' | 'bar' | 'table'

    return (
        <Card
            title="Revenue by Payment Method"
            className="shadow h-full"
            style={{ minHeight: 350 }}
            extra={
                <Space>
                    <Button
                        type={view === 'pie' ? 'primary' : 'default'}
                        size="small"
                        onClick={() => setView('pie')}
                    >
                        Pie
                    </Button>
                    <Button
                        type={view === 'bar' ? 'primary' : 'default'}
                        size="small"
                        onClick={() => setView('bar')}
                    >
                        Bar
                    </Button>
                    <Button
                        type={view === 'table' ? 'primary' : 'default'}
                        size="small"
                        onClick={() => setView('table')}
                    >
                        Table
                    </Button>
                </Space>
            }
        >
            {loading ? (
                <div style={{ padding: 60, textAlign: 'center' }}>Loading...</div>
            ) : (!data || data.length === 0) ? (
                <Empty description="No payment method data available" />
            ) : (
                <>
                    {view === 'pie' && (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={data}
                                    dataKey="value"
                                    nameKey="method"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#8884d8"
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                    {data.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Legend />
                                <RechartsTooltip formatter={(value) => `$${value.toLocaleString()}`} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                    {view === 'bar' && (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="method" />
                                <YAxis />
                                <Legend />
                                <RechartsTooltip formatter={(value) => `$${value.toLocaleString()}`} />
                                <Bar dataKey="value" fill="#8884d8">
                                    {data.map((_, index) => (
                                        <Cell key={`cell-bar-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                    {view === 'table' && (
                        <div style={{ padding: 24 }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Payment Method</th>
                                        <th style={{ textAlign: 'right', padding: 8, borderBottom: '1px solid #eee' }}>Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((item, idx) => (
                                        <tr key={item.method}>
                                            <td style={{ padding: 8 }}>{item.method}</td>
                                            <td style={{ padding: 8, textAlign: 'right', fontWeight: 600, color: COLORS[idx % COLORS.length] }}>
                                                ${item.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </Card>
    );
};

const VendorDashboardPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { dashboard,
        vendorOrders,
        vendorTopSellingProducts,
        vendorTopSellingProductsLoading,
        vendorRevenueByPaymentMethod,
        vendorRevenueByPaymentMethodLoading,
        loading,
        error
    } = useSelector((state) => state.vendors);
    const { user } = useSelector(state => state.auth);

    useEffect(() => {
        dispatch(fetchVendorDashboard());
        dispatch(fetchVendorOrders({ vendorId: user ? user.id : localStorage.getItem("userId"), pageNumber: 1, pageSize: 5 }));
        dispatch(fetchVendorTopSellingProducts({ vendorId: user ? user.id : localStorage.getItem("userId") }));
        dispatch(fetchVendorRevenueByPaymentMethod());
    }, [dispatch, user]);

    useEffect(() => {
        if (error) {
            ToastNotifier.error('Operation Failed', error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    // Always fetch regardless of fulfilled state (fixes refresh bug)
    const handleRefresh = () => {
        dispatch(fetchVendorDashboard()).then((result) => {
            if (!result.error) {
                ToastNotifier.success('Dashboard Refreshed', 'Vendor dashboard data fetched successfully.');
            } else {
                ToastNotifier.error('Failed to refresh', result.error?.message || 'Unknown error');
            }
        });
        dispatch(fetchVendorOrders({ vendorId: user ? user.id : localStorage.getItem("userId"), pageNumber: 1, pageSize: 5 }));
        dispatch(fetchVendorTopSellingProducts({ vendorId: user ? user.id : localStorage.getItem("userId") }));
        dispatch(fetchVendorRevenueByPaymentMethod());
    };

    // Prepare revenue trend data
    const revenueTrendData = (dashboard?.revenueTrend || []).map(item => ({
        month: item.month,
        amount: item.amount,
    }));

    const ordersWeekTrend = dashboard?.ordersWeekTrend;
    const ordersMonthTrend = dashboard?.ordersMonthTrend;
    const revenueTrend = dashboard?.revenueTrendPercent;

    // Prepare payment methods chart data
    const pieChartData = (vendorRevenueByPaymentMethod || []).map(pm => ({
        method: pm.paymentMethod,
        value: pm.revenue
    }));

    if (loading) {
        return <LoadingSpinner text="Loading dashboard data..." />;
    }

    if (!dashboard) {
        return <Empty description="No dashboard data available" />;
    }

    const recentOrders = vendorOrders?.items || [];

    console.log(recentOrders);
    

    return (
        <div className="p-6 min-h-screen">
            <PageHeader
                title="Vendor Dashboard"
                subtitle="Overview of your business performance"
                actions={
                    <Button
                        type="primary"
                        onClick={handleRefresh}
                    >
                        Refresh
                    </Button>
                }
            />
            {/* Quick Actions */}
            <Card style={{ margin: "12px 0" }}>
                <Row gutter={[16, 16]}>
                    <Col>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/vendor/menu/add')}>
                            Add New Product
                        </Button>
                    </Col>
                    <Col>
                        <Button icon={<UnorderedListOutlined />} onClick={() => navigate('/vendor/orders')}>
                            View Orders
                        </Button>
                    </Col>
                    <Col>
                        <Button icon={<StarFilled />} onClick={() => navigate('/vendor/ratings')}>
                            Respond to Reviews
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* KPI Cards */}
            <Row gutter={[24, 24]} className="mb-8">
                <Col xs={24} sm={12} md={6}>
                    <StatsCard
                        title="Orders This Week"
                        value={dashboard?.ordersThisWeek || 0}
                        suffix="orders"
                        trend={ordersWeekTrend?.trend}
                        trendType={ordersWeekTrend?.type}
                        color="#e6f7ff"
                        icon={<ShoppingCartOutlined style={{ color: '#1890ff', fontSize: 24 }} />}
                    />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <StatsCard
                        title="Orders This Month"
                        value={dashboard?.ordersThisMonth || 0}
                        suffix="orders"
                        trend={ordersMonthTrend?.trend}
                        trendType={ordersMonthTrend?.type}
                        color="#fffbe6"
                        icon={<ShoppingCartOutlined style={{ color: '#faad14', fontSize: 24 }} />}
                    />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <StatsCard
                        title="Current Revenue"
                        value={dashboard?.currentRevenue || 0}
                        suffix="USD"
                        trend={revenueTrend?.trend}
                        trendType={revenueTrend?.type}
                        color="#f6ffed"
                        icon={<DollarCircleOutlined style={{ color: '#52c41a', fontSize: 24 }} />}
                    />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <RatingStars rating={dashboard?.averageRating || 0} />
                </Col>
            </Row>

            <Divider />

            {/* Main Visualization Row */}
            <Row gutter={[24, 24]} className="mb-8">
                <Col xs={24} lg={12}>
                    <ChartCard title="Revenue Trend" data={revenueTrendData} />
                </Col>
                <Col xs={24} lg={12}>
                    <PaymentPieChart data={pieChartData} loading={vendorRevenueByPaymentMethodLoading} />
                </Col>
            </Row>

            <Row gutter={[24, 24]}>
                {/* Recent Orders */}
                <Col xs={24} lg={12}>
                    <Card title="Recent Orders" className="shadow h-full">
                        <Row gutter={[16, 16]}>
                            {recentOrders.length === 0 && (
                                <Col span={24}>
                                    <Empty description="No recent orders" />
                                </Col>
                            )}
                            {recentOrders.map(order => (
                                <Col xs={24} sm={12} key={order.id}>
                                    <Card
                                        size="small"
                                        className="order-card"
                                        style={{ height: '100%', padding: '16px' }}
                                        title={
                                            <div className="flex items-center justify-between">
                                                <span className="font-mono text-xs">#{order.id}</span>
                                                <Tag
                                                    color={
                                                        order.status === "Completed" ? "green"
                                                            : order.status === "Pending" ? "orange"
                                                                : order.status === "Cancelled" ? "red"
                                                                    : "blue"
                                                    }
                                                    style={{ fontWeight: 'bold' }}
                                                >
                                                    {order.status}
                                                </Tag>
                                            </div>
                                        }
                                        extra={
                                            <span className="font-bold text-green-600">
                                                ${order.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        }
                                    >
                                        <div className="text-gray-500 text-xs mb-1">
                                            {new Date(order.orderDate).toLocaleString()}
                                        </div>
                                        <div>
                                            <b>Products:</b>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                                                {(order.orderProducts || []).map(p => (
                                                    <Tag key={p.productId} color="blue" style={{ marginBottom: 4 }}>
                                                        {p.nameEn} ×{p.quantity}
                                                    </Tag>
                                                ))}
                                            </div>
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Card>
                </Col>
                {/* Top Selling Products */}
                <Col xs={24} lg={12}>
                    <Card bordered title="Top-Selling Products" className="shadow h-full">
                        {vendorTopSellingProductsLoading ? (
                            <div style={{ padding: '30px 0', textAlign: 'center' }}>
                                <span>Loading...</span>
                            </div>
                        ) : vendorTopSellingProducts.length === 0 ? (
                            <div style={{ padding: '30px 0', textAlign: 'center' }}>
                                <span>No top-selling products</span>
                            </div>
                        ) : (
                            <List
                                itemLayout="horizontal"
                                dataSource={vendorTopSellingProducts}
                                renderItem={product => (
                                    <List.Item style={{ alignItems: 'flex-start', paddingTop: 12, paddingBottom: 12 }}>
                                        <List.Item.Meta
                                            title={
                                                <div>
                                                    <span style={{ fontWeight: 600, fontSize: 16 }}>{product.nameEn}</span>
                                                    <span style={{ color: '#888', fontSize: 13, marginLeft: 10 }}>{product.nameAr}</span>
                                                </div>
                                            }
                                            description={
                                                <div style={{ marginTop: 6 }}>
                                                    <span style={{ marginRight: 16 }}>
                                                        <Tag color="blue" style={{ fontSize: 14 }}>
                                                            Sold: <b>{product.sold}</b>
                                                        </Tag>
                                                    </span>
                                                    <span>
                                                        <Tag color="green" style={{ fontSize: 14 }}>
                                                            Revenue: <b>${product.revenue?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</b>
                                                        </Tag>
                                                    </span>
                                                </div>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default VendorDashboardPage;
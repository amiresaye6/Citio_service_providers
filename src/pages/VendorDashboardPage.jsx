import React, { useState, useEffect } from 'react';
import { Card, Statistic, Rate, Button, Row, Col } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import PageHeader from '../components/common/PageHeader';
import TableWrapper from '../components/common/TableWrapper';
import ToastNotifier from '../components/common/ToastNotifier';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Placeholder StatsCard component
const StatsCard = ({ title, value, suffix }) => (
    <Card className="shadow">
        <Statistic title={title} value={value} suffix={suffix} />
    </Card>
);

// Placeholder ChartCard component
const ChartCard = ({ title, data }) => (
    <Card title={title} className="shadow">
        <LineChart width={500} height={300} data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>
    </Card>
);

// Placeholder RatingStars component
const RatingStars = ({ rating }) => (
    <Card className="shadow">
        <div className="flex items-center">
            <span className="mr-2">Average Rating:</span>
            <Rate disabled defaultValue={rating} allowHalf />
            <span className="ml-2">({rating.toFixed(1)})</span>
        </div>
    </Card>
);

const VendorDashboardPage = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fake dashboard data (replace with API call in a real app)
    const fakeDashboardData = {
        totalOrdersWeek: 25,
        totalOrdersMonth: 100,
        currentRevenue: 2450.75,
        averageRating: 4.2,
        topSellingItems: [
            { id: '1', name: 'Cheeseburger', sales: 50 },
            { id: '2', name: 'Margherita Pizza', sales: 30 },
            { id: '3', name: 'Caesar Salad', sales: 20 },
        ],
        recentOrders: [
            {
                id: '1',
                orderId: 'ORD001',
                customer: 'John Doe',
                amount: 45.99,
                status: 'active',
                date: '2025-04-18',
            },
            {
                id: '2',
                orderId: 'ORD002',
                customer: 'Jane Smith',
                amount: 89.50,
                status: 'pending',
                date: '2025-04-17',
            },
        ],
        revenueTrend: [
            { name: 'Jan', value: 400 },
            { name: 'Feb', value: 300 },
            { name: 'Mar', value: 600 },
            { name: 'Apr', value: 800 },
        ],
    };

    // Simulate fetching dashboard data
    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setDashboardData(fakeDashboardData);
            setLoading(false);
            ToastNotifier.success('Dashboard Loaded', 'Vendor dashboard data fetched successfully.');
        }, 1000);
    }, []);

    // Table columns for recent orders
    const orderColumns = [
        { title: 'Order ID', dataIndex: 'orderId', key: 'orderId' },
        { title: 'Customer', dataIndex: 'customer', key: 'customer' },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => `$${amount.toFixed(2)}`,
        },
        { title: 'Date', dataIndex: 'date', key: 'date' },
    ];

    // Table columns for top-selling items
    const itemColumns = [
        { title: 'Item Name', dataIndex: 'name', key: 'name' },
        { title: 'Sales', dataIndex: 'sales', key: 'sales' },
    ];

    if (loading || !dashboardData) {
        return <LoadingSpinner text="Loading dashboard data..." />;
    }

    return (
        <div className="p-6 min-h-screen">
            <PageHeader
                title="Vendor Dashboard"
                subtitle="Overview of your business performance"
                actions={
                    <Button
                        type="primary"
                        onClick={() => ToastNotifier.info('Refresh', 'Dashboard data refreshed.')}
                    >
                        Refresh
                    </Button>
                }
            />

            {/* KPIs */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} lg={6}>
                    <StatsCard
                        title="Orders This Week"
                        value={dashboardData.totalOrdersWeek}
                        suffix="orders"
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatsCard
                        title="Orders This Month"
                        value={dashboardData.totalOrdersMonth}
                        suffix="orders"
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatsCard
                        title="Current Revenue"
                        value={dashboardData.currentRevenue}
                        suffix="USD"
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <RatingStars rating={dashboardData.averageRating} />
                </Col>
            </Row>

            {/* Revenue Trend Chart */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} lg={12}>
                    <ChartCard title="Revenue Trend" data={dashboardData.revenueTrend} />
                </Col>
            </Row>

            {/* Top-Selling Items and Recent Orders */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card title="Top-Selling Items" className="shadow">
                        <TableWrapper
                            dataSource={dashboardData.topSellingItems}
                            columns={itemColumns}
                            pagination={false}
                            rowKey="id"
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Recent Orders" className="shadow">
                        <TableWrapper
                            dataSource={dashboardData.recentOrders}
                            columns={orderColumns}
                            pagination={false}
                            rowKey="id"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default VendorDashboardPage;
import React, { useEffect } from 'react';
import { Card, Statistic, Rate, Button, Row, Col, Empty } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVendorDashboard, clearError } from '../redux/slices/vendorsSlice';
import PageHeader from '../components/common/PageHeader';
import ToastNotifier from '../components/common/ToastNotifier';
import LoadingSpinner from '../components/common/LoadingSpinner';

// StatsCard component
const StatsCard = ({ title, value, suffix }) => (
    <Card className="shadow">
        <Statistic title={title} value={value} suffix={suffix} />
    </Card>
);

// ChartCard component
const ChartCard = ({ title, data }) => {
    if (!data || data.length === 0) {
        return (
            <Card title={title} className="shadow">
                <Empty description="No revenue data available" />
            </Card>
        );
    }

    return (
        <Card title={title} className="shadow">
            <LineChart width={500} height={300} data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
        </Card>
    );
};

// RatingStars component
const RatingStars = ({ rating }) => (
    <Card className="shadow">
        <div className="flex items-center">
            <span className="mr-2">Average Rating:</span>
            <Rate disabled value={rating} allowHalf />
            <span className="ml-2">({rating.toFixed(1)})</span>
        </div>
    </Card>
);

const VendorDashboardPage = () => {
    const dispatch = useDispatch();
    const { dashboard, loading, error } = useSelector((state) => state.vendors);

    // Fetch dashboard data
    useEffect(() => {
        dispatch(fetchVendorDashboard());
    }, [dispatch]);

    // Handle errors
    useEffect(() => {
        if (error) {
            console.error('Operation Failed', error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    // Handle refresh
    const handleRefresh = () => {
        dispatch(fetchVendorDashboard()).then((result) => {
            if (result.meta.requestStatus === 'fulfilled') {
                ToastNotifier.success('Dashboard Refreshed', 'Vendor dashboard data fetched successfully.');
            }
        });
    };

    if (loading) {
        return <LoadingSpinner text="Loading dashboard data..." />;
    }

    if (!dashboard) {
        return <Empty description="No dashboard data available" />;
    }

    // Map revenueTrend for chart
    const revenueTrendData = (dashboard.revenueTrend || []).map((item) => ({
        month: item.month,
        amount: item.amount,
    }));

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

            {/* KPIs */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} lg={6}>
                    <StatsCard
                        title="Orders This Week"
                        value={dashboard.ordersThisWeek || 0}
                        suffix="orders"
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatsCard
                        title="Orders This Month"
                        value={dashboard.ordersThisMonth || 0}
                        suffix="orders"
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatsCard
                        title="Current Revenue"
                        value={dashboard.currentRevenue || 0}
                        suffix="USD"
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <RatingStars rating={dashboard.averageRating || 0} />
                </Col>
            </Row>

            {/* Revenue Trend Chart */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} lg={12}>
                    <ChartCard title="Revenue Trend" data={revenueTrendData} />
                </Col>
            </Row>
        </div>
    );
};

export default VendorDashboardPage;
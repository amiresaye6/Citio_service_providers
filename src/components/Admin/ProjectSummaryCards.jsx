import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin } from 'antd';
import {
    ShoppingCartOutlined,
    DollarCircleOutlined,
    UsergroupAddOutlined,
    ShopOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { useSelector } from 'react-redux';

const ProjectSummaryCards = () => {
    const [summaryData, setSummaryData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = useSelector(state => state.auth.token);

    useEffect(() => {
        const fetchSummaryData = async () => {
            try {
                setLoading(true);
                const response = await axios.get('https://service-provider.runasp.net/api/Admin/project-summary', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setSummaryData(response.data);
            } catch (err) {
                setError('Failed to load project summary data');
                console.error('Error fetching project summary:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSummaryData();
    }, [token]);

    if (loading) {
        return (
            <div className="p-6 bg-gray-50 rounded-xl shadow-md flex justify-center items-center" style={{ minHeight: '200px' }}>
                <Spin size="large" tip="Loading project summary..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-gray-50 rounded-xl shadow-md">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 rounded-xl shadow-md">
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Orders"
                            value={summaryData?.totalOrders || 0}
                            prefix={<ShoppingCartOutlined style={{ color: '#1890ff' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Revenue"
                            value={summaryData?.totalRevenue || 0}
                            precision={2}
                            prefix={<DollarCircleOutlined style={{ color: '#52c41a' }} />}
                            suffix="USD"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Users"
                            value={summaryData?.totalUsers || 0}
                            prefix={<UsergroupAddOutlined style={{ color: '#722ed1' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Vendors"
                            value={summaryData?.totalVendors || 0}
                            prefix={<ShopOutlined style={{ color: '#fa8c16' }} />}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ProjectSummaryCards;
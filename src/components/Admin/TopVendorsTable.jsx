import { useState, useEffect } from 'react';
import { Table, Typography, Spin, Empty } from 'antd';
import { StarOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useSelector } from 'react-redux';

const { Title } = Typography;

const TopVendorsTable = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = useSelector(state => state.auth.token);

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                setLoading(true);
                const response = await axios.get('https://service-provider.runasp.net/api/Admin/top-vendors', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                // Transform totalRevenue to revenue
                const transformedData = response.data.map(vendor => ({
                    ...vendor,
                    revenue: vendor.totalRevenue
                }));
                setVendors(transformedData);
                setError(null);
            } catch (err) {
                setError('Failed to load vendors data');
                console.error('Error fetching top vendors:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchVendors();
    }, [token]);

    return (
        <div className="w-full p-4 bg-white rounded shadow">
            <div className="flex items-center mb-4">
                <StarOutlined className="text-yellow-500 text-2xl mr-2" />
                <Title level={4} style={{ margin: 0 }}>
                    Top 15 Vendors by Revenue
                </Title>
            </div>

            {loading ? (
                <div className="flex justify-center items-center p-8">
                    <Spin size="large" tip="Loading vendors data..." />
                </div>
            ) : error ? (
                <div className="text-red-500 p-4">{error}</div>
            ) : vendors.length === 0 ? (
                <Empty description="No vendor data available" />
            ) : (
                <Table
                    dataSource={vendors}
                    rowKey="vendorId"
                    pagination={false}
                    defaultSortOrder="descend"
                    defaultSortField="revenue"
                >
                    <Table.Column
                        title="Vendor ID"
                        dataIndex="vendorId"
                        key="vendorId"
                        sorter={(a, b) => a.vendorId.localeCompare(b.vendorId)}
                    />
                    <Table.Column
                        title="Business Name"
                        dataIndex="businessName"
                        key="businessName"
                        sorter={(a, b) => a.businessName?.localeCompare(b.businessName) || 0}
                        render={(businessName) => businessName || 'N/A'}
                    />
                    <Table.Column
                        title="Revenue"
                        dataIndex="revenue"
                        key="revenue"
                        defaultSortOrder="descend"
                        sorter={(a, b) => a.revenue - b.revenue}
                        render={(revenue) => `$${revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    />
                </Table>
            )}
        </div>
    );
};

export default TopVendorsTable;
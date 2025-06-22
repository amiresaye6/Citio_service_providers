import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
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
    Alert,
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
    ArrowLeftOutlined,
    ShoppingCartOutlined,
    DollarCircleOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    CreditCardOutlined,
    TruckOutlined,
    // PackageOutlined
} from '@ant-design/icons';
import {
    fetchOrderById,
    clearOrderDetails,
    clearError
} from '../redux/slices/adminSlice';
import PageHeader from '../components/common/PageHeader';
import ToastNotifier from '../components/common/ToastNotifier';

const { Text, Title } = Typography;

const OrderDetailsPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const {
        orderDetails,
        orderDetailsLoading,
        orderDetailsError
    } = useSelector((state) => state.admin);

    useEffect(() => {
        if (orderId) {
            dispatch(fetchOrderById(orderId));
        }

        // Cleanup on unmount
        return () => {
            dispatch(clearOrderDetails());
        };
    }, [dispatch, orderId]);

    useEffect(() => {
        if (orderDetailsError) {
            ToastNotifier.error('Failed to load order details', orderDetailsError);
            dispatch(clearError());
        }
    }, [orderDetailsError, dispatch]);

    const handleGoBack = () => {
        navigate('/admin/orders');
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
            case 'delivered':
                return 'green';
            case 'pending':
            case 'processing':
                return 'orange';
            case 'shipped':
                return 'blue';
            case 'failed':
            case 'cancelled':
                return 'red';
            default:
                return 'default';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
            case 'delivered':
                return <CheckCircleOutlined />;
            case 'pending':
            case 'processing':
                return <ClockCircleOutlined />;
            case 'shipped':
                return <TruckOutlined />;
            case 'failed':
            case 'cancelled':
                return <CloseCircleOutlined />;
            default:
                return <ClockCircleOutlined />;
        }
    };

    const productColumns = [
        {
            title: 'Product ID',
            dataIndex: 'productId',
            key: 'productId',
            width: 100,
            render: (id) => <Text code className="text-xs">{id}</Text>
        },
        {
            title: 'Product Name (English)',
            dataIndex: 'nameEn',
            key: 'nameEn',
            width: 200,
        },
        {
            title: 'Product Name (Arabic)',
            dataIndex: 'nameAr',
            key: 'nameAr',
            width: 200,
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            width: 100,
            render: (price) => (
                <Text strong className="text-green-600">
                    ${price?.toFixed(2)}
                </Text>
            )
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 80,
            render: (quantity) => (
                <Tag color="blue">{quantity}</Tag>
            )
        },
        {
            title: 'Total',
            key: 'total',
            width: 100,
            render: (_, record) => (
                <Text strong className="text-purple-600">
                    ${((record.price || 0) * (record.quantity || 0)).toFixed(2)}
                </Text>
            )
        }
    ];

    if (orderDetailsLoading) {
        return (
            <div className="p-4 md:p-6 min-h-screen">
                <PageHeader
                    title="Order Details"
                    subtitle="Loading order information..."
                    actions={
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={handleGoBack}
                        >
                            Back to Orders
                        </Button>
                    }
                />
                <div className="flex items-center justify-center py-12">
                    <Spin size="large" />
                </div>
            </div>
        );
    }

    if (orderDetailsError || !orderDetails) {
        return (
            <div className="p-4 md:p-6 min-h-screen">
                <PageHeader
                    title="Order Details"
                    subtitle="View order information"
                    actions={
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={handleGoBack}
                        >
                            Back to Orders
                        </Button>
                    }
                />
                <Alert
                    message="Error Loading Order"
                    description="Unable to load order details. Please try again."
                    type="error"
                    showIcon
                    action={
                        <Button size="small" onClick={() => dispatch(fetchOrderById(orderId))}>
                            Retry
                        </Button>
                    }
                />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 min-h-screen">
            <PageHeader
                title="Order Details"
                subtitle={`Order #${orderDetails.id} - ${orderDetails.status}`}
                actions={
                    <Space>
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={handleGoBack}
                        >
                            Back to Orders
                        </Button>
                    </Space>
                }
            />

            {/* Order Overview Section */}
            <Row gutter={[24, 24]} className="mb-6">
                {/* Order Summary Card */}
                <Col xs={24} lg={8}>
                    <Card className="text-center">
                        <div className="mb-4">
                            <ShoppingCartOutlined 
                                style={{ fontSize: '48px', color: '#1890ff' }}
                                className="mb-4"
                            />
                        </div>

                        <h2 className="text-xl font-semibold mb-2">
                            Order #{orderDetails.id}
                        </h2>

                        <div className="mb-4">
                            <Tag
                                icon={getStatusIcon(orderDetails.status)}
                                color={getStatusColor(orderDetails.status)}
                                className="px-3 py-1 text-sm"
                            >
                                {orderDetails.status}
                            </Tag>
                        </div>

                        <Divider />

                        <Space direction="vertical" className="w-full">
                            <div className="flex items-center justify-center text-gray-600">
                                <CalendarOutlined className="mr-2" />
                                <span className="text-sm">
                                    {new Date(orderDetails.orderDate).toLocaleDateString()} at{' '}
                                    {new Date(orderDetails.orderDate).toLocaleTimeString()}
                                </span>
                            </div>
                            <div className="flex items-center justify-center text-gray-600">
                                <DollarCircleOutlined className="mr-2" />
                                <span className="text-lg font-semibold text-green-600">
                                    ${orderDetails.totalAmount.toFixed(2)}
                                </span>
                            </div>
                        </Space>
                    </Card>

                    {/* Order Stats Card */}
                    <Card title="Order Statistics" style={{ marginTop: "28px" }}>
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {orderDetails.products?.length || 0}
                                    </div>
                                    <div className="text-sm text-gray-500">Products</div>
                                </div>
                            </Col>
                            <Col span={12}>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {orderDetails.products?.reduce((sum, p) => sum + (p.quantity || 0), 0) || 0}
                                    </div>
                                    <div className="text-sm text-gray-500">Total Items</div>
                                </div>
                            </Col>
                            <Col span={24}>
                                <Divider style={{ margin: '12px 0' }} />
                                <div className="text-center">
                                    <div className="text-xl font-bold text-purple-600">
                                        ${orderDetails.totalAmount.toFixed(2)}
                                    </div>
                                    <div className="text-sm text-gray-500">Total Amount</div>
                                </div>
                            </Col>
                        </Row>
                    </Card>
                </Col>

                {/* Order Details Card */}
                <Col xs={24} lg={16}>
                    <Card>
                        <Title level={4} className="mb-4">
                            <ShoppingCartOutlined className="mr-2" />
                            Order Information
                        </Title>
                        <Descriptions
                            bordered
                            column={1}
                            size="medium"
                        >
                            <Descriptions.Item label="Order ID">
                                <Text code copyable className="text-xs">
                                    {orderDetails.id}
                                </Text>
                            </Descriptions.Item>

                            <Descriptions.Item label="Total Amount">
                                <Text strong className="text-green-600 text-lg">
                                    ${orderDetails.totalAmount.toFixed(2)}
                                </Text>
                            </Descriptions.Item>

                            <Descriptions.Item label="Order Date">
                                {new Date(orderDetails.orderDate).toLocaleDateString()} at{' '}
                                {new Date(orderDetails.orderDate).toLocaleTimeString()}
                            </Descriptions.Item>

                            <Descriptions.Item label="Order Status">
                                <Tag
                                    icon={getStatusIcon(orderDetails.status)}
                                    color={getStatusColor(orderDetails.status)}
                                >
                                    {orderDetails.status}
                                </Tag>
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>
            </Row>

            {/* Payment Information Section */}
            {orderDetails.payment && (
                <Card className="mb-6">
                    <Title level={4} className="mb-4">
                        <CreditCardOutlined className="mr-2" />
                        Payment Information
                    </Title>
                    <Row gutter={[24, 16]}>
                        <Col xs={12} sm={8}>
                            <Statistic
                                title="Payment Amount"
                                value={orderDetails.payment.amount}
                                prefix="$"
                                precision={2}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Col>
                        <Col xs={12} sm={8}>
                            <Statistic
                                title="Payment Status"
                                value={orderDetails.payment.status}
                                valueRender={() => (
                                    <Tag
                                        icon={getStatusIcon(orderDetails.payment.status)}
                                        color={getStatusColor(orderDetails.payment.status)}
                                    >
                                        {orderDetails.payment.status}
                                    </Tag>
                                )}
                            />
                        </Col>
                        <Col xs={24} sm={8}>
                            <Statistic
                                title="Transaction Date"
                                value={new Date(orderDetails.payment.transactionDate).toLocaleDateString()}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Col>
                    </Row>
                </Card>
            )}

            {/* Shipping Information Section */}
            {orderDetails.shipping && (
                <Card className="mb-6">
                    <Title level={4} className="mb-4">
                        <TruckOutlined className="mr-2" />
                        Shipping Information
                    </Title>
                    <Row gutter={[24, 16]}>
                        <Col xs={12} sm={12}>
                            <Statistic
                                title="Shipping Status"
                                value={orderDetails.shipping.status}
                                valueRender={() => (
                                    <Tag
                                        icon={getStatusIcon(orderDetails.shipping.status)}
                                        color={getStatusColor(orderDetails.shipping.status)}
                                    >
                                        {orderDetails.shipping.status}
                                    </Tag>
                                )}
                            />
                        </Col>
                        <Col xs={12} sm={12}>
                            <Statistic
                                title="Estimated Delivery"
                                value={new Date(orderDetails.shipping.estimatedDeliveryDate).toLocaleDateString()}
                                valueStyle={{ color: '#722ed1' }}
                            />
                        </Col>
                    </Row>
                </Card>
            )}

            {/* Products Section - Full Width */}
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <Title level={4} className="mb-0">
                        <DollarCircleOutlined className="mr-2" />
                        {/* <PackageOutlined className="mr-2" /> */}
                        Products ({orderDetails.products?.length || 0})
                    </Title>
                </div>

                {!orderDetails.products || orderDetails.products.length === 0 ? (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="No products found in this order"
                    />
                ) : (
                    <Table
                        dataSource={orderDetails.products}
                        columns={productColumns}
                        rowKey="productId"
                        pagination={false}
                        scroll={{ x: 'max-content' }}
                        summary={(pageData) => {
                            const totalAmount = pageData.reduce(
                                (sum, record) => sum + ((record.price || 0) * (record.quantity || 0)), 
                                0
                            );
                            const totalQuantity = pageData.reduce(
                                (sum, record) => sum + (record.quantity || 0), 
                                0
                            );
                            
                            return (
                                <Table.Summary.Row style={{ backgroundColor: '#fafafa' }}>
                                    <Table.Summary.Cell index={0} colSpan={3}>
                                        <Text strong>Totals</Text>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={3}>
                                        <Text strong>-</Text>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={4}>
                                        <Tag color="blue" className="font-bold">
                                            {totalQuantity}
                                        </Tag>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={5}>
                                        <Text strong className="text-purple-600">
                                            ${totalAmount.toFixed(2)}
                                        </Text>
                                    </Table.Summary.Cell>
                                </Table.Summary.Row>
                            );
                        }}
                    />
                )}
            </Card>
        </div>
    );
};

export default OrderDetailsPage;
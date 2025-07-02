import React, { useEffect, useState, useMemo } from 'react';
import {
  Table, Card, Button, Input, Tag, Space, Dropdown, Menu,
  Typography, Spin, message, Select, DatePicker, Modal, List,
  Row, Col, Drawer, Descriptions, Divider, Empty, Badge,
  Avatar, Tabs,
  Pagination
} from 'antd';
import {
  ReloadOutlined, MoreOutlined,
  CheckCircleOutlined, CarOutlined, CoffeeOutlined,
  EyeOutlined, EditOutlined, ExclamationCircleOutlined,
  MenuOutlined, FilterOutlined, CalendarOutlined,
  CloseOutlined, DollarOutlined, ShoppingOutlined,
  SyncOutlined, StopOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVendorOrders, updateOrderStatus, clearVendorOrdersError, updateFilters, clearFilters, setSelectedOrder } from '../redux/slices/ordersSlice';
import { format } from 'date-fns';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

// Order status colors - for the update functionality
const OrderStatusColors = {
  'Preparing': 'blue',
  'OutForDelivery': 'orange',
  'Delivered': 'green'
};

// Status icon mapping - for the update functionality
const OrderStatusIcons = {
  'Preparing': <CoffeeOutlined />,
  'OutForDelivery': <CarOutlined />,
  'Delivered': <CheckCircleOutlined />
};

// Filter status colors - for filtering
const FilterStatusColors = {
  'Pending': '#faad14',
  'Processing': '#1890ff',
  'Shipped': '#722ed1',
  'Delivered': '#52c41a',
  'Cancelled': '#f5222d'
};

// Filter status icons - for filtering
const FilterStatusIcons = {
  'Pending': <SyncOutlined spin />,
  'Processing': <SyncOutlined />,
  'Shipped': <CarOutlined />,
  'Delivered': <CheckCircleOutlined />,
  'Cancelled': <StopOutlined />
};

const VendorOrdersPage = () => {
  const dispatch = useDispatch();
  const {
    vendorOrders,
    vendorOrdersLoading,
    vendorOrdersError,
    orderUpdateLoading,
    orderUpdateError,
    filters
  } = useSelector(state => state.orders);

  const { user } = useSelector(state => state.auth);

  // Responsive state
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Status update modal state
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [newStatus, setNewStatus] = useState(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  const vendorId = user?.id || localStorage.getItem("userId");

  // Current timestamp and user for logging (updated to the new timestamp)
  const currentTimestamp = '2025-06-30 21:09:28';
  const currentUser = 'amiresaye6';

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter orders by status for tabs
  const filteredOrders = useMemo(() => {
    if (!vendorOrders?.items) return [];
    if (activeTab === 'all') return vendorOrders.items;
    return vendorOrders.items.filter(order => order.status === activeTab);
  }, [vendorOrders.items, activeTab]);

  // Initial data fetch
  useEffect(() => {
    if (vendorId) {
      dispatch(fetchVendorOrders({
        vendorId,
        ...filters
      }));
    }
    // console.log(vendorOrders);
    
  }, [dispatch, vendorId, filters]);

  // Handle errors
  useEffect(() => {
    if (vendorOrdersError) {
      message.error(`Failed to load orders: ${vendorOrdersError.detail || 'Unknown error'}`);
      dispatch(clearVendorOrdersError());
    }
    if (orderUpdateError) {
      message.error(`Failed to update order: ${orderUpdateError.detail || 'Unknown error'}`);
    }
  }, [vendorOrdersError, orderUpdateError, dispatch]);

  // Handle pagination
  const handlePagination = (page, pageSize) => {
    dispatch(updateFilters({
      pageNumber: page,
      pageSize
    }));
  };

  // Handle status filter
  const handleStatusFilter = (statuses) => {
    dispatch(updateFilters({
      statuses,
      pageNumber: 0 // Reset to first page
    }));
  };

  // Handle date filter
  const handleDateFilter = (date) => {
    let dateFilter = null;
    if (date) {
      // Format date for API
      dateFilter = date.format('YYYY-MM-DD');
    }

    dispatch(updateFilters({
      dateFilter,
      pageNumber: 0 // Reset to first page
    }));
  };

  // Handle sort change
  const handleSortChange = (sorter) => {
    if (sorter.column) {
      dispatch(updateFilters({
        sortColumn: sorter.field,
        sortDirection: sorter.order === 'descend' ? 'desc' : 'asc'
      }));
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    dispatch(clearFilters());
    setActiveTab('all');
  };

  // Handle tab change
  const handleTabChange = (key) => {
    setActiveTab(key);
    if (key !== 'all') {
      dispatch(updateFilters({
        statuses: [key],
        pageNumber: 0
      }));
    } else {
      dispatch(updateFilters({
        statuses: [],
        pageNumber: 0
      }));
    }
  };

  // Handle order status update - show confirmation modal
  const handleOrderStatusUpdate = (order, status) => {
    console.log("update status", order, status);
    setUpdatingOrder(order);
    setNewStatus(status);
    setStatusModalVisible(true);
  };

  // Confirm order status update
  const confirmStatusUpdate = () => {
    if (!updatingOrder || !newStatus) return;

    setStatusUpdateLoading(true);

    dispatch(updateOrderStatus({
      orderId: updatingOrder.id,
      newStatus: newStatus
    })).then((resultAction) => {
      setStatusUpdateLoading(false);

      if (!resultAction.error) {
        message.success(`Order #${updatingOrder.id} status updated to ${newStatus}`);
        // Refresh the orders list
        dispatch(fetchVendorOrders({
          vendorId,
          ...filters
        }));
        // Close the modal
        setStatusModalVisible(false);
      } else {
        message.error("Failed to update order status");
      }
    }).catch(() => {
      setStatusUpdateLoading(false);
      message.error("Failed to update order status");
    });
  };

  // Cancel status update
  const cancelStatusUpdate = () => {
    setStatusModalVisible(false);
    setUpdatingOrder(null);
    setNewStatus(null);
  };

  // Handle order details view
  const handleViewOrderDetails = (order) => {
    setSelectedOrderDetails(order);
    setDrawerVisible(true);
    dispatch(setSelectedOrder(order));
  };

  // Format currency value
  const formatCurrency = (value) => `$${Number(value).toFixed(2)}`;

  // Get status tag based on status
  const getStatusTag = (status) => {
    // For display in the list/table
    if (FilterStatusColors[status]) {
      return (
        <Tag color={FilterStatusColors[status]} icon={FilterStatusIcons[status]}>
          {status}
        </Tag>
      );
    }

    // Fallback for any other status
    return (
      <Tag color="default">
        {status}
      </Tag>
    );
  };

  // Column definition for orders table
  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      render: id => <Text strong>#{id}</Text>,
      width: 100,
      sorter: true,
      sortDirections: ['descend', 'ascend'],
      sortOrder: filters.sortColumn === 'id' ? (filters.sortDirection === 'desc' ? 'descend' : 'ascend') : null,
      fixed: 'left'
    },
    {
      title: 'Date',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: date => format(new Date(date), 'MMM dd, yyyy HH:mm'),
      width: 180,
      sorter: true,
      sortDirections: ['descend', 'ascend'],
      sortOrder: filters.sortColumn === 'orderDate' ? (filters.sortDirection === 'desc' ? 'descend' : 'ascend') : null,
      responsive: ['md']
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => getStatusTag(status),
      width: 140,
      filters: Object.keys(FilterStatusColors).map(status => ({
        text: status,
        value: status
      })),
      filteredValue: filters.statuses,
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: amount => formatCurrency(amount),
      width: 110,
      sorter: true,
      sortDirections: ['descend', 'ascend'],
      sortOrder: filters.sortColumn === 'totalAmount' ? (filters.sortDirection === 'desc' ? 'descend' : 'ascend') : null
    },
    {
      title: 'Items',
      dataIndex: 'orderProducts',
      key: 'orderProducts',
      render: products => (
        <Badge count={products.length} style={{ backgroundColor: products.length > 0 ? '#1890ff' : '#ccc' }} />
      ),
      width: 80,
      responsive: ['lg']
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewOrderDetails(record)}
            title="View Details"
          />
          <Dropdown
            overlay={
              <Menu>
                {Object.keys(OrderStatusColors).map(status => (
                  <Menu.Item
                    key={status}
                    icon={OrderStatusIcons[status]}
                    onClick={() => handleOrderStatusUpdate(record, status)}
                    disabled={record.status === status || orderUpdateLoading}
                  >
                    {status}
                  </Menu.Item>
                ))}
              </Menu>
            }
            trigger={['click']}
            placement="bottomRight"
          >
            <Button
              icon={<EditOutlined />}
              size="small"
              title="Update Status"
            />
          </Dropdown>
        </Space>
      )
    }
  ];

  // Render mobile card view for orders
  const renderOrderCard = (order) => (
    <Card
      key={order.id}
      className="mb-4"
      style={{ borderRadius: '8px' }}
      actions={[
        <Button
          key="view"
          type="text"
          icon={<EyeOutlined />}
          onClick={() => handleViewOrderDetails(order)}
        >
          Details
        </Button>,
        <Dropdown
          key="update"
          overlay={
            <Menu>
              {Object.keys(OrderStatusColors).map(status => (
                <Menu.Item
                  key={status}
                  icon={OrderStatusIcons[status]}
                  onClick={() => handleOrderStatusUpdate(order, status)}
                  disabled={order.status === status}
                >
                  {status}
                </Menu.Item>
              ))}
            </Menu>
          }
          trigger={['click']}
          placement="bottomRight"
        >
          <Button type="text" icon={<EditOutlined />}>Update</Button>
        </Dropdown>
      ]}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <Text strong>Order #{order.id}</Text>
          <div className="text-xs text-gray-500">
            {format(new Date(order.orderDate), 'MMM dd, yyyy HH:mm')}
          </div>
        </div>
        {getStatusTag(order.status)}
      </div>

      <Divider style={{ margin: '12px 0' }} />

      <div className="flex justify-between">
        <div>
          <Text type="secondary">Items</Text>
          <div>
            <Badge
              count={order.orderProducts.length}
              style={{ backgroundColor: '#1890ff' }}
            /> {order.orderProducts.length} {order.orderProducts.length === 1 ? 'item' : 'items'}
          </div>
        </div>
        <div className="text-right">
          <Text type="secondary">Total</Text>
          <div className="font-semibold">{formatCurrency(order.totalAmount)}</div>
        </div>
      </div>
    </Card>
  );

  // Render order details in drawer
  const renderOrderDetails = () => {
    if (!selectedOrderDetails) return null;

    const { id, totalAmount, orderDate, status, orderProducts } = selectedOrderDetails;

    return (
      <>
        <div className="flex justify-between items-center mb-4">
          {getStatusTag(status)}

          <Text className="text-gray-500 text-sm">
            {format(new Date(orderDate), 'MMM dd, yyyy HH:mm')}
          </Text>
        </div>

        <Descriptions
          bordered
          column={1}
          size={isMobile ? "small" : "default"}
          className="mb-4"
        >
          <Descriptions.Item label="Order ID">#{id}</Descriptions.Item>
          <Descriptions.Item label="Total Amount">
            <Text strong>{formatCurrency(totalAmount)}</Text>
          </Descriptions.Item>
        </Descriptions>

        <Divider orientation="left">Order Items</Divider>

        <List
          itemLayout="horizontal"
          dataSource={orderProducts}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar
                    shape="square"
                    icon={<ShoppingOutlined />}
                    style={{ backgroundColor: '#f5f5f5', color: '#1890ff' }}
                  />
                }
                title={item.nameEn}
                description={
                  <Space>
                    <Tag>{item.quantity} × {formatCurrency(item.price)}</Tag>
                  </Space>
                }
              />
              <div className="font-semibold">
                {formatCurrency(Number(item.price) * item.quantity)}
              </div>
            </List.Item>
          )}
          className="mb-6"
        />

        <Card title="Update Status" size="small" className="mb-4">
          <div className="flex flex-wrap gap-2">
            {Object.keys(OrderStatusColors).map(newStatus => (
              <Button
                key={newStatus}
                type={status === newStatus ? "primary" : "default"}
                onClick={() => handleOrderStatusUpdate(selectedOrderDetails, newStatus)}
                disabled={status === newStatus || orderUpdateLoading}
                loading={status === newStatus && orderUpdateLoading}
                icon={OrderStatusIcons[newStatus]}
                size={isMobile ? "small" : "middle"}
              >
                {newStatus}
              </Button>
            ))}
          </div>
        </Card>

        <div className="mt-8 pt-4 border-t border-gray-200 text-gray-400 text-xs">
          <div>Viewed by: {currentUser}</div>
          <div>Access timestamp: {currentTimestamp}</div>
        </div>
      </>
    );
  };

  // Render filters panel for mobile
  const renderMobileFilters = () => (
    <Modal
      title="Filters"
      open={filtersVisible}
      onCancel={() => setFiltersVisible(false)}
      footer={[
        <Button key="reset" onClick={handleResetFilters}>
          Reset Filters
        </Button>,
        <Button key="apply" type="primary" onClick={() => setFiltersVisible(false)}>
          Apply
        </Button>
      ]}
    >
      <Space direction="vertical" className="w-full mb-4">

        <div>
          <Text strong className="block mb-1">Filter by Status</Text>
          <Select
            mode="multiple"
            placeholder="Select status"
            style={{ width: '100%' }}
            value={filters.statuses}
            onChange={handleStatusFilter}
            allowClear
          >
            {Object.keys(FilterStatusColors).map(status => (
              <Option key={status} value={status}>
                <Space>
                  {FilterStatusIcons[status]}
                  {status}
                </Space>
              </Option>
            ))}
          </Select>
        </div>

        <div>
          <Text strong className="block mb-1">Filter by Date</Text>
          <DatePicker
            onChange={handleDateFilter}
            allowClear
            placeholder="Select date"
            format="YYYY-MM-DD"
            value={filters.dateFilter ? moment(filters.dateFilter) : null}
            style={{ width: '100%' }}
          />
        </div>
      </Space>
    </Modal>
  );

  // Calculate counts for tabs
  const getStatusCounts = () => {
    if (!vendorOrders.items) return {};

    return vendorOrders.items.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, { all: vendorOrders.items.length });
  };

  const statusCounts = getStatusCounts();

  return (
    <div style={{ padding: isMobile ? '16px' : '24px', minHeight: '100vh' }}>
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        marginBottom: isMobile ? '16px' : '24px'
      }}>
        <div>
          <Title level={isMobile ? 3 : 2}>Orders Management</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: isMobile ? '8px' : '0' }}>
            View and manage your customer orders
          </Text>
        </div>

        <Space wrap style={{ marginTop: isMobile ? '8px' : '0' }}>
          {isMobile && (
            <Button
              icon={<FilterOutlined />}
              onClick={() => setFiltersVisible(true)}
            >
              Filters
            </Button>
          )}
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={() => dispatch(fetchVendorOrders({
              vendorId,
              ...filters
            }))}
            loading={vendorOrdersLoading}
          >
            Refresh
          </Button>
        </Space>
      </div>

      {/* Filters Section - Desktop and Tablet */}
      {!isMobile && (
        <Card style={{ marginBottom: '24px' }}>
          <Row gutter={[16, 16]} align="bottom">

            <Col xs={24} md={8} lg={6}>
              <Text strong style={{ display: 'block', marginBottom: '4px' }}>Filter by Status</Text>
              <Select
                mode="multiple"
                placeholder="Select status"
                style={{ width: '100%' }}
                value={filters.statuses}
                onChange={handleStatusFilter}
                allowClear
              >
                {Object.keys(FilterStatusColors).map(status => (
                  <Option key={status} value={status}>
                    <Space>
                      {FilterStatusIcons[status]}
                      {status}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Col>

            <Col xs={24} md={8} lg={6}>
              <Text strong style={{ display: 'block', marginBottom: '4px' }}>Filter by Date</Text>
              <DatePicker
                onChange={handleDateFilter}
                allowClear
                placeholder="Select date"
                format="YYYY-MM-DD"
                value={filters.dateFilter ? moment(filters.dateFilter) : null}
                style={{ width: '100%' }}
              />
            </Col>

            <Col xs={24} md={8} lg={6}>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleResetFilters}
              >
                Reset Filters
              </Button>
            </Col>
          </Row>

          <Divider style={{ margin: '16px 0' }} />

          <Row>
            <Col span={24}>
              <Space>
                <Text>
                  Showing {vendorOrders.items?.length || 0} of {vendorOrders.totalPages * filters.pageSize || 0} orders
                </Text>
                {filters.dateFilter && (
                  <Tag closable onClose={() => dispatch(updateFilters({ dateFilter: null }))}>
                    Date: {filters.dateFilter}
                  </Tag>
                )}
              </Space>
            </Col>
          </Row>
        </Card>
      )}

      {/* Status Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        style={{ marginBottom: '16px' }}
        type={isMobile ? "card" : "line"}
        size={isMobile ? "small" : "middle"}
      >
        <TabPane
          tab={
            <Badge count={statusCounts.all || 0} offset={[10, 0]}>
              <span>All Orders</span>
            </Badge>
          }
          key="all"
        />
        {Object.keys(FilterStatusColors).map(status => (
          <TabPane
            tab={
              <Badge count={statusCounts[status] || 0} offset={[10, 0]}>
                <Space>
                  {!isMobile && FilterStatusIcons[status]}
                  <span>{status}</span>
                </Space>
              </Badge>
            }
            key={status}
          />
        ))}
      </Tabs>

      {/* Orders List/Table */}
      <Card style={{ padding: isMobile ? 12 : 24 }}>
        {vendorOrdersLoading && !vendorOrders.items?.length ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '48px 0'
          }}>
            <Spin size="large" tip="Loading orders..." />
          </div>
        ) : vendorOrders.items?.length === 0 ? (
          <Empty
            description={
              <div>
                <p style={{ marginBottom: '8px' }}>No orders found</p>
                {(filters.statuses.length || filters.dateFilter) && (
                  <Button type="link" onClick={handleResetFilters}>
                    Clear filters
                  </Button>
                )}
              </div>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <>
            {isMobile ? (
              // Mobile Card View
              <div>
                {filteredOrders.map(renderOrderCard)}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: '16px'
                }}>
                  <Pagination
                    simple
                    current={(vendorOrders.pageNumber || 0)}
                    pageSize={filters.pageSize}
                    total={vendorOrders.totalPages * filters.pageSize}
                    onChange={handlePagination}
                  />
                </div>
              </div>
            ) : (
              // Desktop Table View
              <Table
                dataSource={filteredOrders}
                columns={columns}
                rowKey="id"
                loading={vendorOrdersLoading && vendorOrders.items?.length > 0}
                onChange={(pagination, filters, sorter) => handleSortChange(sorter)}
                pagination={{
                  current: (vendorOrders.pageNumber || 0), // API uses 0-based indexing
                  pageSize: filters.pageSize,
                  total: vendorOrders.totalPages * filters.pageSize,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '50'],
                  onChange: handlePagination,
                  showTotal: (total) => `Total ${total} orders`
                }}
                scroll={{ x: 800 }}
                size={isTablet ? "small" : "middle"}
              />
            )}
          </>
        )}
      </Card>

      {/* Custom Status Update Modal */}
      <Modal
        title={`Update Order Status`}
        open={statusModalVisible}
        onCancel={cancelStatusUpdate}
        footer={[
          <Button key="cancel" onClick={cancelStatusUpdate}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={statusUpdateLoading}
            onClick={confirmStatusUpdate}
          >
            Update Status
          </Button>,
        ]}
        width={windowWidth < 768 ? 320 : 420}
      >
        {updatingOrder && newStatus && (
          <div>
            <p>Are you sure you want to update this order's status?</p>

            <div style={{ margin: '16px 0', padding: '12px', background: '#f5f5f5', borderRadius: '4px' }}>
              <div>Order ID: <Text strong>#{updatingOrder.id}</Text></div>
              <div style={{ marginTop: '12px' }}>
                <div>From: <Tag color={OrderStatusColors[updatingOrder.status] || 'default'}>{updatingOrder.status}</Tag></div>
                <div style={{ marginTop: '8px' }}>To: <Tag color={OrderStatusColors[newStatus] || 'default'}>{newStatus}</Tag></div>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: '#888', marginTop: '16px' }}>
              <div>User: {currentUser}</div>
              <div>Date: {currentTimestamp}</div>
            </div>
          </div>
        )}
      </Modal>

      {/* Mobile Filters Modal */}
      {renderMobileFilters()}

      {/* Order Details Drawer */}
      <Drawer
        title={
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>Order #{selectedOrderDetails?.id}</span>
            <CloseOutlined onClick={() => setDrawerVisible(false)} />
          </div>
        }
        placement={isMobile ? "bottom" : "right"}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={isMobile ? "100%" : 420}
        height={isMobile ? "80%" : undefined}
        bodyStyle={{ paddingBottom: 80 }}
      >
        {renderOrderDetails()}
      </Drawer>
    </div>
  );
};

export default VendorOrdersPage;
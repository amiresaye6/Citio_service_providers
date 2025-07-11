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
import { useTranslation } from 'react-i18next';

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
  const { t, i18n } = useTranslation('vendorOrders');
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
  const direction = i18n.dir();
  const isRTL = direction === "rtl";

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
  }, [dispatch, vendorId, filters]);

  // Handle errors
  useEffect(() => {
    if (vendorOrdersError) {
      message.error(t('errors.loadOrdersFailed', { error: vendorOrdersError.detail || t('errors.unknown') }));
      dispatch(clearVendorOrdersError());
    }
    if (orderUpdateError) {
      message.error(t('errors.updateOrderFailed', { error: orderUpdateError.detail || t('errors.unknown') }));
    }
  }, [vendorOrdersError, orderUpdateError, dispatch, t]);

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

  // Get translated status
  const getTranslatedStatus = (status) => {
    return t(`status.${status.toLowerCase()}`, status);
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
        message.success(t('notifications.statusUpdated', { id: updatingOrder.id, status: getTranslatedStatus(newStatus) }));
        // Refresh the orders list
        dispatch(fetchVendorOrders({
          vendorId,
          ...filters
        }));
        // Close the modal
        setStatusModalVisible(false);
      } else {
        message.error(t('errors.updateStatusFailed'));
      }
    }).catch(() => {
      setStatusUpdateLoading(false);
      message.error(t('errors.updateStatusFailed'));
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
          {getTranslatedStatus(status)}
        </Tag>
      );
    }

    // Fallback for any other status
    return (
      <Tag color="default">
        {getTranslatedStatus(status)}
      </Tag>
    );
  };

  // Column definition for orders table
  const columns = [
    {
      title: t('table.orderId'),
      dataIndex: 'id',
      key: 'id',
      render: id => <Text strong>#{id}</Text>,
      width: 100,
      sorter: true,
      sortDirections: ['descend', 'ascend'],
      sortOrder: filters.sortColumn === 'id' ? (filters.sortDirection === 'desc' ? 'descend' : 'ascend') : null,
      fixed: isRTL ? 'right' : 'left'
    },
    {
      title: t('table.date'),
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
      title: t('table.status'),
      dataIndex: 'status',
      key: 'status',
      render: status => getStatusTag(status),
      width: 140,
      filters: Object.keys(FilterStatusColors).map(status => ({
        text: getTranslatedStatus(status),
        value: status
      })),
      filteredValue: filters.statuses,
      onFilter: (value, record) => record.status === value
    },
    {
      title: t('table.total'),
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: amount => formatCurrency(amount),
      width: 110,
      sorter: true,
      sortDirections: ['descend', 'ascend'],
      sortOrder: filters.sortColumn === 'totalAmount' ? (filters.sortDirection === 'desc' ? 'descend' : 'ascend') : null
    },
    {
      title: t('table.items'),
      dataIndex: 'orderProducts',
      key: 'orderProducts',
      render: products => (
        <Badge count={products.length} style={{ backgroundColor: products.length > 0 ? '#1890ff' : '#ccc' }} />
      ),
      width: 80,
      responsive: ['lg']
    },
    {
      title: t('table.actions'),
      key: 'actions',
      width: 100,
      fixed: isRTL ? 'left' : 'right',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewOrderDetails(record)}
            title={t('buttons.viewDetails')}
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
                    {getTranslatedStatus(status)}
                  </Menu.Item>
                ))}
              </Menu>
            }
            trigger={['click']}
            placement={isRTL ? "bottomLeft" : "bottomRight"}
          >
            <Button
              icon={<EditOutlined />}
              size="small"
              title={t('buttons.updateStatus')}
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
          {t('buttons.details')}
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
                  {getTranslatedStatus(status)}
                </Menu.Item>
              ))}
            </Menu>
          }
          trigger={['click']}
          placement={isRTL ? "bottomLeft" : "bottomRight"}
        >
          <Button type="text" icon={<EditOutlined />}>{t('buttons.update')}</Button>
        </Dropdown>
      ]}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <Text strong>{t('card.orderNumber', { id: order.id })}</Text>
          <div className="text-xs text-gray-500">
            {format(new Date(order.orderDate), 'MMM dd, yyyy HH:mm')}
          </div>
        </div>
        {getStatusTag(order.status)}
      </div>

      <Divider style={{ margin: '12px 0' }} />

      <div className="flex justify-between">
        <div>
          <Text type="secondary">{t('card.items')}</Text>
          <div>
            <Badge
              count={order.orderProducts.length}
              style={{ backgroundColor: '#1890ff' }}
            /> {order.orderProducts.length} {t(order.orderProducts.length === 1 ? 'card.item' : 'card.items')}
          </div>
        </div>
        <div className={`text-${isRTL ? 'left' : 'right'}`}>
          <Text type="secondary">{t('card.total')}</Text>
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
          <Descriptions.Item label={t('details.orderId')}>#{id}</Descriptions.Item>
          <Descriptions.Item label={t('details.totalAmount')}>
            <Text strong>{formatCurrency(totalAmount)}</Text>
          </Descriptions.Item>
        </Descriptions>

        <Divider orientation={isRTL ? "right" : "left"}>{t('details.orderItems')}</Divider>

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
                title={isRTL && item.nameAr ? item.nameAr : item.nameEn}
                description={
                  <Space>
                    <Tag>{t('details.quantityByPrice', { quantity: item.quantity, price: formatCurrency(item.price) })}</Tag>
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

        <Card title={t('details.updateStatus')} size="small" className="mb-4">
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
                {getTranslatedStatus(newStatus)}
              </Button>
            ))}
          </div>
        </Card>

        <div className="mt-8 pt-4 border-t border-gray-200 text-gray-400 text-xs">
          <div>{t('details.viewedBy', { user: currentUser })}</div>
          <div>{t('details.accessTimestamp', { timestamp: currentTimestamp })}</div>
        </div>
      </>
    );
  };

  // Render filters panel for mobile
  const renderMobileFilters = () => (
    <Modal
      title={t('filters.title')}
      open={filtersVisible}
      onCancel={() => setFiltersVisible(false)}
      footer={[
        <Button key="reset" onClick={handleResetFilters}>
          {t('buttons.resetFilters')}
        </Button>,
        <Button key="apply" type="primary" onClick={() => setFiltersVisible(false)}>
          {t('buttons.apply')}
        </Button>
      ]}
    >
      <Space direction="vertical" className="w-full mb-4">

        <div>
          <Text strong className="block mb-1">{t('filters.byStatus')}</Text>
          <Select
            mode="multiple"
            placeholder={t('filters.selectStatus')}
            style={{ width: '100%' }}
            value={filters.statuses}
            onChange={handleStatusFilter}
            allowClear
          >
            {Object.keys(FilterStatusColors).map(status => (
              <Option key={status} value={status}>
                <Space>
                  {FilterStatusIcons[status]}
                  {getTranslatedStatus(status)}
                </Space>
              </Option>
            ))}
          </Select>
        </div>

        <div>
          <Text strong className="block mb-1">{t('filters.byDate')}</Text>
          <DatePicker
            onChange={handleDateFilter}
            allowClear
            placeholder={t('filters.selectDate')}
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
    <div style={{ padding: isMobile ? '16px' : '24px', minHeight: '100vh' }} dir={direction}>
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        marginBottom: isMobile ? '16px' : '24px'
      }}>
        <div>
          <Title level={isMobile ? 3 : 2}>{t('pageHeader.title')}</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: isMobile ? '8px' : '0' }}>
            {t('pageHeader.subtitle')}
          </Text>
        </div>

        <Space wrap style={{ marginTop: isMobile ? '8px' : '0' }}>
          {isMobile && (
            <Button
              icon={<FilterOutlined />}
              onClick={() => setFiltersVisible(true)}
            >
              {t('buttons.filters')}
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
            {t('buttons.refresh')}
          </Button>
        </Space>
      </div>

      {/* Filters Section - Desktop and Tablet */}
      {!isMobile && (
        <Card style={{ marginBottom: '24px' }}>
          <Row gutter={[16, 16]} align="bottom">

            <Col xs={24} md={8} lg={6}>
              <Text strong style={{ display: 'block', marginBottom: '4px' }}>{t('filters.byStatus')}</Text>
              <Select
                mode="multiple"
                placeholder={t('filters.selectStatus')}
                style={{ width: '100%' }}
                value={filters.statuses}
                onChange={handleStatusFilter}
                allowClear
              >
                {Object.keys(FilterStatusColors).map(status => (
                  <Option key={status} value={status}>
                    <Space>
                      {FilterStatusIcons[status]}
                      {getTranslatedStatus(status)}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Col>

            <Col xs={24} md={8} lg={6}>
              <Text strong style={{ display: 'block', marginBottom: '4px' }}>{t('filters.byDate')}</Text>
              <DatePicker
                onChange={handleDateFilter}
                allowClear
                placeholder={t('filters.selectDate')}
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
                {t('buttons.resetFilters')}
              </Button>
            </Col>
          </Row>

          <Divider style={{ margin: '16px 0' }} />

          <Row>
            <Col span={24}>
              <Space>
                <Text>
                  {t('filters.showing', {
                    shown: vendorOrders.items?.length || 0,
                    total: vendorOrders.totalPages * filters.pageSize || 0
                  })}
                </Text>
                {filters.dateFilter && (
                  <Tag closable onClose={() => dispatch(updateFilters({ dateFilter: null }))}>
                    {t('filters.dateTag', { date: filters.dateFilter })}
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
              <span>{t('tabs.allOrders')}</span>
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
                  <span>{getTranslatedStatus(status)}</span>
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
            <Spin size="large" tip={t('loading')} />
          </div>
        ) : vendorOrders.items?.length === 0 ? (
          <Empty
            description={
              <div>
                <p style={{ marginBottom: '8px' }}>{t('empty.noOrders')}</p>
                {(filters.statuses.length || filters.dateFilter) && (
                  <Button type="link" onClick={handleResetFilters}>
                    {t('buttons.clearFilters')}
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
                    className={isRTL ? "rtl-pagination" : ""}
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
                  showTotal: (total) => t('pagination.total', { total })
                }}
                scroll={{ x: 800 }}
                size={isTablet ? "small" : "middle"}
                className={isRTL ? "rtl-table" : ""}
              />
            )}
          </>
        )}
      </Card>

      {/* Custom Status Update Modal */}
      <Modal
        title={t('modal.updateStatusTitle')}
        open={statusModalVisible}
        onCancel={cancelStatusUpdate}
        footer={[
          <Button key="cancel" onClick={cancelStatusUpdate}>
            {t('buttons.cancel')}
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={statusUpdateLoading}
            onClick={confirmStatusUpdate}
          >
            {t('buttons.updateStatus')}
          </Button>,
        ]}
        width={windowWidth < 768 ? 320 : 420}
      >
        {updatingOrder && newStatus && (
          <div>
            <p>{t('modal.confirmUpdateQuestion')}</p>

            <div style={{ margin: '16px 0', padding: '12px', background: '#f5f5f5', borderRadius: '4px' }}>
              <div>{t('modal.orderId')}: <Text strong>#{updatingOrder.id}</Text></div>
              <div style={{ marginTop: '12px' }}>
                <div>{t('modal.from')}: <Tag color={OrderStatusColors[updatingOrder.status] || 'default'}>{getTranslatedStatus(updatingOrder.status)}</Tag></div>
                <div style={{ marginTop: '8px' }}>{t('modal.to')}: <Tag color={OrderStatusColors[newStatus] || 'default'}>{getTranslatedStatus(newStatus)}</Tag></div>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: '#888', marginTop: '16px' }}>
              <div>{t('modal.user', { user: currentUser })}</div>
              <div>{t('modal.date', { date: currentTimestamp })}</div>
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
            <span>{t('drawer.title', { id: selectedOrderDetails?.id })}</span>
            <CloseOutlined onClick={() => setDrawerVisible(false)} />
          </div>
        }
        placement={isMobile ? "bottom" : isRTL ? "left" : "right"}
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
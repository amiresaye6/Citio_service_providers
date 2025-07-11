import React, { useState, useEffect } from 'react';
import { Button, Tag, Select, DatePicker, Space, Col, Row } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllOrders, clearError, fetchBusinessTypes } from '../redux/slices/adminSlice';
import PageHeader from '../components/common/PageHeader';
import TableWrapper from '../components/common/TableWrapper';
import SearchInput from '../components/common/SearchInput';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ToastNotifier from '../components/common/ToastNotifier';
import { useNavigate } from 'react-router-dom';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
const { Option } = Select;

const OrderStatusColors = {
  'Pending': 'orange',
  'Processing': 'blue',
  'Shipped': 'purple',
  'Delivered': 'green',
  'Cancelled': 'red'
};

const AdminOrdersPage = () => {
  const { t, i18n } = useTranslation('orders');
  const dispatch = useDispatch();
  const { orders, BusinessTypes, loading, error } = useSelector((state) => state.admin);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('');
  const [statusFilter, setStatusFilter] = useState([]);
  const [vendorFilter, setVendorFilter] = useState([]);
  const [allBusinessTypes, setAllBusinessTypes] = useState([]);
  const [filterDate, setFilterDate] = useState(null);

  const navigate = useNavigate();
  const direction = i18n.dir();
  const isRTL = direction === "rtl";

  // Fetch orders
  useEffect(() => {
    dispatch(fetchAllOrders({
      pageNumber: currentPage,
      pageSize: pageSize,
      searchValue: searchValue,
      sortColumn: sortColumn,
      sortDirection: sortDirection,
      Statuses: statusFilter.length > 0 ? statusFilter : undefined,
      BusinessTypes: vendorFilter.length > 0 ? vendorFilter : undefined,
      DateFilter: filterDate ? filterDate.format('YYYY-MM-DD') : undefined
    }));
  }, [dispatch, currentPage, pageSize, searchValue, sortColumn, sortDirection, statusFilter, filterDate, vendorFilter]);

  // Handle errors
  useEffect(() => {
    if (error) {
      ToastNotifier.error(t('errors.loadFailed'), error);
      dispatch(clearError());
    }
  }, [error, dispatch, t]);

  useEffect(() => {
    // Try to get business types from session storage first
    const storedBusinessTypes = sessionStorage.getItem('businessTypes');

    if (storedBusinessTypes) {
      setAllBusinessTypes(JSON.parse(storedBusinessTypes));
    } else {
      // Only fetch from API if not in session storage
      dispatch(fetchBusinessTypes());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When BusinessTypes updates from API, update state and session storage
  useEffect(() => {
    if (BusinessTypes.businessTypes?.length > 0) {
      setAllBusinessTypes(BusinessTypes.businessTypes);
      sessionStorage.setItem('businessTypes', JSON.stringify(BusinessTypes.businessTypes));
    }
  }, [BusinessTypes.businessTypes]);

  const getStatusTranslation = (status) => {
    const statusKey = status?.toLowerCase();
    return t(`status.${statusKey}`, status);
  };

  // Table columns
  const columns = [
    {
      title: t('table.columns.orderId'),
      dataIndex: 'id',
      key: 'id',
      sorter: true,
    },
    {
      title: t('table.columns.customer'),
      dataIndex: 'applicationUserFullName',
      key: 'applicationUserFullName',
      sorter: true,
      responsive: ['md'],
    },
    {
      title: t('table.columns.vendors'),
      dataIndex: 'vendors',
      key: 'vendors',
      render: (vendors) => (
        <div>
          {vendors.map((vendor, index) => (
            <div key={vendor.id} className={index !== 0 ? 'mt-1' : ''}>
              {vendor.businessName}
              <div className="text-xs text-gray-500">
                {vendor.businessType}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: t('table.columns.total'),
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      sorter: true,
      render: (amount) => `$${amount.toFixed(2)}`
    },
    {
      title: t('table.columns.date'),
      dataIndex: 'orderDate',
      key: 'orderDate',
      sorter: true,
      render: (date) => new Date(date).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US'),
      responsive: ['lg'],
    },
    {
      title: t('table.columns.status'),
      dataIndex: 'status',
      key: 'status',
      sorter: true,
      render: (status) => (
        <Tag color={OrderStatusColors[status] || 'default'}>
          {getStatusTranslation(status)}
        </Tag>
      )
    },
    {
      title: t('table.columns.actions'),
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<InfoCircleOutlined />}
            size="small"
            onClick={() => navigate(`/admin/orders/${record.id}`)}
            type="primary"
          >
            {t('buttons.details')}
          </Button>
        </Space>
      ),
    }
  ];

  // Handle search
  const handleSearch = (value) => {
    setSearchValue(value);
    setCurrentPage(1);
  };

  // Handle table change (pagination and sorting)
  const handleTableChange = (pagination, filters, sorter) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
    if (sorter.field && sorter.order) {
      setSortColumn(sorter.field);
      setSortDirection(sorter.order === 'ascend' ? 'asc' : 'desc');
    } else {
      setSortColumn('');
      setSortDirection('');
    }
  };

  // Handle status filter change
  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  // Handle vendor filter change
  const handleVendorFilterChange = (values) => {
    setVendorFilter(values);
    setCurrentPage(1);
  };

  // Handle date change (single date only)
  const handleDateChange = (date) => {
    setFilterDate(date);
    setCurrentPage(1);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchValue('');
    setStatusFilter([]);
    setVendorFilter([]);
    setFilterDate(null);
    setSortColumn('');
    setSortDirection('');
    setCurrentPage(1);
    dispatch(fetchAllOrders({
      pageNumber: 1,
      pageSize: pageSize
    }));
  };

  return (
    <div className="p-4 md:p-6 min-h-screen" dir={direction}>
      <PageHeader
        title={t('pageHeader.title')}
        subtitle={t('pageHeader.subtitle')}
        actions={
          <Button
            type="primary"
            onClick={() => {
              dispatch(fetchAllOrders({
                pageNumber: currentPage,
                pageSize: pageSize,
                searchValue: searchValue,
                sortColumn: sortColumn,
                sortDirection: sortDirection,
                Statuses: statusFilter.length > 0 ? statusFilter : undefined,
                BusinessTypes: vendorFilter.length > 0 ? vendorFilter : undefined,
                DateFilter: filterDate ? filterDate.format('YYYY-MM-DD') : undefined
              }));
              ToastNotifier.info(t('notifications.refreshTitle'), t('notifications.refreshMessage'));
            }}
          >
            {t('buttons.refresh')}
          </Button>
        }
      />

      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={24} md={12}>
          <SearchInput
            placeholder={t('search.placeholder')}
            onSearch={handleSearch}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full"
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={24} sm={12} md={6} lg={6}>
          <Select
            mode="multiple"
            placeholder={t('filters.statusPlaceholder')}
            onChange={handleStatusFilterChange}
            value={statusFilter}
            className="w-full"
            allowClear
          >
            <Option value="Pending">{t('status.pending')}</Option>
            <Option value="Processing">{t('status.processing')}</Option>
            <Option value="Shipped">{t('status.shipped')}</Option>
            <Option value="Delivered">{t('status.delivered')}</Option>
            <Option value="Cancelled">{t('status.cancelled')}</Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} md={6} lg={6}>
          <Select
            mode="multiple"
            placeholder={t('filters.vendorTypePlaceholder')}
            onChange={handleVendorFilterChange}
            value={vendorFilter}
            className="w-full"
            allowClear
          >
            {allBusinessTypes.map(type => (
              <Option key={type} value={type}>{type}</Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={16} md={8} lg={6}>
          <DatePicker
            onChange={handleDateChange}
            value={filterDate}
            className="w-full"
            placeholder={t('filters.datePlaceholder')}
            format={isRTL ? "YYYY/MM/DD" : "MM/DD/YYYY"}
          />
        </Col>
        <Col xs={24} sm={8} md={4} lg={3}>
          <Button onClick={handleResetFilters} className="w-full">
            {t('buttons.resetFilters')}
          </Button>
        </Col>
      </Row>

      {loading ? (
        <LoadingSpinner text={t('loading.orders')} />
      ) : (
        <TableWrapper
          dataSource={orders.items || []}
          columns={columns}
          loading={loading}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: (orders?.totalPages || 1) * pageSize,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total, range) => t('pagination.showTotal', { start: range[0], end: range[1], total }),
            position: ['bottomCenter'],
            showQuickJumper: true,
            hasNextPage: orders?.hasNextPage,
            hasPreviousPage: orders?.hasPreviousPage,
          }}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
          className={isRTL ? 'rtl-table' : ''}
          dir={direction}
        />
      )}
    </div>
  );
};

export default AdminOrdersPage;
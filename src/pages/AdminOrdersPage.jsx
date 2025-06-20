import React, { useState, useEffect } from 'react';
import { Button, Tag, Select, DatePicker, Space, Col, Row } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllOrders, clearError, fetchBusinessTypes } from '../redux/slices/adminSlice';
import PageHeader from '../components/common/PageHeader';
import TableWrapper from '../components/common/TableWrapper';
import SearchInput from '../components/common/SearchInput';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ToastNotifier from '../components/common/ToastNotifier';
const { Option } = Select;

const OrderStatusColors = {
  'Pending': 'orange',
  'Processing': 'blue',
  'Shipped': 'purple',
  'Delivered': 'green',
  'Cancelled': 'red'
};

const AdminOrdersPage = () => {
  const dispatch = useDispatch();
  const { orders, BusinessTypes, loading, error } = useSelector((state) => state.admin);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('');
  const [statusFilter, setStatusFilter] = useState([]);
  const [vendorFilter, setVendorFilter] = useState([]);
  const [filterDate, setFilterDate] = useState(null);

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
    
    dispatch(fetchBusinessTypes())
  }, [dispatch, currentPage, pageSize, searchValue, sortColumn, sortDirection, statusFilter, filterDate, vendorFilter]);

  // Handle errors
  useEffect(() => {
    if (error) {
      ToastNotifier.error('Failed to load orders', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Table columns
  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      sorter: true,
    },
    {
      title: 'Customer',
      dataIndex: 'applicationUserFullName',
      key: 'applicationUserFullName',
      sorter: true,
      responsive: ['md'],
    },
    {
      title: 'Vendors',
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
      title: 'Total',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      sorter: true,
      render: (amount) => `$${amount.toFixed(2)}`
    },
    {
      title: 'Date',
      dataIndex: 'orderDate',
      key: 'orderDate',
      sorter: true,
      render: (date) => new Date(date).toLocaleDateString(),
      responsive: ['lg'],
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      sorter: true,
      render: (status) => (
        <Tag color={OrderStatusColors[status] || 'default'}>
          {status}
        </Tag>
      )
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

  // Filter orders locally based on vendor filters
  // since the API doesn't directly support these filters
  // const filteredItems = orders ? orders.items : [];

  return (
    <div className="p-4 md:p-6 min-h-screen">
      <PageHeader
        title="Admin Orders"
        subtitle="View and manage all orders across vendors"
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
              ToastNotifier.info('Refresh', 'Orders refreshed.');
            }}
          >
            Refresh
          </Button>
        }
      />

      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={24} md={12}>
          <SearchInput
            placeholder="Search by order ID, customer name..."
            onSearch={handleSearch}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full"
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={24} sm={12} md={6} lg={4}>
          <Select
            mode="multiple"
            placeholder="Filter by status"
            onChange={handleStatusFilterChange}
            value={statusFilter}
            className="w-full"
            allowClear
          >
            <Option value="Pending">Pending</Option>
            <Option value="Processing">Processing</Option>
            <Option value="Shipped">Shipped</Option>
            <Option value="Delivered">Delivered</Option>
            <Option value="Cancelled">Cancelled</Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} md={6} lg={4}>
          <Select
            mode="multiple"
            placeholder="Filter by vendor type"
            onChange={handleVendorFilterChange}
            value={vendorFilter}
            className="w-full"
            allowClear
          >
            {BusinessTypes.businessTypes.map(type => (
              <Option key={type} value={type}>{type}</Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={16} md={8} lg={6}>
          <DatePicker
            onChange={handleDateChange}
            value={filterDate}
            className="w-full"
          />
        </Col>
        <Col xs={24} sm={8} md={4} lg={3}>
          <Button onClick={handleResetFilters} className="w-full">
            Reset Filters
          </Button>
        </Col>
      </Row>

      {loading ? (
        <LoadingSpinner text="Loading orders..." />
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
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} orders`,
            position: ['bottomCenter'],
            showQuickJumper: true,
            hasNextPage: orders?.hasNextPage,
            hasPreviousPage: orders?.hasPreviousPage,
          }}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
        />
      )}
    </div>
  );
};

export default AdminOrdersPage;
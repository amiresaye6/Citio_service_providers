import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import PageHeader from '../components/common/PageHeader';
import TableWrapper from '../components/common/TableWrapper';
import SearchInput from '../components/common/SearchInput';
import StatusTag from '../components/common/StatusTag';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ToastNotifier from '../components/common/ToastNotifier';
import FilterBar from '../components/common/FilterBar';
import moment from 'moment';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fake order data (replace with API call in a real app)
  const fakeOrders = [
    {
      id: '1',
      orderId: 'ORD001',
      customer: 'John Doe',
      vendor: 'Acme Corp',
      amount: 45.99,
      status: 'pending',
      date: '2025-04-18',
    },
    {
      id: '2',
      orderId: 'ORD002',
      customer: 'Jane Smith',
      vendor: 'Beta LLC',
      amount: 89.50,
      status: 'active',
      date: '2025-04-17',
    },
    {
      id: '3',
      orderId: 'ORD003',
      customer: 'Bob Johnson',
      vendor: 'Gamma Inc',
      amount: 22.75,
      status: 'error',
      date: '2025-04-16',
    },
  ];

  // Simulate fetching orders
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setOrders(fakeOrders);
      setFilteredOrders(fakeOrders);
      setLoading(false);
      ToastNotifier.success('Orders Loaded', 'Successfully fetched orders.');
    }, 1000);
  }, []);

  // Table columns
  const columns = [
    { title: 'Order ID', dataIndex: 'orderId', key: 'orderId' },
    { title: 'Customer', dataIndex: 'customer', key: 'customer' },
    { title: 'Vendor', dataIndex: 'vendor', key: 'vendor' },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `$${amount.toFixed(2)}`,
    },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusTag status={status} />,
    },
  ];

  // Filter configuration
  const filters = [
    {
      key: 'vendor',
      placeholder: 'Select Vendor',
      options: [
        { label: 'Acme Corp', value: 'Acme Corp' },
        { label: 'Beta LLC', value: 'Beta LLC' },
        { label: 'Gamma Inc', value: 'Gamma Inc' },
      ],
    },
    {
      key: 'status',
      placeholder: 'Select Status',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Active', value: 'active' },
        { label: 'Error', value: 'error' },
      ],
    },
  ];

  // Handle search
  const handleSearch = (value) => {
    const filtered = orders.filter(
      (order) =>
        order.orderId.toLowerCase().includes(value.toLowerCase()) ||
        order.customer.toLowerCase().includes(value.toLowerCase()) ||
        order.vendor.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredOrders(filtered);
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    const filtered = orders.filter((order) => {
      if (key === 'vendor' && value) {
        return order.vendor === value;
      }
      if (key === 'status' && value) {
        return order.status === value;
      }
      return true;
    });
    setFilteredOrders(filtered);
  };

  // Handle date range change
  const handleDateRangeChange = (dates) => {
    if (dates) {
      const [start, end] = dates;
      const filtered = orders.filter((order) =>
        moment(order.date).isBetween(start, end, 'day', '[]')
      );
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setFilteredOrders(orders);
  };

  return (
    <div className="p-6 min-h-screen">
      <PageHeader
        title="Admin Orders"
        subtitle="View and manage all orders across vendors"
        actions={
          <Button
            type="primary"
            onClick={() => ToastNotifier.info('Refresh', 'Orders refreshed.')}
          >
            Refresh
          </Button>
        }
      />

      <SearchInput
        placeholder="Search by order ID, customer, or vendor..."
        onSearch={handleSearch}
      />

      <FilterBar
        filters={filters}
        dateRange
        onFilterChange={handleFilterChange}
        onDateRangeChange={handleDateRangeChange}
        onReset={handleResetFilters}
        loading={loading}
      />

      {loading ? (
        <LoadingSpinner text="Loading orders..." />
      ) : (
        <TableWrapper
          dataSource={filteredOrders}
          columns={columns}
          loading={loading}
          rowKey="id"
        />
      )}
    </div>
  );
};

export default AdminOrdersPage;
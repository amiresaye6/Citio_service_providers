import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import PageHeader from '../components/common/PageHeader';
import TableWrapper from '../components/common/TableWrapper';
import SearchInput from '../components/common/SearchInput';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ToastNotifier from '../components/common/ToastNotifier';
import StatusTag from '../components/common/StatusTag';
import FilterBar from '../components/common/FilterBar';

const AllTransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fake transaction data (replace with API call in a real app)
  const fakeTransactions = [
    {
      id: '1',
      user: 'John Doe',
      vendor: 'Acme Corp',
      amount: 150.75,
      date: '2025-04-15',
      status: 'active',
    },
    {
      id: '2',
      user: 'Jane Smith',
      vendor: 'Beta LLC',
      amount: 89.99,
      date: '2025-04-14',
      status: 'pending',
    },
    {
      id: '3',
      user: 'Bob Johnson',
      vendor: 'Gamma Inc',
      amount: 245.50,
      date: '2025-04-13',
      status: 'error',
    },
  ];

  // Simulate fetching transactions
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setTransactions(fakeTransactions);
      setFilteredTransactions(fakeTransactions);
      setLoading(false);
      ToastNotifier.success('Transactions Loaded', 'Successfully fetched transactions.');
    }, 1000);
  }, []);

  // Table columns
  const columns = [
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
    },
    {
      title: 'Vendor',
      dataIndex: 'vendor',
      key: 'vendor',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `$${amount.toFixed(2)}`,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
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
      key: 'status',
      placeholder: 'Select Status',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Pending', value: 'pending' },
        { label: 'Error', value: 'error' },
      ],
    },
  ];

  // Handle search
  const handleSearch = (value) => {
    const filtered = transactions.filter(
      (transaction) =>
        transaction.user.toLowerCase().includes(value.toLowerCase()) ||
        transaction.vendor.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredTransactions(filtered);
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    const filtered = value
      ? transactions.filter((transaction) => transaction[key] === value)
      : transactions;
    setFilteredTransactions(filtered);
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setFilteredTransactions(transactions);
  };

  return (
    <div className="p-6 min-h-screen">
      <PageHeader
        title="All Transactions"
        subtitle="View and manage all transactions in the system"
        actions={
          <Button
            type="primary"
            onClick={() => ToastNotifier.info('Refresh', 'Transactions refreshed.')}
          >
            Refresh
          </Button>
        }
      />

      <SearchInput
        placeholder="Search by user or vendor..."
        onSearch={handleSearch}
      />

      <FilterBar
        filters={filters}
        dateRange
        onFilterChange={handleFilterChange}
        onDateRangeChange={(dates) => console.log('Date Range:', dates)} // Replace with actual date filtering logic
        onReset={handleResetFilters}
        loading={loading}
      />

      {loading ? (
        <LoadingSpinner text="Loading transactions..." />
      ) : (
        <TableWrapper
          dataSource={filteredTransactions}
          columns={columns}
          loading={loading}
          rowKey="id"
        />
      )}
    </div>
  );
};

export default AllTransactionsPage;
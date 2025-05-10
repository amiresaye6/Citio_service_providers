import React, { useState, useEffect } from 'react';
import { Button, Row, Col, Select, DatePicker, Card, Tag, Space } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllTransactions, clearError } from '../redux/slices/adminSlice';
import PageHeader from '../components/common/PageHeader';
import TableWrapper from '../components/common/TableWrapper';
import SearchInput from '../components/common/SearchInput';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ToastNotifier from '../components/common/ToastNotifier';
import { SyncOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { Option } = Select;

const AllTransactionsPage = () => {
  const dispatch = useDispatch();
  const { transactions, loading, error } = useSelector(state => state.admin);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [localFiltered, setLocalFiltered] = useState([]);

  // Fetch transactions
  useEffect(() => {
    dispatch(fetchAllTransactions({
      pageNumber: currentPage,
      pageSize: pageSize,
      searchValue: searchValue,
      sortColumn: sortColumn,
      sortDirection: sortDirection,
      statuses: statusFilter ? [statusFilter] : undefined
    }));
  }, [dispatch, currentPage, pageSize, searchValue, sortColumn, sortDirection, statusFilter]);

  // Handle errors
  useEffect(() => {
    if (error) {
      ToastNotifier.error('Failed to load transactions', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Apply local filtering for date range
  useEffect(() => {
    if (!transactions?.items) {
      setLocalFiltered([]);
      return;
    }

    let filtered = [...transactions.items];

    // Apply date range filter
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = moment(dateRange[0]).startOf('day');
      const endDate = moment(dateRange[1]).endOf('day');

      filtered = filtered.filter(transaction => {
        const txDate = moment(transaction.transactionDate);
        return txDate.isBetween(startDate, endDate, null, '[]');
      });
    }

    setLocalFiltered(filtered);
  }, [transactions?.items, dateRange]);

  // Table columns
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: true,
    },
    {
      title: 'User',
      dataIndex: 'applicationUserFullName',
      key: 'applicationUserFullName',
      sorter: true,
    },
    {
      title: 'Order ID',
      dataIndex: 'orderId',
      key: 'orderId',
      sorter: true,
      responsive: ['md'],
    },
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      sorter: true,
      render: (amount) => `$${amount.toFixed(2)}`,
    },
    {
      title: 'Payment Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      responsive: ['lg'],
    },
    {
      title: 'Date',
      dataIndex: 'transactionDate',
      key: 'transactionDate',
      sorter: true,
      render: (date) => moment(date).format('YYYY-MM-DD HH:mm'),
      responsive: ['md'],
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      sorter: true,
      render: (status) => {
        let color = 'default';
        let icon = null;

        switch (status) {
          case 'Completed':
            color = 'success';
            icon = <CheckCircleOutlined />;
            break;
          case 'Pending':
            color = 'warning';
            icon = <SyncOutlined spin />;
            break;
          case 'Failed':
            color = 'error';
            icon = <CloseCircleOutlined />;
            break;
          default:
            color = 'default';
        }

        return (
          <Tag color={color} icon={icon}>
            {status}
          </Tag>
        );
      }
    },
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

  // Handle date range filter change
  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchValue('');
    setStatusFilter(null);
    setDateRange(null);
    setSortColumn('');
    setSortDirection('');
    setCurrentPage(1);

    dispatch(fetchAllTransactions({
      pageNumber: 1,
      pageSize: pageSize
    }));
  };

  // Refresh transactions
  const handleRefresh = () => {
    dispatch(fetchAllTransactions({
      pageNumber: currentPage,
      pageSize: pageSize,
      searchValue: searchValue,
      sortColumn: sortColumn,
      sortDirection: sortDirection,
      statuses: statusFilter ? [statusFilter] : undefined
    }));

    ToastNotifier.info('Refresh', 'Transactions refreshed.');
  };

  // Determine which data to display (filtered locally or from API)
  const displayData = dateRange
    ? localFiltered
    : (transactions?.items || []);

  return (
    <div className="p-4 md:p-6 min-h-screen">
      <PageHeader
        title="All Transactions"
        subtitle="View and manage all transactions in the system"
        actions={
          <Button
            type="primary"
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        }
      />

      <Card className="mb-6">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12} lg={8}>
            <SearchInput
              placeholder="Search by user name or order ID..."
              onSearch={handleSearch}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full"
              allowClear
            />
          </Col>

          <Col xs={24} sm={12} md={6} lg={4}>
            <Select
              placeholder="Filter by status"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="w-full"
              allowClear
            >
              <Option value="Completed">Completed</Option>
              <Option value="Pending">Pending</Option>
              <Option value="Failed">Failed</Option>
            </Select>
          </Col>

          <Col xs={24} sm={12} md={10} lg={8}>
            <RangePicker
              placeholder={['Start Date', 'End Date']}
              value={dateRange}
              onChange={handleDateRangeChange}
              className="w-full"
              showTime={{ format: 'HH:mm' }}
              format="YYYY-MM-DD HH:mm"
            />
          </Col>

          <Col xs={24} md={6} lg={4}>
            <Space className="w-full">
              <Button
                onClick={handleResetFilters}
                className="flex-1"
              >
                Reset
              </Button>
              <Button
                type="primary"
                onClick={handleRefresh}
                className="flex-1"
                loading={loading}
              >
                Refresh
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {loading ? (
        <LoadingSpinner text="Loading transactions..." />
      ) : (
        <Card
          title={
            <div className="flex justify-between items-center">
              <span>Transactions</span>
              <span className="text-sm text-gray-500">
                {dateRange
                  ? `Filtered: ${displayData.length} transactions`
                  : `Page ${transactions?.pageNumber || 1} of ${transactions?.totalPages || 1}`}
              </span>
            </div>
          }
        >
          <TableWrapper
            dataSource={displayData}
            columns={columns}
            rowKey="id"
            pagination={{
              current: dateRange ? 1 : (transactions?.pageNumber || 1),
              pageSize: pageSize,
              total: dateRange
                ? displayData.length
                : (transactions?.totalPages || 1) * pageSize,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} transactions`,
            }}
            onChange={handleTableChange}
            scroll={{ x: 'max-content' }}
          />
        </Card>
      )}
    </div>
  );
};

export default AllTransactionsPage;
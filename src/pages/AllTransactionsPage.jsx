import { useState, useEffect } from 'react';
import { Button, Row, Col, Select, DatePicker, Card, Tag } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllTransactions, clearError } from '../redux/slices/adminSlice';
import PageHeader from '../components/common/PageHeader';
import TableWrapper from '../components/common/TableWrapper';
import SearchInput from '../components/common/SearchInput';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ToastNotifier from '../components/common/ToastNotifier';
import {
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { Option } = Select;

const AllTransactionsPage = () => {
  const dispatch = useDispatch();
  const { transactions, loading, error } = useSelector(state => state.admin);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('');
  const [statusFilter, setStatusFilter] = useState([]);
  const [dateFilter, setDateFilter] = useState(null);


  // Fetch transactions
  useEffect(() => {
    dispatch(fetchAllTransactions({
      pageNumber: currentPage,
      pageSize: pageSize,
      searchValue: searchValue,
      sortColumn: sortColumn,
      sortDirection: sortDirection,
      Statuses: statusFilter.length > 0 ? statusFilter : undefined,
      DateFilter: dateFilter ? dateFilter.format('YYYY-MM-DD') : undefined
    }));
  }, [dispatch, currentPage, pageSize, searchValue, sortColumn, sortDirection, statusFilter, dateFilter]);

  // Handle errors
  useEffect(() => {
    if (error) {
      ToastNotifier.error('Failed to load transactions', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Table columns
  const columns = [
    {
      title: 'Transaction ID',
      dataIndex: 'id',
      key: 'id',
      sorter: true,
      render: (id) => <span className="font-mono text-sm">TXN-{id}</span>
    },
    {
      title: 'Customer',
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
      render: (orderId) => <span className="font-mono text-sm">ORD-{orderId}</span>
    },
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      sorter: true,
      render: (amount) => (
        <span className="font-semibold text-green-600">
          ${amount.toFixed(2)}
        </span>
      ),
    },
    {
      title: 'Payment Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      responsive: ['lg'],
      render: (method) => (
        <Tag color="blue" className="text-xs">
          {method}
        </Tag>
      )
    },
    {
      title: 'Transaction Date',
      dataIndex: 'transactionDate',
      key: 'transactionDate',
      sorter: true,
      render: (date) => (
        <div>
          <div className="text-sm">{moment(date).format('YYYY-MM-DD')}</div>
          <div className="text-xs text-gray-500">{moment(date).format('HH:mm:ss')}</div>
        </div>
      ),
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

        switch (status?.toLowerCase()) {
          case 'completed':
            color = 'success';
            icon = <CheckCircleOutlined />;
            break;
          case 'pending':
            color = 'warning';
            icon = <ClockCircleOutlined />;
            break;
          case 'failed':
            color = 'error';
            icon = <CloseCircleOutlined />;
            break;
          case 'processing':
            color = 'processing';
            icon = <SyncOutlined spin />;
            break;
          default:
            color = 'default';
            icon = <ClockCircleOutlined />;
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


  // Handle date filter change
  const handleDateFilterChange = (date) => {
    setDateFilter(date);
    setCurrentPage(1);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchValue('');
    setStatusFilter([]);
    setDateFilter(null);
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
      Statuses: statusFilter.length > 0 ? statusFilter : undefined,
      DateFilter: dateFilter ? dateFilter.format('YYYY-MM-DD') : undefined
    }));

    ToastNotifier.success('Transactions refreshed');
  };

  // Calculate statistics
  const transactionStats = {
    total: transactions.items?.length || 0,
    totalAmount: transactions.items?.reduce((sum, t) => sum + (t.totalAmount || 0), 0) || 0,
    completed: transactions.items?.filter(t => t.status?.toLowerCase() === 'completed').length || 0,
    pending: transactions.items?.filter(t => t.status?.toLowerCase() === 'pending').length || 0
  };

  return (
    <div className="p-4 md:p-6 min-h-screen">
      <PageHeader
        title="All Transactions"
        subtitle="View and manage all transactions in the system"
        actions={
          <Button
            icon={<ReloadOutlined />}
            type="primary"
            onClick={handleRefresh}
            loading={loading}
          >
            Refresh
          </Button>
        }
      />

      {/* Transaction Statistics */}
      <Card className="mb-6">
        <Row gutter={[24, 16]} justify="space-between">
          <Col xs={12} sm={6}>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {transactionStats.total}
              </div>
              <div className="text-sm text-gray-500">Total Transactions</div>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {transactionStats.completed}
              </div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {transactionStats.pending}
              </div>
              <div className="text-sm text-gray-500">Pending</div>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600">
                ${transactionStats.totalAmount.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">Total Amount</div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Filters Card */}
      <Card className="mb-6" title="Filters">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <SearchInput
              placeholder="Search by customer name or order ID..."
              onSearch={handleSearch}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full"
              allowClear
            />
          </Col>

          <Col xs={24} sm={12} md={4}>
            <Select
              mode="multiple"
              placeholder="Filter by status"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="w-full"
              allowClear
            >
              <Option value="Completed">Completed</Option>
              <Option value="Pending">Pending</Option>
              <Option value="Failed">Failed</Option>
              <Option value="Processing">Processing</Option>
            </Select>
          </Col>

          <Col xs={24} sm={12} md={4}>
            <DatePicker
              placeholder="Select date"
              value={dateFilter}
              onChange={handleDateFilterChange}
              className="w-full"
              format="YYYY-MM-DD"
            />
          </Col>

          <Col xs={24} sm={12} md={4}>
            <Button
              onClick={handleResetFilters}
              className="w-full"
              disabled={loading}
            >
              Reset Filters
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Transactions Table */}
      {loading ? (
        <LoadingSpinner text="Loading transactions..." />
      ) : (
        <Card
          title={
            <div className="flex justify-between items-center">
              <span>Transactions ({transactions.items?.length || 0})</span>
              <span className="text-sm text-gray-500">
                Page {transactions?.pageNumber || 1} of {transactions?.totalPages || 1}
              </span>
            </div>
          }
        >
          <TableWrapper
            dataSource={transactions.items || []}
            columns={columns}
            rowKey="id"
            pagination={{
              current: transactions?.pageNumber || 1,
              pageSize: pageSize,
              total: (transactions?.totalPages || 1) * pageSize,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} transactions`,
              showQuickJumper: true,
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
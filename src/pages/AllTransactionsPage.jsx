import { useState, useEffect } from 'react';
import { Button, Row, Col, Select, DatePicker, Card, Tag } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllTransactions, clearError, fetchTransactionsStatus } from '../redux/slices/adminSlice';
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
import { useTranslation } from 'react-i18next';

const { Option } = Select;

const AllTransactionsPage = () => {
  const { t, i18n } = useTranslation('transactions');
  const dispatch = useDispatch();
  const { transactions, transactionStatus: tStats, loading, error } = useSelector(state => state.admin);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('');
  const [statusFilter, setStatusFilter] = useState([]);
  const [dateFilter, setDateFilter] = useState(null);
  const [paymentMethodFilter, setPaymentMethodFilter] = useState([]);

  const direction = i18n.dir();
  const isRTL = direction === "rtl";

  // Fetch transactions
  useEffect(() => {
    dispatch(fetchAllTransactions({
      pageNumber: currentPage,
      pageSize: pageSize,
      searchValue: searchValue,
      sortColumn: sortColumn,
      sortDirection: sortDirection,
      Statuses: statusFilter.length > 0 ? statusFilter : undefined,
      DateFilter: dateFilter ? dateFilter.format('YYYY-MM-DD') : undefined,
      PaymentMethods: paymentMethodFilter.length > 0 ? paymentMethodFilter : undefined
    }));
  }, [dispatch, currentPage, pageSize, searchValue, sortColumn, sortDirection, statusFilter, dateFilter, paymentMethodFilter]);
  let i = 0;
  // // Fetch Transactions status
  useEffect(() => {
    ++i === 1 ? dispatch(fetchTransactionsStatus()) : () => { };
    ;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle errors
  useEffect(() => {
    if (error) {
      ToastNotifier.error(t('errors.loadFailed'), error);
      dispatch(clearError());
    }
  }, [error, dispatch, t]);

  // Get status translation
  const getStatusTranslation = (status) => {
    const statusKey = status?.toLowerCase();
    return t(`status.${statusKey}`, status);
  };

  // Table columns
  const columns = [
    {
      title: t('table.columns.transactionId'),
      dataIndex: 'id',
      key: 'id',
      sorter: true,
      render: (id) => <span className="font-mono text-sm">TXN-{id}</span>
    },
    {
      title: t('table.columns.customer'),
      dataIndex: 'applicationUserFullName',
      key: 'applicationUserFullName',
      sorter: true,
    },
    {
      title: t('table.columns.orderId'),
      dataIndex: 'orderId',
      key: 'orderId',
      sorter: true,
      responsive: ['md'],
      render: (orderId) => <span className="font-mono text-sm">ORD-{orderId}</span>
    },
    {
      title: t('table.columns.amount'),
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
      title: t('table.columns.paymentMethod'),
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
      title: t('table.columns.transactionDate'),
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
      title: t('table.columns.status'),
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
            {getStatusTranslation(status)}
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

  const handlePaymentMethodFilterChange = (value) => {
    setPaymentMethodFilter(value);
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
    setPaymentMethodFilter([]);
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
      DateFilter: dateFilter ? dateFilter.format('YYYY-MM-DD') : undefined,
      PaymentMethods: paymentMethodFilter.length > 0 ? paymentMethodFilter : undefined
    }));

    ToastNotifier.success(t('notifications.refreshed'));
  };

  // Calculate statistics
  const transactionStats = {
    total: tStats?.allTransactionsCount || 0,
    totalAmount: tStats?.totalRevenue || 0,
    completed: tStats?.compleatedTransactionsCount || 0,
    pending: tStats?.pendingTransactionsCount || 0
  };

  return (
    <div className="p-4 md:p-6 min-h-screen" dir={direction}>
      <PageHeader
        title={t('pageHeader.title')}
        subtitle={t('pageHeader.subtitle')}
        actions={
          <Button
            icon={<ReloadOutlined />}
            type="primary"
            onClick={handleRefresh}
            loading={loading}
          >
            {t('buttons.refresh')}
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
              <div className="text-sm text-gray-500">{t('stats.totalTransactions')}</div>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {transactionStats.completed}
              </div>
              <div className="text-sm text-gray-500">{t('stats.completed')}</div>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {transactionStats.pending}
              </div>
              <div className="text-sm text-gray-500">{t('stats.pending')}</div>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600">
                ${transactionStats.totalAmount.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">{t('stats.totalAmount')}</div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Filters Card */}
      <Card className="mb-6" title={t('filters.title')}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <SearchInput
              placeholder={t('search.placeholder')}
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
              placeholder={t('filters.statusPlaceholder')}
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="w-full"
              allowClear
            >
              <Option value="Completed">{t('status.completed')}</Option>
              <Option value="Pending">{t('status.pending')}</Option>
              <Option value="Failed">{t('status.failed')}</Option>
              <Option value="Refunded">{t('status.refunded')}</Option>
            </Select>
          </Col>

          <Col xs={24} sm={12} md={4}>
            <Select
              mode="multiple"
              placeholder={t('filters.paymentMethodPlaceholder')}
              value={paymentMethodFilter}
              onChange={handlePaymentMethodFilterChange}
              className="w-full"
              allowClear
            >
              <Option value="Visa">{t('paymentMethods.visa')}</Option>
              <Option value="Mastercard">{t('paymentMethods.mastercard')}</Option>
              <Option value="American Express">{t('paymentMethods.americanExpress')}</Option>
              <Option value="Discover">{t('paymentMethods.discover')}</Option>
              <Option value="UnionPay">{t('paymentMethods.unionPay')}</Option>
              <Option value="JCB">{t('paymentMethods.jcb')}</Option>
            </Select>
          </Col>

          <Col xs={24} sm={12} md={4}>
            <DatePicker
              placeholder={t('filters.datePlaceholder')}
              value={dateFilter}
              onChange={handleDateFilterChange}
              className="w-full"
              format={isRTL ? "YYYY/MM/DD" : "YYYY-MM-DD"}
            />
          </Col>

          <Col xs={24} sm={12} md={4}>
            <Button
              onClick={handleResetFilters}
              className="w-full"
              disabled={loading}
            >
              {t('buttons.resetFilters')}
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Transactions Table */}
      {loading ? (
        <LoadingSpinner text={t('loading.transactions')} />
      ) : (
        <Card
          title={
            <div className="flex justify-between items-center">
              <span>{t('card.transactionsCount', { count: transactions.items?.length || 0 })}</span>
              <span className="text-sm text-gray-500">
                {t('pagination.pageInfo', {
                  current: transactions?.pageNumber || 1,
                  total: transactions?.totalPages || 1
                })}
              </span>
            </div>
          }
          className={isRTL ? "rtl-card" : ""}
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
              showTotal: (total, range) => t('pagination.showTotal', { start: range[0], end: range[1], total }),
              showQuickJumper: true,
            }}
            onChange={handleTableChange}
            scroll={{ x: 'max-content' }}
            className={isRTL ? "rtl-table" : ""}
            dir={direction}
          />
        </Card>
      )}
    </div>
  );
};

export default AllTransactionsPage;
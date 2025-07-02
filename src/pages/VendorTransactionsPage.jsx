import React, { useEffect, useState } from 'react';
import {
  Table, Card, Tag, Typography, Pagination, Spin, Empty,
  DatePicker, Select, Row, Col, Grid, Divider, Descriptions, Space, Button
} from 'antd';
import {
  ReloadOutlined, SortAscendingOutlined, SortDescendingOutlined, UserOutlined, MailOutlined, DollarOutlined, CalendarOutlined, ShoppingOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVendorTransactions, clearVendorTransactionsError } from '../redux/slices/vendorsSlice';
import moment from 'moment';
import PageHeader from '../components/common/PageHeader';

const { Title } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;

const paymentMethodsList = [
  'discover', 'mastercard', 'visa', 'amex', 'jcb', 'union pay', 'CashOnDelivery'
];

const statusList = [
  'Pending', 'Completed', 'Failed', 'Refunded', 'Cancelled'
];

const paymentMethodColors = {
  discover: 'purple',
  mastercard: 'red',
  visa: 'blue',
  amex: 'cyan',
  jcb: 'magenta',
  'union pay': 'green',
  CashOnDelivery: 'gold'
};
const statusColors = {
  Pending: 'orange',
  Completed: 'green',
  Failed: 'red',
  Refunded: 'volcano',
  Cancelled: 'gray'
};

const VendorTransactionsPage = () => {
  const dispatch = useDispatch();
  const screens = useBreakpoint();

  const { vendorTransactions, vendorTransactionsLoading, vendorTransactionsError } = useSelector(state => state.vendors);

  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortDirection, setSortDirection] = useState('desc');
  const [dateFilter, setDateFilter] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [statuses, setStatuses] = useState([]);

  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;

  const sortColumn = 'transactionDate';

  const fetchData = () => {
    dispatch(fetchVendorTransactions({
      pageNumber,
      pageSize,
      sortColumn,
      sortDirection,
      dateFilter: dateFilter ? dateFilter.format('YYYY-MM-DD') : undefined,
      paymentMethods,
      statuses,
    }));
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [dispatch, pageNumber, pageSize, sortDirection, dateFilter, paymentMethods, statuses]);

  useEffect(() => {
    if (vendorTransactionsError) {
      dispatch(clearVendorTransactionsError());
    }
  }, [vendorTransactionsError, dispatch]);

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'orderId',
      key: 'orderId',
      render: id => <strong>#{id}</strong>
    },
    {
      title: 'Customer',
      dataIndex: 'userFullName',
      key: 'userFullName',
      render: (name, record) => (
        <div>
          <div>{name}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{record.userEmail}</div>
        </div>
      )
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: amount => <span>${Number(amount).toFixed(2)}</span>
    },
    {
      title: 'Payment Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method) => (
        <Tag color={paymentMethodColors[method] || 'default'}>{method}</Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusColors[status] || 'blue'}>{status}</Tag>
      )
    },
    {
      title: (
        <span>
          Date&nbsp;
          <Button
            size="small"
            type="text"
            style={{ padding: 0, verticalAlign: 'middle' }}
            icon={
              sortDirection === 'asc'
                ? <SortAscendingOutlined />
                : <SortDescendingOutlined />
            }
            onClick={() => setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')}
            aria-label="Sort by date"
          />
        </span>
      ),
      dataIndex: 'transactionDate',
      key: 'transactionDate',
      sorter: true,
      sortOrder: sortDirection === 'asc' ? 'ascend' : 'descend',
      render: date => moment(date).format('YYYY-MM-DD HH:mm')
    }
  ];

  // Card view for mobile/tablet
  const renderTransactionCard = (txn) => (
    <Card key={txn.orderId} className="mb-4" style={{ borderRadius: 12, marginBottom: 16 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 8 }}>
        <Col>
          <span style={{ fontWeight: 600, fontSize: 16 }}>Order #{txn.orderId}</span>
        </Col>
        <Col>
          <Tag color={statusColors[txn.status] || 'blue'} style={{ fontSize: 15, padding: "3px 12px" }}>
            {txn.status}
          </Tag>
        </Col>
      </Row>
      <Divider style={{ margin: "8px 0" }} />
      <Descriptions column={1} size="small" layout="vertical" style={{ marginBottom: 8 }}>
        <Descriptions.Item
          label={
            <span><UserOutlined style={{ color: "#888" }} /> Customer</span>
          }
        >
          {txn.userFullName}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <span><MailOutlined style={{ color: "#888" }} /> Email</span>
          }
        >
          <span style={{ color: "#666" }}>{txn.userEmail}</span>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <span><DollarOutlined style={{ color: "#888" }} /> Amount</span>
          }
        >
          <span style={{ fontWeight: 600, color: "#188048" }}>${Number(txn.amount).toFixed(2)}</span>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <span><CalendarOutlined style={{ color: "#888" }} /> Date</span>
          }
        >
          {moment(txn.transactionDate).format('YYYY-MM-DD HH:mm')}
        </Descriptions.Item>
        <Descriptions.Item
          label="Payment Method"
        >
          <Tag color={paymentMethodColors[txn.paymentMethod] || 'default'} style={{ fontSize: 14, padding: "3px 12px" }}>
            {txn.paymentMethod}
          </Tag>
        </Descriptions.Item>
      </Descriptions>
      <Divider style={{ margin: "8px 0" }} />
      <div style={{ fontWeight: 500, marginBottom: 2 }}>Products:</div>
      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14 }}>
        {txn.products.map(p => (
          <li key={p.productId}>
            <span style={{ fontWeight: 500 }}>{p.nameEn}</span> <span style={{ color: "#aaa" }}>({p.nameAr})</span>
            <span> - </span>
            <span style={{ color: "#666" }}>{p.quantity} × ${p.price}</span>
          </li>
        ))}
      </ul>
    </Card>
  );

  // Appealing expanded row for table
  const renderExpandedRow = (record) => (
    <Card
      size="small"
      style={{
        borderRadius: 12,
        margin: 0,
        boxShadow: "none",
        padding: 16,
        paddingTop: 8,
      }}
    >
      <Row gutter={[24, 8]} style={{ marginBottom: 8 }}>
        <Col xs={24} md={6}>
          <Space>
            <UserOutlined style={{ color: "#888" }} />
            <strong>Customer:</strong>
            <span>{record.userFullName}</span>
          </Space>
        </Col>
        <Col xs={24} md={6}>
          <Space>
            <MailOutlined style={{ color: "#888" }} />
            <strong>Email:</strong>
            <span style={{ color: "#666" }}>{record.userEmail}</span>
          </Space>
        </Col>
        <Col xs={24} md={4}>
          <Space>
            <DollarOutlined style={{ color: "#888" }} />
            <strong>Amount:</strong>
            <span style={{ color: "#188048", fontWeight: 600 }}>${Number(record.amount).toFixed(2)}</span>
          </Space>
        </Col>
        <Col xs={24} md={4}>
          <Space>
            <Tag color={paymentMethodColors[record.paymentMethod] || 'default'}>
              {record.paymentMethod}
            </Tag>
          </Space>
        </Col>
        <Col xs={24} md={4}>
          <Space>
            <CalendarOutlined style={{ color: "#888" }} />
            <span>{moment(record.transactionDate).format('YYYY-MM-DD HH:mm')}</span>
          </Space>
        </Col>
      </Row>
      <Divider style={{ margin: "8px 0" }} />
      <div style={{ fontWeight: 500, marginBottom: 2 }}>
        <ShoppingOutlined style={{ color: "#888" }} /> Products:
      </div>
      <Row gutter={[8, 4]}>
        {record.products.map(p => (
          <Col xs={24} sm={12} md={8} lg={6} key={p.productId}>
            <Card
              size="small"
              style={{ marginBottom: 8, borderRadius: 8, padding: 12 }}
            >
              <div style={{ fontWeight: 500 }}>{p.nameEn}</div>
              <div style={{ color: "#999", fontSize: 13 }}>{p.nameAr}</div>
              <Divider style={{ margin: "6px 0" }} />
              <div style={{ fontSize: 13 }}>
                <span>Qty: <b>{p.quantity}</b></span>
                <span style={{ float: "right", color: "#188048" }}>${Number(p.price).toFixed(2)}</span>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );

  // Responsive filter bar
  const renderFilters = () => (
    <Card
      style={{
        borderRadius: 12,
        marginBottom: isMobile ? 16 : 24,
      }}
    >
      <Row gutter={[8, 8]} style={{ flexWrap: "wrap" }}>
        <Col xs={24} sm={12} md={8}>
          <DatePicker
            allowClear
            placeholder="Filter by Date"
            onChange={d => setDateFilter(d)}
            style={{ width: "100%" }}
            value={dateFilter}
            size={isMobile ? "middle" : "large"}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Select
            mode="multiple"
            allowClear
            placeholder="Payment Methods"
            style={{ width: "100%" }}
            value={paymentMethods}
            onChange={setPaymentMethods}
            size={isMobile ? "middle" : "large"}
          >
            {paymentMethodsList.map(method => (
              <Option key={method} value={method}>{method}</Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Select
            mode="multiple"
            allowClear
            placeholder="Statuses"
            style={{ width: "100%" }}
            value={statuses}
            onChange={setStatuses}
            size={isMobile ? "middle" : "large"}
          >
            {statusList.map(status => (
              <Option key={status} value={status}>{status}</Option>
            ))}
          </Select>
        </Col>
      </Row>
    </Card>
  );

  return (
    <div className="p-2 md:p-6 min-h-screen">
      <Card>
        <PageHeader
          title="Transactions"
          subtitle="View and filter all transactions for your vendor account"
          actions={
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={fetchData}
              loading={vendorTransactionsLoading}
            >
              Refresh
            </Button>
          }
        />
        {renderFilters()}
        {isMobile || isTablet ? (
          <>
            {vendorTransactionsLoading && (!vendorTransactions.items || vendorTransactions.items.length === 0) ? (
              <Spin tip="Loading..." style={{ width: "100%", margin: "32px 0" }} />
            ) : vendorTransactions.items && vendorTransactions.items.length > 0 ? (
              vendorTransactions.items.map(txn => renderTransactionCard(txn))
            ) : (
              <Empty description="No transactions found" style={{ margin: '32px 0' }} />
            )}
          </>
        ) : (
          <Table
            dataSource={vendorTransactions.items}
            columns={columns}
            loading={vendorTransactionsLoading}
            rowKey="orderId"
            pagination={false}
            locale={{
              emptyText: vendorTransactionsLoading
                ? <Spin tip="Loading..." />
                : <Empty description="No transactions found" />
            }}
            onChange={(pagination, filters, sorter) => {
              if (sorter && sorter.field === 'transactionDate') {
                setSortDirection(sorter.order === 'ascend' ? 'asc' : 'desc');
              }
            }}
            expandable={{
              expandedRowRender: renderExpandedRow,
              expandRowByClick: true
            }}
          />
        )}
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Pagination
            current={vendorTransactions.pageNumber}
            pageSize={pageSize}
            total={vendorTransactions.totalPages * pageSize}
            showSizeChanger
            pageSizeOptions={['10', '20', '50']}
            onChange={(page, size) => {
              setPageNumber(page);
              setPageSize(size);
            }}
          />
        </div>
      </Card>
    </div>
  );
};

export default VendorTransactionsPage;
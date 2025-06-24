import { useState, useEffect } from 'react';
import {
  Button,
  Card,
  Space,
  Tooltip,
  Row,
  Col,
  Avatar,
  DatePicker
} from 'antd';
import {
  InfoCircleOutlined,
  ReloadOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsers, clearError } from '../redux/slices/adminSlice';

// Import reusable components
import PageHeader from '../components/common/PageHeader';
import TableWrapper from '../components/common/TableWrapper';
import SearchInput from '../components/common/SearchInput';
import ToastNotifier from '../components/common/ToastNotifier';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

const UsersPage = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector(state => state.admin);

  // State for pagination and filters
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [searchValue, setSearchValue] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('');
  const [dateFilter, setDateFilter] = useState(null);

  const navigate = useNavigate();

  // Load users data
  useEffect(() => {
    dispatch(fetchAllUsers({
      pageNumber: currentPage,
      pageSize: pageSize,
      searchValue: searchValue,
      sortColumn: sortColumn,
      sortDirection: sortDirection,
      DateFilter: dateFilter ? dateFilter.format('YYYY-MM-DD') : undefined,
    }));
    
  }, [dispatch, currentPage, pageSize, searchValue, sortColumn, sortDirection, dateFilter]);
  // Handle errors
  useEffect(() => {
    if (error) {
      ToastNotifier.error('Failed to load users', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Search function
  const handleSearch = (value) => {
    setSearchValue(value);
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
    setDateFilter(null);
    setSortColumn('');
    setSortDirection('');
    setCurrentPage(1);

    dispatch(fetchAllUsers({
      pageNumber: 1,
      pageSize: pageSize
    }));
  };

  // Refresh users list
  const handleRefresh = () => {
    dispatch(fetchAllUsers({
      pageNumber: currentPage,
      pageSize: pageSize,
      searchValue: searchValue,
      sortColumn: sortColumn,
      sortDirection: sortDirection,
      DateFilter: dateFilter ? dateFilter.format('YYYY-MM-DD') : undefined,
    }));

    ToastNotifier.success('Users list refreshed');
  };

  // Table change handler for sorting and pagination
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

  // Table columns
  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (_, record) => (
        <div className="flex items-center">
          <Avatar
            src={`https://service-provider.runasp.net${record.imageUrl}`}
            icon={<UserOutlined />}
            size={40}
            className="mr-4"
          />
          <div>
            <div className="font-medium">{record.fullName}</div>
            <div className="text-sm text-gray-500">{record.email}</div>
            {record.address && (
              <div className="text-sm text-gray-400 hidden md:block">{record.address}</div>
            )}
          </div>
        </div>
      ),
      width: 200,
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => id || 'Not found',
      width: 200,
    },
    {
      title: 'Phone',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (phoneNumber) => phoneNumber || 'Not found',
      responsive: ['md'],
      width: 150,
    },
    {
      title: 'Registration Date',
      dataIndex: 'registrationDate',
      key: 'registrationDate',
      sorter: true,
      render: (date) => date ? new Date(date).toLocaleDateString() : 'Not found',
      responsive: ['lg'],
      width: 150,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View User Details">
            <Button
              icon={<InfoCircleOutlined />}
              size="middle"
              onClick={() => {
                navigate(`/admin/users/${record.id}`);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Determine which data to display (filtered locally or from API)
  const displayData = users?.items || [];

  return (
    <div className="p-6 min-h-screen">
      {/* Page Header */}
      <PageHeader
        title="User Management"
        subtitle="View users and their details"
        actions={
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
            size="large"
            type="primary"
          >
            Refresh
          </Button>
        }
      />

      {/* Search and Filter Section */}
      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={12} lg={8}>
            <SearchInput
              placeholder="Search by name or email..."
              onSearch={handleSearch}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              allowClear
              size="large"
              className="w-full"
            />
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

          <Col xs={24} md={12} lg={4}>
            <Button
              onClick={handleResetFilters}
              size="large"
              className="w-full"
            >
              Reset Filters
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Users Table */}
      {loading ? (
        <LoadingSpinner text="Loading users..." />
      ) : (
        <Card
          title={`Users (${displayData.length})`}
          className="mb-6"
          extra={
            <div className="text-sm text-gray-500">
              {`Page ${users?.pageNumber || 1} of ${users?.totalPages || 1}`}
            </div>
          }
        >
          <TableWrapper
            dataSource={displayData}
            columns={columns}
            rowKey="id"
            pagination={{
              current: users?.pageNumber || 1,
              pageSize: pageSize,
              total: (users?.totalPages || 1) * pageSize,
              showSizeChanger: true,
              pageSizeOptions: ['8', '16', '32', '50'],
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
            }}
            onChange={handleTableChange}
            scroll={{ x: 'max-content' }}
          />
        </Card>
      )}
    </div>
  );
};

export default UsersPage;
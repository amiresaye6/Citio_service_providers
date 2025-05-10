import React, { useState, useEffect } from 'react';
import {
  Button,
  Card,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Divider,
  Tooltip,
  Row,
  Col,
  Avatar,
  DatePicker
} from 'antd';
import {
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsers, clearError } from '../redux/slices/adminSlice';
import moment from 'moment';

// Import reusable components
import PageHeader from '../components/common/PageHeader';
import TableWrapper from '../components/common/TableWrapper';
import SearchInput from '../components/common/SearchInput';
import ConfirmModal from '../components/common/ConfirmModal';
import ToastNotifier from '../components/common/ToastNotifier';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusTag from '../components/common/StatusTag';

const { Option } = Select;
const { RangePicker } = DatePicker;

const UsersPage = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector(state => state.admin);

  // State for pagination and filters
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [searchValue, setSearchValue] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('');
  const [roleFilter, setRoleFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [dateRange, setDateRange] = useState(null);

  // State for local filtering (for date range which API doesn't support)
  const [localFiltered, setLocalFiltered] = useState([]);

  // State for modals
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [userFormVisible, setUserFormVisible] = useState(false);
  const [userFormMode, setUserFormMode] = useState('create'); // 'create' or 'edit'
  const [currentUser, setCurrentUser] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [userToChangePassword, setUserToChangePassword] = useState(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Form instances
  const [userForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // Load users data
  useEffect(() => {
    dispatch(fetchAllUsers({
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
      ToastNotifier.error('Failed to load users', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Apply local filtering for date range
  useEffect(() => {
    if (!users?.items) {
      setLocalFiltered([]);
      return;
    }

    let filtered = [...users.items];

    // Apply role filter locally (API might not support role filtering)
    if (roleFilter) {
      filtered = filtered.filter(user =>
        user.role === roleFilter ||
        (roleFilter === 'Admin' && user.email.includes('admin'))
      );
    }

    // Apply date range filter
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = moment(dateRange[0]).startOf('day');
      const endDate = moment(dateRange[1]).endOf('day');

      filtered = filtered.filter(user => {
        if (!user.registrationDate) return false;
        const regDate = moment(user.registrationDate);
        return regDate.isBetween(startDate, endDate, null, '[]');
      });
    }

    setLocalFiltered(filtered);
  }, [users?.items, roleFilter, dateRange]);

  // Search function
  const handleSearch = (value) => {
    setSearchValue(value);
    setCurrentPage(1);
  };

  // Filter handlers
  const handleRoleFilterChange = (value) => {
    setRoleFilter(value);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchValue('');
    setRoleFilter(null);
    setStatusFilter(null);
    setDateRange(null);
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
      statuses: statusFilter ? [statusFilter] : undefined
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

  // Delete user functions
  const showDeleteConfirm = (user) => {
    setUserToDelete(user);
    setDeleteModalVisible(true);
  };

  const handleDeleteUser = async () => {
    setDeleteLoading(true);

    try {
      // In a real application, you would call an API to delete the user
      await new Promise(resolve => setTimeout(resolve, 1000));

      ToastNotifier.success('User deleted successfully');
      handleRefresh();
    } catch (error) {
      ToastNotifier.error('Failed to delete user');
    } finally {
      setDeleteLoading(false);
      setDeleteModalVisible(false);
      setUserToDelete(null);
    }
  };

  // Edit user functions
  const showEditUserModal = (user) => {
    setCurrentUser(user);
    setUserFormMode('edit');
    userForm.setFieldsValue({
      fullName: user.fullName,
      email: user.email,
      role: user.role || 'User', // Role might not be in the API response
      status: user.status || 'active',
      address: user.address,
      phoneNumber: user.phoneNumber
    });
    setUserFormVisible(true);
  };

  const showCreateUserModal = () => {
    setCurrentUser(null);
    setUserFormMode('create');
    userForm.resetFields();
    setUserFormVisible(true);
  };

  const handleUserFormSubmit = async (values) => {
    setFormLoading(true);

    try {
      // In a real application, you would call an API to create or update a user
      await new Promise(resolve => setTimeout(resolve, 1000));

      ToastNotifier.success(
        userFormMode === 'create'
          ? 'User created successfully'
          : 'User updated successfully'
      );
      handleRefresh();
    } catch (error) {
      ToastNotifier.error(
        userFormMode === 'create'
          ? 'Failed to create user'
          : 'Failed to update user'
      );
    } finally {
      setFormLoading(false);
      setUserFormVisible(false);
      setCurrentUser(null);
      userForm.resetFields();
    }
  };

  // Change password functions
  const showChangePasswordModal = (user) => {
    setUserToChangePassword(user);
    passwordForm.resetFields();
    setPasswordModalVisible(true);
  };

  const handlePasswordChange = async (values) => {
    setPasswordLoading(true);

    try {
      // In a real application, you would call an API to change the password
      await new Promise(resolve => setTimeout(resolve, 1000));

      ToastNotifier.success('Password changed successfully');
    } catch (error) {
      ToastNotifier.error('Failed to change password');
    } finally {
      setPasswordLoading(false);
      setPasswordModalVisible(false);
      setUserToChangePassword(null);
      passwordForm.resetFields();
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
            src={record.imageUrl}
            icon={<UserOutlined />}
            size="large"
            className="mr-3"
          />
          <div>
            <div className="font-medium">{record.fullName}</div>
            <div className="text-xs text-gray-500">{record.email}</div>
            {record.address && (
              <div className="text-xs text-gray-400 hidden md:block">{record.address}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      responsive: ['md'],
    },
    {
      title: 'Registration Date',
      dataIndex: 'registrationDate',
      key: 'registrationDate',
      sorter: true,
      render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A',
      responsive: ['lg'],
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <StatusTag status={record.status || 'active'} />
      ),
      responsive: ['sm'],
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit User">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => showEditUserModal(record)}
            />
          </Tooltip>
          <Tooltip title="Change Password">
            <Button
              icon={<LockOutlined />}
              size="small"
              onClick={() => showChangePasswordModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete User">
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              onClick={() => showDeleteConfirm(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Determine which data to display (filtered locally or from API)
  const displayData = dateRange || roleFilter
    ? localFiltered
    : (users?.items || []);

  return (
    <div className="p-4 md:p-6 min-h-screen">
      {/* Page Header */}
      <PageHeader
        title="User Management"
        subtitle="View, create, edit, and delete users"
        actions={
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={showCreateUserModal}
          >
            Add User
          </Button>
        }
      />

      {/* Search and Filter Section */}
      <Card className="mb-6">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12} lg={8}>
            <SearchInput
              placeholder="Search by name or email..."
              onSearch={handleSearch}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              allowClear
              className="w-full"
            />
          </Col>

          <Col xs={24} sm={12} md={6} lg={4}>
            <Select
              placeholder="Filter by role"
              value={roleFilter}
              onChange={handleRoleFilterChange}
              allowClear
              className="w-full"
            >
              <Option value="Admin">Admin</Option>
              <Option value="Vendor">Vendor</Option>
              <Option value="User">User</Option>
            </Select>
          </Col>

          <Col xs={24} sm={12} md={6} lg={4}>
            <Select
              placeholder="Filter by status"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              allowClear
              className="w-full"
            >
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
              <Option value="pending">Pending</Option>
            </Select>
          </Col>

          <Col xs={24} md={12} lg={8}>
            <RangePicker
              placeholder={['Start Date', 'End Date']}
              value={dateRange}
              onChange={handleDateRangeChange}
              className="w-full"
            />
          </Col>

          <Col xs={12} sm={6} md={6} lg={4}>
            <Button
              onClick={handleResetFilters}
              className="w-full"
            >
              Reset Filters
            </Button>
          </Col>

          <Col xs={12} sm={6} md={6} lg={4}>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
              className="w-full"
              type="primary"
            >
              Refresh
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
              {dateRange || roleFilter
                ? `Showing filtered results: ${displayData.length} users`
                : `Page ${users?.pageNumber || 1} of ${users?.totalPages || 1}`}
            </div>
          }
        >
          <TableWrapper
            dataSource={displayData}
            columns={columns}
            rowKey="id"
            pagination={{
              current: dateRange || roleFilter ? 1 : (users?.pageNumber || 1),
              pageSize: pageSize,
              total: dateRange || roleFilter
                ? displayData.length
                : (users?.totalPages || 1) * pageSize,
              showSizeChanger: true,
              pageSizeOptions: ['8', '16', '32', '50'],
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
            }}
            onChange={handleTableChange}
            scroll={{ x: 'max-content' }}
          />
        </Card>
      )}

      {/* Delete User Confirm Modal */}
      <ConfirmModal
        title="Delete User"
        content={
          userToDelete ?
            <>
              <p>Are you sure you want to delete the following user?</p>
              <p><strong>{userToDelete.fullName}</strong> ({userToDelete.email})</p>
              <p className="text-red-500 mt-4">
                <ExclamationCircleOutlined className="mr-2" />
                This action cannot be undone.
              </p>
            </> :
            'Are you sure you want to delete this user?'
        }
        open={deleteModalVisible}
        onConfirm={handleDeleteUser}
        onCancel={() => {
          setDeleteModalVisible(false);
          setUserToDelete(null);
        }}
        confirmLoading={deleteLoading}
        isDanger={true}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Create/Edit User Modal */}
      <Modal
        title={userFormMode === 'create' ? 'Create New User' : 'Edit User'}
        open={userFormVisible}
        onCancel={() => {
          setUserFormVisible(false);
          setCurrentUser(null);
          userForm.resetFields();
        }}
        footer={null}
        destroyOnClose
        width={600}
      >
        <Form
          form={userForm}
          layout="vertical"
          onFinish={handleUserFormSubmit}
          initialValues={{
            status: 'active',
            role: 'User'
          }}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="fullName"
                label="Full Name"
                rules={[{ required: true, message: 'Please enter user name' }]}
              >
                <Input placeholder="Full name" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input placeholder="Email address" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="phoneNumber"
                label="Phone Number"
              >
                <Input placeholder="Phone number" />
              </Form.Item>
            </Col>

            {userFormMode === 'create' && (
              <Col span={24}>
                <Form.Item
                  name="password"
                  label="Password"
                  rules={[
                    { required: true, message: 'Please enter password' },
                    { min: 8, message: 'Password must be at least 8 characters' }
                  ]}
                >
                  <Input.Password placeholder="Password" />
                </Form.Item>
              </Col>
            )}

            <Col xs={24}>
              <Form.Item
                name="address"
                label="Address"
              >
                <Input placeholder="Address" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="role"
                label="Role"
                rules={[{ required: true, message: 'Please select a role' }]}
              >
                <Select placeholder="Select a role">
                  <Option value="Admin">Admin</Option>
                  <Option value="Vendor">Vendor</Option>
                  <Option value="User">User</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Please select a status' }]}
              >
                <Select placeholder="Select status">
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                  <Option value="pending">Pending</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                setUserFormVisible(false);
                setCurrentUser(null);
                userForm.resetFields();
              }}
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={formLoading}>
              {userFormMode === 'create' ? 'Create User' : 'Update User'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        title="Change Password"
        open={passwordModalVisible}
        onCancel={() => {
          setPasswordModalVisible(false);
          setUserToChangePassword(null);
          passwordForm.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        {userToChangePassword && (
          <div className="mb-4">
            <p>Change password for user:</p>
            <p><strong>{userToChangePassword.fullName}</strong> ({userToChangePassword.email})</p>
          </div>
        )}

        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordChange}
        >
          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: 'Please enter new password' },
              { min: 8, message: 'Password must be at least 8 characters' }
            ]}
          >
            <Input.Password placeholder="New password" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm new password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm new password" />
          </Form.Item>

          <Divider />

          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                setPasswordModalVisible(false);
                setUserToChangePassword(null);
                passwordForm.resetFields();
              }}
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={passwordLoading}>
              Change Password
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default UsersPage;
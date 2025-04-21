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
  Tabs
} from 'antd';
import {
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  ExclamationCircleOutlined,
  FilterOutlined,
  ReloadOutlined
} from '@ant-design/icons';

// Import reusable components
import PageHeader from '../components/common/PageHeader';
import TableWrapper from '../components/common/TableWrapper';
import SearchInput from '../components/common/SearchInput';
import ConfirmModal from '../components/common/ConfirmModal';
import ToastNotifier from '../components/common/ToastNotifier';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusTag from '../components/common/StatusTag';
import UserCard from '../components/common/UserCard';
import FilterBar from '../components/common/FilterBar';

const { Option } = Select;
const { TabPane } = Tabs;

const UsersPage = () => {
  // State for users data
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [activeFilters, setActiveFilters] = useState({});

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

  // Mock user data
  const mockUsers = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@example.com',
      role: 'Admin',
      status: 'active',
      lastLogin: '2025-04-20T15:30:45',
      createdAt: '2024-08-15'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      role: 'Editor',
      status: 'active',
      lastLogin: '2025-04-19T09:12:33',
      createdAt: '2024-09-22'
    },
    {
      id: 3,
      name: 'Michael Brown',
      email: 'michael.brown@example.com',
      role: 'Viewer',
      status: 'inactive',
      lastLogin: '2025-04-01T16:45:22',
      createdAt: '2024-07-30'
    },
    {
      id: 4,
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      role: 'Admin',
      status: 'active',
      lastLogin: '2025-04-20T11:23:51',
      createdAt: '2024-10-05'
    },
    {
      id: 5,
      name: 'Robert Wilson',
      email: 'robert.wilson@example.com',
      role: 'Editor',
      status: 'pending',
      lastLogin: null,
      createdAt: '2025-04-18'
    },
    {
      id: 6,
      name: 'Jessica Miller',
      email: 'jessica.miller@example.com',
      role: 'Viewer',
      status: 'active',
      lastLogin: '2025-04-15T14:12:09',
      createdAt: '2024-11-12'
    },
    {
      id: 7,
      name: 'David Clark',
      email: 'david.clark@example.com',
      role: 'Editor',
      status: 'active',
      lastLogin: '2025-04-19T17:30:45',
      createdAt: '2024-12-03'
    },
    {
      id: 8,
      name: 'Lisa Moore',
      email: 'lisa.moore@example.com',
      role: 'Viewer',
      status: 'inactive',
      lastLogin: '2025-03-25T10:15:33',
      createdAt: '2024-08-28'
    },
    {
      id: 9,
      name: 'Kevin Taylor',
      email: 'kevin.taylor@example.com',
      role: 'Admin',
      status: 'active',
      lastLogin: '2025-04-20T08:45:12',
      createdAt: '2025-01-10'
    },
    {
      id: 10,
      name: 'Amanda White',
      email: 'amanda.white@example.com',
      role: 'Editor',
      status: 'active',
      lastLogin: '2025-04-18T13:20:41',
      createdAt: '2025-02-15'
    }
  ];

  // Load users data
  useEffect(() => {
    const loadUsers = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1200));
        setUsers(mockUsers);
        setFilteredUsers(mockUsers);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load users:', error);
        ToastNotifier.error('Failed to load users');
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  // Filter options for the filter bar
  const filterOptions = [
    {
      key: 'role',
      placeholder: 'Role',
      options: [
        { label: 'Admin', value: 'Admin' },
        { label: 'Editor', value: 'Editor' },
        { label: 'Viewer', value: 'Viewer' }
      ]
    },
    {
      key: 'status',
      placeholder: 'Status',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Pending', value: 'pending' }
      ]
    }
  ];

  // Search and filter functions
  const handleSearch = (value) => {
    setSearchText(value);
    applyFilters(value, activeFilters);
  };

  const handleFilter = (key, value) => {
    const newFilters = { ...activeFilters };
    if (value) {
      newFilters[key] = value;
    } else {
      delete newFilters[key];
    }

    setActiveFilters(newFilters);
    applyFilters(searchText, newFilters);
  };

  const handleResetFilters = () => {
    setSearchText('');
    setActiveFilters({});
    setFilteredUsers(users);
  };

  const applyFilters = (search, filters) => {
    let result = [...users];

    // Apply search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(user =>
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter(user => user[key] === value);
      }
    });

    setFilteredUsers(result);
  };

  // Refresh users list
  const handleRefresh = async () => {
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Randomize some values to simulate fresh data
      const refreshedUsers = mockUsers.map(user => ({
        ...user,
        status: Math.random() > 0.8 ?
          (user.status === 'active' ? 'inactive' : 'active') :
          user.status,
        lastLogin: Math.random() > 0.3 ?
          new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString() :
          user.lastLogin
      }));

      setUsers(refreshedUsers);
      setFilteredUsers(refreshedUsers);
      handleResetFilters();
      ToastNotifier.success('Users list refreshed');
    } catch (error) {
      ToastNotifier.error('Failed to refresh users');
    } finally {
      setLoading(false);
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Remove user from state
      const updatedUsers = users.filter(u => u.id !== userToDelete.id);
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers.filter(user => {
        // Reapply current filters
        let matches = true;
        if (searchText) {
          const searchLower = searchText.toLowerCase();
          matches = matches && (
            user.name.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower)
          );
        }

        Object.entries(activeFilters).forEach(([key, value]) => {
          if (value) {
            matches = matches && user[key] === value;
          }
        });

        return matches;
      }));

      ToastNotifier.success('User deleted successfully');
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
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (userFormMode === 'create') {
        // Create new user
        const newUser = {
          id: users.length + 1,
          ...values,
          lastLogin: null,
          createdAt: new Date().toISOString().split('T')[0]
        };

        const updatedUsers = [newUser, ...users];
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
        ToastNotifier.success('User created successfully');
      } else {
        // Update existing user
        const updatedUsers = users.map(user =>
          user.id === currentUser.id ? { ...user, ...values } : user
        );

        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers.filter(user => {
          // Reapply current filters
          let matches = true;
          if (searchText) {
            const searchLower = searchText.toLowerCase();
            matches = matches && (
              user.name.toLowerCase().includes(searchLower) ||
              user.email.toLowerCase().includes(searchLower)
            );
          }

          Object.entries(activeFilters).forEach(([key, value]) => {
            if (value) {
              matches = matches && user[key] === value;
            }
          });

          return matches;
        }));

        ToastNotifier.success('User updated successfully');
      }
    } catch (error) {
      ToastNotifier.error(userFormMode === 'create' ?
        'Failed to create user' :
        'Failed to update user'
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
      // Simulate API call
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
        <UserCard
          name={record.name}
          email={record.email}
          status={record.status}
          role={record.role}
        />
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 120,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => <StatusTag status={status} />,
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      width: 200,
      render: (lastLogin) => lastLogin ?
        new Date(lastLogin).toLocaleString() :
        'Never'
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
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

  return (
    <div className="page-container">
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
        <div className="mb-4">
          <SearchInput
            placeholder="Search by name or email..."
            onSearch={handleSearch}
            allowClear
          />
        </div>

        <FilterBar
          filters={filterOptions}
          onFilterChange={handleFilter}
          onReset={handleResetFilters}
          loading={loading}
        />

        <div className="flex justify-end mt-4">
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
          >
            Refresh
          </Button>
        </div>
      </Card>

      {/* Users Table */}
      <Card title={`Users (${filteredUsers.length})`} className="mb-6">
        <TableWrapper
          dataSource={filteredUsers}
          columns={columns}
          loading={loading}
          pagination={{
            pageSize: 8,
            showSizeChanger: true,
            pageSizeOptions: ['8', '16', '32'],
          }}
        />
      </Card>

      {/* Delete User Confirm Modal */}
      <ConfirmModal
        title="Delete User"
        content={
          userToDelete ?
            <>
              <p>Are you sure you want to delete the following user?</p>
              <p><strong>{userToDelete.name}</strong> ({userToDelete.email})</p>
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
      >
        <Form
          form={userForm}
          layout="vertical"
          onFinish={handleUserFormSubmit}
          initialValues={{
            status: 'active',
            role: 'Viewer'
          }}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter user name' }]}
          >
            <Input placeholder="Full name" />
          </Form.Item>

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

          {userFormMode === 'create' && (
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
          )}

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select a role' }]}
          >
            <Select placeholder="Select a role">
              <Option value="Admin">Admin</Option>
              <Option value="Editor">Editor</Option>
              <Option value="Viewer">Viewer</Option>
            </Select>
          </Form.Item>

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
            <p><strong>{userToChangePassword.name}</strong> ({userToChangePassword.email})</p>
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
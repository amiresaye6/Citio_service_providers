
import React, { useState } from 'react'
import { Button, Card, Divider, Space, Switch } from 'antd'
import {
    PlusOutlined,
    ExclamationCircleOutlined,
    BellOutlined,
    ReloadOutlined,
} from '@ant-design/icons'

// Import our reusable components
import PageHeader from '../components/common/PageHeader'
import TableWrapper from '../components/common/TableWrapper'
import ConfirmModal from '../components/common/ConfirmModal'
import StatusTag from '../components/common/StatusTag'
import SearchInput from '../components/common/SearchInput'
import UserCard from '../components/common/UserCard'
import ToastNotifier from '../components/common/ToastNotifier'
import LoadingSpinner from '../components/common/LoadingSpinner'
import FilterBar from '../components/common/FilterBar'

const TestComponentsPage = () => {
    // State variables
    const [loading, setLoading] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [confirmLoading, setConfirmLoading] = useState(false)
    const [searchText, setSearchText] = useState('')

    // Sample data for the table
    const tableData = [
        {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            status: 'active',
            role: 'Admin',
            createdAt: '2023-03-15',
        },
        {
            id: 2,
            name: 'Jane Smith',
            email: 'jane@example.com',
            status: 'inactive',
            role: 'Editor',
            createdAt: '2023-02-28',
        },
        {
            id: 3,
            name: 'Bob Johnson',
            email: 'bob@example.com',
            status: 'pending',
            role: 'Viewer',
            createdAt: '2023-03-10',
        },
        {
            id: 4,
            name: 'Alice Brown',
            email: 'alice@example.com',
            status: 'active',
            role: 'Admin',
            createdAt: '2023-01-05',
        },
        {
            id: 5,
            name: 'Charlie Wilson',
            email: 'charlie@example.com',
            status: 'warning',
            role: 'Editor',
            createdAt: '2023-03-01',
        },
    ]

    // Table columns
    const columns = [
        {
            title: 'User',
            dataIndex: 'name',
            key: 'name',
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
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => <StatusTag status={status} />,
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: () => (
                <Space>
                    <Button size="small" type="text">
                        Edit
                    </Button>
                    <Button size="small" type="text" danger onClick={() => setModalVisible(true)}>
                        Delete
                    </Button>
                </Space>
            ),
        },
    ]

    // Filter options
    const filterOptions = [
        {
            key: 'status',
            placeholder: 'Status',
            options: [
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
                { label: 'Pending', value: 'pending' },
            ],
        },
        {
            key: 'role',
            placeholder: 'Role',
            options: [
                { label: 'Admin', value: 'Admin' },
                { label: 'Editor', value: 'Editor' },
                { label: 'Viewer', value: 'Viewer' },
            ],
        },
    ]

    // Handlers
    const handleSearch = (value) => {
        console.log('Search:', value)
        setSearchText(value)
    }

    const handleFilter = (key, value) => {
        console.log('Filter:', key, value)
    }

    const handleDateRange = (dates) => {
        console.log('Date Range:', dates)
    }

    const handleResetFilters = () => {
        console.log('Reset filters')
    }

    const handleConfirm = () => {
        setConfirmLoading(true)
        setTimeout(() => {
            setConfirmLoading(false)
            setModalVisible(false)
            ToastNotifier.success('Action successful', 'Item has been deleted')
        }, 2000)
    }

    const toggleLoading = () => {
        setLoading(!loading)
    }

    const showNotification = (type) => {
        switch (type) {
            case 'success':
                ToastNotifier.success('Success', 'Operation completed successfully')
                break
            case 'error':
                ToastNotifier.error('Error', 'Something went wrong')
                break
            case 'info':
                ToastNotifier.info('Information', 'Here is some information')
                break
            case 'warning':
                ToastNotifier.warning('Warning', 'This is a warning message')
                break
            default:
                break
        }
    }

    return (
        <div className="page-container">
            {/* Page Header */}
            <PageHeader
                title="Test Components"
                subtitle="Showcase of all reusable components"
                actions={
                    <>
                        <Button icon={<PlusOutlined />} type="primary">
                            Add New
                        </Button>
                    </>
                }
            />

            {/* Search and Filter Section */}
            <Card className="mb-6">
                <div className="mb-4">
                    <SearchInput
                        placeholder="Search users..."
                        onSearch={handleSearch}
                        allowClear
                    />
                </div>

                <FilterBar
                    filters={filterOptions}
                    dateRange={true}
                    onFilterChange={handleFilter}
                    onDateRangeChange={handleDateRange}
                    onReset={handleResetFilters}
                    loading={loading}
                />
            </Card>

            {/* Table Section */}
            <Card title="Users Table" className="mb-6">
                <div className="flex justify-end mb-4">
                    <Switch
                        checkedChildren="Loading"
                        unCheckedChildren="Loading"
                        checked={loading}
                        onChange={toggleLoading}
                    />
                </div>
                <TableWrapper
                    dataSource={tableData}
                    columns={columns}
                    loading={loading}
                    pagination={{ pageSize: 5 }}
                />
            </Card>

            {/* Status Tags Preview */}
            <Card title="Status Tags" className="mb-6">
                <Space size="large">
                    <StatusTag status="active" />
                    <StatusTag status="inactive" />
                    <StatusTag status="pending" />
                    <StatusTag status="warning" />
                    <StatusTag status="error" />
                    <StatusTag status="loading" />
                    <StatusTag status="custom" text="Custom" customColor="purple" />
                </Space>
            </Card>

            {/* User Cards */}
            <Card title="User Cards" className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tableData.slice(0, 3).map((user) => (
                        <Card key={user.id} size="small">
                            <UserCard
                                name={user.name}
                                email={user.email}
                                status={user.status}
                                role={user.role}
                                size="large"
                            />
                        </Card>
                    ))}
                </div>
            </Card>

            {/* Modal and Toast Notifications */}
            <Card title="Interactive Components" className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h3 className="text-lg mb-4">Confirm Modal</h3>
                        <Button onClick={() => setModalVisible(true)} danger>
                            Open Delete Modal
                        </Button>
                    </div>

                    <div>
                        <h3 className="text-lg mb-4">Toast Notifications</h3>
                        <Space>
                            <Button type="primary" onClick={() => showNotification('success')}>
                                Success
                            </Button>
                            <Button danger onClick={() => showNotification('error')}>
                                Error
                            </Button>
                            <Button onClick={() => showNotification('info')}>Info</Button>
                            <Button
                                style={{ background: '#faad14', borderColor: '#faad14', color: 'white' }}
                                onClick={() => showNotification('warning')}
                            >
                                Warning
                            </Button>
                        </Space>
                    </div>
                </div>
            </Card>

            {/* Loading Spinner */}
            <Card title="Loading Spinner" className="mb-6">
                <div className="flex justify-center">
                    <Space size="large">
                        <div>
                            <h4 className="text-center mb-2">Small</h4>
                            <LoadingSpinner size="small" />
                        </div>
                        <div>
                            <h4 className="text-center mb-2">Default</h4>
                            <LoadingSpinner />
                        </div>
                        <div>
                            <h4 className="text-center mb-2">Large</h4>
                            <LoadingSpinner size="large" text="Loading data..." />
                        </div>
                        <div>
                            <h4 className="text-center mb-2">No Text</h4>
                            <LoadingSpinner showText={false} />
                        </div>
                    </Space>
                </div>
            </Card>

            {/* Page Header Examples */}
            <Card title="Page Header Examples" className="mb-6">
                <PageHeader
                    title="Simple Header"
                    level={3}
                    className="mb-4"
                />

                <Divider />

                <PageHeader
                    title="With Subtitle"
                    subtitle="This is a descriptive subtitle that explains the purpose of the page"
                    level={3}
                    className="mb-4"
                />

                <Divider />

                <PageHeader
                    title="With Actions"
                    subtitle="Header with action buttons"
                    level={3}
                    actions={
                        <Space>
                            <Button icon={<ReloadOutlined />}>Refresh</Button>
                            <Button type="primary" icon={<PlusOutlined />}>
                                Add New
                            </Button>
                        </Space>
                    }
                />
            </Card>
            {/* Confirm Modal */}
            <ConfirmModal
                title="Confirm Deletion"
                content="Are you sure you want to delete this item? This action cannot be undone."
                open={modalVisible}
                onConfirm={handleConfirm}
                onCancel={() => setModalVisible(false)}
                confirmLoading={confirmLoading}
                isDanger={true}
                confirmText="Delete"
                cancelText="Cancel"
            />
        </div>
    )
}

export default TestComponentsPage
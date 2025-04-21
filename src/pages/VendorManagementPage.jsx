import React, { useState, useEffect } from 'react';
import { Button, Input, Modal, Form } from 'antd';
import PageHeader from '../components/common/PageHeader';
import TableWrapper from '../components/common/TableWrapper';
import ConfirmModal from '../components/common/ConfirmModal';
import ToastNotifier from '../components/common/ToastNotifier';
import SearchInput from '../components/common/SearchInput';
import StatusTag from '../components/common/StatusTag';
import FilterBar from '../components/common/FilterBar';

const VendorManagementPage = () => {
    const [vendors, setVendors] = useState([]);
    const [filteredVendors, setFilteredVendors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);
    const [form] = Form.useForm();

    // Fake vendor data (replace with API call in a real app)
    const fakeVendors = [
        { id: '1', name: 'Acme Corp', contact: 'john@acme.com', status: 'active' },
        { id: '2', name: 'Beta LLC', contact: 'jane@beta.com', status: 'inactive' },
        { id: '3', name: 'Gamma Inc', contact: 'bob@gamma.com', status: 'active' },
    ];

    // Simulate fetching vendors
    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setVendors(fakeVendors);
            setFilteredVendors(fakeVendors);
            setLoading(false);
            ToastNotifier.success('Vendors Loaded', 'Successfully fetched vendors.');
        }, 1000);
    }, []);

    // Table columns
    const columns = [
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Contact', dataIndex: 'contact', key: 'contact' },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => <StatusTag status={status} />,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div className="space-x-2">
                    <Button
                        type="link"
                        onClick={() => handleEdit(record)}
                    >
                        Edit
                    </Button>
                    <Button
                        type="link"
                        danger
                        onClick={() => handleDelete(record)}
                    >
                        Delete
                    </Button>
                    <Button
                        type="link"
                        onClick={() => handleToggleStatus(record)}
                    >
                        {record.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Button>
                </div>
            ),
        },
    ];

    // Filter configuration
    const filters = [
        {
            key: 'status',
            placeholder: 'Select Status',
            options: [
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
            ],
        },
    ];

    // Handle search
    const handleSearch = (value) => {
        const filtered = vendors.filter(
            (vendor) =>
                vendor.name.toLowerCase().includes(value.toLowerCase()) ||
                vendor.contact.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredVendors(filtered);
    };

    // Handle filter change
    const handleFilterChange = (key, value) => {
        const filtered = value
            ? vendors.filter((vendor) => vendor[key] === value)
            : vendors;
        setFilteredVendors(filtered);
    };

    // Handle reset filters
    const handleResetFilters = () => {
        setFilteredVendors(vendors);
    };

    // Handle add vendor
    const handleAddVendor = () => {
        form.validateFields().then((values) => {
            const newVendor = {
                id: String(vendors.length + 1),
                name: values.name,
                contact: values.contact,
                status: 'active',
            };
            setVendors([...vendors, newVendor]);
            setFilteredVendors([...vendors, newVendor]);
            setIsAddModalVisible(false);
            form.resetFields();
            ToastNotifier.success('Vendor Added', `${values.name} has been added.`);
        }).catch(() => {
            ToastNotifier.error('Validation Failed', 'Please fill in all required fields.');
        });
    };

    // Handle edit vendor
    const handleEdit = (vendor) => {
        setSelectedVendor(vendor);
        form.setFieldsValue(vendor);
        setIsEditModalVisible(true);
    };

    const handleUpdateVendor = () => {
        form.validateFields().then((values) => {
            const updatedVendors = vendors.map((vendor) =>
                vendor.id === selectedVendor.id ? { ...vendor, ...values } : vendor
            );
            setVendors(updatedVendors);
            setFilteredVendors(updatedVendors);
            setIsEditModalVisible(false);
            form.resetFields();
            ToastNotifier.success('Vendor Updated', `${values.name} has been updated.`);
        }).catch(() => {
            ToastNotifier.error('Validation Failed', 'Please fill in all required fields.');
        });
    };

    // Handle delete vendor
    const handleDelete = (vendor) => {
        setSelectedVendor(vendor);
        setConfirmAction('delete');
        setIsConfirmModalVisible(true);
    };

    const handleConfirmDelete = () => {
        const updatedVendors = vendors.filter((vendor) => vendor.id !== selectedVendor.id);
        setVendors(updatedVendors);
        setFilteredVendors(updatedVendors);
        setIsConfirmModalVisible(false);
        ToastNotifier.success('Vendor Deleted', `${selectedVendor.name} has been deleted.`);
    };

    // Handle toggle status
    const handleToggleStatus = (vendor) => {
        setSelectedVendor(vendor);
        setConfirmAction('toggleStatus');
        setIsConfirmModalVisible(true);
    };

    const handleConfirmToggleStatus = () => {
        const updatedVendors = vendors.map((vendor) =>
            vendor.id === selectedVendor.id
                ? { ...vendor, status: vendor.status === 'active' ? 'inactive' : 'active' }
                : vendor
        );
        setVendors(updatedVendors);
        setFilteredVendors(updatedVendors);
        setIsConfirmModalVisible(false);
        ToastNotifier.success(
            'Status Updated',
            `${selectedVendor.name} is now ${selectedVendor.status === 'active' ? 'inactive' : 'active'}.`
        );
    };

    return (
        <div className="p-6 min-h-screen">
            <PageHeader
                title="Vendor Management"
                subtitle="Manage your vendors and their statuses"
                actions={
                    <Button
                        type="primary"
                        onClick={() => setIsAddModalVisible(true)}
                    >
                        Add Vendor
                    </Button>
                }
            />

            <SearchInput
                placeholder="Search by name or contact..."
                onSearch={handleSearch}
            />

            <FilterBar
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
                loading={loading}
            />

            <TableWrapper
                dataSource={filteredVendors}
                columns={columns}
                loading={loading}
                rowKey="id"
            />

            {/* Add Vendor Modal */}
            <Modal
                title="Add Vendor"
                open={isAddModalVisible}
                onOk={handleAddVendor}
                onCancel={() => {
                    setIsAddModalVisible(false);
                    form.resetFields();
                }}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Vendor Name"
                        rules={[{ required: true, message: 'Please enter vendor name' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="contact"
                        label="Contact Email"
                        rules={[{ required: true, message: 'Please enter contact email' }]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Edit Vendor Modal */}
            <Modal
                title="Edit Vendor"
                open={isEditModalVisible}
                onOk={handleUpdateVendor}
                onCancel={() => {
                    setIsEditModalVisible(false);
                    form.resetFields();
                }}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Vendor Name"
                        rules={[{ required: true, message: 'Please enter vendor name' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="contact"
                        label="Contact Email"
                        rules={[{ required: true, message: 'Please enter contact email' }]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Confirm Modal */}
            <ConfirmModal
                open={isConfirmModalVisible}
                onConfirm={confirmAction === 'delete' ? handleConfirmDelete : handleConfirmToggleStatus}
                onCancel={() => setIsConfirmModalVisible(false)}
                title={confirmAction === 'delete' ? 'Delete Vendor' : 'Toggle Status'}
                content={
                    confirmAction === 'delete'
                        ? `Are you sure you want to delete ${selectedVendor?.name}?`
                        : `Are you sure you want to ${selectedVendor?.status === 'active' ? 'deactivate' : 'activate'} ${selectedVendor?.name}?`
                }
                isDanger={confirmAction === 'delete'}
            />
        </div>
    );
};

export default VendorManagementPage;
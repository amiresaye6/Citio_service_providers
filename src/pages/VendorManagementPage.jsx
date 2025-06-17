import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Select, Input } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchVendors,
    approveVendor,
    deactivateVendor,
    clearError,
    fetchSubcategories,
} from '../redux/slices/vendorsSlice';
import { register } from '../redux/slices/authSlice';
import PageHeader from '../components/common/PageHeader';
import TableWrapper from '../components/common/TableWrapper';
import SearchInput from '../components/common/SearchInput';
import FilterBar from '../components/common/FilterBar';
import StatusTag from '../components/common/StatusTag';
import ToastNotifier from '../components/common/ToastNotifier';

const { Option } = Select;

const VendorManagementPage = () => {
    const dispatch = useDispatch();
    const { vendors, subcategories, loading, error } = useSelector((state) => state.vendors);
    const { loading: authLoading, error: authError } = useSelector((state) => state.auth);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchValue, setSearchValue] = useState('');
    const [statusFilter, setStatusFilter] = useState(null);
    const [sortColumn, setSortColumn] = useState('');
    const [sortDirection, setSortDirection] = useState('');
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        dispatch(fetchVendors({
            PageNumer: currentPage,
            PageSize: pageSize,
            SearchValue: searchValue,
            Status: statusFilter,
            SortColumn: sortColumn,
            SortDirection: sortDirection,
        }));
        dispatch(fetchSubcategories());
    }, [dispatch, currentPage, pageSize, searchValue, statusFilter, sortColumn, sortDirection]);

    useEffect(() => {
        if (error) {
            ToastNotifier.error('Failed to load vendor data', error);
            dispatch(clearError());
        }
        if (authError) {
            ToastNotifier.error('Failed to register vendor', authError);
            dispatch(clearError());
        }
    }, [error, authError, dispatch]);

    const columns = [
        {
            title: 'Business Name',
            dataIndex: 'businessName',
            key: 'businessName',
            sorter: true,
        },
        {
            title: 'Owner',
            dataIndex: 'fullName',
            key: 'fullName',
            sorter: true,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            sorter: true,
        },
        {
            title: 'Business Type',
            dataIndex: 'businessType',
            key: 'businessType',
            sorter: true,
        },
        {
            title: 'Status',
            dataIndex: 'isApproved',
            key: 'isApproved',
            render: (isApproved) => <StatusTag status={isApproved ? 'active' : 'pending'} />,
            sorter: true,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div className="space-x-2">
                    <Button
                        type="link"
                        danger
                        onClick={() => handleDeactivate(record)}
                    >
                        Deactivate
                    </Button>
                    {!record.isApproved && (
                        <Button
                            type="link"
                            onClick={() => handleActivate(record)}
                        >
                            Activate
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    const filters = [
        {
            key: 'isApproved',
            placeholder: 'Select Status',
            options: [
                { label: 'Active', value: true },
                { label: 'Pending', value: false },
            ],
        },
    ];

    const handleSearch = (value) => {
        setSearchValue(value);
        setCurrentPage(1);
    };

    const handleFilterChange = (key, value) => {
        if (key === 'isApproved') {
            setStatusFilter(value !== undefined ? value : null);
        }
        setCurrentPage(1);
    };

    const handleResetFilters = () => {
        setSearchValue('');
        setStatusFilter(null);
        setSortColumn('');
        setSortDirection('');
        setCurrentPage(1);
    };

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

    const handleAddVendor = () => {
        form.validateFields().then((values) => {
            const vendorData = {
                email: values.email,
                password: values.password,
                fullName: values.fullName,
                businessName: values.businessName,
                businessType: values.businessType,
                taxNumber: values.taxNumber,
                subCategoryIds: values.subCategoryIds,
            };
            dispatch(register(vendorData)).then((result) => {
                if (result.meta.requestStatus === 'fulfilled') {
                    ToastNotifier.success('Vendor Added', `${values.businessName} has been registered.`);
                    dispatch(fetchVendors({
                        PageNumer: currentPage,
                        PageSize: pageSize,
                        SearchValue: searchValue,
                        Status: statusFilter,
                        SortColumn: sortColumn,
                        SortDirection: sortDirection,
                    }));
                }
            });
            setIsAddModalVisible(false);
            form.resetFields();
        }).catch(() => {
            ToastNotifier.error('Validation Failed', 'Please fill in all required fields.');
        });
    };

    const handleActivate = (vendor) => {
        setSelectedVendor(vendor);
        setConfirmAction('activate');
        setIsConfirmModalVisible(true);
    };

    const handleConfirmActivate = () => {
        dispatch(approveVendor(selectedVendor.id)).then((result) => {
            if (result.meta.requestStatus === 'fulfilled') {
                ToastNotifier.success('Vendor Activated', `${selectedVendor.businessName} has been activated.`);
                dispatch(fetchVendors({
                    PageNumer: currentPage,
                    PageSize: pageSize,
                    SearchValue: searchValue,
                    Status: statusFilter,
                    SortColumn: sortColumn,
                    SortDirection: sortDirection,
                }));
            }
        });
        setIsConfirmModalVisible(false);
    };

    const handleDeactivate = (vendor) => {
        setSelectedVendor(vendor);
        setConfirmAction('deactivate');
        setIsConfirmModalVisible(true);
    };

    const handleConfirmDeactivate = () => {
        dispatch(deactivateVendor(selectedVendor.id)).then((result) => {
            if (result.meta.requestStatus === 'fulfilled') {
                ToastNotifier.success('Vendor Deactivated', `${selectedVendor.businessName} has been deactivated.`);
                dispatch(fetchVendors({
                    PageNumer: currentPage,
                    PageSize: pageSize,
                    SearchValue: searchValue,
                    Status: statusFilter,
                    SortColumn: sortColumn,
                    SortDirection: sortDirection,
                }));
            }
        });
        setIsConfirmModalVisible(false);
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
                placeholder="Search by name, email, or contact..."
                onSearch={handleSearch}
                className="mb-4"
            />

            <FilterBar
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
                loading={loading || authLoading}
            />

            <TableWrapper
                dataSource={vendors.items}
                columns={columns}
                loading={loading || authLoading}
                rowKey="id"
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: vendors.totalCount,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50'],
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} vendors`,
                    position: ['bottomCenter'],
                    showQuickJumper: true,
                }}
                onChange={handleTableChange}
            />

            <Modal
                title="Add Vendor"
                open={isAddModalVisible}
                onOk={handleAddVendor}
                onCancel={() => {
                    setIsAddModalVisible(false);
                    form.resetFields();
                }}
                confirmLoading={authLoading}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="businessName"
                        label="Business Name"
                        rules={[{ required: true, message: 'Please enter business name' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="fullName"
                        label="Owner Name"
                        rules={[{ required: true, message: 'Please enter owner name' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Please enter email' },
                            { type: 'email', message: 'Please enter a valid email' },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        label="Password"
                        rules={[{ required: true, message: 'Please enter password' }]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item
                        name="businessType"
                        label="Business Type"
                        rules={[{ required: true, message: 'Please enter business type' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="taxNumber"
                        label="Tax Number"
                        rules={[{ required: true, message: 'Please enter tax number' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="subCategoryIds"
                        label="Subcategories"
                        rules={[{ required: true, message: 'Please select at least one subcategory' }]}
                    >
                        <Select mode="multiple" placeholder="Select subcategories">
                            {subcategories.map(sub => (
                                <Option key={sub.id} value={sub.id}>{sub.nameEn}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={confirmAction === 'activate' ? 'Activate Vendor' : 'Deactivate Vendor'}
                open={isConfirmModalVisible}
                onOk={confirmAction === 'activate' ? handleConfirmActivate : handleConfirmDeactivate}
                onCancel={() => setIsConfirmModalVisible(false)}
                okText={confirmAction === 'activate' ? 'Activate' : 'Deactivate'}
                cancelText="Cancel"
                okButtonProps={{ danger: confirmAction === 'deactivate' }}
            >
                <p>
                    {confirmAction === 'activate'
                        ? `Are you sure you want to activate ${selectedVendor?.businessName}?`
                        : `Are you sure you want to deactivate ${selectedVendor?.businessName}?`}
                </p>
            </Modal>
        </div>
    );
};

export default VendorManagementPage;
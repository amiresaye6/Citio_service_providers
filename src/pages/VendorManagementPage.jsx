import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Select, Input, Avatar, Rate, Space, Tooltip } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
    UserOutlined,
    ShopOutlined,
    CheckCircleOutlined,
    StopOutlined,
    EyeOutlined
} from '@ant-design/icons';
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
import { fetchBusinessTypes } from '../redux/slices/adminSlice';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

const VendorManagementPage = () => {
    const dispatch = useDispatch();
    const { vendors, subcategories, loading, error } = useSelector((state) => state.vendors);
    const { loading: authLoading, error: authError } = useSelector((state) => state.auth);
    const { BusinessTypes } = useSelector((state) => state.admin);
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
    const [allBusinessTypes, setAllBusinessTypes] = useState([]);
    const [form] = Form.useForm();
    const navigate = useNavigate();

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

    useEffect(() => {
        // Try to get business types from session storage first
        const storedBusinessTypes = sessionStorage.getItem('businessTypes');

        if (storedBusinessTypes) {
            setAllBusinessTypes(JSON.parse(storedBusinessTypes));
        } else {
            // Only fetch from API if not in session storage
            dispatch(fetchBusinessTypes());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // When BusinessTypes updates from API, update state and session storage
    useEffect(() => {
        if (BusinessTypes.businessTypes?.length > 0) {
            setAllBusinessTypes(BusinessTypes.businessTypes);
            sessionStorage.setItem('businessTypes', JSON.stringify(BusinessTypes.businessTypes));
        }
    }, [BusinessTypes.businessTypes]);

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 100,
            render: (id) => (
                <Tooltip title={`Vendor ID: ${id}`}>
                    <span className="text-xs text-gray-500 font-mono">
                        {id.substring(0, 8)}...
                    </span>
                </Tooltip>
            ),
            sorter: true,
        },
        {
            title: 'Profile',
            dataIndex: 'profilePictureUrl',
            key: 'profilePictureUrl',
            width: 80,
            render: (profilePictureUrl, record) => (
                <Avatar
                    size={40}
                    src={`https://service-provider.runasp.net${profilePictureUrl}`}
                    icon={<UserOutlined />}
                    alt={record.fullName}
                />
            ),
        },
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
            responsive: ['md'],
        },
        {
            title: 'Business Type',
            dataIndex: 'businessType',
            key: 'businessType',
            sorter: true,
            responsive: ['lg'],
        },
        {
            title: 'Rating',
            dataIndex: 'rating',
            key: 'rating',
            width: 120,
            render: (rating) => (
                <Tooltip title={`Rating: ${rating}`}>
                    <div className="flex items-center gap-2">
                        <Rate disabled defaultValue={rating} className="text-sm" style={{ fontSize: "10px" }} />
                    </div>
                </Tooltip>
            ),
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
            width: 220,
            render: (_, record) => (
                <Space size="small" wrap>
                    <Button
                        type="primary"
                        ghost
                        icon={<EyeOutlined />}
                        onClick={() => handleViewShop(record)}
                        size="small"
                    >
                        View Shop
                    </Button>

                    {record.isApproved ? (
                        <Button
                            danger
                            icon={<StopOutlined />}
                            onClick={() => handleDeactivate(record)}
                            size="small"
                        >
                            Deactivate
                        </Button>
                    ) : (
                        <Button
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            onClick={() => handleActivate(record)}
                            size="small"
                        >
                            Approve
                        </Button>
                    )}
                </Space>
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

const handleViewShop = (vendor) => {
    navigate(`/admin/vendors/${vendor.id}`);
};

    const handleAddVendor = () => {
        form.validateFields().then((values) => {
            const vendorData = {
                email: values.email,
                password: values.password,
                fullName: values.fullName,
                businessName: values.businessName,
                businessType: values.businessType[0],
                taxNumber: values.taxNumber,
                subCategoryIds: values.subCategoryIds,
            };
            console.log("new vendor", vendorData);

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
                ToastNotifier.success('Vendor Approved', `${selectedVendor.businessName} has been approved.`);
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
                scroll={{ x: 'max-content' }}
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
                width={600}
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
                        <Select
                            mode="tags"
                            placeholder="Select or type business type"
                            style={{ width: '100%' }}
                        >
                            {allBusinessTypes.map(type => (
                                <Option key={type} value={type}>{type}</Option>
                            ))}
                        </Select>
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
                        <Select mode="tags" placeholder="Select subcategories">
                            {subcategories.map(sub => (
                                <Option key={sub.id} value={sub.id}>{sub.nameEn}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={confirmAction === 'activate' ? 'Approve Vendor' : 'Deactivate Vendor'}
                open={isConfirmModalVisible}
                onOk={confirmAction === 'activate' ? handleConfirmActivate : handleConfirmDeactivate}
                onCancel={() => setIsConfirmModalVisible(false)}
                okText={confirmAction === 'activate' ? 'Approve' : 'Deactivate'}
                cancelText="Cancel"
                okButtonProps={{ danger: confirmAction === 'deactivate' }}
            >
                <p>
                    {confirmAction === 'activate'
                        ? `Are you sure you want to approve ${selectedVendor?.businessName}?`
                        : `Are you sure you want to deactivate ${selectedVendor?.businessName}?`}
                </p>
            </Modal>
        </div>
    );
};

export default VendorManagementPage;
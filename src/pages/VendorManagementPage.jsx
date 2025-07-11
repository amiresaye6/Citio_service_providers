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
import { useTranslation } from 'react-i18next';

const { Option } = Select;

const VendorManagementPage = () => {
    const { t, i18n } = useTranslation('vendors');
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

    const direction = i18n.dir();
    const isRTL = direction === "rtl";

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
            ToastNotifier.error(t('errors.loadFailed'), error);
            dispatch(clearError());
        }
        if (authError) {
            ToastNotifier.error(t('errors.registerFailed'), authError);
            dispatch(clearError());
        }
    }, [error, authError, dispatch, t]);

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
            title: t('table.columns.id'),
            dataIndex: 'id',
            key: 'id',
            width: 100,
            render: (id) => (
                <Tooltip title={`${t('table.columns.vendorId')}: ${id}`}>
                    <span className="text-xs text-gray-500 font-mono">
                        {id.substring(0, 8)}...
                    </span>
                </Tooltip>
            ),
            sorter: true,
        },
        {
            title: t('table.columns.profile'),
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
            title: t('table.columns.businessName'),
            dataIndex: 'businessName',
            key: 'businessName',
            sorter: true,
        },
        {
            title: t('table.columns.owner'),
            dataIndex: 'fullName',
            key: 'fullName',
            sorter: true,
        },
        {
            title: t('table.columns.email'),
            dataIndex: 'email',
            key: 'email',
            sorter: true,
            responsive: ['md'],
        },
        {
            title: t('table.columns.businessType'),
            dataIndex: 'businessType',
            key: 'businessType',
            sorter: true,
            responsive: ['lg'],
        },
        {
            title: t('table.columns.rating'),
            dataIndex: 'rating',
            key: 'rating',
            width: 120,
            render: (rating) => (
                <Tooltip title={`${t('table.columns.rating')}: ${rating}`}>
                    <div className="flex items-center gap-2">
                        <Rate disabled defaultValue={rating} className="text-sm" style={{ fontSize: "10px" }} />
                    </div>
                </Tooltip>
            ),
            sorter: true,
        },
        {
            title: t('table.columns.status'),
            dataIndex: 'isApproved',
            key: 'isApproved',
            render: (isApproved) => <StatusTag status={isApproved ? 'active' : 'pending'} />,
            sorter: true,
        },
        {
            title: t('table.columns.actions'),
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
                        {t('buttons.viewShop')}
                    </Button>

                    {record.isApproved ? (
                        <Button
                            danger
                            icon={<StopOutlined />}
                            onClick={() => handleDeactivate(record)}
                            size="small"
                        >
                            {t('buttons.deactivate')}
                        </Button>
                    ) : (
                        <Button
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            onClick={() => handleActivate(record)}
                            size="small"
                        >
                            {t('buttons.approve')}
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    const filters = [
        {
            key: 'isApproved',
            placeholder: t('filters.statusPlaceholder'),
            options: [
                { label: t('filters.options.active'), value: true },
                { label: t('filters.options.pending'), value: false },
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
                    ToastNotifier.success(
                        t('notifications.vendorAdded'),
                        t('notifications.vendorAddedMessage', { businessName: values.businessName })
                    );
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
            ToastNotifier.error(t('errors.validationFailed'), t('errors.fillRequiredFields'));
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
                ToastNotifier.success(
                    t('notifications.vendorApproved'),
                    t('notifications.vendorApprovedMessage', { businessName: selectedVendor.businessName })
                );
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
                ToastNotifier.success(
                    t('notifications.vendorDeactivated'),
                    t('notifications.vendorDeactivatedMessage', { businessName: selectedVendor.businessName })
                );
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
        <div className="p-6 min-h-screen" dir={direction}>
            <PageHeader
                title={t('pageHeader.title')}
                subtitle={t('pageHeader.subtitle')}
                actions={
                    <Button
                        type="primary"
                        onClick={() => setIsAddModalVisible(true)}
                    >
                        {t('buttons.addVendor')}
                    </Button>
                }
            />

            <SearchInput
                placeholder={t('search.placeholder')}
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
                    showTotal: (total, range) => t('pagination.showTotal', { start: range[0], end: range[1], total }),
                    position: ['bottomCenter'],
                    showQuickJumper: true,
                }}
                onChange={handleTableChange}
                scroll={{ x: 'max-content' }}
                className={isRTL ? 'rtl-table' : ''}
            />

            <Modal
                title={t('modal.addVendor.title')}
                open={isAddModalVisible}
                onOk={handleAddVendor}
                onCancel={() => {
                    setIsAddModalVisible(false);
                    form.resetFields();
                }}
                confirmLoading={authLoading}
                width={600}
                okText={t('modal.addVendor.okText')}
                cancelText={t('modal.addVendor.cancelText')}
            >
                <Form form={form} layout="vertical" dir={direction}>
                    <Form.Item
                        name="businessName"
                        label={t('modal.addVendor.businessName')}
                        rules={[{ required: true, message: t('modal.addVendor.businessNameRequired') }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="fullName"
                        label={t('modal.addVendor.ownerName')}
                        rules={[{ required: true, message: t('modal.addVendor.ownerNameRequired') }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label={t('modal.addVendor.email')}
                        rules={[
                            { required: true, message: t('modal.addVendor.emailRequired') },
                            { type: 'email', message: t('modal.addVendor.invalidEmail') },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        label={t('modal.addVendor.password')}
                        rules={[{ required: true, message: t('modal.addVendor.passwordRequired') }]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item
                        name="businessType"
                        label={t('modal.addVendor.businessType')}
                        rules={[{ required: true, message: t('modal.addVendor.businessTypeRequired') }]}
                    >
                        <Select
                            mode="tags"
                            placeholder={t('modal.addVendor.businessTypePlaceholder')}
                            style={{ width: '100%' }}
                        >
                            {allBusinessTypes.map(type => (
                                <Option key={type} value={type}>{type}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="taxNumber"
                        label={t('modal.addVendor.taxNumber')}
                        rules={[{ required: true, message: t('modal.addVendor.taxNumberRequired') }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="subCategoryIds"
                        label={t('modal.addVendor.subcategories')}
                        rules={[{ required: true, message: t('modal.addVendor.subcategoriesRequired') }]}
                    >
                        <Select mode="tags" placeholder={t('modal.addVendor.subcategoriesPlaceholder')}>
                            {subcategories.map(sub => (
                                <Option key={sub.id} value={sub.id}>{isRTL && sub.nameAr ? sub.nameAr : sub.nameEn}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={confirmAction === 'activate' ? t('modal.confirmActivate.title') : t('modal.confirmDeactivate.title')}
                open={isConfirmModalVisible}
                onOk={confirmAction === 'activate' ? handleConfirmActivate : handleConfirmDeactivate}
                onCancel={() => setIsConfirmModalVisible(false)}
                okText={confirmAction === 'activate' ? t('modal.confirmActivate.okText') : t('modal.confirmDeactivate.okText')}
                cancelText={t('modal.common.cancelText')}
                okButtonProps={{ danger: confirmAction === 'deactivate' }}
            >
                <p>
                    {confirmAction === 'activate'
                        ? t('modal.confirmActivate.message', { businessName: selectedVendor?.businessName })
                        : t('modal.confirmDeactivate.message', { businessName: selectedVendor?.businessName })}
                </p>
            </Modal>
        </div>
    );
};

export default VendorManagementPage;
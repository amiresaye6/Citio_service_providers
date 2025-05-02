import React, { useEffect, useState } from 'react';
import { Button, Modal, Rate, Form } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchVendorRatings,
    flagRating,
    respondToRating,
    clearError,
} from '../redux/slices/vendorsSlice';
import PageHeader from '../components/common/PageHeader';
import TableWrapper from '../components/common/TableWrapper';
import SearchInput from '../components/common/SearchInput';
import StatusTag from '../components/common/StatusTag';
import ConfirmModal from '../components/common/ConfirmModal';
import ToastNotifier from '../components/common/ToastNotifier';
import LoadingSpinner from '../components/common/LoadingSpinner';

const { TextArea } = Form.Item;

const AdminRatingsPage = () => {
    const dispatch = useDispatch();
    const { vendorRatings, loading, error } = useSelector((state) => state.vendors);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchValue, setSearchValue] = useState('');
    const [sortColumn, setSortColumn] = useState('');
    const [sortDirection, setSortDirection] = useState('');
    const [statusFilter, setStatusFilter] = useState(null);
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
    const [isResponseModalVisible, setIsResponseModalVisible] = useState(false);
    const [selectedRating, setSelectedRating] = useState(null);
    const [form] = Form.useForm();

    // Fetch ratings
    useEffect(() => {
        dispatch(fetchVendorRatings({
            PageNumer: currentPage,
            PageSize: pageSize,
            SearchValue: searchValue,
            SortColumn: sortColumn,
            SortDirection: sortDirection,
            Status: statusFilter,
        }));
    }, [dispatch, currentPage, pageSize, searchValue, sortColumn, sortDirection, statusFilter]);

    // Handle errors
    useEffect(() => {
        if (error) {
            ToastNotifier.error('Failed to load ratings', error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    // Table columns
    const columns = [
        {
            title: 'Reviewer',
            dataIndex: 'reviewer',
            key: 'reviewer',
            sorter: true,
        },
        {
            title: 'Vendor',
            dataIndex: 'vendor',
            key: 'vendor',
            sorter: true,
        },
        {
            title: 'Rating',
            dataIndex: 'rating',
            key: 'rating',
            sorter: true,
            render: (rating) => <Rate disabled defaultValue={rating} />,
        },
        {
            title: 'Comment',
            dataIndex: 'comment',
            key: 'comment',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            sorter: true,
            render: (status) => <StatusTag status={status} />,
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            sorter: true,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div className="space-x-2">
                    <Button
                        type="link"
                        onClick={() => handleRespond(record)}
                        disabled={record.response}
                    >
                        Respond
                    </Button>
                    <Button
                        type="link"
                        danger
                        onClick={() => handleFlag(record)}
                        disabled={record.status === 'error'}
                    >
                        Flag
                    </Button>
                </div>
            ),
        },
    ];

    // Filters
    // const filters = [
    //     {
    //         key: 'status',
    //         placeholder: 'Select Status',
    //         options: [
    //             { label: 'Active', value: true },
    //             { label: 'Flagged', value: false },
    //         ],
    //     },
    // ];

    // Handle search
    const handleSearch = (value) => {
        setSearchValue(value);
        setCurrentPage(1);
    };

    // Handle filter change
    // const handleFilterChange = (key, value) => {
    //     if (key === 'status') {
    //         setStatusFilter(value !== undefined ? value : null);
    //     }
    //     setCurrentPage(1);
    // };

    // Handle reset filters
    // const handleResetFilters = () => {
    //     setSearchValue('');
    //     setStatusFilter(null);
    //     setSortColumn('');
    //     setSortDirection('');
    //     setCurrentPage(1);
    // };

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

    // Handle flag review
    const handleFlag = (rating) => {
        setSelectedRating(rating);
        setIsConfirmModalVisible(true);
    };

    const handleConfirmFlag = () => {
        dispatch(flagRating(selectedRating.id)).then((result) => {
            if (result.meta.requestStatus === 'fulfilled') {
                ToastNotifier.success('Review Flagged', `${selectedRating.reviewer}'s review has been flagged.`);
                dispatch(fetchVendorRatings({
                    PageNumer: currentPage,
                    PageSize: pageSize,
                    SearchValue: searchValue,
                    SortColumn: sortColumn,
                    SortDirection: sortDirection,
                    Status: statusFilter,
                }));
            }
        });
        setIsConfirmModalVisible(false);
    };

    // Handle respond to review
    const handleRespond = (rating) => {
        setSelectedRating(rating);
        form.setFieldsValue({ response: rating.response });
        setIsResponseModalVisible(true);
    };

    const handleSubmitResponse = (values) => {
        dispatch(respondToRating({
            ratingId: selectedRating.id,
            response: values.response,
        })).then((result) => {
            if (result.meta.requestStatus === 'fulfilled') {
                ToastNotifier.success('Response Submitted', `Response to ${selectedRating.reviewer}'s review has been submitted.`);
                dispatch(fetchVendorRatings({
                    PageNumer: currentPage,
                    PageSize: pageSize,
                    SearchValue: searchValue,
                    SortColumn: sortColumn,
                    SortDirection: sortDirection,
                    Status: statusFilter,
                }));
            }
        });
        setIsResponseModalVisible(false);
        form.resetFields();
    };

    return (
        <div className="p-6 min-h-screen">
            <PageHeader
                title="Admin Ratings"
                subtitle="View and manage user-submitted reviews and ratings"
                actions={
                    <Button
                        type="primary"
                        onClick={() => {
                            dispatch(fetchVendorRatings({
                                PageNumer: currentPage,
                                PageSize: pageSize,
                                SearchValue: searchValue,
                                SortColumn: sortColumn,
                                SortDirection: sortDirection,
                                Status: statusFilter,
                            }));
                            ToastNotifier.info('Refresh', 'Ratings refreshed.');
                        }}
                    >
                        Refresh
                    </Button>
                }
            />

            <SearchInput
                placeholder="Search by reviewer, vendor, or comment..."
                onSearch={handleSearch}
                className="mb-4"
            />

            {/* <FilterBar
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
                loading={loading}
            /> */}

            {loading ? (
                <LoadingSpinner text="Loading ratings..." />
            ) : (
                <TableWrapper
                    dataSource={vendorRatings.items}
                    columns={columns}
                    loading={loading}
                    rowKey="id"
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: vendorRatings.totalCount,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50'],
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} ratings`,
                        position: ['bottomCenter'],
                        showQuickJumper: true,
                    }}
                    onChange={handleTableChange}
                />
            )}

            <ConfirmModal
                open={isConfirmModalVisible}
                onConfirm={handleConfirmFlag}
                onCancel={() => setIsConfirmModalVisible(false)}
                title="Flag Review"
                content={`Are you sure you want to flag ${selectedRating?.reviewer}'s review as inappropriate?`}
                isDanger
            />

            <Modal
                title={`Respond to ${selectedRating?.reviewer}'s Review`}
                open={isResponseModalVisible}
                onOk={() => form.submit()}
                onCancel={() => {
                    setIsResponseModalVisible(false);
                    form.resetFields();
                }}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmitResponse}>
                    <Form.Item
                        name="response"
                        label="Response"
                        rules={[{ required: true, message: 'Please enter a response' }]}
                    >
                        <TextArea rows={4} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminRatingsPage;
import React, { useEffect, useState } from 'react';
import { Button, Form, Select, Input, Rate } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchUserVendorReviews,
    clearError,
} from '../redux/slices/adminSlice';
import PageHeader from '../components/common/PageHeader';
import TableWrapper from '../components/common/TableWrapper';
import SearchInput from '../components/common/SearchInput';
import ToastNotifier from '../components/common/ToastNotifier';
import LoadingSpinner from '../components/common/LoadingSpinner';

const { Option } = Select;

const AdminRatingsPage = () => {
    const dispatch = useDispatch();
    const { reviews, loading, error } = useSelector((state) => state.admin);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchValue, setSearchValue] = useState('');
    const [sortColumn, setSortColumn] = useState('');
    const [sortDirection, setSortDirection] = useState('');
    const [minRating, setMinRating] = useState(null);
    const [maxRating, setMaxRating] = useState(null);

    // Fetch ratings
    useEffect(() => {
        dispatch(fetchUserVendorReviews({
            pageNumber: currentPage,
            pageSize: pageSize,
            searchValue: searchValue,
            sortColumn: sortColumn,
            sortDirection: sortDirection,
            minRating: minRating,
            maxRating: maxRating
        }));
    }, [dispatch, currentPage, pageSize, searchValue, sortColumn, sortDirection, minRating, maxRating]);

    // Handle errors
    useEffect(() => {
        if (error) {
            ToastNotifier.error('Failed to load ratings', error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    // Table columns - Actions column removed
    const columns = [
        {
            title: 'User',
            dataIndex: 'userFullName',
            key: 'userFullName',
            sorter: true,
        },
        {
            title: 'Email',
            dataIndex: 'userEmail',
            key: 'userEmail',
            sorter: true,
        },
        {
            title: 'Vendor',
            dataIndex: 'vendorFullName',
            key: 'vendorFullName',
            sorter: true,
        },
        {
            title: 'Product',
            dataIndex: 'productNameEn',
            key: 'productNameEn',
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
            title: 'Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            sorter: true,
            render: (date) => new Date(date).toLocaleDateString(),
        }
    ];

    // Handle search
    const handleSearch = (value) => {
        setSearchValue(value);
        setCurrentPage(1);
    };

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

    // Handle rating filter
    const handleRatingFilterChange = (value) => {
        if (value === "all") {
            setMinRating(null);
            setMaxRating(null);
        } else if (value === "5") {
            setMinRating(5);
            setMaxRating(5);
        } else if (value === "4-5") {
            setMinRating(4);
            setMaxRating(5);
        } else if (value === "1-3") {
            setMinRating(1);
            setMaxRating(3);
        }
    };

    return (
        <div className="p-6 min-h-screen">
            <PageHeader
                title="Customer Reviews"
                subtitle="View and manage user-vendor reviews and ratings"
                actions={
                    <Button
                        type="primary"
                        onClick={() => {
                            dispatch(fetchUserVendorReviews({
                                pageNumber: currentPage,
                                pageSize: pageSize,
                                searchValue: searchValue,
                                sortColumn: sortColumn,
                                sortDirection: sortDirection,
                                minRating: minRating,
                                maxRating: maxRating
                            }));
                            ToastNotifier.info('Refresh', 'Reviews refreshed.');
                        }}
                    >
                        Refresh
                    </Button>
                }
            />

            <div className="flex justify-between items-center mb-4">
                <SearchInput
                    placeholder="Search by user, vendor, product, or comment..."
                    onSearch={handleSearch}
                    className="w-1/2"
                />
                <Select
                    placeholder="Filter by rating"
                    onChange={handleRatingFilterChange}
                    className="w-48"
                    allowClear
                >
                    <Option value="all">All Ratings</Option>
                    <Option value="5">5 Stars Only</Option>
                    <Option value="4-5">4-5 Stars</Option>
                    <Option value="1-3">1-3 Stars</Option>
                </Select>
            </div>

            {loading ? (
                <LoadingSpinner text="Loading reviews..." />
            ) : (
                <TableWrapper
                    dataSource={reviews?.items || []}
                    columns={columns}
                    loading={loading}
                    rowKey="id"
                    pagination={{
                        current: reviews?.pageNumber || 1,
                        pageSize: pageSize,
                        total: (reviews?.totalPages || 1) * pageSize,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50'],
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} reviews`,
                        position: ['bottomCenter'],
                        showQuickJumper: true,
                        hasNextPage: reviews?.hasNextPage,
                        hasPreviousPage: reviews?.hasPreviousPage,
                    }}
                    onChange={handleTableChange}
                />
            )}
        </div>
    );
};

export default AdminRatingsPage;
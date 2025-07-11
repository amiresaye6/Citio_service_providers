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
import { useTranslation } from 'react-i18next';

const { Option } = Select;

const AdminRatingsPage = () => {
    const { t, i18n } = useTranslation('ratings');
    const dispatch = useDispatch();
    const { reviews, loading, error } = useSelector((state) => state.admin);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchValue, setSearchValue] = useState('');
    const [sortColumn, setSortColumn] = useState('');
    const [sortDirection, setSortDirection] = useState('');
    const [minRating, setMinRating] = useState(null);
    const [maxRating, setMaxRating] = useState(null);

    const direction = i18n.dir();
    const isRTL = direction === "rtl";

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
            ToastNotifier.error(t('errors.loadFailed'), error);
            dispatch(clearError());
        }
    }, [error, dispatch, t]);

    // Table columns - Actions column removed
    const columns = [
        {
            title: t('table.columns.user'),
            dataIndex: 'userFullName',
            key: 'userFullName',
            sorter: true,
        },
        {
            title: t('table.columns.email'),
            dataIndex: 'userEmail',
            key: 'userEmail',
            sorter: true,
        },
        {
            title: t('table.columns.vendor'),
            dataIndex: 'vendorFullName',
            key: 'vendorFullName',
            sorter: true,
        },
        {
            title: t('table.columns.product'),
            dataIndex: 'productNameEn',
            key: 'productNameEn',
            sorter: true,
            render: (productNameEn, record) => (
                isRTL && record.productNameAr ? record.productNameAr : productNameEn
            ),
        },
        {
            title: t('table.columns.rating'),
            dataIndex: 'rating',
            key: 'rating',
            sorter: true,
            render: (rating) => <Rate disabled defaultValue={rating} />,
        },
        {
            title: t('table.columns.comment'),
            dataIndex: 'comment',
            key: 'comment',
        },
        {
            title: t('table.columns.date'),
            dataIndex: 'createdAt',
            key: 'createdAt',
            sorter: true,
            render: (date) => new Date(date).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US'),
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
        <div className="p-6 min-h-screen" dir={direction}>
            <PageHeader
                title={t('pageHeader.title')}
                subtitle={t('pageHeader.subtitle')}
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
                            ToastNotifier.info(t('notifications.refreshTitle'), t('notifications.refreshMessage'));
                        }}
                    >
                        {t('buttons.refresh')}
                    </Button>
                }
            />

            <div className="flex justify-between items-center mb-4">
                <SearchInput
                    placeholder={t('search.placeholder')}
                    onSearch={handleSearch}
                    className="w-1/2"
                />
                <Select
                    placeholder={t('filters.ratingPlaceholder')}
                    onChange={handleRatingFilterChange}
                    className="w-48"
                    allowClear
                >
                    <Option value="all">{t('filters.options.allRatings')}</Option>
                    <Option value="5">{t('filters.options.fiveStars')}</Option>
                    <Option value="4-5">{t('filters.options.fourToFive')}</Option>
                    <Option value="1-3">{t('filters.options.oneToThree')}</Option>
                </Select>
            </div>

            {loading ? (
                <LoadingSpinner text={t('loading.reviews')} />
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
                        showTotal: (total, range) => t('pagination.showTotal', { start: range[0], end: range[1], total }),
                        position: ['bottomCenter'],
                        showQuickJumper: true,
                        hasNextPage: reviews?.hasNextPage,
                        hasPreviousPage: reviews?.hasPreviousPage,
                    }}
                    onChange={handleTableChange}
                    className={isRTL ? 'rtl-table' : ''}
                    dir={direction}
                />
            )}
        </div>
    );
};

export default AdminRatingsPage;
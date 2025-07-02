import React, { useEffect, useState } from 'react';
import { Card, Rate, Select, Row, Col, Typography, Empty, Spin, Button, Pagination } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchVendorReviews,
    clearError,
} from '../redux/slices/vendorsSlice';
import PageHeader from '../components/common/PageHeader';
import SearchInput from '../components/common/SearchInput';
import ToastNotifier from '../components/common/ToastNotifier';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { UserOutlined, CalendarOutlined, MessageOutlined } from '@ant-design/icons';
import { Grid } from "antd";
import TableWrapper from '../components/common/TableWrapper';

const { Option } = Select;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const ratingFilterOptions = [
    { label: 'All Ratings', value: 'all' },
    { label: '5 Stars Only', value: '5' },
    { label: '4-5 Stars', value: '4-5' },
    { label: '1-3 Stars', value: '1-3' },
];

const VendorRatingsPage = () => {
    const dispatch = useDispatch();
    const { vendorReviews, loading, error } = useSelector((state) => state.vendors);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchValue, setSearchValue] = useState('');
    const [sortColumn, setSortColumn] = useState('');
    const [sortDirection, setSortDirection] = useState('');
    const [minRating, setMinRating] = useState(null);
    const [maxRating, setMaxRating] = useState(null);

    const screens = useBreakpoint();
    const isMobile = !screens.md;

    // Fetch ratings
    useEffect(() => {
        dispatch(fetchVendorReviews({
            PageNumer: currentPage,
            PageSize: pageSize,
            SearchValue: searchValue,
            SortColumn: sortColumn,
            SortDirection: sortDirection,
            MinRating: minRating,
            MaxRating: maxRating,
        }));
    }, [dispatch, currentPage, pageSize, searchValue, sortColumn, sortDirection, minRating, maxRating]);

    // Handle errors
    useEffect(() => {
        if (error) {
            ToastNotifier.error('Failed to load ratings', error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    // Handle search
    const handleSearch = (value) => {
        setSearchValue(value);
        setCurrentPage(1);
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

    // Enhanced Card UI for mobile/tablet; table for desktop
    const renderCard = (review) => (
        <Card
            key={review.id}
            className="mb-4"
            style={{
                borderRadius: 14,
                marginBottom: 18,
                boxShadow: "0 4px 12px #eee",
                background: "#fafcff"
            }}
            bodyStyle={{ padding: 20 }}
        >
            <Row align="middle" gutter={[12, 8]} style={{ marginBottom: 10 }}>
                <Col>
                    <UserOutlined style={{ fontSize: 32, color: "#91a5be" }} />
                </Col>
                <Col flex="auto">
                    <Title level={5} style={{ margin: 0 }}>{review.userName}</Title>
                    <Text type="secondary" style={{ fontSize: 13 }}>{review.productNameEn}</Text>
                </Col>
                <Col>
                    <Rate disabled value={review.rating} style={{ color: "#ffb700" }} />
                </Col>
            </Row>
            <Row style={{ marginBottom: 8 }}>
                <Col flex="auto">
                    <Text>
                        <MessageOutlined style={{ color: "#69c0ff", marginRight: 6 }} />
                        {review.comment || <Text type="secondary">No comment.</Text>}
                    </Text>
                </Col>
            </Row>
            <Row gutter={12} style={{ fontSize: 13 }}>
                <Col>
                    <CalendarOutlined style={{ color: "#aaa" }} />{" "}
                    <span>{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "-"}</span>
                </Col>
            </Row>
        </Card>
    );

    // Table columns for desktop
    const columns = [
        {
            title: 'Reviewer',
            dataIndex: 'userName',
            key: 'userName',
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
            render: (rating) => <Rate disabled value={rating} style={{ color: "#ffb700" }} />,
        },
        {
            title: 'Comment',
            dataIndex: 'comment',
            key: 'comment',
            render: (comment) =>
                <span>
                    <MessageOutlined style={{ color: "#69c0ff", marginRight: 4 }} />
                    {comment || <Text type="secondary">No comment.</Text>}
                </span>
        },
        {
            title: 'Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            sorter: true,
            render: (date) =>
                date ? new Date(date).toLocaleDateString() : "-",
        }
    ];

    return (
        <div className="p-6 min-h-screen">
            <PageHeader
                title="Vendor Ratings"
                subtitle="View and manage user-submitted reviews and ratings"
                actions={
                    <Button
                        type="primary"
                        onClick={() => {
                            dispatch(fetchVendorReviews({
                                PageNumer: currentPage,
                                PageSize: pageSize,
                                SearchValue: searchValue,
                                SortColumn: sortColumn,
                                SortDirection: sortDirection,
                                MinRating: minRating,
                                MaxRating: maxRating,
                            }));
                            ToastNotifier.info('Refresh', 'Ratings refreshed.');
                        }}
                    >
                        Refresh
                    </Button>
                }
            />

            <Row gutter={[16, 16]} className="mb-5" align="middle" wrap>
                <Col xs={24} md={12}>
                    <SearchInput
                        placeholder="Search by reviewer, product, or comment..."
                        onSearch={handleSearch}
                        className="w-full"
                    />
                </Col>
                <Col xs={24} md={12}>
                    <Select
                        placeholder="Filter by rating"
                        onChange={handleRatingFilterChange}
                        className="w-full md:w-48"
                        allowClear
                        style={{ maxWidth: 200 }}
                    >
                        {ratingFilterOptions.map(opt =>
                            <Option value={opt.value} key={opt.value}>{opt.label}</Option>
                        )}
                    </Select>
                </Col>
            </Row>

            {loading ? (
                <LoadingSpinner text="Loading ratings..." />
            ) : (
                <>
                    {isMobile ? (
                        <div>
                            {vendorReviews.items && vendorReviews.items.length > 0 ? (
                                vendorReviews.items.map(review => renderCard(review))
                            ) : (
                                <Empty description="No ratings found" style={{ margin: '32px 0' }} />
                            )}
                            <div style={{ marginTop: 16, textAlign: 'right' }}>
                                <Pagination
                                    current={vendorReviews.pageNumber + 1}
                                    pageSize={pageSize}
                                    total={vendorReviews.totalPages * pageSize}
                                    showSizeChanger
                                    pageSizeOptions={['10', '20', '50']}
                                    onChange={(page, size) => {
                                        setCurrentPage(page);
                                        setPageSize(size);
                                    }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <TableWrapper
                                dataSource={vendorReviews.items}
                                columns={columns}
                                loading={loading}
                                rowKey="id"
                                pagination={{
                                    current: vendorReviews.pageNumber + 1,
                                    pageSize: pageSize,
                                    total: vendorReviews.totalPages * pageSize,
                                    showSizeChanger: true,
                                    pageSizeOptions: ['10', '20', '50'],
                                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} ratings`,
                                    position: ['bottomCenter'],
                                    showQuickJumper: true,
                                }}
                                onChange={({ current, pageSize: ps }, filters, sorter) => {
                                    setCurrentPage(current || 1);
                                    setPageSize(ps || 10);
                                    if (sorter && sorter.field && sorter.order) {
                                        setSortColumn(sorter.field);
                                        setSortDirection(sorter.order === 'ascend' ? 'asc' : 'desc');
                                    } else {
                                        setSortColumn('');
                                        setSortDirection('');
                                    }
                                }}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default VendorRatingsPage;
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
import { useTranslation } from 'react-i18next';

const { Option } = Select;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const VendorRatingsPage = () => {
    const { t, i18n } = useTranslation('vendorRatings');
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
    const direction = i18n.dir();
    const isRTL = direction === "rtl";

    const ratingFilterOptions = [
        { label: t('filters.allRatings'), value: 'all' },
        { label: t('filters.fiveStarsOnly'), value: '5' },
        { label: t('filters.fourToFiveStars'), value: '4-5' },
        { label: t('filters.oneToThreeStars'), value: '1-3' },
    ];

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
            ToastNotifier.error(t('notifications.loadFailed'), error);
            dispatch(clearError());
        }
    }, [error, dispatch, t]);

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

    // Get product name based on current language
    const getProductName = (review) => {
        return isRTL && review.productNameAr ? review.productNameAr : review.productNameEn;
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
                    <Text type="secondary" style={{ fontSize: 13 }}>{getProductName(review)}</Text>
                </Col>
                <Col>
                    <Rate disabled value={review.rating} style={{ color: "#ffb700" }} />
                </Col>
            </Row>
            <Row style={{ marginBottom: 8 }}>
                <Col flex="auto">
                    <Text>
                        <MessageOutlined style={{ color: "#69c0ff", marginRight: isRTL ? 0 : 6, marginLeft: isRTL ? 6 : 0 }} />
                        {review.comment || <Text type="secondary">{t('reviews.noComment')}</Text>}
                    </Text>
                </Col>
            </Row>
            <Row gutter={12} style={{ fontSize: 13 }}>
                <Col>
                    <CalendarOutlined style={{ color: "#aaa" }} />{" "}
                    <span>{review.createdAt ? new Date(review.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US') : "-"}</span>
                </Col>
            </Row>
        </Card>
    );

    // Table columns for desktop
    const columns = [
        {
            title: t('table.reviewer'),
            dataIndex: 'userName',
            key: 'userName',
            sorter: true,
        },
        {
            title: t('table.product'),
            dataIndex: isRTL ? 'productNameAr' : 'productNameEn',
            key: 'product',
            sorter: true,
            render: (text, record) => getProductName(record),
        },
        {
            title: t('table.rating'),
            dataIndex: 'rating',
            key: 'rating',
            sorter: true,
            render: (rating) => <Rate disabled value={rating} style={{ color: "#ffb700" }} />,
        },
        {
            title: t('table.comment'),
            dataIndex: 'comment',
            key: 'comment',
            render: (comment) =>
                <span>
                    <MessageOutlined style={{ color: "#69c0ff", marginRight: isRTL ? 0 : 4, marginLeft: isRTL ? 4 : 0 }} />
                    {comment || <Text type="secondary">{t('reviews.noComment')}</Text>}
                </span>
        },
        {
            title: t('table.date'),
            dataIndex: 'createdAt',
            key: 'createdAt',
            sorter: true,
            render: (date) =>
                date ? new Date(date).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US') : "-",
        }
    ];

    return (
        <div className="p-6 min-h-screen" dir={direction}>
            <PageHeader
                title={t('pageHeader.title')}
                subtitle={t('pageHeader.subtitle')}
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
                            ToastNotifier.info(t('notifications.refreshTitle'), t('notifications.refreshMessage'));
                        }}
                    >
                        {t('buttons.refresh')}
                    </Button>
                }
            />

            <Row gutter={[16, 16]} className="mb-5" align="middle" wrap>
                <Col xs={24} md={12}>
                    <SearchInput
                        placeholder={t('search.placeholder')}
                        onSearch={handleSearch}
                        className="w-full"
                    />
                </Col>
                <Col xs={24} md={12}>
                    <Select
                        placeholder={t('filters.placeholder')}
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
                <LoadingSpinner text={t('loading')} />
            ) : (
                <>
                    {isMobile ? (
                        <div>
                            {vendorReviews.items && vendorReviews.items.length > 0 ? (
                                vendorReviews.items.map(review => renderCard(review))
                            ) : (
                                <Empty description={t('empty.noRatings')} style={{ margin: '32px 0' }} />
                            )}
                            <div style={{ marginTop: 16, textAlign: isRTL ? 'left' : 'right' }}>
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
                                    className={isRTL ? "rtl-pagination" : ""}
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
                                    showTotal: (total, range) => t('pagination.showTotal', { start: range[0], end: range[1], total }),
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
                                className={isRTL ? "rtl-table" : ""}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default VendorRatingsPage;
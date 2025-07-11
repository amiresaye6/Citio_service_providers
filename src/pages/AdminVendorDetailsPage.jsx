import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
    Avatar,
    Rate,
    Button,
    Tag,
    Descriptions,
    Row,
    Col,
    Space,
    Divider,
    Image,
    Spin,
    Alert,
    Tabs,
    List,
    Empty,
    Typography,
    Pagination,
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
    ArrowLeftOutlined,
    UserOutlined,
    ShopOutlined,
    MailOutlined,
    PhoneOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    EditOutlined,
    AppstoreOutlined,
    DollarCircleOutlined,
    StarOutlined,
    MessageOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import {
    fetchVendorByID,
    fetchVendorMenu,
    fetchVendorRatings,
    clearVendorDetails,
    clearVendorMenu,
    clearVendorRatings,
    clearError
} from '../redux/slices/adminSlice';
import PageHeader from '../components/common/PageHeader';
import ToastNotifier from '../components/common/ToastNotifier';
import { useTranslation } from 'react-i18next';

const { TabPane } = Tabs;
const { Text, Title, Paragraph } = Typography;

const AdminVendorDetailsPage = () => {
    const { t, i18n } = useTranslation('vendorDetails');
    const { vendorId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const {
        vendorDetails,
        vendorDetailsLoading,
        vendorDetailsError,
        vendorMenu,
        vendorMenuLoading,
        vendorMenuError,
        vendorRatings,
        vendorRatingsLoading,
        vendorRatingsError
    } = useSelector((state) => state.admin);

    const [activeTab, setActiveTab] = useState('details');
    const [ratingsPage, setRatingsPage] = useState(1);
    const [ratingsPageSize, setRatingsPageSize] = useState(5);

    const direction = i18n.dir();
    const isRTL = direction === "rtl";

    useEffect(() => {
        if (vendorId) {
            dispatch(fetchVendorByID(vendorId));
            dispatch(fetchVendorMenu(vendorId));
            dispatch(fetchVendorRatings({
                vendorId,
                pageNumber: ratingsPage,
                pageSize: ratingsPageSize
            }));
        }

        // Cleanup on unmount
        return () => {
            dispatch(clearVendorDetails());
            dispatch(clearVendorMenu());
            dispatch(clearVendorRatings());
        };
    }, [dispatch, vendorId, ratingsPage, ratingsPageSize]);

    // Fetch ratings when pagination changes
    useEffect(() => {
        if (vendorId && activeTab === 'ratings') {
            dispatch(fetchVendorRatings({
                vendorId,
                pageNumber: ratingsPage,
                pageSize: ratingsPageSize
            }));
        }
    }, [dispatch, vendorId, ratingsPage, ratingsPageSize, activeTab]);

    useEffect(() => {
        if (vendorDetailsError) {
            ToastNotifier.error(t('errors.detailsFailed'), vendorDetailsError);
            dispatch(clearError());
        }
        if (vendorMenuError) {
            ToastNotifier.error(t('errors.menuFailed'), vendorMenuError);
            dispatch(clearError());
        }
        if (vendorRatingsError) {
            ToastNotifier.error(t('errors.ratingsFailed'), vendorRatingsError);
            dispatch(clearError());
        }
    }, [vendorDetailsError, vendorMenuError, vendorRatingsError, dispatch, t]);

    const handleGoBack = () => {
        navigate('/admin/vendors');
    };

    const handleTabChange = (key) => {
        setActiveTab(key);
        if (key === 'ratings' && vendorRatings.items.length === 0) {
            dispatch(fetchVendorRatings({
                vendorId,
                pageNumber: ratingsPage,
                pageSize: ratingsPageSize
            }));
        }
    };

    const handleRatingsPaginationChange = (page, pageSize) => {
        setRatingsPage(page);
        setRatingsPageSize(pageSize);
    };

    const renderProductCard = (product) => (
        <Card
            key={product.id}
            hoverable
            className="mb-4"
            cover={
                <div className="h-48 overflow-hidden">
                    <Image
                        alt={isRTL && product.nameAr ? product.nameAr : product.nameEn}
                        src={`https://service-provider.runasp.net${product.mainImageUrl}`}
                        className="w-full h-full object-cover"
                        width={"100%"}
                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYnN"
                    />
                </div>
            }
            actions={[
                <div className="px-4 pb-2">
                    <div className="flex justify-between items-center">
                        <Text strong className="text-lg text-green-600">
                            ${product.price.toFixed(2)}
                        </Text>
                        <Tag color="blue">{isRTL && product.categoryNameAr ? product.categoryNameAr : product.categoryNameEn}</Tag>
                    </div>
                </div>
            ]}
        >
            <Card.Meta
                title={
                    <div>
                        <Text strong className="text-base">{isRTL && product.nameAr ? product.nameAr : product.nameEn}</Text>
                        <br />
                        <Text className="text-sm text-gray-500">{isRTL ? product.nameEn : product.nameAr}</Text>
                    </div>
                }
                description={
                    <Text className="text-sm text-gray-600 line-clamp-2">
                        {isRTL && product.descriptionAr ? product.descriptionAr : product.description}
                    </Text>
                }
            />
        </Card>
    );

    const renderRatingCard = (rating) => (
        <Card key={rating.reviewId} className="mb-4">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                    <Avatar size={40} icon={<UserOutlined />} />
                    <div>
                        <Text strong className="block">{rating.customerName}</Text>
                        <Text className="text-xs text-gray-500">
                            <CalendarOutlined className={isRTL ? "ml-1" : "mr-1"} />
                            {new Date(rating.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}
                        </Text>
                    </div>
                </div>
                <Rate disabled defaultValue={rating.rating} style={{ fontSize: '14px' }} />
            </div>

            <div className="mb-3">
                <Text strong className="text-sm">{t('ratings.product')}: </Text>
                <Text className="text-sm">{isRTL && rating.productNameAr ? rating.productNameAr : rating.productNameEn}</Text>
                <br />
                <Text className="text-xs text-gray-500">{isRTL ? rating.productNameEn : rating.productNameAr}</Text>
            </div>

            {rating.comment && (
                <div className=" p-3 rounded-lg">
                    <Text className="text-sm">{rating.comment}</Text>
                </div>
            )}
        </Card>
    );

    const menuStats = {
        totalProducts: vendorMenu.length,
        totalValue: vendorMenu.reduce((sum, product) => sum + product.price, 0),
        categories: [...new Set(vendorMenu.map(product => product.categoryNameEn))].length,
        averagePrice: vendorMenu.length > 0 ? vendorMenu.reduce((sum, product) => sum + product.price, 0) / vendorMenu.length : 0
    };

    const ratingsStats = {
        totalRatings: vendorRatings.items.length,
        averageRating: vendorRatings.items.length > 0
            ? vendorRatings.items.reduce((sum, rating) => sum + rating.rating, 0) / vendorRatings.items.length
            : 0
    };

    if (vendorDetailsLoading) {
        return (
            <div className="p-6 min-h-screen flex items-center justify-center">
                <Spin size="large" />
            </div>
        );
    }

    if (vendorDetailsError) {
        return (
            <div className="p-6 min-h-screen" dir={direction}>
                <PageHeader
                    title={t('pageHeader.title')}
                    subtitle={t('pageHeader.subtitle')}
                    actions={
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={handleGoBack}
                        >
                            {t('buttons.backToVendors')}
                        </Button>
                    }
                />
                <Alert
                    message={t('errors.errorLoadingVendor')}
                    description={t('errors.unableToLoadDetails')}
                    type="error"
                    showIcon
                    action={
                        <Button size="small" onClick={() => dispatch(fetchVendorByID(vendorId))}>
                            {t('buttons.retry')}
                        </Button>
                    }
                />
            </div>
        );
    }

    if (!vendorDetails) {
        return (
            <div className="p-6 min-h-screen" dir={direction}>
                <PageHeader
                    title={t('pageHeader.title')}
                    subtitle={t('pageHeader.subtitle')}
                    actions={
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={handleGoBack}
                        >
                            {t('buttons.backToVendors')}
                        </Button>
                    }
                />
                <Alert
                    message={t('errors.vendorNotFound')}
                    description={t('errors.vendorNotFoundDescription')}
                    type="warning"
                    showIcon
                />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 min-h-screen" dir={direction}>
            <PageHeader
                title={t('pageHeader.title')}
                subtitle={`${vendorDetails.businessName} - ${vendorDetails.businessType}`}
                actions={
                    <Space>
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={handleGoBack}
                        >
                            {t('buttons.backToVendors')}
                        </Button>
                    </Space>
                }
            />

            <Row gutter={[24, 24]}>
                {/* Profile Card */}
                <Col xs={24} lg={8}>
                    <Card className="text-center">
                        <div className="mb-4">
                            <Avatar
                                size={120}
                                src={`https://service-provider.runasp.net${vendorDetails.profilePictureUrl}`}
                                icon={<UserOutlined />}
                                className="mb-4"
                            />
                        </div>

                        <h2 className="text-xl font-semibold mb-2">
                            {vendorDetails.fullName}
                        </h2>

                        <p className="text-gray-600 mb-3">
                            {vendorDetails.businessName}
                        </p>

                        <div className="mb-4">
                            <Rate
                                disabled
                                defaultValue={vendorDetails.rating}
                                className="mb-2"
                            />
                            <p className="text-sm text-gray-500">
                                {t('profile.rating')}: {vendorDetails.rating?.toFixed(1)} / 5.0
                            </p>
                        </div>

                        <div className="mb-4">
                            <Tag
                                icon={vendorDetails.isApproved ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                                color={vendorDetails.isApproved ? 'green' : 'orange'}
                                className="px-3 py-1"
                            >
                                {vendorDetails.isApproved ? t('status.approved') : t('status.pendingApproval')}
                            </Tag>
                        </div>

                        <Divider />

                        <Space direction="vertical" className="w-full">
                            <div className="flex items-center justify-center text-gray-600">
                                <MailOutlined className={isRTL ? "ml-2" : "mr-2"} />
                                <span className="text-sm">{vendorDetails.email}</span>
                            </div>
                            <div className="flex items-center justify-center text-gray-600">
                                <ShopOutlined className={isRTL ? "ml-2" : "mr-2"} />
                                <span className="text-sm">{vendorDetails.businessType}</span>
                            </div>
                        </Space>
                    </Card>

                    {/* Menu Stats Card */}
                    <Card title={t('menu.overview')} style={{ marginTop: "28px" }}>
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {menuStats.totalProducts}
                                    </div>
                                    <div className="text-sm text-gray-500">{t('menu.products')}</div>
                                </div>
                            </Col>
                            <Col span={12}>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {menuStats.categories}
                                    </div>
                                    <div className="text-sm text-gray-500">{t('menu.categories')}</div>
                                </div>
                            </Col>
                            <Col span={12}>
                                <div className="text-center">
                                    <div className="text-xl font-bold text-purple-600">
                                        ${menuStats.averagePrice.toFixed(2)}
                                    </div>
                                    <div className="text-sm text-gray-500">{t('menu.avgPrice')}</div>
                                </div>
                            </Col>
                            <Col span={12}>
                                <div className="text-center">
                                    <div className="text-xl font-bold text-orange-600">
                                        ${menuStats.totalValue.toFixed(2)}
                                    </div>
                                    <div className="text-sm text-gray-500">{t('menu.totalValue')}</div>
                                </div>
                            </Col>
                        </Row>
                    </Card>
                </Col>

                {/* Main Content */}
                <Col xs={24} lg={16}>
                    {/* Cover Image Section - Always visible */}
                    {vendorDetails.coverImageUrl && (
                        <Card className="mb-6">
                            <Title level={4} className="mb-3">{t('profile.coverImage')}</Title>
                            <div className="text-center">
                                <Image
                                    width="100%"
                                    height={200}
                                    src={`https://service-provider.runasp.net${vendorDetails.coverImageUrl}`}
                                    alt={`${vendorDetails.businessName} cover`}
                                    className="rounded-lg object-cover"
                                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYnN"
                                />
                            </div>
                        </Card>
                    )}

                    {/* Tabs Section */}
                    <Card>
                        <Tabs
                            activeKey={activeTab}
                            onChange={handleTabChange}
                            items={[
                                {
                                    key: 'details',
                                    label: (
                                        <span>
                                            <UserOutlined />
                                            {t('tabs.vendorInformation')}
                                        </span>
                                    ),
                                    children: (
                                        <div>
                                            <Descriptions
                                                bordered
                                                column={1}
                                                size="medium"
                                            >
                                                <Descriptions.Item label={t('details.vendorId')}>
                                                    <Text copyable className="font-mono text-sm">
                                                        {vendorDetails.id}
                                                    </Text>
                                                </Descriptions.Item>

                                                <Descriptions.Item label={t('details.fullName')}>
                                                    {vendorDetails.fullName}
                                                </Descriptions.Item>

                                                <Descriptions.Item label={t('details.emailAddress')}>
                                                    <a href={`mailto:${vendorDetails.email}`}>
                                                        {vendorDetails.email}
                                                    </a>
                                                </Descriptions.Item>

                                                <Descriptions.Item label={t('details.businessName')}>
                                                    {vendorDetails.businessName}
                                                </Descriptions.Item>

                                                <Descriptions.Item label={t('details.businessType')}>
                                                    <Tag color="blue">{vendorDetails.businessType}</Tag>
                                                </Descriptions.Item>

                                                <Descriptions.Item label={t('details.taxNumber')}>
                                                    {vendorDetails.taxNumber}
                                                </Descriptions.Item>

                                                <Descriptions.Item label={t('details.rating')}>
                                                    <div className="flex items-center gap-2">
                                                        <Rate
                                                            disabled
                                                            defaultValue={vendorDetails.rating}
                                                            style={{ fontSize: '12px' }}
                                                        />
                                                        <span>({vendorDetails.rating?.toFixed(2)})</span>
                                                    </div>
                                                </Descriptions.Item>

                                                <Descriptions.Item label={t('details.accountStatus')}>
                                                    <Tag
                                                        icon={vendorDetails.isApproved ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                                                        color={vendorDetails.isApproved ? 'green' : 'orange'}
                                                    >
                                                        {vendorDetails.isApproved ? t('status.approvedActive') : t('status.pendingApproval')}
                                                    </Tag>
                                                </Descriptions.Item>
                                            </Descriptions>
                                        </div>
                                    )
                                },
                                {
                                    key: 'menu',
                                    label: (
                                        <span>
                                            <AppstoreOutlined />
                                            {t('tabs.menuProducts', { count: vendorMenu.length })}
                                        </span>
                                    ),
                                    children: (
                                        <div>
                                            {vendorMenuLoading ? (
                                                <div className="text-center py-8">
                                                    <Spin size="large" />
                                                    <p className="mt-4 text-gray-500">{t('loading.menu')}</p>
                                                </div>
                                            ) : vendorMenuError ? (
                                                <Alert
                                                    message={t('errors.errorLoadingMenu')}
                                                    description={t('errors.unableToLoadMenu')}
                                                    type="error"
                                                    showIcon
                                                    action={
                                                        <Button
                                                            size="small"
                                                            onClick={() => dispatch(fetchVendorMenu(vendorId))}
                                                        >
                                                            {t('buttons.retry')}
                                                        </Button>
                                                    }
                                                />
                                            ) : vendorMenu.length === 0 ? (
                                                <Empty
                                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                                    description={t('menu.noProducts')}
                                                />
                                            ) : (
                                                <Row gutter={[16, 16]}>
                                                    {vendorMenu.map((product) => (
                                                        <Col xs={12} sm={12} md={8} lg={6} key={product.id}>
                                                            {renderProductCard(product)}
                                                        </Col>
                                                    ))}
                                                </Row>
                                            )}
                                        </div>
                                    )
                                },
                                {
                                    key: 'ratings',
                                    label: (
                                        <span>
                                            <StarOutlined />
                                            {t('tabs.reviewsRatings')}
                                        </span>
                                    ),
                                    children: (
                                        <div>
                                            {vendorRatingsLoading ? (
                                                <div className="text-center py-8">
                                                    <Spin size="large" />
                                                    <p className="mt-4 text-gray-500">{t('loading.reviews')}</p>
                                                </div>
                                            ) : vendorRatingsError ? (
                                                <Alert
                                                    message={t('errors.errorLoadingReviews')}
                                                    description={t('errors.unableToLoadReviews')}
                                                    type="error"
                                                    showIcon
                                                    action={
                                                        <Button
                                                            size="small"
                                                            onClick={() => dispatch(fetchVendorRatings({
                                                                vendorId,
                                                                pageNumber: ratingsPage,
                                                                pageSize: ratingsPageSize
                                                            }))}
                                                        >
                                                            {t('buttons.retry')}
                                                        </Button>
                                                    }
                                                />
                                            ) : vendorRatings.items.length === 0 ? (
                                                <Empty
                                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                                    description={t('ratings.noReviews')}
                                                />
                                            ) : (
                                                <div>
                                                    {/* Reviews Header */}
                                                    <div className="mb-4 p-4 rounded-lg">
                                                        <Row gutter={[16, 16]} align="middle">
                                                            <Col span={12}>
                                                                <div className="text-center">
                                                                    <Text strong className="text-lg">
                                                                        {ratingsStats.averageRating.toFixed(1)}
                                                                    </Text>
                                                                    <Rate
                                                                        disabled
                                                                        defaultValue={ratingsStats.averageRating}
                                                                        style={{ fontSize: '14px', display: 'block' }}
                                                                    />
                                                                    <Text className="text-sm text-gray-500">
                                                                        {t('ratings.averageRating')}
                                                                    </Text>
                                                                </div>
                                                            </Col>
                                                            <Col span={12}>
                                                                <div className="text-center">
                                                                    <Text strong className="text-lg">
                                                                        {vendorRatings.totalPages * ratingsPageSize}
                                                                    </Text>
                                                                    <Text className="text-sm text-gray-500 block">
                                                                        {t('ratings.totalReviews')}
                                                                    </Text>
                                                                </div>
                                                            </Col>
                                                        </Row>
                                                    </div>

                                                    {/* Reviews List */}
                                                    <div className="space-y-4">
                                                        {vendorRatings.items.map((rating) => renderRatingCard(rating))}
                                                    </div>

                                                    {/* Pagination */}
                                                    {vendorRatings.totalPages > 1 && (
                                                        <div className="mt-6 text-center">
                                                            <Pagination
                                                                current={ratingsPage}
                                                                total={vendorRatings.totalPages * ratingsPageSize}
                                                                pageSize={ratingsPageSize}
                                                                onChange={handleRatingsPaginationChange}
                                                                showSizeChanger
                                                                showQuickJumper
                                                                showTotal={(total, range) =>
                                                                    t('pagination.showTotal', { start: range[0], end: range[1], total })
                                                                }
                                                                pageSizeOptions={['5', '10', '20']}
                                                                className={isRTL ? 'rtl-pagination' : ''}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )
                                }
                            ]}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminVendorDetailsPage;
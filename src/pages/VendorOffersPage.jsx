import React, { useEffect, useState } from 'react';
import { Card, Rate, Select, Row, Col, Typography, Empty, Spin, Button, Pagination, Avatar, Space, Modal, message, Dropdown, Menu } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchVendorOffers,
    clearError,
    deleteOffer,
} from '../redux/slices/vendorsSlice';
import PageHeader from '../components/common/PageHeader';
import SearchInput from '../components/common/SearchInput';
import ToastNotifier from '../components/common/ToastNotifier';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { UserOutlined, CalendarOutlined, MessageOutlined, EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined, MoreOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Grid } from "antd";
import TableWrapper from '../components/common/TableWrapper';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const VendorOffersPage = () => {
    const { t, i18n } = useTranslation('vendorOffers');
    const dispatch = useDispatch();
    const { vendorOffers, loading, error } = useSelector((state) => state.vendors);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchValue, setSearchValue] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [sortColumn, setSortColumn] = useState('');
    const [sortDirection, setSortDirection] = useState('');
    const [deleteModal, setDeleteModal] = useState({ visible: false, offer: null });

    const screens = useBreakpoint();
    const isMobile = !screens.md;
    const direction = i18n.dir();
    const isRTL = direction === "rtl";

    const navigate = useNavigate();

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchValue);
            setCurrentPage(1);
        }, 400);
        return () => clearTimeout(handler);
    }, [searchValue]);

    useEffect(() => {
        dispatch(fetchVendorOffers({
            PageNumer: currentPage,
            PageSize: pageSize,
            SearchValue: debouncedSearch,
            SortColumn: sortColumn,
            SortDirection: sortDirection,
        }));
    }, [dispatch, currentPage, pageSize, debouncedSearch, sortColumn, sortDirection]);

    // Handle errors
    useEffect(() => {
        if (error) {
            ToastNotifier.error(t('notifications.loadFailed'), error);
            dispatch(clearError());
        }
    }, [error, dispatch, t]);

    // Get product name based on current language
    const getProductName = (Offer) => {
        return isRTL && Offer.productNameAr ? Offer.productNameAr : Offer.productNameEn;
    };

    // Enhanced Card UI for mobile/tablet; table for desktop
    const renderCard = (Offer) => (
        <Card
            key={Offer.productId}
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
                    <Title level={5} style={{ margin: 0 }}>
                        <Avatar
                            src={Offer.imageUrl ? `https://service-provider.runasp.net${Offer.imageUrl}` : null}
                            size={40}
                            shape="square"
                            alt={getProductName(Offer)}
                            style={{ objectFit: 'cover' }}
                        />
                    </Title>
                    <Text type="secondary" style={{ fontSize: 13 }}>{getProductName(Offer)}</Text>
                </Col>
                <Col>
                <span style={{ fontWeight: 500, color: '#52c41a' }}>
                    {Offer.discountPercentage?.toFixed(2)}%
                </span>
                </Col>
            </Row>
            <Row style={{ marginBottom: 8 }}>
                <Col flex="auto">
                    <Text>
                        {Offer.description || <Text type="secondary">{t('Offers.noComment')}</Text>}
                    </Text>
                </Col>
            </Row>
            <Row gutter={12} style={{ fontSize: 13 }}>
                <Col>
                <Text>
                        {Offer.discountCode || <Text type="secondary">{t('Offers.noComment')}</Text>}
                </Text>
                </Col>
            </Row>
        </Card>
    );

    // Table columns for desktop
    const columns = [
        {
            title: t('table.image'),
            dataIndex: 'imageUrl',
            key: 'imageUrl',
            // sorter: true, // Removed sorting
            render: (imageUrl, record) => (
                <Avatar
                    src={imageUrl ? `https://service-provider.runasp.net${imageUrl}` : null}
                    size={40}
                    shape="square"
                    alt={getProductName(record)}
                    style={{ objectFit: 'cover' }}
                />
            ),
        },
        {
            title: t('table.product'),
            dataIndex: isRTL ? 'productNameAr' : 'productNameEn',
            key: 'product',
            sorter: true,
            render: (text, record) => getProductName(record),
        },
        {
            title: t('table.discount'),
            dataIndex: 'discountPercentage',
            key: 'discountPercentage',
            sorter: true,
            render: (discountPercentage) => (
                <span style={{ fontWeight: 500, color: '#52c41a' }}>
                    {parseInt(discountPercentage, 10)}%
                </span>
            ),
        },
        {
            title: t('table.discription'),
            dataIndex: 'description',
            key: 'description',
            render: (description) =>
                <span>
                    {description || <Text type="secondary">{t('Offers.noComment')}</Text>}
                </span>
        },
        {
            title: t('table.code'),
            dataIndex: 'discountCode',
            key: 'discountCode',
            sorter: true,
            render: (discountCode) =>
                <span>
                    {discountCode || <Text type="secondary">{t('Offers.noComment')}</Text>}
                </span>
        },
        {
            title: t('table.actions'),
            key: 'actions',
            align: isRTL ? 'left' : 'right',
            width: 48,
            render: (_, record) => (
                <Dropdown
                    overlay={
                        <Menu>
                            <Menu.Item
                                key="view/edit"
                                onClick={() => navigate(`/vendor/offers/${record.productId}/${record.discountPercentage}`)}
                                icon={<InfoCircleOutlined />}
                            >
                                {t('actions.viewEdit')}
                            </Menu.Item>
                            <Menu.Item
                                key="delete"
                                onClick={() => showDeleteModal(record)}
                                icon={<DeleteOutlined />}
                                danger
                            >
                                {t('actions.delete')}
                            </Menu.Item>
                        </Menu>
                    }
                    trigger={['click']}
                    placement={isRTL ? "bottomLeft" : "bottomRight"}
                >
                    <Button
                        icon={<MoreOutlined />}
                        type="text"
                    />
                </Dropdown>
            ),
            fixed: isRTL ? 'left' : 'right'
        },
    ];

    // Delete offer handlers
    const showDeleteModal = (offer) => {
        setDeleteModal({ visible: true, offer });
    };
    const handleDeleteOffer = () => {
        const { offer } = deleteModal;
        if (!offer) return;
        dispatch(deleteOffer({ productId: offer.productId, discountPercentage: offer.discountPercentage })).then((result) => {
            if (!result.error) {
                message.success(t('notifications.deleteOfferSuccess') || 'Offer deleted successfully!');
                dispatch(fetchVendorOffers({ PageNumer: currentPage, PageSize: pageSize }));
            } else {
                message.error(t('notifications.deleteOfferFailed') || 'Failed to delete offer.');
            }
            setDeleteModal({ visible: false, offer: null });
        });
    };

    return (
        <div className="p-6 min-h-screen" dir={direction}>
            <PageHeader
                title={t('pageHeader.title')}
                subtitle={t('pageHeader.subtitle')}
                actions={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/vendor/offers/add')}
                    >
                        {t('buttons.addOffer')}
                    </Button>
                }
            />

            <Row gutter={[16, 16]} className="mb-5" align="middle" wrap>
                <Col xs={24} md={12}>
                    <SearchInput
                        placeholder={t('search.placeholder')}
                        value={searchValue}
                        onChange={e => setSearchValue(e.target.value)}
                        className="w-full"
                    />
                </Col>
            </Row>

            {loading ? (
                <LoadingSpinner text={t('loading')} />
            ) : (
                <>
                    {isMobile ? (
                        <div>
                            {vendorOffers.items && vendorOffers.items.length > 0 ? (
                                vendorOffers.items.map(Offer => renderCard(Offer))
                            ) : (
                                <Empty description={t('empty.noOffers')} style={{ margin: '32px 0' }} />
                            )}
                            <div style={{ marginTop: 16, textAlign: isRTL ? 'left' : 'right' }}>
                                <Pagination
                                    current={currentPage}
                                    pageSize={pageSize}
                                    total={vendorOffers.totalPages * pageSize}
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
                                dataSource={vendorOffers.items}
                                columns={columns}
                                loading={loading}
                                rowKey="productId"
                                pagination={{
                                    current: currentPage,
                                    pageSize: pageSize,
                                    total: vendorOffers.totalPages * pageSize,
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

            {/* Delete Confirmation Modal */}
            <Modal
                title={t('modal.confirmDeleteTitle') || 'Confirm Deletion'}
                open={deleteModal.visible}
                onOk={handleDeleteOffer}
                onCancel={() => setDeleteModal({ visible: false, offer: null })}
                okText={t('modal.yesDelete') || 'Delete'}
                cancelText={t('modal.cancel') || 'Cancel'}
                okButtonProps={{ danger: true }}
            >
                <p>{t('modal.confirmDeleteMessage') || 'Are you sure you want to delete this offer? This action cannot be undone.'}</p>
                {deleteModal.offer && (
                    <p style={{ color: '#888', fontSize: 13 }}>
                        {getProductName(deleteModal.offer)} — {deleteModal.offer.discountPercentage}%
                    </p>
                )}
            </Modal>
        </div>
    );
};

export default VendorOffersPage;
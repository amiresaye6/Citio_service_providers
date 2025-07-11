import React, { useEffect, useState } from 'react';
import { Button, Input, Table, Avatar, Tag, Dropdown, Menu, Tooltip, Card, Modal } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVendorMenu, fetchSubcategories, clearError } from '../redux/slices/vendorsSlice';
import { useNavigate } from 'react-router-dom';
import {
    MoreOutlined,
    PlusOutlined,
    InfoCircleOutlined,
    ExclamationCircleOutlined,
    WarningOutlined
} from '@ant-design/icons';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ToastNotifier from '../components/common/ToastNotifier';
import { deleteProduct } from '../redux/slices/productsSlice';
import { useTranslation } from 'react-i18next';

const MOBILE_WIDTH = 768;

const VendorMenuPage = () => {
    const { t, i18n } = useTranslation('vendorMenu');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { vendorMenu, loading, error } = useSelector((state) => state.vendors);
    const { user } = useSelector((state) => state.auth);
    const [search, setSearch] = useState('');
    const [filteredItems, setFilteredItems] = useState([]);
    const [deactivatingId, setDeactivatingId] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_WIDTH);
    const [confirmModal, setConfirmModal] = useState({ visible: false, itemId: null, itemName: '' });
    const vendorId = user?.id || localStorage.getItem("userId");

    const direction = i18n.dir();
    const isRTL = direction === "rtl";

    useEffect(() => {
        if (vendorId) {
            dispatch(fetchVendorMenu({ vendorId }));
            dispatch(fetchSubcategories());
        }
    }, [dispatch, vendorId]);

    useEffect(() => {
        if (error) {
            ToastNotifier.error(t('errors.operationFailed'), error);
            dispatch(clearError());
        }
    }, [error, dispatch, t]);

    useEffect(() => {
        if (!search) {
            setFilteredItems(vendorMenu.items || []);
        } else {
            setFilteredItems(
                (vendorMenu.items || []).filter(
                    (item) =>
                        (item.nameEn?.toLowerCase().includes(search.toLowerCase()) || '') ||
                        (item.nameAr?.toLowerCase().includes(search.toLowerCase()) || '') ||
                        (item.description?.toLowerCase().includes(search.toLowerCase()) || '') ||
                        (item.categoryNameEn?.toLowerCase().includes(search.toLowerCase()) || '')
                )
            );
        }
    }, [vendorMenu, search]);

    useEffect(() => {
        // Responsive: listen for window resize
        const handleResize = () => setIsMobile(window.innerWidth < MOBILE_WIDTH);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Show confirmation modal before deactivation
    const showDeactivateConfirmation = (item) => {
        setConfirmModal({
            visible: true,
            itemId: item.id,
            itemName: isRTL && item.nameAr ? item.nameAr : item.nameEn
        });
    };

    // Handle deactivation after confirmation
    const handleDeactivate = () => {
        const itemId = confirmModal.itemId;
        setDeactivatingId(itemId);

        // Close modal
        setConfirmModal({ visible: false, itemId: null, itemName: '' });

        dispatch(deleteProduct(itemId)).then((result) => {
            if (result.meta.requestStatus === 'fulfilled') {
                ToastNotifier.success(t('notifications.itemDeactivated.title'), t('notifications.itemDeactivated.message'));
                dispatch(fetchVendorMenu({ vendorId }));
            }
            setDeactivatingId(null);
        });
    };

    const getItemName = (item) => {
        return isRTL && item.nameAr ? item.nameAr : item.nameEn;
    };

    const getItemDescription = (item) => {
        return isRTL && item.descriptionAr ? item.descriptionAr : item.description;
    };

    const getCategoryName = (item) => {
        return isRTL && item.categoryNameAr ? item.categoryNameAr : item.categoryNameEn;
    };

    const getStatusTranslation = (status) => {
        return status === 'inactive' ? t('status.inactive') : t('status.active');
    };

    const columns = [
        {
            title: t('table.image'),
            dataIndex: 'mainImageUrl',
            key: 'mainImageUrl',
            width: 80,
            render: (url, record) => (
                <Avatar
                    src={url ? `https://service-provider.runasp.net${url}` : null}
                    size={40}
                    shape="square"
                    alt={getItemName(record)}
                    style={{ objectFit: 'cover' }}
                />
            ),
            fixed: 'left'
        },
        {
            title: t('table.name'),
            dataIndex: isRTL ? 'nameAr' : 'nameEn',
            key: 'name',
            render: (text, record) => <span style={{ fontWeight: 600 }}>{getItemName(record)}</span>,
            ellipsis: true,
            width: 180,
        },
        {
            title: t('table.description'),
            dataIndex: isRTL ? 'descriptionAr' : 'description',
            key: 'description',
            ellipsis: true,
            render: (desc, record) => {
                const description = getItemDescription(record);
                return (
                    <Tooltip title={description}>
                        <span style={{ color: '#555' }}>
                            {description && description.length > 80 ? description.slice(0, 80) + "..." : description}
                        </span>
                    </Tooltip>
                );
            },
            width: 300,
        },
        {
            title: t('table.price'),
            dataIndex: 'price',
            key: 'price',
            render: (price) => <span>${Number(price).toFixed(2)}</span>,
            width: 120,
            sorter: (a, b) => a.price - b.price,
        },
        {
            title: t('table.category'),
            dataIndex: isRTL ? 'categoryNameAr' : 'categoryNameEn',
            key: 'category',
            render: (val, record) => <span style={{ color: '#555' }}>{getCategoryName(record)}</span>,
            width: 150,
            filters: [...new Set((vendorMenu.items || []).map(item => getCategoryName(item)))]
                .filter(Boolean)
                .map(cat => ({ text: cat, value: cat })),
            onFilter: (value, record) => getCategoryName(record) === value,
        },
        {
            title: t('table.status'),
            dataIndex: 'status',
            key: 'status',
            render: (status) =>
                status === 'inactive' ? (
                    <Tag color="red">{t('status.inactive')}</Tag>
                ) : (
                    <Tag color="green">{t('status.active')}</Tag>
                ),
            width: 90,
            filters: [
                { text: t('status.active'), value: 'active' },
                { text: t('status.inactive'), value: 'inactive' },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: '',
            key: 'actions',
            align: isRTL ? 'left' : 'right',
            width: 48,
            render: (_, record) => (
                <Dropdown
                    overlay={
                        <Menu>
                            <Menu.Item
                                key="view/edit"
                                onClick={() => navigate(`/vendor/menu/item/${record.id}`)}
                                icon={<InfoCircleOutlined />}
                            >
                                {t('actions.viewEdit')}
                            </Menu.Item>
                            <Menu.Item
                                key="deactivate"
                                onClick={() => showDeactivateConfirmation(record)}
                                disabled={record.status === 'inactive' || deactivatingId === record.id}
                                icon={<WarningOutlined />}
                                danger
                            >
                                {t('actions.deactivate')}
                            </Menu.Item>
                        </Menu>
                    }
                    trigger={['click']}
                    placement={isRTL ? "bottomLeft" : "bottomRight"}
                >
                    <Button
                        icon={<MoreOutlined />}
                        type="text"
                        loading={deactivatingId === record.id}
                    />
                </Dropdown>
            ),
            fixed: isRTL ? 'left' : 'right'
        },
    ];

    // Mobile Card rendering with improved layout
    const renderMobileCards = () => (
        <div className="flex flex-col gap-4">
            {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                    <Card
                        key={item.id}
                        bodyStyle={{ padding: 12, display: 'flex', alignItems: 'flex-start', gap: 12 }}
                        style={{ borderRadius: 12, boxShadow: '0 1px 8px #0001' }}
                    >
                        <Avatar
                            src={item.mainImageUrl ? `https://service-provider.runasp.net${item.mainImageUrl}` : null}
                            size={64}
                            shape="square"
                            alt={getItemName(item)}
                            style={{
                                objectFit: 'cover',
                                flexShrink: 0,
                                border: '1px solid #eee',
                                borderRadius: '8px'
                            }}
                        />
                        <div style={{ flex: 1 }}>
                            <div className="flex justify-between items-start">
                                <div style={{ fontWeight: 600, fontSize: 16 }}>{getItemName(item)}</div>
                                <Tag
                                    style={{
                                        borderRadius: 8,
                                        fontSize: 12
                                    }}
                                    color={item.status === 'inactive' ? 'red' : 'green'}
                                >
                                    {getStatusTranslation(item.status)}
                                </Tag>
                            </div>
                            <div style={{ color: '#888', fontSize: 13, marginBottom: 4 }}>{getCategoryName(item)}</div>
                            <div style={{ color: '#555', marginBottom: 8, fontSize: 13, lineHeight: 1.4 }}>
                                {getItemDescription(item) && getItemDescription(item).length > 100
                                    ? getItemDescription(item).slice(0, 100) + "..."
                                    : getItemDescription(item)}
                            </div>
                            <div className="flex justify-between items-center">
                                <span style={{
                                    fontWeight: 600,
                                    color: '#1a1a1a',
                                    fontSize: '16px'
                                }}>
                                    ${Number(item.price).toFixed(2)}
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        size="small"
                                        type="primary"
                                        onClick={() => navigate(`/vendor/menu/item/${item.id}`)}
                                    >
                                        {t('buttons.edit')}
                                    </Button>
                                    <Button
                                        size="small"
                                        danger
                                        disabled={item.status === 'inactive' || deactivatingId === item.id}
                                        loading={deactivatingId === item.id}
                                        onClick={() => showDeactivateConfirmation(item)}
                                    >
                                        {t('buttons.deactivate')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))
            ) : (
                <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                    <ExclamationCircleOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                    <p>{t('emptyState.noItems')}</p>
                    {search && (
                        <Button type="link" onClick={() => setSearch('')}>
                            {t('buttons.clearSearch')}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );

    // Empty state component
    const renderEmptyState = () => (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <ExclamationCircleOutlined style={{ fontSize: 48, marginBottom: 16 }} />
            <p className="mb-4">{t('emptyState.noItems')}</p>
            {search ? (
                <Button type="link" onClick={() => setSearch('')}>
                    {t('buttons.clearSearch')}
                </Button>
            ) : (
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/vendor/menu/add')}
                >
                    {t('buttons.addFirstItem')}
                </Button>
            )}
        </div>
    );

    return (
        <div className="p-6 min-h-screen" dir={direction}>
            <PageHeader
                title={t('pageHeader.title')}
                subtitle={t('pageHeader.subtitle')}
                actions={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/vendor/menu/add')}
                    >
                        {t('buttons.addProduct')}
                    </Button>
                }
            />

            {/* Search and filter section */}
            <div className="mb-6">
                <div className="flex flex-wrap gap-4 items-center">
                    <div style={{ maxWidth: 340, width: '100%' }}>
                        <Input.Search
                            placeholder={t('search.placeholder')}
                            allowClear
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ borderRadius: 6 }}
                        />
                    </div>
                    {!isMobile && (
                        <div className="text-gray-500 text-sm">
                            {filteredItems.length} {t(filteredItems.length === 1 ? 'search.itemFound' : 'search.itemsFound')}
                        </div>
                    )}
                </div>
            </div>

            {/* Main content section */}
            {loading ? (
                <LoadingSpinner text={t('loading.menuItems')} />
            ) : filteredItems.length > 0 ? (
                isMobile ? (
                    renderMobileCards()
                ) : (
                    <Table
                        dataSource={filteredItems}
                        columns={columns}
                        rowKey="id"
                        scroll={{ x: 900, y: 520 }}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            pageSizeOptions: ['10', '20', '50'],
                            showTotal: (total, range) => t('pagination.showTotal', { start: range[0], end: range[1], total }),
                            position: ['bottomCenter'],
                            showQuickJumper: true,
                        }}
                        rowClassName={record => record.status === 'inactive' ? 'bg-gray-50' : ''}
                        className={isRTL ? 'rtl-table' : ''}
                    />
                )
            ) : (
                renderEmptyState()
            )}

            {/* Confirmation modal for deactivation */}
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <WarningOutlined style={{ color: '#ff4d4f' }} />
                        {t('modal.confirmDeactivation')}
                    </div>
                }
                open={confirmModal.visible}
                onOk={handleDeactivate}
                onCancel={() => setConfirmModal({ visible: false, itemId: null, itemName: '' })}
                okText={t('modal.yesDeactivate')}
                cancelText={t('modal.cancel')}
                okButtonProps={{ danger: true, loading: deactivatingId === confirmModal.itemId }}
            >
                <p>{t('modal.deactivatePrompt', { name: confirmModal.itemName })}</p>
                <p className="text-gray-500 text-sm mt-2">
                    {t('modal.deactivateDescription')}
                </p>
            </Modal>
        </div>
    );
};

export default VendorMenuPage;
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

const MOBILE_WIDTH = 768;

const VendorMenuPage = () => {
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

    useEffect(() => {
        if (vendorId) {
            dispatch(fetchVendorMenu({ vendorId }));
            dispatch(fetchSubcategories());
        }
    }, [dispatch, vendorId]);

    useEffect(() => {
        if (error) {
            ToastNotifier.error('Operation Failed', error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    useEffect(() => {
        if (!search) {
            setFilteredItems(vendorMenu.items || []);
        } else {
            setFilteredItems(
                (vendorMenu.items || []).filter(
                    (item) =>
                        (item.nameEn?.toLowerCase().includes(search.toLowerCase()) || '') ||
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
            itemName: item.nameEn
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
                ToastNotifier.success('Item Deactivated', `Menu item has been deactivated.`);
                dispatch(fetchVendorMenu({ vendorId }));
            }
            setDeactivatingId(null);
        });
    };

    const columns = [
        {
            title: 'Image',
            dataIndex: 'mainImageUrl',
            key: 'mainImageUrl',
            width: 80,
            render: (url, record) => (
                <Avatar
                    src={url ? `https://service-provider.runasp.net${url}` : null}
                    size={40}
                    shape="square"
                    alt={record.nameEn}
                    style={{ objectFit: 'cover' }}
                />
            ),
            fixed: 'left'
        },
        {
            title: 'Name',
            dataIndex: 'nameEn',
            key: 'nameEn',
            render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>,
            ellipsis: true,
            width: 180,
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
            render: (desc) => (
                <Tooltip title={desc}>
                    <span style={{ color: '#555' }}>
                        {desc && desc.length > 80 ? desc.slice(0, 80) + "..." : desc}
                    </span>
                </Tooltip>
            ),
            width: 300,
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price) => <span>${Number(price).toFixed(2)}</span>,
            width: 120,
            sorter: (a, b) => a.price - b.price,
        },
        {
            title: 'Category',
            dataIndex: 'categoryNameEn',
            key: 'categoryNameEn',
            render: (val) => <span style={{ color: '#555' }}>{val}</span>,
            width: 150,
            filters: [...new Set((vendorMenu.items || []).map(item => item.categoryNameEn))]
                .filter(Boolean)
                .map(cat => ({ text: cat, value: cat })),
            onFilter: (value, record) => record.categoryNameEn === value,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) =>
                status === 'inactive' ? (
                    <Tag color="red">Inactive</Tag>
                ) : (
                    <Tag color="green">Active</Tag>
                ),
            width: 90,
            filters: [
                { text: 'Active', value: 'active' },
                { text: 'Inactive', value: 'inactive' },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: '',
            key: 'actions',
            align: 'right',
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
                                View & Edit
                            </Menu.Item>
                            <Menu.Item
                                key="deactivate"
                                onClick={() => showDeactivateConfirmation(record)}
                                disabled={record.status === 'inactive' || deactivatingId === record.id}
                                icon={<WarningOutlined />}
                                danger
                            >
                                Deactivate
                            </Menu.Item>
                        </Menu>
                    }
                    trigger={['click']}
                    placement="bottomRight"
                >
                    <Button
                        icon={<MoreOutlined />}
                        type="text"
                        loading={deactivatingId === record.id}
                    />
                </Dropdown>
            ),
            fixed: 'right'
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
                            alt={item.nameEn}
                            style={{
                                objectFit: 'cover',
                                flexShrink: 0,
                                border: '1px solid #eee',
                                borderRadius: '8px'
                            }}
                        />
                        <div style={{ flex: 1 }}>
                            <div className="flex justify-between items-start">
                                <div style={{ fontWeight: 600, fontSize: 16 }}>{item.nameEn}</div>
                                <Tag
                                    style={{
                                        borderRadius: 8,
                                        fontSize: 12
                                    }}
                                    color={item.status === 'inactive' ? 'red' : 'green'}
                                >
                                    {item.status === 'inactive' ? 'Inactive' : 'Active'}
                                </Tag>
                            </div>
                            <div style={{ color: '#888', fontSize: 13, marginBottom: 4 }}>{item.categoryNameEn}</div>
                            <div style={{ color: '#555', marginBottom: 8, fontSize: 13, lineHeight: 1.4 }}>
                                {item.description && item.description.length > 100
                                    ? item.description.slice(0, 100) + "..."
                                    : item.description}
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
                                        Edit
                                    </Button>
                                    <Button
                                        size="small"
                                        danger
                                        disabled={item.status === 'inactive' || deactivatingId === item.id}
                                        loading={deactivatingId === item.id}
                                        onClick={() => showDeactivateConfirmation(item)}
                                    >
                                        Deactivate
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))
            ) : (
                <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                    <ExclamationCircleOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                    <p>No menu items found</p>
                    {search && (
                        <Button type="link" onClick={() => setSearch('')}>
                            Clear search
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
            <p className="mb-4">No menu items found</p>
            {search ? (
                <Button type="link" onClick={() => setSearch('')}>
                    Clear search
                </Button>
            ) : (
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/vendor/menu/add')}
                >
                    Add Your First Menu Item
                </Button>
            )}
        </div>
    );

    return (
        <div className="p-6 min-h-screen">
            <PageHeader
                title="Menu"
                subtitle="View and manage your menu items"
                actions={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/vendor/menu/add')}
                    >
                        Add Product
                    </Button>
                }
            />

            {/* Search and filter section */}
            <div className="mb-6">
                <div className="flex flex-wrap gap-4 items-center">
                    <div style={{ maxWidth: 340, width: '100%' }}>
                        <Input.Search
                            placeholder="Search menu items..."
                            allowClear
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ borderRadius: 6 }}
                        />
                    </div>
                    {!isMobile && (
                        <div className="text-gray-500 text-sm">
                            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found
                        </div>
                    )}
                </div>
            </div>

            {/* Main content section */}
            {loading ? (
                <LoadingSpinner text="Loading menu items..." />
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
                            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                            position: ['bottomCenter'],
                            showQuickJumper: true,
                        }}
                        rowClassName={record => record.status === 'inactive' ? 'bg-gray-50' : ''}
                    />
                )
            ) : (
                renderEmptyState()
            )}

            {/* Confirmation modal for deactivation */}
            <Modal
                title={<div className="flex items-center gap-2"><WarningOutlined style={{ color: '#ff4d4f' }} /> Confirm Deactivation</div>}
                open={confirmModal.visible}
                onOk={handleDeactivate}
                onCancel={() => setConfirmModal({ visible: false, itemId: null, itemName: '' })}
                okText="Yes, Deactivate"
                cancelText="Cancel"
                okButtonProps={{ danger: true, loading: deactivatingId === confirmModal.itemId }}
            >
                <p>Are you sure you want to deactivate <strong>{confirmModal.itemName}</strong>?</p>
                <p className="text-gray-500 text-sm mt-2">
                    This will make the item unavailable for customers to order. This action will be logged.
                </p>
            </Modal>
        </div>
    );
};

export default VendorMenuPage;
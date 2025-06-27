import React, { useEffect, useState } from 'react';
import { Button, Input, Table, Avatar, Tag, Dropdown, Menu, Tooltip, Card } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVendorMenu, fetchSubcategories, deactivateMenuItem, clearError } from '../redux/slices/vendorsSlice';
import { useNavigate } from 'react-router-dom';
import { MoreOutlined, PlusOutlined, InfoCircleOutlined } from '@ant-design/icons';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ToastNotifier from '../components/common/ToastNotifier';

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
            setFilteredItems(vendorMenu.items);
        } else {
            setFilteredItems(
                vendorMenu.items.filter(
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

    const handleDeactivate = (itemId) => {
        setDeactivatingId(itemId);
        dispatch(deactivateMenuItem({ vendorId, menuItemId: itemId })).then((result) => {
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
                    src={`https://service-provider.runasp.net${url}`}
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
            width: 500,
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price) => <span>${price?.toFixed(2)}</span>,
            width: 150,
        },
        {
            title: 'Category',
            dataIndex: 'categoryNameEn',
            key: 'categoryNameEn',
            render: (val) => <span style={{ color: '#555' }}>{val}</span>,
            width: 150,
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
                                onClick={() => handleDeactivate(record.id)}
                                disabled={record.status === 'inactive'}
                                danger
                            >
                                Deactivate
                            </Menu.Item>
                        </Menu>
                    }
                    trigger={['click']}
                >
                    <Button icon={<MoreOutlined />} type="text" />
                </Dropdown>
            ),
            fixed: 'right'
        },
    ];

    // Mobile Card rendering
    const renderMobileCards = () => (
        <div className="flex flex-col gap-4">
            {filteredItems.map((item) => (
                <Card
                    key={item.id}
                    bodyStyle={{ padding: 12, display: 'flex', alignItems: 'flex-start', gap: 12 }}
                    style={{ borderRadius: 12, boxShadow: '0 1px 8px #0001' }}
                >
                    <Avatar
                        src={`https://service-provider.runasp.net${item.mainImageUrl}`}
                        size={54}
                        shape="square"
                        alt={item.nameEn}
                        style={{ objectFit: 'cover', flexShrink: 0, border: '1px solid #eee' }}
                    />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 16 }}>{item.nameEn}</div>
                        <div style={{ color: '#888', fontSize: 13, marginBottom: 4 }}>{item.categoryNameEn}</div>
                        <div style={{ color: '#555', marginBottom: 4 }}>
                            {item.description && item.description.length > 60
                                ? item.description.slice(0, 60) + "..."
                                : item.description}
                        </div>
                        <div style={{ marginBottom: 4 }}>
                            <span style={{ fontWeight: 500, color: '#1a1a1a' }}>${item.price?.toFixed(2)}</span>
                            <Tag
                                style={{
                                    marginLeft: 10,
                                    verticalAlign: 'middle',
                                    fontSize: 12,
                                    borderRadius: 8,
                                }}
                                color={item.status === 'inactive' ? 'red' : 'green'}
                            >
                                {item.status === 'inactive' ? 'Inactive' : 'Active'}
                            </Tag>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <Button
                                size="small"
                                type="primary"
                                icon={<InfoCircleOutlined />}
                                onClick={() => navigate(`/vendor/menu/item/${item.id}`)}
                            >
                                View & Edit
                            </Button>
                            <Button
                                size="small"
                                danger
                                style={{ marginLeft: 4 }}
                                disabled={item.status === 'inactive' || deactivatingId === item.id}
                                loading={deactivatingId === item.id}
                                onClick={() => handleDeactivate(item.id)}
                            >
                                Deactivate
                            </Button>
                        </div>
                    </div>
                </Card>
            ))}
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
            <div style={{ maxWidth: 340, marginBottom: 18 }}>
                <Input.Search
                    placeholder="Search menu item..."
                    allowClear
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ borderRadius: 6 }}
                />
            </div>
            {loading ? (
                <LoadingSpinner text="Loading menu items..." />
            ) : isMobile ? (
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
                />
            )}
        </div>
    );
};

export default VendorMenuPage;
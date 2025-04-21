import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import PageHeader from '../components/common/PageHeader';
import TableWrapper from '../components/common/TableWrapper';
import SearchInput from '../components/common/SearchInput';
import ConfirmModal from '../components/common/ConfirmModal';
import ToastNotifier from '../components/common/ToastNotifier';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AdminMenusPage = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [filteredMenuItems, setFilteredMenuItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // Fake menu item data (replace with API call in a real app)
    const fakeMenuItems = [
        {
            id: '1',
            name: 'Cheeseburger',
            price: 9.99,
            description: 'Classic beef burger with cheese',
            vendor: 'Acme Corp',
            status: 'active',
        },
        {
            id: '2',
            name: 'Margherita Pizza',
            price: 12.50,
            description: 'Tomato, mozzarella, and basil',
            vendor: 'Beta LLC',
            status: 'active',
        },
        {
            id: '3',
            name: 'Caesar Salad',
            price: 7.25,
            description: 'Romaine lettuce with Caesar dressing',
            vendor: 'Gamma Inc',
            status: 'active',
        },
    ];

    // Simulate fetching menu items
    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setMenuItems(fakeMenuItems);
            setFilteredMenuItems(fakeMenuItems);
            setLoading(false);
            ToastNotifier.success('Menu Items Loaded', 'Successfully fetched menu items.');
        }, 1000);
    }, []);

    // Table columns
    const columns = [
        { title: 'Item Name', dataIndex: 'name', key: 'name' },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price) => `$${price.toFixed(2)}`,
        },
        { title: 'Description', dataIndex: 'description', key: 'description' },
        { title: 'Vendor', dataIndex: 'vendor', key: 'vendor' },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <span>
                    {status === 'active' ? (
                        <span className="text-green-500">Active</span>
                    ) : (
                        <span className="text-red-500">Inactive</span>
                    )}
                </span>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div className="space-x-2">
                    <Button
                        type="link"
                        danger
                        onClick={() => handleDeactivate(record)}
                        disabled={record.status === 'inactive'}
                    >
                        Deactivate
                    </Button>
                </div>
            ),
        },
    ];

    // Handle search
    const handleSearch = (value) => {
        const filtered = menuItems.filter(
            (item) =>
                item.name.toLowerCase().includes(value.toLowerCase()) ||
                item.vendor.toLowerCase().includes(value.toLowerCase()) ||
                item.description.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredMenuItems(filtered);
    };

    // Handle deactivate item
    const handleDeactivate = (item) => {
        setSelectedItem(item);
        setIsConfirmModalVisible(true);
    };

    const handleConfirmDeactivate = () => {
        const updatedItems = menuItems.map((item) =>
            item.id === selectedItem.id ? { ...item, status: 'inactive' } : item
        );
        setMenuItems(updatedItems);
        setFilteredMenuItems(updatedItems);
        setIsConfirmModalVisible(false);
        ToastNotifier.success('Item Deactivated', `${selectedItem.name} has been deactivated.`);
    };

    return (
        <div className="p-6 min-h-screen">
            <PageHeader
                title="Admin Menus"
                subtitle="View and manage menu items across all vendors"
                actions={
                    <Button
                        type="primary"
                        onClick={() => ToastNotifier.info('Refresh', 'Menu items refreshed.')}
                    >
                        Refresh
                    </Button>
                }
            />

            <SearchInput
                placeholder="Search by item name, vendor, or description..."
                onSearch={handleSearch}
            />

            {loading ? (
                <LoadingSpinner text="Loading menu items..." />
            ) : (
                <TableWrapper
                    dataSource={filteredMenuItems}
                    columns={columns}
                    loading={loading}
                    rowKey="id"
                />
            )}

            {/* Confirm Deactivate Modal */}
            <ConfirmModal
                open={isConfirmModalVisible}
                onConfirm={handleConfirmDeactivate}
                onCancel={() => setIsConfirmModalVisible(false)}
                title="Deactivate Menu Item"
                content={`Are you sure you want to deactivate ${selectedItem?.name}?`}
                isDanger
            />
        </div>
    );
};

export default AdminMenusPage;
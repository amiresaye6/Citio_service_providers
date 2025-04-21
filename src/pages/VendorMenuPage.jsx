import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, InputNumber } from 'antd';
import PageHeader from '../components/common/PageHeader';
import TableWrapper from '../components/common/TableWrapper';
import ConfirmModal from '../components/common/ConfirmModal';
import ToastNotifier from '../components/common/ToastNotifier';
import LoadingSpinner from '../components/common/LoadingSpinner';

const VendorMenuPage = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [form] = Form.useForm();

    // Fake menu item data (replace with API call in a real app)
    const fakeMenuItems = [
        {
            id: '1',
            name: 'Cheeseburger',
            price: 9.99,
            description: 'Classic beef burger with cheese',
        },
        {
            id: '2',
            name: 'Margherita Pizza',
            price: 12.50,
            description: 'Tomato, mozzarella, and basil',
        },
        {
            id: '3',
            name: 'Caesar Salad',
            price: 7.25,
            description: 'Romaine lettuce with Caesar dressing',
        },
    ];

    // Simulate fetching menu items
    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setMenuItems(fakeMenuItems);
            setLoading(false);
            ToastNotifier.success('Menu Loaded', 'Successfully fetched menu items.');
        }, 1000);
    }, []);

    // Table columns
    const columns = [
        { title: 'Name', dataIndex: 'name', key: 'name' },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price) => `$${price.toFixed(2)}`,
        },
        { title: 'Description', dataIndex: 'description', key: 'description' },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div className="space-x-2">
                    <Button type="link" onClick={() => handleEdit(record)}>
                        Edit
                    </Button>
                    <Button type="link" danger onClick={() => handleDelete(record)}>
                        Delete
                    </Button>
                </div>
            ),
        },
    ];

    // Handle add menu item
    const handleAddItem = () => {
        form.validateFields().then((values) => {
            const newItem = {
                id: String(menuItems.length + 1),
                ...values,
            };
            setMenuItems([...menuItems, newItem]);
            setIsAddModalVisible(false);
            form.resetFields();
            ToastNotifier.success('Item Added', `${values.name} has been added to the menu.`);
        }).catch(() => {
            ToastNotifier.error('Validation Failed', 'Please fill in all required fields.');
        });
    };

    // Handle edit menu item
    const handleEdit = (item) => {
        setSelectedItem(item);
        form.setFieldsValue(item);
        setIsEditModalVisible(true);
    };

    const handleUpdateItem = () => {
        form.validateFields().then((values) => {
            const updatedItems = menuItems.map((item) =>
                item.id === selectedItem.id ? { ...item, ...values } : item
            );
            setMenuItems(updatedItems);
            setIsEditModalVisible(false);
            form.resetFields();
            ToastNotifier.success('Item Updated', `${values.name} has been updated.`);
        }).catch(() => {
            ToastNotifier.error('Validation Failed', 'Please fill in all required fields.');
        });
    };

    // Handle delete menu item
    const handleDelete = (item) => {
        setSelectedItem(item);
        setIsConfirmModalVisible(true);
    };

    const handleConfirmDelete = () => {
        const updatedItems = menuItems.filter((item) => item.id !== selectedItem.id);
        setMenuItems(updatedItems);
        setIsConfirmModalVisible(false);
        ToastNotifier.success('Item Deleted', `${selectedItem.name} has been deleted.`);
    };

    return (
        <div className="p-6 min-h-screen">
            <PageHeader
                title="Vendor Menu"
                subtitle="Manage your menu items"
                actions={
                    <Button type="primary" onClick={() => setIsAddModalVisible(true)}>
                        Add Menu Item
                    </Button>
                }
            />

            {loading ? (
                <LoadingSpinner text="Loading menu items..." />
            ) : (
                <TableWrapper
                    dataSource={menuItems}
                    columns={columns}
                    loading={loading}
                    rowKey="id"
                />
            )}

            {/* Add Menu Item Modal */}
            <Modal
                title="Add Menu Item"
                open={isAddModalVisible}
                onOk={handleAddItem}
                onCancel={() => {
                    setIsAddModalVisible(false);
                    form.resetFields();
                }}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Item Name"
                        rules={[{ required: true, message: 'Please enter item name' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="price"
                        label="Price"
                        rules={[{ required: true, message: 'Please enter price' }]}
                    >
                        <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[{ required: true, message: 'Please enter description' }]}
                    >
                        <Input.TextArea />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Edit Menu Item Modal */}
            <Modal
                title="Edit Menu Item"
                open={isEditModalVisible}
                onOk={handleUpdateItem}
                onCancel={() => {
                    setIsEditModalVisible(false);
                    form.resetFields();
                }}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Item Name"
                        rules={[{ required: true, message: 'Please enter item name' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="price"
                        label="Price"
                        rules={[{ required: true, message: 'Please enter price' }]}
                    >
                        <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[{ required: true, message: 'Please enter description' }]}
                    >
                        <Input.TextArea />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Confirm Delete Modal */}
            <ConfirmModal
                open={isConfirmModalVisible}
                onConfirm={handleConfirmDelete}
                onCancel={() => setIsConfirmModalVisible(false)}
                title="Delete Menu Item"
                content={`Are you sure you want to delete ${selectedItem?.name}?`}
                isDanger
            />
        </div>
    );
};

export default VendorMenuPage;
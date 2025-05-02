import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Input, InputNumber } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchVendorMenu,
    addMenuItem,
    updateMenuItem,
    deactivateMenuItem,
    clearError,
} from '../redux/slices/vendorsSlice';
import PageHeader from '../components/common/PageHeader';
import TableWrapper from '../components/common/TableWrapper';
import StatusTag from '../components/common/StatusTag';
import ConfirmModal from '../components/common/ConfirmModal';
import ToastNotifier from '../components/common/ToastNotifier';
import LoadingSpinner from '../components/common/LoadingSpinner';

const VendorMenuPage = () => {
    const dispatch = useDispatch();
    const { vendorMenu, loading, error } = useSelector((state) => state.vendors);
    const { user } = useSelector((state) => state.auth); // Assumes authSlice with user info
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortColumn, setSortColumn] = useState('');
    const [sortDirection, setSortDirection] = useState('');
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [form] = Form.useForm();
    const vendorId = user?.id; // Vendor ID from auth state

    // Fetch menu items
    useEffect(() => {
        if (vendorId) {
            dispatch(fetchVendorMenu({ vendorId }));
        }
    }, [dispatch, vendorId]);

    // Handle errors
    useEffect(() => {
        if (error) {
            ToastNotifier.error('Operation Failed', error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    // Sort and paginate items
    const sortedItems = [...vendorMenu.items].sort((a, b) => {
        if (!sortColumn || !sortDirection) return 0;
        const valueA = a[sortColumn] || '';
        const valueB = b[sortColumn] || '';
        const direction = sortDirection === 'asc' ? 1 : -1;
        if (typeof valueA === 'string') {
            return valueA.localeCompare(valueB) * direction;
        }
        return (valueA - valueB) * direction;
    });

    const paginatedItems = sortedItems.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    // Table columns
    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: true,
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            sorter: true,
            render: (price) => `$${price.toFixed(2)}`,
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            sorter: true,
            render: (status) => <StatusTag status={status} />,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div className="space-x-2">
                    <Button
                        type="link"
                        onClick={() => handleEdit(record)}
                        disabled={record.status === 'inactive'}
                    >
                        Edit
                    </Button>
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

    // Handle add menu item
    const handleAddItem = () => {
        form.validateFields().then((values) => {
            dispatch(addMenuItem({ vendorId, item: { ...values, status: 'active' } }))
                .then((result) => {
                    if (result.meta.requestStatus === 'fulfilled') {
                        ToastNotifier.success('Item Added', `${values.name} has been added to the menu.`);
                        dispatch(fetchVendorMenu({ vendorId }));
                    }
                });
            setIsAddModalVisible(false);
            form.resetFields();
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
            dispatch(updateMenuItem({
                vendorId,
                menuItemId: selectedItem.id,
                item: values,
            })).then((result) => {
                if (result.meta.requestStatus === 'fulfilled') {
                    ToastNotifier.success('Item Updated', `${values.name} has been updated.`);
                    dispatch(fetchVendorMenu({ vendorId }));
                }
            });
            setIsEditModalVisible(false);
            form.resetFields();
        }).catch(() => {
            ToastNotifier.error('Validation Failed', 'Please fill in all required fields.');
        });
    };

    // Handle deactivate menu item
    const handleDeactivate = (item) => {
        setSelectedItem(item);
        setIsConfirmModalVisible(true);
    };

    const handleConfirmDeactivate = () => {
        dispatch(deactivateMenuItem({
            vendorId,
            menuItemId: selectedItem.id,
        })).then((result) => {
            if (result.meta.requestStatus === 'fulfilled') {
                ToastNotifier.success('Item Deactivated', `${selectedItem.name} has been deactivated.`);
                dispatch(fetchVendorMenu({ vendorId }));
            }
        });
        setIsConfirmModalVisible(false);
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
                    dataSource={paginatedItems}
                    columns={columns}
                    loading={loading}
                    rowKey="id"
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: vendorMenu.items.length,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50'],
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                        position: ['bottomCenter'],
                        showQuickJumper: true,
                    }}
                    onChange={handleTableChange}
                />
            )}

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

export default VendorMenuPage;
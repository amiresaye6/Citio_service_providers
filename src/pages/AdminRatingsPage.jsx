import React, { useState, useEffect } from 'react';
import { Button, Modal, Rate, Input, Form } from 'antd';
import PageHeader from '../components/common/PageHeader';
import TableWrapper from '../components/common/TableWrapper';
import SearchInput from '../components/common/SearchInput';
import StatusTag from '../components/common/StatusTag';
import ConfirmModal from '../components/common/ConfirmModal';
import ToastNotifier from '../components/common/ToastNotifier';
import LoadingSpinner from '../components/common/LoadingSpinner';

const { TextArea } = Input;

const AdminRatingsPage = () => {
    const [ratings, setRatings] = useState([]);
    const [filteredRatings, setFilteredRatings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
    const [isResponseModalVisible, setIsResponseModalVisible] = useState(false);
    const [selectedRating, setSelectedRating] = useState(null);
    const [form] = Form.useForm();

    // Fake rating data (replace with API call in a real app)
    const fakeRatings = [
        {
            id: '1',
            reviewer: 'John Doe',
            vendor: 'Acme Corp',
            rating: 4,
            comment: 'Great service, fast delivery!',
            status: 'active',
            date: '2025-04-18',
            response: '',
        },
        {
            id: '2',
            reviewer: 'Jane Smith',
            vendor: 'Beta LLC',
            rating: 2,
            comment: 'Food was cold on arrival.',
            status: 'active',
            date: '2025-04-17',
            response: '',
        },
        {
            id: '3',
            reviewer: 'Bob Johnson',
            vendor: 'Gamma Inc',
            rating: 5,
            comment: 'Excellent quality, will order again!',
            status: 'active',
            date: '2025-04-16',
            response: 'Thank you for your feedback!',
        },
    ];

    // Simulate fetching ratings
    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setRatings(fakeRatings);
            setFilteredRatings(fakeRatings);
            setLoading(false);
            ToastNotifier.success('Ratings Loaded', 'Successfully fetched ratings.');
        }, 1000);
    }, []);

    // Table columns
    const columns = [
        { title: 'Reviewer', dataIndex: 'reviewer', key: 'reviewer' },
        { title: 'Vendor', dataIndex: 'vendor', key: 'vendor' },
        {
            title: 'Rating',
            dataIndex: 'rating',
            key: 'rating',
            render: (rating) => <Rate disabled defaultValue={rating} />,
        },
        { title: 'Comment', dataIndex: 'comment', key: 'comment' },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => <StatusTag status={status} />,
        },
        { title: 'Date', dataIndex: 'date', key: 'date' },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div className="space-x-2">
                    <Button
                        type="link"
                        onClick={() => handleRespond(record)}
                        disabled={record.response}
                    >
                        Respond
                    </Button>
                    <Button
                        type="link"
                        danger
                        onClick={() => handleFlag(record)}
                        disabled={record.status === 'error'}
                    >
                        Flag
                    </Button>
                </div>
            ),
        },
    ];

    // Handle search
    const handleSearch = (value) => {
        const filtered = ratings.filter(
            (rating) =>
                rating.reviewer.toLowerCase().includes(value.toLowerCase()) ||
                rating.vendor.toLowerCase().includes(value.toLowerCase()) ||
                rating.comment.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredRatings(filtered);
    };

    // Handle flag review
    const handleFlag = (rating) => {
        setSelectedRating(rating);
        setIsConfirmModalVisible(true);
    };

    const handleConfirmFlag = () => {
        const updatedRatings = ratings.map((rating) =>
            rating.id === selectedRating.id ? { ...rating, status: 'error' } : rating
        );
        setRatings(updatedRatings);
        setFilteredRatings(updatedRatings);
        setIsConfirmModalVisible(false);
        ToastNotifier.success('Review Flagged', `${selectedRating.reviewer}'s review has been flagged.`);
    };

    // Handle respond to review
    const handleRespond = (rating) => {
        setSelectedRating(rating);
        form.setFieldsValue({ response: rating.response });
        setIsResponseModalVisible(true);
    };

    const handleSubmitResponse = (values) => {
        const updatedRatings = ratings.map((rating) =>
            rating.id === selectedRating.id ? { ...rating, response: values.response } : rating
        );
        setRatings(updatedRatings);
        setFilteredRatings(updatedRatings);
        setIsResponseModalVisible(false);
        form.resetFields();
        ToastNotifier.success('Response Submitted', `Response to ${selectedRating.reviewer}'s review has been submitted.`);
    };

    return (
        <div className="p-6 min-h-screen">
            <PageHeader
                title="Admin Ratings"
                subtitle="View and manage user-submitted reviews and ratings"
                actions={
                    <Button
                        type="primary"
                        onClick={() => ToastNotifier.info('Refresh', 'Ratings refreshed.')}
                    >
                        Refresh
                    </Button>
                }
            />

            <SearchInput
                placeholder="Search by reviewer, vendor, or comment..."
                onSearch={handleSearch}
            />

            {loading ? (
                <LoadingSpinner text="Loading ratings..." />
            ) : (
                <TableWrapper
                    dataSource={filteredRatings}
                    columns={columns}
                    loading={loading}
                    rowKey="id"
                />
            )}

            {/* Confirm Flag Modal */}
            <ConfirmModal
                open={isConfirmModalVisible}
                onConfirm={handleConfirmFlag}
                onCancel={() => setIsConfirmModalVisible(false)}
                title="Flag Review"
                content={`Are you sure you want to flag ${selectedRating?.reviewer}'s review as inappropriate?`}
                isDanger
            />

            {/* Response Modal */}
            <Modal
                title={`Respond to ${selectedRating?.reviewer}'s Review`}
                open={isResponseModalVisible}
                onOk={() => form.submit()}
                onCancel={() => {
                    setIsResponseModalVisible(false);
                    form.resetFields();
                }}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmitResponse}>
                    <Form.Item
                        name="response"
                        label="Response"
                        rules={[{ required: true, message: 'Please enter a response' }]}
                    >
                        <TextArea rows={4} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminRatingsPage;
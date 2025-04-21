import React, { useState, useEffect } from 'react';
import { Button, Modal, Rate } from 'antd';
import PageHeader from '../components/common/PageHeader';
import TableWrapper from '../components/common/TableWrapper';
import StatusTag from '../components/common/StatusTag';
import SearchInput from '../components/common/SearchInput';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ToastNotifier from '../components/common/ToastNotifier';
import FilterBar from '../components/common/FilterBar';

const VendorRatingsPage = () => {
    const [ratings, setRatings] = useState([]);
    const [filteredRatings, setFilteredRatings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRating, setSelectedRating] = useState(null);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

    // Fake rating data (replace with API call in a real app)
    const fakeRatings = [
        {
            id: '1',
            reviewer: 'John Doe',
            rating: 4,
            comment: 'Great service, fast delivery!',
            status: 'active',
            date: '2025-04-18',
        },
        {
            id: '2',
            reviewer: 'Jane Smith',
            rating: 2,
            comment: 'Food was cold on arrival.',
            status: 'error',
            date: '2025-04-17',
        },
        {
            id: '3',
            reviewer: 'Bob Johnson',
            rating: 5,
            comment: 'Excellent quality, will order again!',
            status: 'active',
            date: '2025-04-16',
        },
    ];

    // Simulate fetching ratings
    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setRatings(fakeRatings);
            setFilteredRatings(fakeRatings);
            setLoading(false);
            ToastNotifier.success('Ratings Loaded', 'Successfully fetched vendor ratings.');
        }, 1000);
    }, []);

    // Table columns
    const columns = [
        { title: 'Reviewer', dataIndex: 'reviewer', key: 'reviewer' },
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
                <Button type="link" onClick={() => handleViewDetails(record)}>
                    View Details
                </Button>
            ),
        },
    ];

    // Filter configuration
    const filters = [
        {
            key: 'status',
            placeholder: 'Select Status',
            options: [
                { label: 'Positive', value: 'active' },
                { label: 'Negative', value: 'error' },
            ],
        },
    ];

    // Handle search
    const handleSearch = (value) => {
        const filtered = ratings.filter(
            (rating) =>
                rating.reviewer.toLowerCase().includes(value.toLowerCase()) ||
                rating.comment.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredRatings(filtered);
    };

    // Handle filter change
    const handleFilterChange = (key, value) => {
        const filtered = value
            ? ratings.filter((rating) => rating[key] === value)
            : ratings;
        setFilteredRatings(filtered);
    };

    // Handle reset filters
    const handleResetFilters = () => {
        setFilteredRatings(ratings);
    };

    // Handle view details
    const handleViewDetails = (rating) => {
        setSelectedRating(rating);
        setIsDetailModalVisible(true);
    };

    return (
        <div className="p-6 min-h-screen">
            <PageHeader
                title="Vendor Ratings"
                subtitle="View and manage customer ratings"
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
                placeholder="Search by reviewer or comment..."
                onSearch={handleSearch}
            />

            <FilterBar
                filters={filters}
                dateRange
                onFilterChange={handleFilterChange}
                onDateRangeChange={(dates) => console.log('Date Range:', dates)} // Replace with actual date filtering logic
                onReset={handleResetFilters}
                loading={loading}
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

            {/* Rating Details Modal */}
            <Modal
                title="Rating Details"
                open={isDetailModalVisible}
                onCancel={() => setIsDetailModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
                        Close
                    </Button>,
                ]}
            >
                {selectedRating && (
                    <div>
                        <p><strong>Reviewer:</strong> {selectedRating.reviewer}</p>
                        <p><strong>Rating:</strong> <Rate disabled defaultValue={selectedRating.rating} /></p>
                        <p><strong>Comment:</strong> {selectedRating.comment}</p>
                        <p><strong>Status:</strong> <StatusTag status={selectedRating.status} /></p>
                        <p><strong>Date:</strong> {selectedRating.date}</p>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default VendorRatingsPage;
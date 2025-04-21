import React, { useState, useEffect } from 'react';
import { Button, Modal } from 'antd';
import PageHeader from '../components/common/PageHeader';
import TableWrapper from '../components/common/TableWrapper';
import ConfirmModal from '../components/common/ConfirmModal';
import ToastNotifier from '../components/common/ToastNotifier';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusTag from '../components/common/StatusTag';

const AdminVendorRequestsPage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);

    // Fake vendor request data (replace with API call in a real app)
    const fakeRequests = [
        {
            id: '1',
            name: 'Acme Corp',
            contact: 'john@acme.com',
            businessType: 'Restaurant',
            status: 'pending',
            submittedDate: '2025-04-18',
        },
        {
            id: '2',
            name: 'Beta LLC',
            contact: 'jane@beta.com',
            businessType: 'Retail',
            status: 'pending',
            submittedDate: '2025-04-17',
        },
        {
            id: '3',
            name: 'Gamma Inc',
            contact: 'bob@gamma.com',
            businessType: 'Services',
            status: 'pending',
            submittedDate: '2025-04-16',
        },
    ];

    // Simulate fetching vendor requests
    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setRequests(fakeRequests);
            setLoading(false);
            ToastNotifier.success('Requests Loaded', 'Successfully fetched vendor requests.');
        }, 1000);
    }, []);

    // Table columns
    const columns = [
        { title: 'Vendor Name', dataIndex: 'name', key: 'name' },
        { title: 'Contact', dataIndex: 'contact', key: 'contact' },
        { title: 'Business Type', dataIndex: 'businessType', key: 'businessType' },
        { title: 'Submitted Date', dataIndex: 'submittedDate', key: 'submittedDate' },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => <StatusTag status={status} />,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div className="space-x-2">
                    <Button
                        type="link"
                        onClick={() => handleViewDetails(record)}
                        disabled={record.status !== 'pending'}
                    >
                        View Details
                    </Button>
                    <Button
                        type="link"
                        onClick={() => handleApprove(record)}
                        disabled={record.status !== 'pending'}
                    >
                        Approve
                    </Button>
                    <Button
                        type="link"
                        danger
                        onClick={() => handleReject(record)}
                        disabled={record.status !== 'pending'}
                    >
                        Reject
                    </Button>
                </div>
            ),
        },
    ];

    // Handle approve request
    const handleApprove = (request) => {
        setSelectedRequest(request);
        setConfirmAction('approve');
        setIsConfirmModalVisible(true);
    };

    const handleConfirmApprove = () => {
        const updatedRequests = requests.map((request) =>
            request.id === selectedRequest.id ? { ...request, status: 'active' } : request
        );
        setRequests(updatedRequests);
        setIsConfirmModalVisible(false);
        ToastNotifier.success('Vendor Approved', `${selectedRequest.name} has been approved.`);
    };

    // Handle reject request
    const handleReject = (request) => {
        setSelectedRequest(request);
        setConfirmAction('reject');
        setIsConfirmModalVisible(true);
    };

    const handleConfirmReject = () => {
        const updatedRequests = requests.map((request) =>
            request.id === selectedRequest.id ? { ...request, status: 'error' } : request
        );
        setRequests(updatedRequests);
        setIsConfirmModalVisible(false);
        ToastNotifier.success('Vendor Rejected', `${selectedRequest.name} has been rejected.`);
    };

    // Handle view details
    const handleViewDetails = (request) => {
        setSelectedRequest(request);
        setIsDetailModalVisible(true);
    };

    return (
        <div className="p-6 min-h-screen">
            <PageHeader
                title="Vendor Approval Requests"
                subtitle="Review and manage vendor applications"
                actions={
                    <Button
                        type="primary"
                        onClick={() => ToastNotifier.info('Refresh', 'Requests refreshed.')}
                    >
                        Refresh
                    </Button>
                }
            />

            {loading ? (
                <LoadingSpinner text="Loading vendor requests..." />
            ) : (
                <TableWrapper
                    dataSource={requests}
                    columns={columns}
                    loading={loading}
                    rowKey="id"
                />
            )}

            {/* Confirm Modal for Approve/Reject */}
            <ConfirmModal
                open={isConfirmModalVisible}
                onConfirm={confirmAction === 'approve' ? handleConfirmApprove : handleConfirmReject}
                onCancel={() => setIsConfirmModalVisible(false)}
                title={confirmAction === 'approve' ? 'Approve Vendor' : 'Reject Vendor'}
                content={
                    confirmAction === 'approve'
                        ? `Are you sure you want to approve ${selectedRequest?.name}?`
                        : `Are you sure you want to reject ${selectedRequest?.name}?`
                }
                isDanger={confirmAction === 'reject'}
            />

            {/* Details Modal */}
            <Modal
                title="Vendor Request Details"
                open={isDetailModalVisible}
                onCancel={() => setIsDetailModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
                        Close
                    </Button>,
                ]}
            >
                {selectedRequest && (
                    <div>
                        <p><strong>Vendor Name:</strong> {selectedRequest.name}</p>
                        <p><strong>Contact:</strong> {selectedRequest.contact}</p>
                        <p><strong>Business Type:</strong> {selectedRequest.businessType}</p>
                        <p><strong>Submitted Date:</strong> {selectedRequest.submittedDate}</p>
                        <p><strong>Status:</strong> <StatusTag status={selectedRequest.status} /></p>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminVendorRequestsPage;
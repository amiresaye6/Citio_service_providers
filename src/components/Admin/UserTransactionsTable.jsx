import { useState, useEffect } from 'react';
import { Table, Typography, Spin, Empty, Alert } from 'antd';
import { IdcardOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
// import axios from 'axios';
import dayjs from 'dayjs';

const { Title } = Typography;

const UserTransactionsTable = ({ userId }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get auth token from Redux store
    const token = useSelector((state) => state.auth.token);

    useEffect(() => {
        const fetchUserTransactions = async () => {
            if (!userId) {
                setError('User ID is required');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                // Commented out API call
                /*
                const response = await axios.get(`https://service-provider.runasp.net/api/Admin/users/${userId}/all-transactions`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const data = response.data.map(transaction => ({
                    ...transaction,
                    key: transaction.transactionId
                }));
                */

                // Temporary JSON data for testing
                const tempData = [
                    {
                        transactionId: 'tx-001',
                        orderId: 'ord-001',
                        amount: 125.50,
                        date: '2023-09-15T14:30:00'
                    },
                    {
                        transactionId: 'tx-002',
                        orderId: 'ord-002',
                        amount: 89.99,
                        date: '2023-09-16T09:15:00'
                    },
                    {
                        transactionId: 'tx-003',
                        orderId: 'ord-003',
                        amount: 245.75,
                        date: '2023-09-17T12:45:00'
                    },
                    {
                        transactionId: 'tx-004',
                        orderId: 'ord-004',
                        amount: 56.20,
                        date: '2023-09-18T16:20:00'
                    },
                    {
                        transactionId: 'tx-005',
                        orderId: 'ord-005',
                        amount: 178.30,
                        date: '2023-09-19T08:10:00'
                    },
                    {
                        transactionId: 'tx-006',
                        orderId: 'ord-006',
                        amount: 99.00,
                        date: '2023-09-20T11:55:00'
                    },
                    {
                        transactionId: 'tx-007',
                        orderId: 'ord-007',
                        amount: 310.45,
                        date: '2023-09-21T15:30:00'
                    },
                    {
                        transactionId: 'tx-008',
                        orderId: 'ord-008',
                        amount: 42.15,
                        date: '2023-09-22T13:25:00'
                    },
                    {
                        transactionId: 'tx-009',
                        orderId: 'ord-009',
                        amount: 200.80,
                        date: '2023-09-23T10:40:00'
                    },
                    {
                        transactionId: 'tx-010',
                        orderId: 'ord-010',
                        amount: 135.60,
                        date: '2023-09-24T17:05:00'
                    },
                    {
                        transactionId: 'tx-011',
                        orderId: 'ord-011',
                        amount: 67.90,
                        date: '2023-09-25T09:50:00'
                    },
                    {
                        transactionId: 'tx-012',
                        orderId: 'ord-012',
                        amount: 298.25,
                        date: '2023-09-26T14:15:00'
                    },
                    {
                        transactionId: 'tx-013',
                        orderId: 'ord-013',
                        amount: 110.35,
                        date: '2023-09-27T12:00:00'
                    },
                    {
                        transactionId: 'tx-014',
                        orderId: 'ord-014',
                        amount: 185.70,
                        date: '2023-09-28T16:45:00'
                    },
                    {
                        transactionId: 'tx-015',
                        orderId: 'ord-015',
                        amount: 75.40,
                        date: '2023-09-29T08:30:00'
                    }
                ];
                const data = tempData.map(transaction => ({
                    ...transaction,
                    key: transaction.transactionId
                }));

                setTransactions(data);
                setError(null);
            } catch (err) {
                setError(`Failed to load transactions for user ${userId}`);
                console.error('Error fetching user transactions:', err);
            } finally {
                setLoading(false);
            }
        };

        // Use setTimeout to simulate loading
        setTimeout(() => {
            fetchUserTransactions();
        }, 800);

        /* Original token check
        if (token) {
            fetchUserTransactions();
        } else {
            setError('Authentication token is missing');
            setLoading(false);
        }
        */
    }, [userId, token]);

    const columns = [
        {
            title: 'Transaction ID',
            dataIndex: 'transactionId',
            key: 'transactionId',
            sorter: (a, b) => a.transactionId.localeCompare(b.transactionId),
        },
        {
            title: 'Order ID',
            dataIndex: 'orderId',
            key: 'orderId',
            sorter: (a, b) => a.orderId.localeCompare(b.orderId),
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            sorter: (a, b) => a.amount - b.amount,
            render: (amount) => `$${amount.toFixed(2)}`,
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
            render: (date) => dayjs(date).format('MMM D, YYYY - h:mm A'),
        },
    ];

    return (
        <div className="p-4 bg-white rounded border">
            <div className="flex items-center mb-4">
                <IdcardOutlined className="text-blue-500 text-xl mr-2" />
                <Title level={4} style={{ margin: 0 }}>
                    Transactions for User: {userId}
                </Title>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <Spin size="large" tip="Loading user transactions..." />
                </div>
            ) : error ? (
                <Alert
                    message="Error"
                    description={error}
                    type="error"
                    showIcon
                />
            ) : transactions.length === 0 ? (
                <Empty description="No transactions found for this user" />
            ) : (
                <Table
                    dataSource={transactions}
                    columns={columns}
                    rowKey="transactionId"
                    pagination={{
                        pageSize: 10,
                        showTotal: (total) => `Total ${total} transactions`,
                    }}
                />
            )}
        </div>
    );
};

export default UserTransactionsTable;
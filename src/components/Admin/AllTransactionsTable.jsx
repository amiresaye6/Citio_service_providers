import { useState, useEffect } from 'react';
import { Table, DatePicker, Typography, Spin, Alert } from 'antd';
import { MoneyCollectOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
// import axios from 'axios';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Title } = Typography;

// Temporary mock data for testing
const mockTransactions = [
    {
        transactionId: 'txn-001',
        orderId: 'ord-001',
        amount: 125.50,
        date: '2023-08-15T10:30:00',
    },
    {
        transactionId: 'txn-002',
        orderId: 'ord-003',
        amount: 75.20,
        date: '2023-08-16T14:45:00',
    },
    {
        transactionId: 'txn-003',
        orderId: 'ord-002',
        amount: 200.00,
        date: '2023-08-10T09:15:00',
    },
    {
        transactionId: 'txn-004',
        orderId: 'ord-005',
        amount: 50.75,
        date: '2023-08-18T16:30:00',
    },
    {
        transactionId: 'txn-005',
        orderId: 'ord-006',
        amount: 340.30,
        date: '2023-08-05T11:20:00',
    }
];

const AllTransactionsTable = () => {
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState(null);

    // Get auth token from Redux store
    const token = useSelector((state) => state.auth.token);

    useEffect(() => {
        // Simulating API fetch with a timeout
        setTimeout(() => {
            try {
                // Comment out the original API call
                /*
                const response = await axios.get('https://service-provider.runasp.net/api/Admin/all-transactions', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const data = response.data.map(transaction => ({
                    ...transaction,
                    key: transaction.transactionId
                }));
                */

                // Use the mock data instead
                const data = mockTransactions.map(transaction => ({
                    ...transaction,
                    key: transaction.transactionId
                }));

                setTransactions(data);
                setFilteredTransactions(data);
                setError(null);
            } catch (err) {
                setError('Failed to load transaction data');
                console.error('Error fetching transactions:', err);
            } finally {
                setLoading(false);
            }
        }, 1000); // Simulate network delay

    }, [token]);

    useEffect(() => {
        // Filter transactions based on date range
        if (!dateRange || !dateRange[0] || !dateRange[1]) {
            setFilteredTransactions(transactions);
            return;
        }

        const startDate = dateRange[0].startOf('day');
        const endDate = dateRange[1].endOf('day');

        const filtered = transactions.filter(transaction => {
            const transactionDate = dayjs(transaction.date);
            return transactionDate.isAfter(startDate) && transactionDate.isBefore(endDate);
        });

        setFilteredTransactions(filtered);
    }, [dateRange, transactions]);

    const handleDateRangeChange = (dates) => {
        setDateRange(dates);
    };

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
        <div className="w-full p-5 bg-white rounded-lg shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div className="flex items-center mb-4 md:mb-0">
                    <MoneyCollectOutlined className="text-green-500 text-xl mr-2" />
                    <Title level={4} style={{ margin: 0 }}>
                        All Transactions
                    </Title>
                </div>
                <RangePicker
                    onChange={handleDateRangeChange}
                    format="YYYY-MM-DD"
                    placeholder={['Start Date', 'End Date']}
                    className="w-full md:w-auto"
                />
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <Spin size="large" tip="Loading transactions..." />
                </div>
            ) : error ? (
                <Alert
                    message="Error"
                    description={error}
                    type="error"
                    showIcon
                />
            ) : (
                <Table
                    dataSource={filteredTransactions}
                    columns={columns}
                    rowKey="transactionId"
                    pagination={{
                        pageSize: 10,
                        showTotal: (total) => `Total ${total} transactions`,
                    }}
                    locale={{
                        emptyText: 'No transactions found',
                    }}
                />
            )}
        </div>
    );
};

export default AllTransactionsTable;
import { useState, useEffect } from 'react';
import { Table, Input, Empty, Spin } from 'antd';
import { useSelector } from 'react-redux';
// import axios from 'axios';

const { Search } = Input;

const AllUsersTable = ({ renderActions }) => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchText, setSearchText] = useState('');

    // Get auth token from Redux store
    const token = useSelector((state) => state.auth.token);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                // Temporary JSON data for testing
                const mockUsers = [
                    { id: 1, email: 'john.doe@example.com', fullName: 'John Doe' },
                    { id: 2, email: 'jane.smith@example.com', fullName: 'Jane Smith' },
                    { id: 3, email: 'bob.jones@example.com', fullName: 'Bob Jones' },
                    { id: 4, email: 'alice.brown@example.com', fullName: 'Alice Brown' },
                    { id: 5, email: 'charlie.wilson@example.com', fullName: 'Charlie Wilson' },
                    { id: 6, email: 'emma.taylor@example.com', fullName: 'Emma Taylor' },
                    { id: 7, email: 'david.moore@example.com', fullName: 'David Moore' },
                    { id: 8, email: 'sophia.martin@example.com', fullName: 'Sophia Martin' },
                    { id: 9, email: 'james.jackson@example.com', fullName: 'James Jackson' },
                    { id: 10, email: 'olivia.white@example.com', fullName: 'Olivia White' },
                    { id: 11, email: 'liam.harris@example.com', fullName: 'Liam Harris' },
                    { id: 12, email: 'mia.clark@example.com', fullName: 'Mia Clark' },
                    { id: 13, email: 'noah.lewis@example.com', fullName: 'Noah Lewis' },
                    { id: 14, email: 'ava.walker@example.com', fullName: 'Ava Walker' },
                    { id: 15, email: 'ethan.hall@example.com', fullName: 'Ethan Hall' }
                ];

                // Commented out API call
                /*
                const response = await axios.get('https://service-provider.runasp.net/api/Admin/all-users', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setUsers(response.data);
                setFilteredUsers(response.data);
                */

                setUsers(mockUsers);
                setFilteredUsers(mockUsers);
                setError(null);
            } catch (err) {
                setError('Failed to load users data');
                console.error('Error fetching users:', err);
            } finally {
                setLoading(false);
            }
        };

        // Always fetch mock data regardless of token
        fetchUsers();
        /* Original token check
        if (token) {
            fetchUsers();
        } else {
            setError('Authentication token is missing');
            setLoading(false);
        }
        */
    }, [token]);

    useEffect(() => {
        // Filter users based on search text
        if (searchText.trim() === '') {
            setFilteredUsers(users);
        } else {
            const filtered = users.filter(user => {
                const searchTextLower = searchText.toLowerCase();
                return (
                    (user.email && user.email.toLowerCase().includes(searchTextLower)) ||
                    (user.fullName && user.fullName.toLowerCase().includes(searchTextLower))
                );
            });
            setFilteredUsers(filtered);
        }
    }, [searchText, users]);

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const columns = [
        {
          title: 'ID',
          dataIndex: 'id',
          key: 'id',
          sorter: (a, b) => a.id - b.id,
        },
        {
          title: 'Email',
          dataIndex: 'email',
          key: 'email',
          sorter: (a, b) => a.email.localeCompare(b.email),
        },
        {
          title: 'Full Name',
          dataIndex: 'fullName',
          key: 'fullName',
          sorter: (a, b) => a.fullName.localeCompare(b.fullName),
        },
        // Add an actions column if renderActions prop is provided
        ...(renderActions ? [
          {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => renderActions(record)
          }
        ] : [])
      ];

    return (
        <div className="mx-auto p-4 bg-white rounded-lg shadow">
            <Search
                placeholder="Search by email or name"
                allowClear
                enterButton
                size="large"
                onSearch={handleSearch}
                onChange={(e) => handleSearch(e.target.value)}
                className="mb-4"
            />

            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <Spin size="large" tip="Loading users..." />
                </div>
            ) : error ? (
                <div className="text-red-500 p-4">{error}</div>
            ) : (
                <Table
                    dataSource={filteredUsers}
                    columns={columns}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: false,
                        showTotal: (total) => `Total ${total} users`
                    }}
                    locale={{
                        emptyText: <Empty description="No users found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    }}
                />
            )}
        </div>
    );
};

export default AllUsersTable;
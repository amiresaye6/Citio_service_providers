import React, { useState } from 'react';
import { Drawer, Button } from 'antd';
import AllUsersTable from '../../../components/admin/AllUsersTable';
import UserTransactionsTable from '../../../components/admin/UserTransactionsTable';

const UsersPage = () => {
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);

    const openUserTransactionsDrawer = (userId) => {
        setSelectedUserId(userId);
        setDrawerVisible(true);
    };

    const closeDrawer = () => {
        setDrawerVisible(false);
    };

    // Pass the action to the AllUsersTable component
    const enhancedTable = () => {
        return (
            <AllUsersTable
                renderActions={(record) => (
                    <Button
                        type="primary"
                        size="small"
                        onClick={() => openUserTransactionsDrawer(record.id)}
                    >
                        View Transactions
                    </Button>
                )}
            />
        );
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-semibold mb-6">User Management</h1>

            {enhancedTable()}

            {/* User Transactions Drawer */}
            <Drawer
                title={`Transactions for User ID: ${selectedUserId}`}
                placement="right"
                width={600}
                onClose={closeDrawer}
                open={drawerVisible}
                bodyStyle={{ padding: 0 }}
            >
                {selectedUserId && <UserTransactionsTable userId={selectedUserId} />}
            </Drawer>
        </div>
    );
};

export default UsersPage;
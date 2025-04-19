
import React from 'react';
import AllTransactionsTable from '../components/admin/AllTransactionsTable';

const TransactionsPage = () => {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-semibold mb-6">Transaction History</h1>
            <AllTransactionsTable />
        </div>
    );
};

export default TransactionsPage;
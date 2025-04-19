import React from 'react';
import TodayStatsCard from '../../../components/admin/TodayStatsCard';
import ProjectSummaryCards from '../../../components/admin/ProjectSummaryCards';
import TopVendorsTable from '../../../components/admin/TopVendorsTable';

const OverviewPage = () => {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-semibold mb-6">Dashboard Overview</h1>

            <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
                <div className="lg:col-span-3 md:col-span-2 sm:col-span-1">
                    <TodayStatsCard />
                </div>

                <div className="lg:col-span-3 md:col-span-2 sm:col-span-1">
                    <ProjectSummaryCards />
                </div>

                <div className="lg:col-span-3 md:col-span-2 sm:col-span-1">
                    <TopVendorsTable />
                </div>
            </div>
        </div>
    );
};

export default OverviewPage;
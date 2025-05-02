import { Routes, Route } from 'react-router-dom';
import MainLayout from '../pages/dashboard/MainLayout';
import NotFound from '../pages/errors/NotFound';
import ProtectedRoute from '../components/common/ProtectedRoute';
import LoginPage from '../pages/auth/Login';

import VendorOrdersPage from '../pages/VendorOrdersPage';
import VendorMenuPage from '../pages/VendorMenuPage';
import OverviewPage from '../pages/OverviewPage';
import UsersPage from '../pages/UsersPage';
import AllTransactionsPage from '../pages/AllTransactionsPage';
import VendorManagementPage from '../pages/VendorManagementPage';
import VendorRatingsPage from '../pages/VendorRatingsPage';
import AdminVendorRequestsPage from '../pages/AdminVendorRequestsPage';
import AdminMenusPage from '../pages/AdminMenusPage';
import AdminRatingsPage from '../pages/AdminRatingsPage';
import AdminOrdersPage from '../pages/AdminOrdersPage';
import VendorAccountPage from '../pages/VendorAccountPage';
import VendorDashboardPage from '../pages/VendorDashboardPage';
import ManageStorePage from '../pages/VendorProfilePage';

const AppRoutes = () => (
    <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route element={<MainLayout />}>
            {/* Admin Dashboard */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <OverviewPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/vendors"
                element={
                    <ProtectedRoute>
                        <VendorManagementPage />
                    </ProtectedRoute>
                }
            />
            {/* <Route
                path="/admin/vendor-requests"
                element={
                    <ProtectedRoute>
                        <AdminVendorRequestsPage />
                    </ProtectedRoute>
                }
            /> */}
            {/* <Route
                path="/admin/menus"
                element={
                    <ProtectedRoute>
                        <AdminMenusPage />
                    </ProtectedRoute>
                }
            /> */}
            <Route
                path="/admin/ratings"
                element={
                    <ProtectedRoute>
                        <AdminRatingsPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/orders"
                element={
                    <ProtectedRoute>
                        <AdminOrdersPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/users"
                element={
                    <ProtectedRoute>
                        <UsersPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/transactions"
                element={
                    <ProtectedRoute>
                        <AllTransactionsPage />
                    </ProtectedRoute>
                }
            />

            {/* Vendor Dashboard */}
            <Route
                path="/vendor"
                element={
                    <ProtectedRoute>
                        <VendorDashboardPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/vendor/manage-store"
                element={
                    <ProtectedRoute>
                        <ManageStorePage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/vendor/profile"
                element={
                    <ProtectedRoute>
                        <VendorAccountPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/vendor/menu"
                element={
                    <ProtectedRoute>
                        <VendorMenuPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/vendor/orders"
                element={
                    <ProtectedRoute>
                        <VendorOrdersPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/vendor/ratings"
                element={
                    <ProtectedRoute>
                        <AdminRatingsPage />
                        {/* <VendorRatingsPage /> */}
                    </ProtectedRoute>
                }
            />

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
        </Route>
    </Routes>
);

export default AppRoutes;

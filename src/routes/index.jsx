import { Routes, Route } from 'react-router-dom';
import MainLayout from '../pages/dashboard/MainLayout';
import NotFound from '../pages/errors/NotFound';
import ProtectedRoute from '../components/common/ProtectedRoute';
import LoginPage from '../pages/auth/Login';
import VendorSignUpPage from '../pages/auth/VendorSignUpPage';

import VendorOrdersPage from '../pages/VendorOrdersPage';
import VendorMenuPage from '../pages/VendorMenuPage';
import OverviewPage from '../pages/OverviewPage';
import UsersPage from '../pages/UsersPage';
import AllTransactionsPage from '../pages/AllTransactionsPage';
import VendorManagementPage from '../pages/VendorManagementPage';
import VendorRatingsPage from '../pages/VendorRatingsPage';
import VendorOffersPage from '../pages/VendorOffersPage';
import AddOfferPage from '../pages/AddOfferPage';
import AdminRatingsPage from '../pages/AdminRatingsPage';
import AdminOrdersPage from '../pages/AdminOrdersPage';
import VendorDashboardPage from '../pages/VendorDashboardPage';
import ManageStorePage from '../pages/VendorProfilePage';
import AdminVendorDetailsPage from '../pages/AdminVendorDetailsPage';
import UserDetailsPage from '../pages/UserDetailsPage';
import OrderDetailsPage from '../pages/OrderDetailsPage';
import VendorMenuItemAddPage from '../pages/VendorMenuItemAddPage';
import VendorMenuItemPage from '../pages/VendorMenuItemPage';
import SecuritySettingsPage from '../pages/SecuritySettingsPage';
import SettingsPage from '../pages/SettingsPage';
import VendorTransactionsPage from '../pages/VendorTransactionsPage';
import VendorOfferDetailsPage from '../pages/VendorOfferDetailsPage';

const AppRoutes = () => (
    <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<VendorSignUpPage />} />

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
            <Route
                path="/admin/vendors/:vendorId"
                element={
                    <ProtectedRoute>
                        <AdminVendorDetailsPage />
                    </ProtectedRoute>
                }
            />
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
                path="/admin/orders/:orderId"
                element={
                    <ProtectedRoute>
                        <OrderDetailsPage />
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
                path="/admin/users/:userId"
                element={
                    <ProtectedRoute>
                        <UserDetailsPage />
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
                path="/vendor/menu"
                element={
                    <ProtectedRoute>
                        <VendorMenuPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/vendor/menu/add"
                element={
                    <ProtectedRoute>
                        <VendorMenuItemAddPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/vendor/menu/item/:id"
                element={
                    <ProtectedRoute>
                        <VendorMenuItemPage />
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
                path="/vendor/transactions"
                element={
                    <ProtectedRoute>
                        <VendorTransactionsPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/vendor/ratings"
                element={
                    <ProtectedRoute>
                        {/* <AdminRatingsPage /> */}
                        <VendorRatingsPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/vendor/Offers"
                element={
                    <ProtectedRoute>
                        {/* <AdminRatingsPage /> */}
                        <VendorOffersPage/>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/vendor/offers/add"
                element={
                    <ProtectedRoute>
                        <AddOfferPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/vendor/offers/:productId/:discountPercentage"
                element={
                    <ProtectedRoute>
                        <VendorOfferDetailsPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/settings"
                element={
                    <ProtectedRoute>
                        <SettingsPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/settings/security"
                element={
                    <ProtectedRoute>
                        <SecuritySettingsPage />
                    </ProtectedRoute>
                }
            />
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
        </Route>
    </Routes>
);

export default AppRoutes;

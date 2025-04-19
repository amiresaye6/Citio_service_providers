import { Routes, Route } from 'react-router-dom';
import MainLayout from '../pages/dashboard/MainLayout';
import NotFound from '../pages/errors/NotFound';
import ProtectedRoute from '../components/common/ProtectedRoute';
import LoginPage from '../pages/auth/Login';
import OverviewPage from '../pages/dashboard/adminDashboards/OverviewPage';
import AllTransactionsTable from '../components/Admin/AllTransactionsTable';
import UsersPage from '../pages/dashboard/adminDashboards/UsersPage';

const AppRoutes = () => (
    <Routes>
        {/* Standalone routes for login and signup (no MainLayout/Sidebar) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<NotFound />} />

        {/* Parent route with MainLayout and Sidebar */}
        <Route element={<MainLayout />}>
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <OverviewPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/store"
                element={
                    <ProtectedRoute>
                        <AllTransactionsTable />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/notifications"
                element={
                    <ProtectedRoute>
                        <UsersPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/reviews"
                element={
                    <ProtectedRoute>
                        <NotFound />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/images"
                element={
                    <ProtectedRoute>
                        <NotFound />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/services"
                element={
                    <ProtectedRoute>
                        <NotFound />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/payments"
                element={
                    <ProtectedRoute>
                        <NotFound />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <NotFound />
                    </ProtectedRoute>
                }
            />
            {/* Catch-all route for undefined paths */}
            {/* <Route path="*" element={<NotFound />} /> */}
        </Route>
    </Routes>
);

export default AppRoutes;
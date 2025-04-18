import { Routes, Route } from 'react-router-dom';
import MainLayout from '../pages/dashboard/MainLayout';
import NotFound from '../pages/errors/NotFound';
import ProtectedRoute from '../components/common/ProtectedRoute';
import LoginPage from '../pages/auth/Login';
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
                        <NotFound />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/store"
                element={
                    <ProtectedRoute>
                        <NotFound />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/notifications"
                element={
                    <ProtectedRoute>
                        <NotFound />
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
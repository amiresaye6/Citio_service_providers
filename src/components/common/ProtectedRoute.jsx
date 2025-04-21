import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ children }) {
    // const { isAuthenticated } = useSelector((state) => state.auth);
    // const location = useLocation();

    // if (!isAuthenticated) {
    //     return <Navigate to="/login" state={{ from: location }} replace />;
    // }
    // If authenticated, render the protected content
    return children;
}

export default ProtectedRoute;
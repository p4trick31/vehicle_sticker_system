// ProtectedRoute.js
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ isAuthenticated, role, expectedRole, children }) => {
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (role !== expectedRole) return <Navigate to="/" replace />;
  return children;
};

export default ProtectedRoute;

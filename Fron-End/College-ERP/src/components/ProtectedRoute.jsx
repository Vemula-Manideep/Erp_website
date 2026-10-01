import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // User is authenticated but doesn't have the required role
    const defaultRoute = 
      user.role === 'STUDENT' ? '/dashboard/student/home' :
      user.role === 'PROFESSOR' ? '/dashboard/professor/home' :
      user.role === 'HOD' ? '/dashboard/hod/home' : '/';
      
    return <Navigate to={defaultRoute} replace />;
  }

  return children;
};

export default ProtectedRoute;

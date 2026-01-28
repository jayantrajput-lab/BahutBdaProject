import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

/**
 * ProtectedRoute - Guards routes based on authentication and role
 * Redirects to login if not authenticated
 * Redirects to appropriate dashboard if role doesn't match
 */
export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const roleRoutes = {
      ADMIN: '/admin/dashboard',
      USER: '/user/dashboard',
      MAKER: '/maker/dashboard',
      CHECKER: '/checker/dashboard',
    };
    return <Navigate to={roleRoutes[user.role]} replace />;
  }

  return <>{children}</>;
};

import React, { useState, useEffect } from 'react';
import { authService, AdminUser } from '../../services/auth';
import { AdminLogin } from './AdminLogin';

interface AdminProtectedRouteProps {
  children: (props: { adminUser: AdminUser; onLogout: () => void }) => React.ReactNode;
  onNavigateHome: () => void;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children, onNavigateHome }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => authService.getAdminUser());

  useEffect(() => {
    const user = authService.getAdminUser();
    setAdminUser(user);
  }, []);

  const handleLoginSuccess = (user: AdminUser) => {
    setAdminUser(user);
    if (window.location.pathname !== '/admin') {
      window.history.pushState({}, '', '/admin');
    }
  };

  const handleLogout = () => {
    authService.logout();
    setAdminUser(null);
    if (window.location.pathname !== '/admin/login') {
      window.history.pushState({}, '', '/admin/login');
    }
  };

  if (!adminUser) {
    return (
      <AdminLogin
        onLoginSuccess={handleLoginSuccess}
        onNavigateHome={onNavigateHome}
      />
    );
  }

  return <>{children({ adminUser, onLogout: handleLogout })}</>;
};

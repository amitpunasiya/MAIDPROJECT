import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '../components/layout/AdminLayout';
import DashboardHome from '../pages/DashboardHome';
import UserManagement from '../pages/UserManagement';
import ProviderManagement from '../pages/ProviderManagement';
import HealthcareManagement from '../pages/HealthcareManagement';
import BookingManagement from '../pages/BookingManagement';
import ServiceManagement from '../pages/ServiceManagement';
import LocationManagement from '../pages/LocationManagement';
import CouponManagement from '../pages/CouponManagement';
import NotificationManagement from '../pages/NotificationManagement';
import ReportsManagement from '../pages/ReportsManagement';
import CmsManagement from '../pages/CmsManagement';
import SettingsManagement from '../pages/SettingsManagement';
import SecurityLogs from '../pages/SecurityLogs';
import AdminLoginPage from '../pages/AdminLoginPage';

const AdminAuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('accessToken');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<AdminLoginPage />} />
      <Route
        element={
          <AdminAuthGuard>
            <AdminLayout />
          </AdminAuthGuard>
        }
      >
        <Route path="/" element={<DashboardHome />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/providers" element={<ProviderManagement />} />
        <Route path="/healthcare" element={<HealthcareManagement />} />
        <Route path="/bookings" element={<BookingManagement />} />
        <Route path="/services" element={<ServiceManagement />} />
        <Route path="/locations" element={<LocationManagement />} />
        <Route path="/coupons" element={<CouponManagement />} />
        <Route path="/notifications" element={<NotificationManagement />} />
        <Route path="/reports" element={<ReportsManagement />} />
        <Route path="/cms" element={<CmsManagement />} />
        <Route path="/settings" element={<SettingsManagement />} />
        <Route path="/logs" element={<SecurityLogs />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;

import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout, AuthLayout, DashboardLayout } from '../layouts';
import { PageSkeleton } from '../components';
import ProtectedRoute from './ProtectedRoute';

// Lazy loading all pages for optimized bundle size & fast initial page load
const Splash = lazy(() => import('../pages/Splash'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const OtpVerification = lazy(() => import('../pages/OtpVerification'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/ResetPassword'));
const Home = lazy(() => import('../pages/Home'));
const Services = lazy(() => import('../pages/Services'));
const ServiceDetails = lazy(() => import('../pages/ServiceDetails'));
const Categories = lazy(() => import('../pages/Categories'));
const Providers = lazy(() => import('../pages/Providers'));
const ProviderDetails = lazy(() => import('../pages/ProviderDetails'));
const Booking = lazy(() => import('../pages/Booking'));
const BookingSuccess = lazy(() => import('../pages/BookingSuccess'));
const MyBookings = lazy(() => import('../pages/MyBookings'));
const SearchCook = lazy(() => import('../pages/SearchCook'));
const SearchMaid = lazy(() => import('../pages/SearchMaid'));
const GlobalSearchPage = lazy(() => import('../pages/GlobalSearchPage'));
const NotFound = lazy(() => import('../pages/NotFound'));
const ServerErrorPage = lazy(() => import('../pages/ServerErrorPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const OfflinePage = lazy(() => import('../pages/OfflinePage'));

// Dashboard Pages
const DashboardHome = lazy(() => import('../pages/dashboard/DashboardHome'));
const DashboardProfile = lazy(() => import('../pages/dashboard/DashboardProfile'));
const DashboardBookings = lazy(() => import('../pages/dashboard/DashboardBookings'));
const DashboardWallet = lazy(() => import('../pages/dashboard/DashboardWallet'));
const DashboardAddresses = lazy(() => import('../pages/dashboard/DashboardAddresses'));
const DashboardProviders = lazy(() => import('../pages/dashboard/DashboardProviders'));
const DashboardNotifications = lazy(() => import('../pages/dashboard/DashboardNotifications'));
const DashboardSettings = lazy(() => import('../pages/dashboard/DashboardSettings'));
const ProviderDashboardPage = lazy(() => import('../pages/providerDashboard/ProviderDashboardPage'));

// Booking Pages
const BookingFlowPage = lazy(() => import('../pages/booking/BookingFlowPage'));
const BookingSummaryPage = lazy(() => import('../pages/booking/BookingSummaryPage'));
const BookingSuccessPage = lazy(() => import('../pages/booking/BookingSuccessPage'));
const BookingHistoryPage = lazy(() => import('../pages/booking/BookingHistoryPage'));
const BookingDetailsPage = lazy(() => import('../pages/booking/BookingDetailsPage'));
const CancelBookingPage = lazy(() => import('../pages/booking/CancelBookingPage'));
const RescheduleBookingPage = lazy(() => import('../pages/booking/RescheduleBookingPage'));

// Phase 6 Pages
const PaymentsPage = lazy(() => import('../pages/phase6/PaymentsPage'));
const PaymentSuccessPage = lazy(() => import('../pages/phase6/PaymentSuccessPage'));
const PaymentFailedPage = lazy(() => import('../pages/phase6/PaymentFailedPage'));
const WalletPage = lazy(() => import('../pages/phase6/WalletPage'));
const OffersPage = lazy(() => import('../pages/phase6/OffersPage'));
const NotificationsPage = lazy(() => import('../pages/phase6/NotificationsPage'));
const TrackBookingPage = lazy(() => import('../pages/phase6/TrackBookingPage'));
const SupportPage = lazy(() => import('../pages/phase6/SupportPage'));
const HelpCenterPage = lazy(() => import('../pages/phase6/HelpCenterPage'));

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        {/* Splash Teaser Route */}
        <Route path="/" element={<Splash />} />

        {/* Public Pages Layout */}
        <Route element={<PublicLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/service/:id" element={<ServiceDetails />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/providers" element={<Providers />} />
          <Route path="/providers/:id" element={<ProviderDetails />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/booking/success" element={<BookingSuccess />} />
          <Route path="/booking-success" element={<BookingSuccess />} />
          <Route path="/my-bookings" element={<MyBookings />} />

          {/* Booking Flow Routes */}
          <Route path="/book" element={<BookingFlowPage />} />
          <Route path="/book/summary" element={<BookingSummaryPage />} />
          <Route path="/book/success" element={<BookingSuccessPage />} />
          <Route path="/book/history" element={<BookingHistoryPage />} />
          <Route path="/book/:id" element={<BookingDetailsPage />} />
          <Route path="/book/:id/cancel" element={<CancelBookingPage />} />
          <Route path="/book/:id/reschedule" element={<RescheduleBookingPage />} />

          {/* Phase 6 Payments, Tracking & Support Routes */}
          <Route path="/payment" element={<PaymentsPage />} />
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/failed" element={<PaymentFailedPage />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/offers" element={<OffersPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/track/:bookingId" element={<TrackBookingPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/help" element={<HelpCenterPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          <Route path="/search" element={<GlobalSearchPage />} />
          <Route path="/cooks" element={<SearchCook />} />
          <Route path="/search-cook" element={<SearchCook />} />
          <Route path="/maids" element={<SearchMaid />} />
          <Route path="/search-maid" element={<SearchMaid />} />
        </Route>

        {/* Protected Customer Dashboard Layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/dashboard/profile" element={<DashboardProfile />} />
            <Route path="/dashboard/bookings" element={<DashboardBookings />} />
            <Route path="/dashboard/wallet" element={<DashboardWallet />} />
            <Route path="/dashboard/addresses" element={<DashboardAddresses />} />
            <Route path="/dashboard/providers" element={<DashboardProviders />} />
            <Route path="/dashboard/notifications" element={<DashboardNotifications />} />
            <Route path="/dashboard/settings" element={<DashboardSettings />} />
            <Route path="/dashboard/provider" element={<ProviderDashboardPage />} />
            <Route path="/provider/dashboard" element={<ProviderDashboardPage />} />
          </Route>
        </Route>

        {/* Auth Pages Layout */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<OtpVerification />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* Catch-all, Offline & Error Routes */}
        <Route path="/offline" element={<OfflinePage />} />
        <Route path="/500" element={<ServerErrorPage />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;

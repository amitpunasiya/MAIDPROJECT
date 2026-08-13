import React, { useState, useEffect } from 'react';
import { Box, Typography, Stack } from '@mui/material';

import { DashboardStats, AnalyticsCharts, AdminDataTable, ColumnDef } from '../../components';
import { adminApi, IAdminDashboardStats, IAdminBooking } from '../../services/api';

const MOCK_RECENT_BOOKINGS: IAdminBooking[] = [
  { id: 'b-1', bookingIdNumber: 'BK-948201', customerName: 'Ananya Roy', providerName: 'Ramesh Sharma', serviceType: 'North Indian Cook', date: '2026-08-07', amount: 850, status: 'CONFIRMED' },
  { id: 'b-2', bookingIdNumber: 'BK-948202', customerName: 'Vikram Malhotra', providerName: 'Sunita Devi', serviceType: 'Housekeeping Maid', date: '2026-08-07', amount: 650, status: 'COMPLETED' },
  { id: 'b-3', bookingIdNumber: 'BK-948203', customerName: 'Priya Nair', providerName: 'Kavita Singh', serviceType: 'Deep Cleaning', date: '2026-08-06', amount: 2400, status: 'CONFIRMED' },
  { id: 'b-4', bookingIdNumber: 'BK-948204', customerName: 'Amit Verma', providerName: 'Rajesh Sharma', serviceType: 'Chef Service', date: '2026-08-06', amount: 1200, status: 'COMPLETED' },
];

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<IAdminDashboardStats | undefined>(undefined);
  const [bookings, setBookings] = useState<IAdminBooking[]>(MOCK_RECENT_BOOKINGS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const resStats = await adminApi.getDashboardStats();
        if (resStats.data) setStats(resStats.data);

        const resBookings = await adminApi.getBookings({ limit: 5 });
        if (resBookings.data?.items) setBookings(resBookings.data.items);
      } catch {
        // Fallback to mock
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, []);

  const columns: ColumnDef<IAdminBooking>[] = [
    { id: 'bookingIdNumber', label: 'BOOKING ID' },
    { id: 'customerName', label: 'CUSTOMER' },
    { id: 'providerName', label: 'PROVIDER' },
    { id: 'serviceType', label: 'SERVICE' },
    { id: 'amount', label: 'AMOUNT (₹)', render: (row) => `₹${row.amount}` },
    { id: 'status', label: 'STATUS' },
  ];

  return (
    <Box sx={{ p: 4, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={900} color="text.primary">
          Admin Executive Control Center
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
          Real-time metrics, provider approvals, platform revenue, and live booking volume.
        </Typography>
      </Box>

      <Stack spacing={4}>
        {/* Metric Cards */}
        <DashboardStats stats={stats} />

        {/* Analytics Charts */}
        <AnalyticsCharts />

        {/* Recent Bookings Table */}
        <AdminDataTable
          title="Recent Platform Bookings"
          subtitle="Real-time live booking stream across all operational zones."
          columns={columns}
          data={bookings}
          isLoading={loading}
        />
      </Stack>
    </Box>
  );
};

export default AdminDashboard;

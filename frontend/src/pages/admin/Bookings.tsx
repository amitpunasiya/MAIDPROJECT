import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip } from '@mui/material';

import { AdminDataTable, AdminFilters, ColumnDef } from '../../components';
import { adminApi, IAdminBooking } from '../../services/api';

const MOCK_BOOKINGS: IAdminBooking[] = [
  { id: 'b-1', bookingIdNumber: 'BK-948201', customerName: 'Ananya Roy', providerName: 'Ramesh Sharma', serviceType: 'North Indian Cook', date: '2026-08-07', amount: 850, status: 'CONFIRMED' },
  { id: 'b-2', bookingIdNumber: 'BK-948202', customerName: 'Vikram Malhotra', providerName: 'Sunita Devi', serviceType: 'Housekeeping Maid', date: '2026-08-07', amount: 650, status: 'COMPLETED' },
  { id: 'b-3', bookingIdNumber: 'BK-948203', customerName: 'Priya Nair', providerName: 'Kavita Singh', serviceType: 'Deep Cleaning', date: '2026-08-06', amount: 2400, status: 'IN_PROGRESS' },
  { id: 'b-4', bookingIdNumber: 'BK-948204', customerName: 'Rahul Sharma', providerName: 'Rajesh Kumar', serviceType: 'Baby Care', date: '2026-08-05', amount: 1500, status: 'CANCELLED' },
];

export const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<IAdminBooking[]>(MOCK_BOOKINGS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await adminApi.getBookings({ search, status });
        if (res.data?.items) setBookings(res.data.items);
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [search, status]);

  const columns: ColumnDef<IAdminBooking>[] = [
    { id: 'bookingIdNumber', label: 'BOOKING ID' },
    { id: 'customerName', label: 'CUSTOMER' },
    { id: 'providerName', label: 'STAFF PROVIDER' },
    { id: 'serviceType', label: 'SERVICE' },
    { id: 'date', label: 'DATE' },
    { id: 'amount', label: 'AMOUNT (₹)', render: (r) => `₹${r.amount}` },
    {
      id: 'status',
      label: 'STATUS',
      render: (r) => (
        <Chip
          label={r.status}
          color={r.status === 'COMPLETED' ? 'success' : r.status === 'CONFIRMED' ? 'primary' : r.status === 'IN_PROGRESS' ? 'warning' : 'error'}
          size="small"
          sx={{ fontWeight: 800 }}
        />
      ),
    },
  ];

  return (
    <Box sx={{ p: 4, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={900}>
          Platform Booking Control
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Monitor live active visits, completed orders, and cancellations.
        </Typography>
      </Box>

      <AdminFilters searchTerm={search} onSearchChange={setSearch} statusFilter={status} onStatusChange={setStatus} />

      <AdminDataTable title="All Bookings Queue" columns={columns} data={bookings} isLoading={loading} />
    </Box>
  );
};

export default AdminBookings;

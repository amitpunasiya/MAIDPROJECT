import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip, IconButton } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { AdminDataTable, AdminFilters, ColumnDef } from '../../components';
import { adminApi, IAdminCustomer } from '../../services/api';

const MOCK_CUSTOMERS: IAdminCustomer[] = [
  { id: 'c-1', name: 'Ananya Roy', email: 'ananya@example.com', phone: '+91 9876543210', city: 'Bengaluru', totalBookings: 12, status: 'active', joinedDate: '2026-01-15' },
  { id: 'c-2', name: 'Vikram Malhotra', email: 'vikram@example.com', phone: '+91 9876543211', city: 'Bengaluru', totalBookings: 8, status: 'active', joinedDate: '2026-02-10' },
  { id: 'c-3', name: 'Priya Nair', email: 'priya@example.com', phone: '+91 9876543212', city: 'Mumbai', totalBookings: 3, status: 'active', joinedDate: '2026-04-20' },
  { id: 'c-4', name: 'Rahul Sharma', email: 'rahul@example.com', phone: '+91 9876543213', city: 'Delhi NCR', totalBookings: 0, status: 'suspended', joinedDate: '2026-05-01' },
];

export const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<IAdminCustomer[]>(MOCK_CUSTOMERS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true);
        const res = await adminApi.getCustomers({ search, status });
        if (res.data?.items) setCustomers(res.data.items);
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    };
    void loadCustomers();
  }, [search, status]);

  const filtered = customers.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === 'all' ? true : c.status === status;
    return matchSearch && matchStatus;
  });

  const columns: ColumnDef<IAdminCustomer>[] = [
    { id: 'name', label: 'CUSTOMER NAME' },
    { id: 'email', label: 'EMAIL' },
    { id: 'phone', label: 'PHONE' },
    { id: 'city', label: 'CITY' },
    { id: 'totalBookings', label: 'BOOKINGS' },
    {
      id: 'status',
      label: 'STATUS',
      render: (row) => (
        <Chip
          label={row.status.toUpperCase()}
          color={row.status === 'active' ? 'success' : 'error'}
          size="small"
          sx={{ fontWeight: 800 }}
        />
      ),
    },
    {
      id: 'actions',
      label: 'ACTIONS',
      render: (row) => (
        <IconButton
          size="small"
          color={row.status === 'active' ? 'error' : 'success'}
          onClick={() =>
            setCustomers((prev) =>
              prev.map((c) => (c.id === row.id ? { ...c, status: c.status === 'active' ? 'suspended' : 'active' } : c))
            )
          }
        >
          {row.status === 'active' ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
        </IconButton>
      ),
    },
  ];

  return (
    <Box sx={{ p: 4, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={900}>
          Customer Account Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage registered household accounts, suspensions, and booking logs.
        </Typography>
      </Box>

      <AdminFilters
        searchTerm={search}
        onSearchChange={setSearch}
        statusFilter={status}
        onStatusChange={setStatus}
        onResetFilters={() => {
          setSearch('');
          setStatus('all');
        }}
      />

      <AdminDataTable
        title="Registered Customers"
        subtitle={`Total ${filtered.length} customers registered.`}
        columns={columns}
        data={filtered}
        isLoading={loading}
      />
    </Box>
  );
};

export default AdminCustomers;

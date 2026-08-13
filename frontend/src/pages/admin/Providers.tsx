import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip, Button as MuiButton } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import PendingIcon from '@mui/icons-material/HourglassEmpty';

import { AdminDataTable, AdminFilters, ColumnDef } from '../../components';
import { adminApi, IAdminProvider } from '../../services/api';

const MOCK_PROVIDERS: IAdminProvider[] = [
  { id: 'p-1', name: 'Ramesh Sharma', email: 'ramesh@example.com', phone: '+91 9876543220', serviceType: 'cook', experienceYears: 8, city: 'Bengaluru', rating: 4.9, kycStatus: 'VERIFIED', status: 'active' },
  { id: 'p-2', name: 'Sunita Devi', email: 'sunita@example.com', phone: '+91 9876543221', serviceType: 'maid', experienceYears: 6, city: 'Bengaluru', rating: 4.8, kycStatus: 'VERIFIED', status: 'active' },
  { id: 'p-3', name: 'Rajesh Kumar', email: 'rajesh@example.com', phone: '+91 9876543222', serviceType: 'cook', experienceYears: 4, city: 'Mumbai', rating: 4.6, kycStatus: 'PENDING', status: 'inactive' },
];

export const AdminProviders: React.FC = () => {
  const [providers, setProviders] = useState<IAdminProvider[]>(MOCK_PROVIDERS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  useEffect(() => {
    const loadProviders = async () => {
      try {
        setLoading(true);
        const res = await adminApi.getProviders({ search, status });
        if (res.data?.items) setProviders(res.data.items);
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    };
    void loadProviders();
  }, [search, status]);

  const filtered = providers.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const columns: ColumnDef<IAdminProvider>[] = [
    { id: 'name', label: 'PROVIDER NAME' },
    { id: 'serviceType', label: 'SERVICE TYPE', render: (row) => row.serviceType.toUpperCase() },
    { id: 'city', label: 'CITY' },
    { id: 'experienceYears', label: 'EXP', render: (row) => `${row.experienceYears} Yrs` },
    { id: 'rating', label: 'RATING', render: (row) => `${row.rating} ★` },
    {
      id: 'kycStatus',
      label: 'KYC VERIFICATION',
      render: (row) => (
        <Chip
          icon={row.kycStatus === 'VERIFIED' ? <VerifiedIcon /> : <PendingIcon />}
          label={row.kycStatus}
          color={row.kycStatus === 'VERIFIED' ? 'success' : 'warning'}
          size="small"
          sx={{ fontWeight: 800 }}
        />
      ),
    },
    {
      id: 'actions',
      label: 'KYC APPROVAL',
      render: (row) =>
        row.kycStatus === 'PENDING' ? (
          <MuiButton
            size="small"
            variant="contained"
            color="success"
            onClick={() =>
              setProviders((prev) =>
                prev.map((p) => (p.id === row.id ? { ...p, kycStatus: 'VERIFIED', status: 'active' } : p))
              )
            }
            sx={{ fontWeight: 800, textTransform: 'none', borderRadius: '8px' }}
          >
            Approve KYC
          </MuiButton>
        ) : (
          <Chip label="APPROVED" color="default" size="small" />
        ),
    },
  ];

  return (
    <Box sx={{ p: 4, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={900}>
          Service Partner & Provider Operations
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Verify provider KYC identity documents, ratings, and active statuses.
        </Typography>
      </Box>

      <AdminFilters
        searchTerm={search}
        onSearchChange={setSearch}
        statusFilter={status}
        onStatusChange={setStatus}
        onResetFilters={() => setSearch('')}
      />

      <AdminDataTable
        title="Registered Staff Partners"
        subtitle={`Total ${filtered.length} service providers.`}
        columns={columns}
        data={filtered}
        isLoading={loading}
      />
    </Box>
  );
};

export default AdminProviders;

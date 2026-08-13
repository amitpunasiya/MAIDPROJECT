import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Chip,
  IconButton,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Alert,
  TextField,
  InputAdornment,
  MenuItem,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Block as SuspendIcon,
  Visibility as ViewIcon,
  VerifiedUser as VerifiedIcon,
  Download as ExportIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { adminApi } from '../services/api/admin.api';
import { AdminLoading, AdminError, AdminEmpty, AdminPagination } from '../components/common/AdminStateComponents';

interface ProviderRecord {
  id: string;
  name: string;
  type: string;
  city: string;
  experience: number;
  rating: number;
  status: 'pending' | 'approved' | 'rejected' | 'suspended' | string;
  aadhaarNo: string;
  panNo: string;
}

export const ProviderManagement: React.FC = () => {
  const [selectedProvider, setSelectedProvider] = useState<ProviderRecord | null>(null);
  const [providers, setProviders] = useState<ProviderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, unknown> = { page, limit: 10 };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;

      const res = await adminApi.getProviders(params);
      const payload = res.data || res;
      const rawList = Array.isArray(payload) ? payload : payload.docs || payload.items || payload.providers || [];

      const formatted: ProviderRecord[] = rawList.map((p: any) => ({
        id: p._id || p.id,
        name: p.name || p.user?.name || 'N/A',
        type: p.providerType ? `${p.providerType.toUpperCase()} Service` : p.serviceTypes?.join(', ') || 'Service Staff',
        city: p.city || p.location?.city || p.user?.city || 'N/A',
        experience: p.experienceYears || p.experience || 0,
        rating: p.rating || p.averageRating || 5.0,
        status: (p.verificationStatus || p.status || 'pending').toLowerCase(),
        aadhaarNo: p.aadhaarNumber || p.documents?.aadhaar || 'Provided on File',
        panNo: p.panNumber || p.documents?.pan || 'Provided on File',
      }));

      setProviders(formatted);
      setTotalPages(payload.totalPages || payload.pages || 1);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch providers from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchProviders();
  }, [page, statusFilter, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    void fetchProviders();
  };

  const handleUpdateStatus = async (id: string, action: 'verify' | 'reject' | 'suspend' | 'activate') => {
    try {
      if (action === 'verify') await adminApi.verifyProvider(id);
      else if (action === 'reject') await adminApi.rejectProvider(id);
      else if (action === 'suspend') await adminApi.suspendProvider(id);
      else if (action === 'activate') await adminApi.activateProvider(id);

      void fetchProviders();
      if (selectedProvider && selectedProvider.id === id) {
        setSelectedProvider({
          ...selectedProvider,
          status: action === 'verify' ? 'approved' : action,
        });
      }
    } catch (err: any) {
      alert(err?.message || `Failed to ${action} provider.`);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Provider Management & KYC Verification
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Verify identity documents, manage provider approvals, suspensions, and performance analytics.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<ExportIcon />}
          href={adminApi.exportReportCsvUrl('providers')}
          target="_blank"
        >
          Export Providers
        </Button>
      </Box>

      {/* Search & Filter Bar */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid #e2e8f0', borderRadius: 3 }}>
        <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search provider by name or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 320 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            size="small"
            label="KYC Status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            sx={{ width: 160 }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="pending">Pending KYC</MenuItem>
            <MenuItem value="verified">Verified / Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
            <MenuItem value="suspended">Suspended</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            label="Service Category"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            sx={{ width: 180 }}
          >
            <MenuItem value="">All Categories</MenuItem>
            <MenuItem value="cook">Home Cook</MenuItem>
            <MenuItem value="maid">House Maid</MenuItem>
            <MenuItem value="baby_sitter">Baby Sitter</MenuItem>
            <MenuItem value="elder_care">Elder Care</MenuItem>
            <MenuItem value="patient_care">Patient Care</MenuItem>
            <MenuItem value="cleaner">Home Cleaner</MenuItem>
            <MenuItem value="gardener">Gardener</MenuItem>
            <MenuItem value="laundry">Laundry Helper</MenuItem>
            <MenuItem value="home_helper">General Helper</MenuItem>
            <MenuItem value="other">Other Services</MenuItem>
          </TextField>
          <Button type="submit" variant="contained" color="primary">
            Filter
          </Button>
        </Box>
      </Paper>

      {/* Provider List Table */}
      <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
        {loading ? (
          <AdminLoading message="Fetching provider profiles..." />
        ) : error ? (
          <AdminError message={error} onRetry={fetchProviders} />
        ) : providers.length === 0 ? (
          <AdminEmpty title="No Providers Found" description="Try refining your search query or filter selection." />
        ) : (
          <>
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Provider</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Category & City</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Experience</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Rating</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>KYC Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {providers.map((provider) => (
                  <TableRow key={provider.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: '#0f172a' }}>{provider.name[0]?.toUpperCase() || 'P'}</Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700}>
                            {provider.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {provider.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {provider.type}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {provider.city}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">{provider.experience} Years</Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={700} color="warning.main">
                        {provider.rating} ★
                      </Typography>
                    </TableCell>

                    <TableCell>
                      {(provider.status === 'approved' || provider.status === 'verified') && (
                        <Chip label="VERIFIED" color="success" size="small" />
                      )}
                      {provider.status === 'pending' && <Chip label="PENDING KYC" color="warning" size="small" />}
                      {provider.status === 'rejected' && <Chip label="REJECTED" color="error" size="small" />}
                      {provider.status === 'suspended' && <Chip label="SUSPENDED" color="secondary" size="small" />}
                    </TableCell>

                    <TableCell align="right">
                      <IconButton size="small" onClick={() => setSelectedProvider(provider)} color="info">
                        <ViewIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleUpdateStatus(provider.id, 'verify')}
                        color="success"
                        title="Approve / Verify"
                      >
                        <ApproveIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleUpdateStatus(provider.id, 'reject')}
                        color="error"
                        title="Reject KYC"
                      >
                        <RejectIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleUpdateStatus(provider.id, 'suspend')}
                        color="warning"
                        title="Suspend Account"
                      >
                        <SuspendIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <AdminPagination page={page} count={totalPages} onChange={(p) => setPage(p)} />
          </>
        )}
      </Paper>

      {/* Verification & KYC Documents Modal */}
      <Dialog open={Boolean(selectedProvider)} onClose={() => setSelectedProvider(null)} maxWidth="md" fullWidth>
        <DialogTitle fontWeight={700}>Provider KYC & Identity Document Verification</DialogTitle>
        <DialogContent dividers>
          {selectedProvider && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert severity={selectedProvider.status === 'approved' || selectedProvider.status === 'verified' ? 'success' : 'warning'}>
                  Current KYC Status: {selectedProvider.status.toUpperCase()}
                </Alert>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper elevation={0} sx={{ p: 2, border: '1px solid #cbd5e1', borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                    Aadhaar Verification
                  </Typography>
                  <Typography variant="body2">Aadhaar No: {selectedProvider.aadhaarNo}</Typography>
                  <Chip icon={<VerifiedIcon />} label="Aadhaar Record" color="success" size="small" sx={{ mt: 1 }} />
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper elevation={0} sx={{ p: 2, border: '1px solid #cbd5e1', borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                    PAN Verification
                  </Typography>
                  <Typography variant="body2">PAN No: {selectedProvider.panNo}</Typography>
                  <Chip icon={<VerifiedIcon />} label="PAN Record" color="success" size="small" sx={{ mt: 1 }} />
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          {selectedProvider && (
            <>
              <Button color="success" variant="contained" onClick={() => handleUpdateStatus(selectedProvider.id, 'verify')}>
                Approve KYC
              </Button>
              <Button color="error" variant="outlined" onClick={() => handleUpdateStatus(selectedProvider.id, 'reject')}>
                Reject KYC
              </Button>
            </>
          )}
          <Button onClick={() => setSelectedProvider(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProviderManagement;

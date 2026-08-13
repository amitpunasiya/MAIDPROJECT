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
  TextField,
  InputAdornment,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Download as ExportIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { adminApi } from '../services/api/admin.api';
import { AdminLoading, AdminError, AdminEmpty, AdminPagination } from '../components/common/AdminStateComponents';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  city: string;
  isBlocked: boolean;
  registeredAt: string;
}

export const UserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, unknown> = { page, limit: 10 };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (roleFilter) params.role = roleFilter;

      const res = await adminApi.getUsers(params);
      const payload = res.data || res;
      const rawList = Array.isArray(payload) ? payload : payload.docs || payload.items || payload.users || [];

      const formatted: UserRecord[] = rawList.map((u: any) => ({
        id: u._id || u.id,
        name: u.name || 'N/A',
        email: u.email || 'N/A',
        phone: u.phone || u.phoneNumber || 'N/A',
        role: u.role || 'customer',
        city: u.city || u.addresses?.[0]?.city || 'N/A',
        isBlocked: typeof u.isBlocked === 'boolean' ? u.isBlocked : u.isActive === false,
        registeredAt: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A',
      }));

      setUsers(formatted);
      setTotalPages(payload.totalPages || payload.pages || 1);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch users from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchUsers();
  }, [page, roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    void fetchUsers();
  };

  const handleToggleBlock = async (user: UserRecord) => {
    try {
      await adminApi.updateUser(user.id, { isActive: user.isBlocked });
      void fetchUsers();
    } catch (err: any) {
      alert(err?.message || 'Failed to update user status.');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user account?')) return;
    try {
      await adminApi.deleteUser(id);
      void fetchUsers();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete user.');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Customer & User Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage user accounts, permissions, block/unblock status, and activity records.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<ExportIcon />}
          href={adminApi.exportReportCsvUrl('users')}
          target="_blank"
        >
          Export CSV
        </Button>
      </Box>

      {/* Search & Filter Bar */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid #e2e8f0', borderRadius: 3 }}>
        <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search by name, email, or phone..."
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
            label="Role Filter"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            sx={{ width: 180 }}
          >
            <MenuItem value="">All Roles</MenuItem>
            <MenuItem value="customer">Customer</MenuItem>
            <MenuItem value="provider">Provider</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </TextField>
          <Button type="submit" variant="contained" color="primary">
            Search
          </Button>
        </Box>
      </Paper>

      {/* Users Table */}
      <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
        {loading ? (
          <AdminLoading message="Loading accounts..." />
        ) : error ? (
          <AdminError message={error} onRetry={fetchUsers} />
        ) : users.length === 0 ? (
          <AdminEmpty title="No Users Found" description="Try adjusting your search query or role filter." />
        ) : (
          <>
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Email & Phone</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Role & City</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Registered</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: '#3b82f6' }}>{user.name[0]?.toUpperCase() || 'U'}</Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700}>
                            {user.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {user.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">{user.email}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.phone}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip label={user.role.toUpperCase()} size="small" variant="outlined" sx={{ mr: 1 }} />
                      <Typography variant="caption" color="text.secondary">
                        {user.city}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      {user.isBlocked ? (
                        <Chip label="BLOCKED" color="error" size="small" />
                      ) : (
                        <Chip label="ACTIVE" color="success" size="small" />
                      )}
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">{user.registeredAt}</Typography>
                    </TableCell>

                    <TableCell align="right">
                      <IconButton size="small" onClick={() => setSelectedUser(user)} color="info">
                        <ViewIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleBlock(user)}
                        color={user.isBlocked ? 'success' : 'warning'}
                      >
                        {user.isBlocked ? <CheckCircleIcon fontSize="small" /> : <BlockIcon fontSize="small" />}
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteUser(user.id)} color="error">
                        <DeleteIcon fontSize="small" />
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

      {/* User Details Modal */}
      <Dialog open={Boolean(selectedUser)} onClose={() => setSelectedUser(null)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>User Profile & Details</DialogTitle>
        <DialogContent dividers>
          {selectedUser && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Alert severity={selectedUser.isBlocked ? 'error' : 'success'}>
                Account Status: {selectedUser.isBlocked ? 'BLOCKED / INACTIVE' : 'ACTIVE & VERIFIED'}
              </Alert>
              <Typography variant="subtitle1" fontWeight={700}>
                {selectedUser.name} ({selectedUser.id})
              </Typography>
              <Typography variant="body2">Role: {selectedUser.role.toUpperCase()}</Typography>
              <Typography variant="body2">Email: {selectedUser.email}</Typography>
              <Typography variant="body2">Phone: {selectedUser.phone}</Typography>
              <Typography variant="body2">City: {selectedUser.city}</Typography>
              <Typography variant="body2">Joined Date: {selectedUser.registeredAt}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedUser(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;

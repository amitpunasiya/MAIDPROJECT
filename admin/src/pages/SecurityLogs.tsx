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
  Chip,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { adminApi } from '../services/api/admin.api';
import { AdminLoading, AdminError, AdminEmpty, AdminPagination } from '../components/common/AdminStateComponents';

export const SecurityLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, unknown> = { page, limit: 15 };
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await adminApi.getActivityLogs(params);
      const payload = res.data || res;
      const rawList = Array.isArray(payload) ? payload : payload.docs || payload.items || payload.logs || [];

      setLogs(rawList);
      setTotalPages(payload.totalPages || payload.pages || 1);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch activity logs from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchLogs();
  }, [page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    void fetchLogs();
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Security & System Audit Trails
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Immutable audit logs of admin actions, user role modifications, and system security events.
        </Typography>
      </Box>

      {/* Search Bar */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid #e2e8f0', borderRadius: 3 }}>
        <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search logs by action, user, or IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 340 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
        {loading ? (
          <AdminLoading message="Loading audit trails..." />
        ) : error ? (
          <AdminError message={error} onRetry={fetchLogs} />
        ) : logs.length === 0 ? (
          <AdminEmpty title="No Audit Logs Found" description="System security logs will be recorded as actions are taken." />
        ) : (
          <>
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Log ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actor / Admin</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Module</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>IP Address</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Timestamp</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id || log._id} hover>
                    <TableCell sx={{ fontWeight: 700 }}>{log.id || log._id?.slice(-6) || 'LOG'}</TableCell>
                    <TableCell>{log.user || log.userName || log.userEmail || 'System Admin'}</TableCell>
                    <TableCell>
                      <Chip label={log.action || log.type || 'EVENT'} color="primary" size="small" />
                    </TableCell>
                    <TableCell>{(log.module || log.category || 'SYSTEM').toUpperCase()}</TableCell>
                    <TableCell>{log.ip || log.ipAddress || 'Internal'}</TableCell>
                    <TableCell>{log.createdAt ? new Date(log.createdAt).toLocaleString() : (log.timestamp || 'N/A')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <AdminPagination page={page} count={totalPages} onChange={(p) => setPage(p)} />
          </>
        )}
      </Paper>
    </Box>
  );
};

export default SecurityLogs;

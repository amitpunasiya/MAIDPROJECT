import React, { useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Stack,
  IconButton,
  Chip,
  Button as MuiButton,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DoneAllIcon from '@mui/icons-material/DoneAll';

import DashboardHeader from '../../components/dashboard/DashboardHeader';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import {
  fetchNotifications,
  markNotificationReadApi,
  markAllNotificationsReadApi,
  deleteNotificationApi,
  setNotificationFilter,
} from '../../store/notificationSlice';

export const DashboardNotifications: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, filter, loading, error } = useAppSelector((state) => state.notification);

  useEffect(() => {
    void dispatch(fetchNotifications());
  }, [dispatch]);

  const filtered = items.filter((n) => {
    if (filter === 'all') return true;
    return n.category === filter;
  });

  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 2 }}>
        <DashboardHeader title="Notifications & Alerts" subtitle="Stay updated with booking confirmations, wallet updates, and promo offers." />
        {unreadCount > 0 && (
          <MuiButton
            variant="outlined"
            size="small"
            startIcon={<DoneAllIcon />}
            onClick={() => dispatch(markAllNotificationsReadApi())}
            sx={{ borderRadius: '10px', fontWeight: 700, textTransform: 'none' }}
          >
            Mark All as Read
          </MuiButton>
        )}
      </Box>

      {/* Tabs */}
      <Paper elevation={0} sx={{ p: 1, mb: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFF' }}>
        <Tabs value={filter} onChange={(_e, val) => dispatch(setNotificationFilter(val))}>
          <Tab label={`All Alerts (${items.length})`} value="all" sx={{ fontWeight: 700, textTransform: 'none' }} />
          <Tab label="Booking Updates" value="booking" sx={{ fontWeight: 700, textTransform: 'none' }} />
          <Tab label="Payment Receipts" value="payment" sx={{ fontWeight: 700, textTransform: 'none' }} />
          <Tab label="Promotions & Offers" value="promo" sx={{ fontWeight: 700, textTransform: 'none' }} />
        </Tabs>
      </Paper>

      {/* Notifications List */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFF' }}>
        {loading ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
            Loading notifications...
          </Typography>
        ) : error ? (
          <Typography variant="body2" color="error.main" textAlign="center" py={4}>
            {error}
          </Typography>
        ) : filtered.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="h6" fontWeight={800}>
              No Notifications
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You are all caught up!
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {filtered.map((n) => (
              <Box
                key={n.id}
                sx={{
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  borderRadius: 3,
                  bgcolor: n.read ? '#F8FAFC' : '#EFF6FF',
                  border: `1px solid ${n.read ? '#E2E8F0' : '#BFDBFE'}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '10px',
                      bgcolor: n.read ? '#CBD5E1' : '#2563EB',
                      color: '#FFF',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'center',
                    }}
                  >
                    <NotificationsIcon fontSize="small" />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2" fontWeight={800}>
                        {n.title}
                      </Typography>
                      {!n.read && <Chip label="New" color="primary" size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800 }} />}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.2 }}>
                      {n.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {n.timestamp}
                    </Typography>
                  </Box>
                </Box>

                <Stack direction="row" spacing={1}>
                  {!n.read && (
                    <IconButton size="small" color="primary" onClick={() => dispatch(markNotificationReadApi(n.id))}>
                      <CheckCircleOutlineIcon fontSize="small" />
                    </IconButton>
                  )}
                  <IconButton size="small" color="error" onClick={() => dispatch(deleteNotificationApi(n.id))}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Paper>
    </Box>
  );
};

export default DashboardNotifications;

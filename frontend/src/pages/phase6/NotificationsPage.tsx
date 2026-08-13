import React, { useEffect } from 'react';
import { Box, Container, Typography, Paper, Tabs, Tab, Stack } from '@mui/material';
import DoneAllIcon from '@mui/icons-material/DoneAll';

import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import {
  fetchNotifications,
  markNotificationReadApi,
  markAllNotificationsReadApi,
  deleteNotificationApi,
  setNotificationFilter,
} from '../../store/notificationSlice';
import { NotificationCard, Button } from '../../components';

export const NotificationsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, filter, loading, error } = useAppSelector((state) => state.notification);

  useEffect(() => {
    void dispatch(fetchNotifications());
  }, [dispatch]);

  const filteredItems = items.filter((item) => {
    if (filter === 'all') return true;
    return item.category === filter;
  });

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h3" fontWeight={800} color="text.primary">
              Notification Center
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              Stay updated with staff assignment, live arrival times, and payment receipts.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            startIcon={<DoneAllIcon />}
            onClick={() => dispatch(markAllNotificationsReadApi())}
            sx={{ borderRadius: '10px', fontWeight: 700 }}
          >
            Mark All as Read
          </Button>
        </Box>

        {/* Filter Tabs */}
        <Paper elevation={0} sx={{ mb: 4, borderRadius: '16px', border: '1px solid #E2E8F0', p: 1, bgcolor: '#FFFFFF' }}>
          <Tabs value={filter} onChange={(_e, val) => dispatch(setNotificationFilter(val))}>
            <Tab label={`All (${items.length})`} value="all" sx={{ fontWeight: 700, textTransform: 'none' }} />
            <Tab label="Booking Updates" value="booking" sx={{ fontWeight: 700, textTransform: 'none' }} />
            <Tab label="Payment Receipts" value="payment" sx={{ fontWeight: 700, textTransform: 'none' }} />
            <Tab label="Promotions & Offers" value="promo" sx={{ fontWeight: 700, textTransform: 'none' }} />
          </Tabs>
        </Paper>

        {/* List */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFF' }}>
          {loading ? (
            <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
              Loading notifications...
            </Typography>
          ) : error ? (
            <Typography variant="body2" color="error.main" textAlign="center" py={4}>
              {error}
            </Typography>
          ) : filteredItems.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography variant="h6" fontWeight={800} color="text.secondary">
                No notifications in this filter.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {filteredItems.map((n) => (
                <NotificationCard
                  key={n.id}
                  id={n.id}
                  title={n.title}
                  message={n.message}
                  timestamp={n.timestamp}
                  read={n.read}
                  category={n.category}
                  onMarkRead={(id) => dispatch(markNotificationReadApi(id))}
                  onDelete={(id) => dispatch(deleteNotificationApi(id))}
                />
              ))}
            </Stack>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default NotificationsPage;

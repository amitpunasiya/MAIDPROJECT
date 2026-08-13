import React from 'react';
import { Box, Typography, Stack, IconButton, Chip } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import { useAppDispatch } from '../../hooks/useAppStore';
import { markNotificationReadApi, deleteNotificationApi, INotificationItem } from '../../store/notificationSlice';

export interface NotificationListProps {
  items: INotificationItem[];
}

export const NotificationList: React.FC<NotificationListProps> = ({ items }) => {
  const dispatch = useAppDispatch();

  if (items.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <NotificationsIcon sx={{ fontSize: 36, color: 'text.secondary', mb: 1 }} />
        <Typography variant="body2" color="text.secondary">
          No notifications found.
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={1}>
      {items.map((n) => (
        <Box
          key={n.id}
          sx={{
            p: 1.5,
            borderRadius: 2.5,
            bgcolor: n.read ? '#F8FAFC' : '#EFF6FF',
            border: `1px solid ${n.read ? '#E2E8F0' : '#BFDBFE'}`,
            display: 'flex',
            alignItems: 'flex-start',
            justify: 'space-between',
            gap: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', gap: 1.5, flexGrow: 1 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: '8px',
                bgcolor: n.read ? '#CBD5E1' : '#2563EB',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                flexShrink: 0,
                mt: 0.2,
              }}
            >
              <NotificationsIcon sx={{ fontSize: 18 }} />
            </Box>

            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Typography variant="subtitle2" fontWeight={800} color="text.primary">
                  {n.title}
                </Typography>
                {!n.read && <Chip label="New" color="primary" size="small" sx={{ height: 16, fontSize: '0.6rem', fontWeight: 800 }} />}
              </Box>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ my: 0.2 }}>
                {n.message}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
                {n.timestamp}
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={0.5}>
            {!n.read && (
              <IconButton size="small" color="primary" onClick={() => dispatch(markNotificationReadApi(n.id))}>
                <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />
              </IconButton>
            )}
            <IconButton size="small" color="error" onClick={() => dispatch(deleteNotificationApi(n.id))}>
              <DeleteOutlineIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Stack>
        </Box>
      ))}
    </Stack>
  );
};

export default NotificationList;

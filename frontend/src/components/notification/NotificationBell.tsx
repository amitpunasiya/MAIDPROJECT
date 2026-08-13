import React, { useState } from 'react';
import {
  IconButton,
  Badge,
  Popover,
  Box,
  Typography,
  Divider,
  Button as MuiButton,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { fetchNotifications, markAllNotificationsReadApi } from '../../store/notificationSlice';
import NotificationList from './NotificationList';

export const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.notification);

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    void dispatch(fetchNotifications());
  }, [dispatch]);

  const unreadCount = items.filter((i) => !i.read).length;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton onClick={handleClick} color="inherit">
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            width: 360,
            borderRadius: 4,
            boxShadow: '0 12px 36px rgba(15, 23, 42, 0.15)',
            border: '1px solid #E2E8F0',
            p: 0,
            overflow: 'hidden',
          },
        }}
      >
        <Box sx={{ p: 2, bgcolor: '#0F172A', color: '#FFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" fontWeight={800} color="#FFF">
            Notifications ({unreadCount} New)
          </Typography>
          {unreadCount > 0 && (
            <MuiButton
              size="small"
              startIcon={<DoneAllIcon sx={{ fontSize: '0.9rem !important' }} />}
              onClick={() => dispatch(markAllNotificationsReadApi())}
              sx={{ color: '#60A5FA', textTransform: 'none', fontWeight: 700, fontSize: '0.75rem' }}
            >
              Mark all read
            </MuiButton>
          )}
        </Box>

        <Box sx={{ maxHeight: 380, overflowY: 'auto', p: 1 }}>
          <NotificationList items={items.slice(0, 5)} />
        </Box>

        <Divider />
        <Box sx={{ p: 1.5, textAlign: 'center', bgcolor: '#F8FAFC' }}>
          <MuiButton
            fullWidth
            size="small"
            onClick={() => {
              handleClose();
              navigate('/dashboard/notifications');
            }}
            sx={{ fontWeight: 800, textTransform: 'none' }}
          >
            View All Notifications
          </MuiButton>
        </Box>
      </Popover>
    </>
  );
};

export default NotificationBell;

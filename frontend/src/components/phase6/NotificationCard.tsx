import React from 'react';
import { Paper, Box, Typography, IconButton, Chip } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

interface NotificationCardProps {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: string;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  id,
  title,
  message,
  timestamp,
  read,
  category,
  onMarkRead,
  onDelete,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3.5,
        bgcolor: read ? '#FFFFFF' : '#EFF6FF',
        border: `1px solid ${read ? '#E2E8F0' : '#BFDBFE'}`,
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        transition: 'all 0.2s ease',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '12px',
            bgcolor: read ? '#E2E8F0' : '#2563EB',
            color: read ? '#64748B' : '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
          }}
        >
          <NotificationsIcon />
        </Box>

        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle2" fontWeight={800} color="text.primary">
              {title}
            </Typography>
            {!read && <Chip label="New" color="primary" size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800 }} />}
            <Chip label={category.toUpperCase()} variant="outlined" size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }} />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
            {message}
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            {timestamp}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {!read && (
          <IconButton size="small" color="primary" onClick={() => onMarkRead(id)}>
            <CheckCircleOutlineIcon fontSize="small" />
          </IconButton>
        )}
        <IconButton size="small" color="error" onClick={() => onDelete(id)}>
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default NotificationCard;

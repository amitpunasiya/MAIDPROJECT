import React from 'react';
import { Box, Paper, Typography, IconButton, Badge, Avatar, Stack } from '@mui/material';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title, subtitle }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3 },
        borderRadius: 4,
        border: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
        boxShadow: '0 4px 18px rgba(15, 23, 42, 0.04)',
        mb: 4,
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
      }}
    >
      <Box>
        <Typography variant="h4" fontWeight={800} color="text.primary">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>

      <Stack direction="row" spacing={2} alignItems="center">
        {/* Wallet Quick Button */}
        <Box
          onClick={() => navigate('/dashboard/wallet')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 0.8,
            borderRadius: '20px',
            bgcolor: '#F0FDF4',
            border: '1px solid #BBF7D0',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': { bgcolor: '#DCFCE7' },
          }}
        >
          <AccountBalanceWalletIcon sx={{ color: 'secondary.main', fontSize: 20 }} />
          <Typography variant="subtitle2" fontWeight={800} color="secondary.main">
            ₹2,450.00
          </Typography>
        </Box>

        {/* Notifications Icon */}
        <IconButton
          onClick={() => navigate('/dashboard/notifications')}
          sx={{ bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}
        >
          <Badge badgeContent={3} color="error">
            <NotificationsNoneIcon color="primary" />
          </Badge>
        </IconButton>

        {/* User Profile Avatar */}
        <Avatar
          src={user?.avatar}
          alt={user?.name || 'User'}
          onClick={() => navigate('/dashboard/profile')}
          sx={{ width: 42, height: 42, cursor: 'pointer', border: '2px solid #2563EB' }}
        />
      </Stack>
    </Paper>
  );
};

export default DashboardHeader;

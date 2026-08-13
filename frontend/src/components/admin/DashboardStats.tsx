import React from 'react';
import { Grid2, Paper, Box, Typography } from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PeopleIcon from '@mui/icons-material/People';
import EngineeringIcon from '@mui/icons-material/Engineering';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export interface DashboardStatsProps {
  stats?: {
    totalRevenue?: number;
    totalBookings?: number;
    activeCustomers?: number;
    activeProviders?: number;
    walletVolume?: number;
  };
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  const items = [
    {
      title: 'TOTAL REVENUE',
      value: `₹${(stats?.totalRevenue || 148500).toLocaleString('en-IN')}`,
      trend: '+18.4% vs last month',
      icon: <AttachMoneyIcon sx={{ fontSize: 28, color: '#10B981' }} />,
      color: '#ECFDF5',
    },
    {
      title: 'TOTAL BOOKINGS',
      value: (stats?.totalBookings || 412).toLocaleString('en-IN'),
      trend: '+24 new today',
      icon: <ShoppingBagIcon sx={{ fontSize: 28, color: '#2563EB' }} />,
      color: '#EFF6FF',
    },
    {
      title: 'ACTIVE CUSTOMERS',
      value: (stats?.activeCustomers || 1840).toLocaleString('en-IN'),
      trend: '+140 this week',
      icon: <PeopleIcon sx={{ fontSize: 28, color: '#8B5CF6' }} />,
      color: '#F5F3FF',
    },
    {
      title: 'ACTIVE PROVIDERS',
      value: (stats?.activeProviders || 320).toLocaleString('en-IN'),
      trend: '94% KYC Verified',
      icon: <EngineeringIcon sx={{ fontSize: 28, color: '#F59E0B' }} />,
      color: '#FEF3C7',
    },
    {
      title: 'WALLET VOLUME',
      value: `₹${(stats?.walletVolume || 84200).toLocaleString('en-IN')}`,
      trend: '1-Click Checkout',
      icon: <AccountBalanceWalletIcon sx={{ fontSize: 28, color: '#0D9488' }} />,
      color: '#F0FDF4',
    },
  ];

  return (
    <Grid2 container spacing={2.5}>
      {items.map((stat, idx) => (
        <Grid2 key={idx} size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3.5,
              border: '1px solid #E2E8F0',
              bgcolor: '#FFFFFF',
              boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="caption" fontWeight={800} color="text.secondary" letterSpacing={0.5}>
                {stat.title}
              </Typography>
              <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {stat.icon}
              </Box>
            </Box>

            <Typography variant="h5" fontWeight={900} color="text.primary">
              {stat.value}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
              <TrendingUpIcon sx={{ fontSize: 14, color: 'success.main' }} />
              <Typography variant="caption" color="success.main" fontWeight={700}>
                {stat.trend}
              </Typography>
            </Box>
          </Paper>
        </Grid2>
      ))}
    </Grid2>
  );
};

export default DashboardStats;

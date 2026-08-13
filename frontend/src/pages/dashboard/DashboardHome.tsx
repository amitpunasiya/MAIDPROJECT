import React from 'react';
import {
  Box,
  Typography,
  Grid2,
  Paper,
  Button as MuiButton,
  Stack,
  LinearProgress,
  Chip,
  Avatar,
} from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import AddIcon from '@mui/icons-material/Add';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';

import DashboardHeader from '../../components/dashboard/DashboardHeader';
import StatsCard from '../../components/dashboard/StatsCard';
import { useAppSelector } from '../../hooks/useAppStore';

export const DashboardHome: React.FC = () => {
  const navigate = useNavigate();
  const bookings = useAppSelector((state) => state.booking.bookings);
  const upcomingCount = bookings.filter((b) => b.status === 'confirmed' || b.status === 'pending').length;

  return (
    <Box>
      {/* Header Banner */}
      <DashboardHeader
        title="Welcome back, Aarav! 👋"
        subtitle="Manage your home bookings, wallet, addresses, and staff preferences."
      />

      {/* KPI Stats Grid */}
      <Grid2 container spacing={3} sx={{ mb: 4 }}>
        <Grid2 size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatsCard
            title="Upcoming Bookings"
            value={upcomingCount}
            icon={<EventAvailableIcon fontSize="large" />}
            trend="Active"
            color="primary"
          />
        </Grid2>

        <Grid2 size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatsCard
            title="Total Bookings"
            value={bookings.length}
            icon={<BookmarkBorderIcon fontSize="large" />}
            trend="Lifetime"
            color="info"
          />
        </Grid2>

        <Grid2 size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatsCard
            title="Wallet Balance"
            value="₹2,450"
            icon={<AccountBalanceWalletIcon fontSize="large" />}
            trend="Instant Pay"
            color="success"
          />
        </Grid2>

        <Grid2 size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatsCard
            title="Reward Points"
            value="350 pts"
            icon={<EmojiEventsIcon fontSize="large" />}
            trend="Gold Level"
            color="warning"
          />
        </Grid2>
      </Grid2>

      {/* Quick Action Shortcuts */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', mb: 4 }}>
        <Typography variant="h6" fontWeight={800} gutterBottom>
          Quick Actions
        </Typography>
        <Grid2 container spacing={2} sx={{ mt: 1 }}>
          <Grid2 size={{ xs: 6, sm: 3 }}>
            <MuiButton
              fullWidth
              variant="outlined"
              startIcon={<RestaurantIcon color="primary" />}
              onClick={() => navigate('/cooks')}
              sx={{ py: 1.5, borderRadius: '12px', fontWeight: 700 }}
            >
              Book Cook
            </MuiButton>
          </Grid2>
          <Grid2 size={{ xs: 6, sm: 3 }}>
            <MuiButton
              fullWidth
              variant="outlined"
              startIcon={<CleaningServicesIcon color="secondary" />}
              onClick={() => navigate('/maids')}
              sx={{ py: 1.5, borderRadius: '12px', fontWeight: 700 }}
            >
              Book Maid
            </MuiButton>
          </Grid2>
          <Grid2 size={{ xs: 6, sm: 3 }}>
            <MuiButton
              fullWidth
              variant="outlined"
              startIcon={<AddIcon color="success" />}
              onClick={() => navigate('/dashboard/wallet')}
              sx={{ py: 1.5, borderRadius: '12px', fontWeight: 700 }}
            >
              Add Money
            </MuiButton>
          </Grid2>
          <Grid2 size={{ xs: 6, sm: 3 }}>
            <MuiButton
              fullWidth
              variant="contained"
              color="secondary"
              startIcon={<LocationOnIcon />}
              onClick={() => navigate('/dashboard/provider')}
              sx={{ py: 1.5, borderRadius: '12px', fontWeight: 700 }}
            >
              Provider Mode
            </MuiButton>
          </Grid2>
        </Grid2>
      </Paper>

      {/* Visual Analytics & Recent Activity */}
      <Grid2 container spacing={3.5}>
        {/* Booking Status Analytics Bar */}
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', height: '100%' }}>
            <Typography variant="h6" fontWeight={800} gutterBottom>
              Booking Status Breakdown
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Overview of your completed and active home service visits.
            </Typography>

            <Stack spacing={2.5}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                  <Typography variant="caption" fontWeight={700}>Completed Services (70%)</Typography>
                  <Typography variant="caption" fontWeight={800} color="success.main">14 Visits</Typography>
                </Box>
                <LinearProgress variant="determinate" value={70} color="success" sx={{ height: 8, borderRadius: 4 }} />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                  <Typography variant="caption" fontWeight={700}>Upcoming Confirmed (20%)</Typography>
                  <Typography variant="caption" fontWeight={800} color="primary.main">4 Visits</Typography>
                </Box>
                <LinearProgress variant="determinate" value={20} color="primary" sx={{ height: 8, borderRadius: 4 }} />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                  <Typography variant="caption" fontWeight={700}>Cancelled (10%)</Typography>
                  <Typography variant="caption" fontWeight={800} color="error.main">2 Visits</Typography>
                </Box>
                <LinearProgress variant="determinate" value={10} color="error" sx={{ height: 8, borderRadius: 4 }} />
              </Box>
            </Stack>
          </Paper>
        </Grid2>

        {/* Recent Activity List */}
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={800}>
                Recent Activity
              </Typography>
              <MuiButton
                size="small"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/dashboard/bookings')}
                sx={{ fontWeight: 700, textTransform: 'none' }}
              >
                View All
              </MuiButton>
            </Box>

            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, bgcolor: '#F8FAFC', borderRadius: 3 }}>
                <Avatar src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=150&q=80" />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2" fontWeight={800}>Chef Rajesh Sharma assigned</Typography>
                  <Typography variant="caption" color="text.secondary">Confirmed for Aug 5, 08:00 AM</Typography>
                </Box>
                <Chip label="Upcoming" size="small" color="primary" sx={{ fontWeight: 700 }} />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, bgcolor: '#F8FAFC', borderRadius: 3 }}>
                <Avatar src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80" />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2" fontWeight={800}>Sunita Devi completed visit</Typography>
                  <Typography variant="caption" color="text.secondary">Jul 28 • Housekeeping Service</Typography>
                </Box>
                <Chip label="Completed" size="small" color="success" sx={{ fontWeight: 700 }} />
              </Box>
            </Stack>
          </Paper>
        </Grid2>
      </Grid2>
    </Box>
  );
};

export default DashboardHome;

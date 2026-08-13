import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Avatar,
  Chip,
  Divider,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HomeIcon from '@mui/icons-material/Home';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useNavigate } from 'react-router-dom';

import { useAppSelector } from '../hooks/useAppStore';
import { Button } from '../components';

export const BookingSuccess: React.FC = () => {
  const navigate = useNavigate();
  const lastBooking = useAppSelector((state) => state.booking.lastCreatedBooking);

  const booking = lastBooking || {
    bookingIdNumber: 'BK-89421',
    providerName: 'Chef Rajesh Sharma',
    providerAvatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=300&q=80',
    serviceType: 'cook',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '08:00 AM - 10:00 AM',
    address: 'Flat 402, Sunshine Apartments, HSR Layout Sector 2, Bengaluru',
    totalAmount: 715,
    paymentMethod: 'upi',
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 8 }}>
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, sm: 5 },
            borderRadius: 5,
            border: '1px solid #E2E8F0',
            bgcolor: '#FFFFFF',
            textAlign: 'center',
            boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.08)',
          }}
        >
          {/* Animated Green Checkmark Icon */}
          <Box
            sx={{
              width: 88,
              height: 88,
              borderRadius: '50%',
              bgcolor: '#DCFCE7',
              color: '#16A34A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              boxShadow: '0 0 0 12px rgba(220, 252, 231, 0.5)',
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': { transform: 'scale(0.95)' },
                '50%': { transform: 'scale(1.05)' },
                '100%': { transform: 'scale(0.95)' },
              },
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 56 }} />
          </Box>

          <Typography variant="h4" fontWeight={800} color="text.primary" gutterBottom>
            Booking Confirmed!
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Your booking request has been successfully assigned. We have sent confirmation details to your registered mobile.
          </Typography>

          {/* Booking ID Chip */}
          <Chip
            label={`Booking ID: #${booking.bookingIdNumber}`}
            color="primary"
            sx={{ fontWeight: 800, fontSize: '0.9rem', px: 1, py: 2, mb: 4 }}
          />

          {/* Booking Summary Box */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              textAlign: 'left',
              mb: 4,
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Avatar src={booking.providerAvatar} alt={booking.providerName} sx={{ width: 50, height: 50, border: '2px solid #2563EB' }} />
              <Box>
                <Typography variant="subtitle1" fontWeight={800}>
                  {booking.providerName}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  {booking.serviceType === 'cook' ? 'Home Chef Service' : 'Housekeeping Maid Service'}
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ my: 1.5 }} />

            <Stack spacing={1.2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarMonthIcon fontSize="small" sx={{ color: 'primary.main' }} />
                <Typography variant="body2" fontWeight={600}>
                  Date: {booking.date}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon fontSize="small" sx={{ color: 'primary.main' }} />
                <Typography variant="body2" fontWeight={600}>
                  Time Slot: {booking.timeSlot}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <LocationOnIcon fontSize="small" sx={{ color: 'primary.main', mt: 0.2 }} />
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  {booking.address}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1 }}>
                <Typography variant="subtitle2" fontWeight={800}>
                  Total Paid
                </Typography>
                <Typography variant="subtitle1" fontWeight={800} color="primary.main">
                  ₹{booking.totalAmount}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Action Buttons */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/home')}
              sx={{ borderRadius: '12px', fontWeight: 700 }}
            >
              Go Home
            </Button>

            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<ReceiptLongIcon />}
              onClick={() => navigate('/my-bookings')}
              sx={{ borderRadius: '12px', fontWeight: 700 }}
            >
              View My Bookings
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default BookingSuccess;

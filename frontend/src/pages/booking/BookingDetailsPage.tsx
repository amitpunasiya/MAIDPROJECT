import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid2,
  Paper,
  Stack,
  Avatar,
  Divider,
  Breadcrumbs,
  Link,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VerifiedIcon from '@mui/icons-material/Verified';
import PhoneIcon from '@mui/icons-material/Phone';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import CancelIcon from '@mui/icons-material/Cancel';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';

import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { cancelBookingApi, getBookingDetails } from '../../store/bookingSlice';
import { BookingTimeline, BookingStatusChip, Button } from '../../components';
import { BookingStatus, IBookingRecord } from '../../types';

export const BookingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { bookings, loading } = useAppSelector((state) => state.booking);

  useEffect(() => {
    if (id) {
      void dispatch(getBookingDetails(id));
    }
  }, [dispatch, id]);

  const booking: IBookingRecord | undefined = bookings.find((b) => b.id === id) || bookings[0];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!booking) {
    return (
      <Container maxWidth="md" sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Booking Not Found
        </Typography>
        <Button variant="contained" onClick={() => navigate('/my-bookings')}>
          Back to Bookings
        </Button>
      </Container>
    );
  }

  const isCancelable = booking.status === BookingStatus.CONFIRMED || booking.status === BookingStatus.PENDING;

  const handleCancel = () => {
    void dispatch(cancelBookingApi({ id: booking.id }));
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 8 }}>
      {/* Top Header */}
      <Box sx={{ bgcolor: '#0F172A', color: '#FFF', py: 4, mb: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Breadcrumbs sx={{ '& a': { color: '#94A3B8', textDecoration: 'none', fontWeight: 600 } }}>
              <Link onClick={() => navigate('/home')} sx={{ cursor: 'pointer', '&:hover': { color: '#FFF' } }}>Home</Link>
              <Link onClick={() => navigate('/my-bookings')} sx={{ cursor: 'pointer', '&:hover': { color: '#FFF' } }}>Bookings</Link>
              <Typography variant="caption" color="#FFF" fontWeight={700}>#{booking.bookingIdNumber}</Typography>
            </Breadcrumbs>

            <Button
              size="small"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/my-bookings')}
              sx={{ color: '#FFF', borderColor: 'rgba(255,255,255,0.3)' }}
            >
              Back to History
            </Button>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight={900} color="#FFF">
                Booking #{booking.bookingIdNumber}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                Placed on {booking.createdAt}
              </Typography>
            </Box>

            <BookingStatusChip status={booking.status} />
          </Box>
        </Container>
      </Box>

      {/* Booking Details Cards */}
      <Container maxWidth="lg">
        <Grid2 container spacing={4}>
          <Grid2 size={{ xs: 12, md: 7 }}>
            {/* Staff Member Info */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFF', mb: 3 }}>
              <Typography variant="subtitle2" fontWeight={800} color="text.secondary" gutterBottom>
                Assigned Staff Professional
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar src={booking.providerAvatar} alt={booking.providerName} sx={{ width: 64, height: 64, border: '2px solid #2563EB' }} />
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" fontWeight={800}>
                      {booking.providerName}
                    </Typography>
                    <VerifiedIcon color="primary" sx={{ fontSize: 18 }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    {booking.serviceType === 'cook' ? 'Home Chef' : 'Housekeeper'} • {booking.phone}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<PhoneIcon />}
                  sx={{ ml: 'auto !important', fontWeight: 700, borderRadius: '8px' }}
                >
                  Call Staff
                </Button>
              </Stack>
            </Paper>

            {/* Service Address & Schedule */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFF', mb: 3 }}>
              <Typography variant="subtitle2" fontWeight={800} color="text.secondary" gutterBottom>
                Service Schedule & Address
              </Typography>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Scheduled Date</Typography>
                  <Typography variant="body2" fontWeight={700}>{booking.date}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Time Slot</Typography>
                  <Typography variant="body2" fontWeight={700}>{booking.timeSlot}</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Delivery Address</Typography>
                  <Typography variant="body2" fontWeight={700}>{booking.address}</Typography>
                </Box>
              </Stack>
            </Paper>

            {/* Service Tracking Timeline */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFF' }}>
              <Typography variant="subtitle2" fontWeight={800} color="text.secondary" gutterBottom>
                Live Service Status Tracking
              </Typography>
              <Box sx={{ mt: 2 }}>
                <BookingTimeline status={booking.status} />
              </Box>
            </Paper>
          </Grid2>

          {/* Pricing & Actions Column */}
          <Grid2 size={{ xs: 12, md: 5 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFF', mb: 3 }}>
              <Typography variant="h6" fontWeight={800} gutterBottom>
                Payment & Billing Details
              </Typography>
              <Stack spacing={1.5} sx={{ my: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Service Base Price</Typography>
                  <Typography variant="body2" fontWeight={700}>₹{booking.serviceCharge}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Platform Fee</Typography>
                  <Typography variant="body2" fontWeight={700}>₹{booking.platformFee}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">GST (18%)</Typography>
                  <Typography variant="body2" fontWeight={700}>₹{booking.gstAmount}</Typography>
                </Box>
                {booking.discountAmount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'success.main' }}>
                    <Typography variant="body2" fontWeight={700}>Coupon Discount</Typography>
                    <Typography variant="body2" fontWeight={700}>-₹{booking.discountAmount}</Typography>
                  </Box>
                )}
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1" fontWeight={800}>Total Amount</Typography>
                  <Typography variant="subtitle1" fontWeight={900} color="primary.main">₹{booking.totalAmount}</Typography>
                </Box>
              </Stack>
            </Paper>

            {/* Actions */}
            <Stack spacing={1.5}>
              {isCancelable && (
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  sx={{ borderRadius: '10px', py: 1.2, fontWeight: 700 }}
                >
                  Cancel Booking
                </Button>
              )}
              <Button
                variant="outlined"
                fullWidth
                startIcon={<EditCalendarIcon />}
                onClick={() => navigate(`/book/reschedule?id=${booking.id}`)}
                sx={{ borderRadius: '10px', py: 1.2, fontWeight: 700 }}
              >
                Reschedule Service Slot
              </Button>
              <Button
                variant="contained"
                fullWidth
                startIcon={<SupportAgentIcon />}
                onClick={() => navigate('/support')}
                sx={{ borderRadius: '10px', py: 1.2, fontWeight: 800 }}
              >
                Contact Support Team
              </Button>
            </Stack>
          </Grid2>
        </Grid2>
      </Container>
    </Box>
  );
};

export default BookingDetailsPage;

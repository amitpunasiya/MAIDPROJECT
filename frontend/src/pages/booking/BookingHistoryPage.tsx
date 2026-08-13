import React, { useState, useMemo } from 'react';
import { Box, Container, Typography, Grid2, Paper, Tabs, Tab } from '@mui/material';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useNavigate } from 'react-router-dom';

import { useAppSelector, useAppDispatch } from '../../hooks/useAppStore';
import { rebookBooking } from '../../store/bookingSlice';
import { BookingCard, Button } from '../../components';
import { BookingStatus } from '../../types';

export const BookingHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const bookings = useAppSelector((state) => state.booking.bookings);

  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (activeTab === 'upcoming') {
        return b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.PENDING;
      }
      if (activeTab === 'completed') {
        return b.status === BookingStatus.COMPLETED;
      }
      if (activeTab === 'cancelled') {
        return b.status === BookingStatus.CANCELLED || b.status === BookingStatus.REFUNDED;
      }
      return true;
    });
  }, [bookings, activeTab]);

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h3" fontWeight={800} color="text.primary">
              Booking History & Log
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              Track active, upcoming, completed, and cancelled staff visits.
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => navigate('/book')}
            sx={{ borderRadius: '12px', fontWeight: 800, px: 3 }}
          >
            New Booking
          </Button>
        </Box>

        {/* Filter Tabs */}
        <Paper elevation={0} sx={{ mb: 4, borderRadius: '16px', border: '1px solid #E2E8F0', p: 1, bgcolor: '#FFFFFF' }}>
          <Tabs value={activeTab} onChange={(_e, val) => setActiveTab(val)}>
            <Tab label={`All (${bookings.length})`} value="all" sx={{ fontWeight: 700, textTransform: 'none' }} />
            <Tab
              label={`Upcoming (${bookings.filter((b) => b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.PENDING).length})`}
              value="upcoming"
              sx={{ fontWeight: 700, textTransform: 'none' }}
            />
            <Tab
              label={`Completed (${bookings.filter((b) => b.status === BookingStatus.COMPLETED).length})`}
              value="completed"
              sx={{ fontWeight: 700, textTransform: 'none' }}
            />
            <Tab
              label={`Cancelled (${bookings.filter((b) => b.status === BookingStatus.CANCELLED || b.status === BookingStatus.REFUNDED).length})`}
              value="cancelled"
              sx={{ fontWeight: 700, textTransform: 'none' }}
            />
          </Tabs>
        </Paper>

        {/* Grid */}
        {filteredBookings.length === 0 ? (
          <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFF' }}>
            <BookmarkBorderIcon sx={{ fontSize: 56, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" fontWeight={800} gutterBottom>
              No Bookings Found
            </Typography>
            <Button variant="contained" onClick={() => navigate('/book')} sx={{ mt: 2 }}>
              Book Now
            </Button>
          </Paper>
        ) : (
          <Grid2 container spacing={3.5}>
            {filteredBookings.map((b) => (
              <Grid2 key={b.id} size={{ xs: 12, md: 6 }}>
                <BookingCard
                  booking={b}
                  onViewDetails={() => navigate(`/book/${b.id}`)}
                  onCancelBooking={() => navigate(`/book/${b.id}/cancel`)}
                  onRebook={(id) => {
                    dispatch(rebookBooking(id));
                    navigate('/book/success');
                  }}
                />
              </Grid2>
            ))}
          </Grid2>
        )}
      </Container>
    </Box>
  );
};

export default BookingHistoryPage;

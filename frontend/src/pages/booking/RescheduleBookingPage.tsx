import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';

import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { rescheduleBooking } from '../../store/bookingSlice';
import { DatePicker, TimeSlotGrid, Button } from '../../components';

export const RescheduleBookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const bookings = useAppSelector((state) => state.booking.bookings);

  const booking = bookings.find((b) => b.id === id) || bookings[0];

  const [selectedDate, setSelectedDate] = useState('2026-08-08');
  const [selectedSlot, setSelectedSlot] = useState('09:30 AM - 11:30 AM (Late Morning)');
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const handleConfirmReschedule = () => {
    if (booking) {
      dispatch(rescheduleBooking({ id: booking.id, date: selectedDate, slot: selectedSlot }));
      setConfirmModalOpen(false);
      navigate(`/book/${booking.id}`);
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="md">
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 3, borderRadius: '10px', fontWeight: 700 }}
        >
          Back to Booking Details
        </Button>

        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFF' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: '#DBEAFE',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <EditCalendarIcon sx={{ fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={800} color="text.primary">
                Reschedule Booking #{booking.bookingIdNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Currently scheduled for {booking.date} ({booking.timeSlot}).
              </Typography>
            </Box>
          </Box>

          <Alert severity="success" sx={{ mb: 3, borderRadius: 3 }}>
            Zero reschedule penalty fee! You can change your booking date and slot up to 2 hours before arrival.
          </Alert>

          <Stack spacing={3}>
            {/* New Date Picker */}
            <DatePicker
              selectedDate={selectedDate}
              onSelectDate={(d) => setSelectedDate(d)}
            />

            {/* New Time Slot Grid */}
            <TimeSlotGrid
              selectedSlot={selectedSlot}
              onSelectSlot={(s) => setSelectedSlot(s)}
            />

            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => setConfirmModalOpen(true)}
              sx={{ borderRadius: '12px', fontWeight: 800, py: 1.4 }}
            >
              Confirm Reschedule Date & Slot
            </Button>
          </Stack>
        </Paper>
      </Container>

      {/* Confirmation Dialog */}
      <Dialog open={confirmModalOpen} onClose={() => setConfirmModalOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>
          Confirm Reschedule Details
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Your booking with <b>{booking.providerName}</b> will be updated to:
          </Typography>
          <Box sx={{ mt: 1.5, p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
            <Typography variant="subtitle2" fontWeight={800} color="primary.main">
              📅 Date: {selectedDate}
            </Typography>
            <Typography variant="subtitle2" fontWeight={800} color="primary.main">
              ⏰ Slot: {selectedSlot}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button variant="outlined" onClick={() => setConfirmModalOpen(false)}>
            Go Back
          </Button>
          <Button variant="contained" color="primary" onClick={handleConfirmReschedule} sx={{ fontWeight: 800 }}>
            Confirm & Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RescheduleBookingPage;

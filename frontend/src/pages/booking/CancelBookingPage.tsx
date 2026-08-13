import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  MenuItem,
  Select,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CancelIcon from '@mui/icons-material/Cancel';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { cancelBooking } from '../../store/bookingSlice';
import { Button, Input } from '../../components';

export const CancelBookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const bookings = useAppSelector((state) => state.booking.bookings);

  const booking = bookings.find((b) => b.id === id) || bookings[0];

  const [reason, setReason] = useState('Change of plans');
  const [comments, setComments] = useState('');
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const handleConfirmCancel = () => {
    if (booking) {
      dispatch(cancelBooking(booking.id));
      setConfirmModalOpen(false);
      navigate('/book/history');
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="sm">
        {/* Back Link */}
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 3, borderRadius: '10px', fontWeight: 700 }}
        >
          Back to Details
        </Button>

        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFF' }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: '#FEF2F2',
                color: 'error.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <CancelIcon sx={{ fontSize: 36 }} />
            </Box>
            <Typography variant="h5" fontWeight={800} color="text.primary" gutterBottom>
              Cancel Booking #{booking.bookingIdNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please tell us why you are cancelling your service visit.
            </Typography>
          </Box>

          {/* Refund Guarantee Card */}
          <Alert severity="info" icon={<MonetizationOnIcon color="primary" />} sx={{ mb: 3, borderRadius: 3 }}>
            <Typography variant="subtitle2" fontWeight={800}>
              100% Full Refund Guarantee
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Since you are cancelling before 2 hours of the scheduled time slot, your full paid amount of ₹{booking.totalAmount} will be refunded to your source account within 24 hours.
            </Typography>
          </Alert>

          <Stack spacing={3}>
            {/* Reason Selector */}
            <FormControl fullWidth size="small">
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                Select Reason for Cancellation *
              </Typography>
              <Select value={reason} onChange={(e) => setReason(e.target.value)} sx={{ borderRadius: '10px' }}>
                <MenuItem value="Change of plans">Change of plans / Schedule conflict</MenuItem>
                <MenuItem value="Found alternative provider">Found alternative provider</MenuItem>
                <MenuItem value="Booked by mistake">Booked by mistake</MenuItem>
                <MenuItem value="Pricing concerns">Pricing concerns</MenuItem>
                <MenuItem value="Other">Other reason</MenuItem>
              </Select>
            </FormControl>

            {/* Additional Comments */}
            <Input
              label="Additional Feedback / Comments (Optional)"
              placeholder="Tell us more about how we can improve our service..."
              multiline
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />

            <Button
              variant="contained"
              color="error"
              size="large"
              onClick={() => setConfirmModalOpen(true)}
              sx={{ borderRadius: '12px', fontWeight: 800, py: 1.4 }}
            >
              Proceed to Cancel Booking
            </Button>
          </Stack>
        </Paper>
      </Container>

      {/* Confirmation Dialog */}
      <Dialog open={confirmModalOpen} onClose={() => setConfirmModalOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: 'error.main' }}>
          Are you sure you want to cancel?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This will permanently cancel your booking with <b>{booking.providerName}</b> for <b>{booking.date}</b> ({booking.timeSlot}).
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button variant="outlined" onClick={() => setConfirmModalOpen(false)}>
            Keep Booking
          </Button>
          <Button variant="contained" color="error" onClick={handleConfirmCancel} sx={{ fontWeight: 800 }}>
            Yes, Cancel Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CancelBookingPage;

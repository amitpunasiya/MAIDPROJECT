import React from 'react';
import { Paper, Box, Typography, Avatar, Stack, Divider, Button as MuiButton, Chip } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ReplayIcon from '@mui/icons-material/Replay';
import CancelIcon from '@mui/icons-material/Cancel';

import { IBookingRecord, BookingStatus } from '../../types';
import BookingStatusChip from './BookingStatusChip';

interface BookingCardProps {
  booking: IBookingRecord;
  onViewDetails: (booking: IBookingRecord) => void;
  onCancelBooking?: (bookingId: string) => void;
  onCancel?: (bookingId: string) => void;
  onRebook: (bookingId: string) => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onViewDetails,
  onCancelBooking,
  onCancel,
  onRebook,
}) => {
  const isUpcoming = booking.status === BookingStatus.CONFIRMED || booking.status === BookingStatus.PENDING;
  const isCompleted = booking.status === BookingStatus.COMPLETED;

  const handleCancel = () => {
    if (onCancelBooking) onCancelBooking(booking.id);
    else if (onCancel) onCancel(booking.id);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        border: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
        p: 3,
        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 10px 30px -4px rgba(15, 23, 42, 0.08)',
          borderColor: 'primary.light',
        },
      }}
    >
      {/* Top Bar: Booking ID & Status */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="subtitle2" fontWeight={800} color="text.primary">
            ID: #{booking.bookingIdNumber}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Booked on {booking.createdAt}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          {booking.slotType === 'CUSTOM' && (
            <Chip label="CUSTOM TIME BOOKING" size="small" color="secondary" sx={{ height: 22, fontSize: '0.65rem', fontWeight: 800 }} />
          )}
          <BookingStatusChip status={booking.status} />
        </Stack>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Staff / Provider Section */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Avatar src={booking.providerAvatar} alt={booking.providerName} sx={{ width: 52, height: 52, border: '2px solid #2563EB' }} />
        <Box>
          <Typography variant="subtitle1" fontWeight={800} color="text.primary">
            {booking.providerName}
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {booking.serviceType === 'cook' ? 'Home Chef Service' : 'Housekeeping Maid Service'}
          </Typography>
        </Box>
      </Stack>

      {/* Schedule & Address Details */}
      <Box sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: 3, mb: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarMonthIcon color="primary" fontSize="small" />
          <Typography variant="body2" fontWeight={700}>
            {booking.date}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccessTimeIcon color="primary" fontSize="small" />
          <Typography variant="body2" fontWeight={600} color="text.secondary">
            {booking.timeSlot}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <LocationOnIcon color="primary" fontSize="small" sx={{ mt: 0.2 }} />
          <Typography variant="body2" color="text.secondary" fontWeight={500} noWrap>
            {booking.address}
          </Typography>
        </Box>
      </Box>

      {/* Price & Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1 }}>
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={500} display="block">
            Total Amount
          </Typography>
          <Typography variant="subtitle1" fontWeight={900} color="primary.main">
            ₹{booking.totalAmount}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          {isUpcoming && (
            <MuiButton
              variant="outlined"
              color="error"
              size="small"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
              sx={{ borderRadius: '8px', fontWeight: 700, fontSize: '0.78rem' }}
            >
              Cancel
            </MuiButton>
          )}

          {isCompleted && (
            <MuiButton
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<ReplayIcon />}
              onClick={() => onRebook(booking.id)}
              sx={{ borderRadius: '8px', fontWeight: 700, fontSize: '0.78rem' }}
            >
              Rebook
            </MuiButton>
          )}

          <MuiButton
            variant="contained"
            color="primary"
            size="small"
            startIcon={<ReceiptLongIcon />}
            onClick={() => onViewDetails(booking)}
            sx={{ borderRadius: '8px', fontWeight: 800, fontSize: '0.78rem' }}
          >
            Details
          </MuiButton>
        </Stack>
      </Box>
    </Paper>
  );
};

export default BookingCard;

import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  Divider,
  Chip,
  Stack,
  InputAdornment,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ShieldIcon from '@mui/icons-material/Shield';
import { Button, Input } from '../';

interface BookingWidgetProps {
  serviceTitle: string;
  providerName?: string;
  startingPrice: string;
  onContinueBooking: (bookingData: { date: string; timeSlot: string; address: string }) => void;
}

const timeSlots = ['08:00 AM - 10:00 AM', '12:00 PM - 02:00 PM', '05:00 PM - 07:00 PM'];

export const BookingWidget: React.FC<BookingWidgetProps> = ({
  serviceTitle,
  providerName,
  startingPrice,
  onContinueBooking,
}) => {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState(timeSlots[0]);
  const [address, setAddress] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onContinueBooking({ date, timeSlot: selectedSlot, address });
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      elevation={4}
      sx={{
        p: 3.5,
        borderRadius: 4,
        border: '2px solid #2563EB',
        bgcolor: '#FFFFFF',
        boxShadow: '0 20px 40px -10px rgba(37, 99, 235, 0.15)',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={700}>
            ESTIMATED PRICE
          </Typography>
          <Typography variant="h4" fontWeight={800} color="primary.main">
            {startingPrice}
          </Typography>
        </Box>
        <Chip label="Instant Confirmation" color="success" size="small" sx={{ fontWeight: 800 }} />
      </Box>

      <Typography variant="subtitle2" fontWeight={800} color="text.primary" sx={{ mb: 2 }}>
        Book {providerName || serviceTitle}
      </Typography>

      <Divider sx={{ mb: 2.5 }} />

      {/* Select Date */}
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 0.8, display: 'block' }}>
          1. Select Booking Date
        </Typography>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarMonthIcon color="primary" fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ mb: 0 }}
        />
      </Box>

      {/* Select Time Slot */}
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 0.8, display: 'block' }}>
          2. Select Preferred Time Slot
        </Typography>
        <Stack spacing={1}>
          {timeSlots.map((slot) => (
            <Chip
              key={slot}
              label={slot}
              icon={<AccessTimeIcon fontSize="small" />}
              onClick={() => setSelectedSlot(slot)}
              color={selectedSlot === slot ? 'primary' : 'default'}
              variant={selectedSlot === slot ? 'filled' : 'outlined'}
              sx={{ fontWeight: 700, borderRadius: '10px', py: 1.8, justifyContent: 'flex-start', px: 1 }}
            />
          ))}
        </Stack>
      </Box>

      {/* Address */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 0.8, display: 'block' }}>
          3. Service Address / Area
        </Typography>
        <Input
          placeholder="e.g. HSR Layout, Sector 2, Bengaluru"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOnIcon color="primary" fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ mb: 0 }}
        />
      </Box>

      {/* Submit CTA */}
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        size="large"
        sx={{ py: 1.5, fontWeight: 800, borderRadius: '12px', fontSize: '1rem', mb: 2 }}
      >
        Continue Booking
      </Button>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
        <ShieldIcon sx={{ color: 'success.main', fontSize: 16 }} />
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          100% Satisfaction Guarantee & Free Cancellation
        </Typography>
      </Box>
    </Paper>
  );
};

export default BookingWidget;

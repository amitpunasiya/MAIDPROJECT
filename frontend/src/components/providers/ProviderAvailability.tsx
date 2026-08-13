import React, { useState } from 'react';
import { Paper, Box, Typography, Chip, Stack } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

interface ProviderAvailabilityProps {
  availableSlots?: string[];
}

const defaultSlots = [
  '07:00 AM - 09:00 AM',
  '09:30 AM - 11:30 AM',
  '12:00 PM - 02:00 PM',
  '04:30 PM - 06:30 PM',
  '07:00 PM - 09:00 PM',
];

export const ProviderAvailability: React.FC<ProviderAvailabilityProps> = ({
  availableSlots = defaultSlots,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<string>(availableSlots[0] || '07:00 AM - 09:00 AM');

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3.5,
        borderRadius: 4,
        border: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
        mb: 4,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <AccessTimeIcon color="primary" />
        <Typography variant="h6" fontWeight={800} color="text.primary">
          Available Booking Slots
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Select your preferred working slot for today or upcoming dates:
      </Typography>

      <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
        {availableSlots.map((slot) => {
          const isSelected = selectedSlot === slot;
          return (
            <Chip
              key={slot}
              label={slot}
              icon={<CalendarMonthIcon fontSize="small" />}
              onClick={() => setSelectedSlot(slot)}
              color={isSelected ? 'primary' : 'default'}
              variant={isSelected ? 'filled' : 'outlined'}
              sx={{
                fontWeight: 700,
                fontSize: '0.85rem',
                py: 2,
                px: 1,
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            />
          );
        })}
      </Stack>
    </Paper>
  );
};

export default ProviderAvailability;

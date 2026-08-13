import React from 'react';
import { Paper, Box, Typography, Avatar, Stack, Chip, Divider } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import VerifiedIcon from '@mui/icons-material/Verified';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { ICookProfile, IMaidProfile } from '../../types';

interface BookingSummaryProps {
  provider: ICookProfile | IMaidProfile | null;
  serviceType?: 'cook' | 'maid';
  serviceCategory?: string;
  date?: string;
  timeSlot?: string;
  address?: string;
  duration?: number;
  totalAmount?: number;
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({
  provider,
  serviceType = 'cook',
  serviceCategory,
  date,
  timeSlot,
  address,
  totalAmount,
}) => {
  if (!provider) return null;

  const currentType = serviceCategory === 'maid' ? 'maid' : serviceType;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        border: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
      }}
    >
      <Typography variant="h6" fontWeight={800} color="text.primary" gutterBottom>
        Selected Staff Summary
      </Typography>

      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Avatar src={provider.avatar} alt={provider.name} sx={{ width: 56, height: 56, border: '2px solid #2563EB' }} />
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Typography variant="subtitle1" fontWeight={800}>
              {provider.name}
            </Typography>
            {provider.verified && <VerifiedIcon sx={{ fontSize: 16, color: 'primary.main' }} />}
          </Box>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {currentType === 'cook' ? 'Home Chef' : 'Housekeeper'} • {provider.experienceYears} Yrs Exp
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
            <StarIcon sx={{ color: '#F59E0B', fontSize: 16 }} />
            <Typography variant="caption" fontWeight={800}>
              {provider.averageRating} ({provider.totalRatings})
            </Typography>
          </Box>
        </Box>
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Stack spacing={1.5}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarMonthIcon color="primary" fontSize="small" />
          <Typography variant="body2" fontWeight={600}>
            Date: {date || 'Selected Slot Date'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccessTimeIcon color="primary" fontSize="small" />
          <Typography variant="body2" fontWeight={600}>
            Time: {timeSlot || '08:00 AM - 10:00 AM'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <LocationOnIcon color="primary" fontSize="small" sx={{ mt: 0.2 }} />
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {address || `${provider.area}, ${provider.city}`}
          </Typography>
        </Box>
      </Stack>

      {totalAmount !== undefined && (
        <>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight={700}>
              Total Amount
            </Typography>
            <Chip label={`₹${totalAmount}`} color="primary" sx={{ fontWeight: 800, fontSize: '0.9rem' }} />
          </Box>
        </>
      )}
    </Paper>
  );
};

export default BookingSummary;

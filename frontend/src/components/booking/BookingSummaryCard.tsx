import React from 'react';
import { Paper, Box, Typography, Avatar, Stack, Chip, Divider } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import VerifiedIcon from '@mui/icons-material/Verified';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { ICookProfile, IMaidProfile } from '../../types';

interface BookingSummaryCardProps {
  provider: ICookProfile | IMaidProfile | null;
  serviceCategory: string;
  address: string;
  date: string;
  timeSlot: string;
  duration: number;
  totalAmount: number;
}

export const BookingSummaryCard: React.FC<BookingSummaryCardProps> = ({
  provider,
  serviceCategory,
  address,
  date,
  timeSlot,
  duration,
  totalAmount,
}) => {
  return (
    <Paper elevation={0} sx={{ p: 3.5, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', boxShadow: '0 4px 20px rgba(15,23,42,0.05)' }}>
      <Typography variant="h6" fontWeight={800} gutterBottom>
        Booking Summary & Checkout Confirmation
      </Typography>

      {provider && (
        <Stack direction="row" spacing={2} alignItems="center" sx={{ my: 2.5 }}>
          <Avatar src={provider.avatar} alt={provider.name} sx={{ width: 60, height: 60, border: '2.5px solid #2563EB' }} />
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Typography variant="subtitle1" fontWeight={800}>
                {provider.name}
              </Typography>
              {provider.verified && <VerifiedIcon sx={{ fontSize: 16, color: 'primary.main' }} />}
            </Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {serviceCategory.toUpperCase()} • {provider.experienceYears} Yrs Exp
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <StarIcon sx={{ color: '#F59E0B', fontSize: 16 }} />
              <Typography variant="caption" fontWeight={800}>
                {provider.averageRating} ({provider.totalRatings} Ratings)
              </Typography>
            </Box>
          </Box>
        </Stack>
      )}

      <Divider sx={{ my: 2 }} />

      <Stack spacing={1.8}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarMonthIcon color="primary" fontSize="small" />
          <Typography variant="body2" fontWeight={600}>
            Service Date: {date}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccessTimeIcon color="primary" fontSize="small" />
          <Typography variant="body2" fontWeight={600}>
            Time Slot: {timeSlot} ({duration} hrs duration)
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <LocationOnIcon color="primary" fontSize="small" sx={{ mt: 0.2 }} />
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            Address: {address}
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ my: 2.5 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" fontWeight={800}>
          Grand Total
        </Typography>
        <Chip label={`₹${totalAmount}`} color="primary" sx={{ fontWeight: 800, fontSize: '1rem', py: 2, px: 1 }} />
      </Box>
    </Paper>
  );
};

export default BookingSummaryCard;

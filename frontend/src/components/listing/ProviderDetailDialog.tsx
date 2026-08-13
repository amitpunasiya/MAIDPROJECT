import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  IconButton,
  Chip,
  Grid2,
  Avatar,
  Stack,
  Rating,
  Divider,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VerifiedIcon from '@mui/icons-material/Verified';
import TranslateIcon from '@mui/icons-material/Translate';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Button } from '../';
import { ICookProfile, IMaidProfile } from '../../types';

interface ProviderDetailDialogProps {
  open: boolean;
  onClose: () => void;
  provider: ICookProfile | IMaidProfile | null;
  type: 'cook' | 'maid';
  onBookNow: (provider: ICookProfile | IMaidProfile, type: 'cook' | 'maid') => void;
}

export const ProviderDetailDialog: React.FC<ProviderDetailDialogProps> = ({
  open,
  onClose,
  provider,
  type,
  onBookNow,
}) => {
  if (!provider) return null;

  const isCook = type === 'cook';
  const specializations = isCook
    ? (provider as ICookProfile).skills
    : (provider as IMaidProfile).services;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 5, overflow: 'hidden' },
      }}
    >
      {/* Header Banner */}
      <Box sx={{ position: 'relative', bgcolor: '#0F172A', color: '#FFF', p: 3, pt: 4 }}>
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', top: 12, right: 12, color: '#FFF', bgcolor: 'rgba(255,255,255,0.1)' }}
        >
          <CloseIcon />
        </IconButton>

        <Grid2 container spacing={3} alignItems="center">
          <Grid2 size={{ xs: 12, sm: 'auto' }}>
            <Avatar
              src={provider.avatar}
              alt={provider.name}
              sx={{ width: 96, height: 96, border: '3px solid #2563EB', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}
            />
          </Grid2>

          <Grid2 size={{ xs: 12, sm: 'auto' }} sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="h5" fontWeight={800} color="#FFF">
                {provider.name}
              </Typography>
              {provider.verified && (
                <Chip
                  icon={<VerifiedIcon sx={{ fontSize: '16px !important', color: '#FFF !important' }} />}
                  label="Police Verified"
                  color="primary"
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              )}
            </Box>

            <Typography variant="body2" sx={{ color: '#94A3B8', mb: 1.5 }}>
              📍 {provider.area}, {provider.city} • {provider.experienceYears} Years Experience
            </Typography>

            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Rating value={provider.averageRating} precision={0.1} readOnly size="small" />
                <Typography variant="body2" fontWeight={800} color="#FBBF24">
                  {provider.averageRating}
                </Typography>
                <Typography variant="caption" color="#94A3B8">
                  ({provider.totalRatings} Reviews)
                </Typography>
              </Box>

              <Chip
                label={`${provider.completedBookings}+ Bookings Done`}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#FFF', fontWeight: 700 }}
              />
            </Stack>
          </Grid2>
        </Grid2>
      </Box>

      {/* Dialog Body Content */}
      <DialogContent sx={{ p: 4 }}>
        <Grid2 container spacing={4}>
          {/* Left Column: About & Skills */}
          <Grid2 size={{ xs: 12, md: 7 }}>
            <Typography variant="h6" fontWeight={800} gutterBottom>
              About {provider.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7, mb: 3 }}>
              {provider.bio}
            </Typography>

            <Typography variant="subtitle1" fontWeight={800} gutterBottom>
              {isCook ? 'Cuisine & Culinary Specialties' : 'Housekeeping Services Offered'}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
              {specializations.map((spec) => (
                <Chip
                  key={spec}
                  label={spec}
                  color={isCook ? 'primary' : 'secondary'}
                  sx={{ fontWeight: 700, borderRadius: '8px' }}
                />
              ))}
            </Stack>

            <Typography variant="subtitle1" fontWeight={800} gutterBottom>
              Languages Spoken
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              {provider.languages.map((lang) => (
                <Chip key={lang} label={lang} variant="outlined" size="small" icon={<TranslateIcon fontSize="small" />} />
              ))}
            </Stack>
          </Grid2>

          {/* Right Column: Pricing & Guarantee Box */}
          <Grid2 size={{ xs: 12, md: 5 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                bgcolor: '#F8FAFC',
                border: '1px solid #E2E8F0',
              }}
            >
              <Typography variant="subtitle2" fontWeight={800} color="text.secondary" sx={{ mb: 2 }}>
                PRICING PACKAGES
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pb: 2, borderBottom: '1px solid #E2E8F0' }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={800}>
                    Hourly Rate
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Flexible on-demand slot
                  </Typography>
                </Box>
                <Typography variant="h6" fontWeight={800} color="primary.main">
                  ₹{provider.hourlyRate} / hr
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={800}>
                    Monthly Subscription
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    30 days dedicated service
                  </Typography>
                </Box>
                <Typography variant="h6" fontWeight={800} color="secondary.main">
                  ₹{provider.monthlyRate.toLocaleString()} / mo
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={1} sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon sx={{ color: 'success.main', fontSize: 18 }} />
                  <Typography variant="caption" fontWeight={700}>
                    100% Police & Aadhaar Verified
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon sx={{ color: 'success.main', fontSize: 18 }} />
                  <Typography variant="caption" fontWeight={700}>
                    Free Immediate Replacement Guarantee
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid2>
        </Grid2>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'space-between' }}>
        <Button variant="outlined" onClick={onClose} sx={{ width: 130, borderRadius: '10px' }}>
          Close
        </Button>
        <Button
          variant="contained"
          color={isCook ? 'primary' : 'secondary'}
          size="large"
          onClick={() => {
            onClose();
            onBookNow(provider, type);
          }}
          sx={{ px: 4, borderRadius: '10px', fontWeight: 700 }}
        >
          Book {provider.name} Now
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProviderDetailDialog;

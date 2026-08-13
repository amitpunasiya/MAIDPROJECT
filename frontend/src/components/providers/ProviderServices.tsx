import React from 'react';
import { Paper, Box, Typography, Grid2, Divider } from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { ICookProfile, IMaidProfile } from '../../types';

interface ProviderServicesProps {
  provider: ICookProfile | IMaidProfile;
  type: 'cook' | 'maid';
}

export const ProviderServices: React.FC<ProviderServicesProps> = ({
  provider,
  type,
}) => {
  const isCook = type === 'cook';

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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <LocalOfferIcon color="primary" />
        <Typography variant="h6" fontWeight={800} color="text.primary">
          Service Plans & Pricing
        </Typography>
      </Box>

      <Grid2 container spacing={3}>
        {/* Hourly Slot Plan */}
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              border: '2px solid #2563EB',
              bgcolor: '#F8FAFC',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
            }}
          >
            <Box>
              <Typography variant="caption" color="primary.main" fontWeight={800} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Flexi Booking
              </Typography>
              <Typography variant="h5" fontWeight={800} sx={{ mt: 0.5, mb: 1 }}>
                Hourly Service
              </Typography>
              <Typography variant="h4" fontWeight={800} color="primary.main" sx={{ mb: 2 }}>
                ₹{provider.hourlyRate} <Typography component="span" variant="body2" color="text.secondary">/ hour</Typography>
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleOutlineIcon color="primary" fontSize="small" />
                  <Typography variant="body2" fontWeight={600}>On-demand one-time slot</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleOutlineIcon color="primary" fontSize="small" />
                  <Typography variant="body2" fontWeight={600}>
                    {isCook ? 'Custom dish preparation' : 'Targeted room cleaning'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleOutlineIcon color="primary" fontSize="small" />
                  <Typography variant="body2" fontWeight={600}>Zero commitment needed</Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid2>

        {/* Monthly Subscription Plan */}
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              border: '2px solid #0D9488',
              bgcolor: '#F0FDF4',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
            }}
          >
            <Box>
              <Typography variant="caption" color="secondary.main" fontWeight={800} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Best Value Plan
              </Typography>
              <Typography variant="h5" fontWeight={800} sx={{ mt: 0.5, mb: 1 }}>
                Monthly Dedicated
              </Typography>
              <Typography variant="h4" fontWeight={800} color="secondary.main" sx={{ mb: 2 }}>
                ₹{provider.monthlyRate.toLocaleString()} <Typography component="span" variant="body2" color="text.secondary">/ month</Typography>
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleOutlineIcon color="secondary" fontSize="small" />
                  <Typography variant="body2" fontWeight={600}>Daily fixed time visit (30 Days)</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleOutlineIcon color="secondary" fontSize="small" />
                  <Typography variant="body2" fontWeight={600}>Free instant replacement guarantee</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleOutlineIcon color="secondary" fontSize="small" />
                  <Typography variant="body2" fontWeight={600}>Save up to 30% vs hourly booking</Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid2>
      </Grid2>
    </Paper>
  );
};

export default ProviderServices;

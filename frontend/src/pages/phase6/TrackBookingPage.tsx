import React, { useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid2,
  Paper,
  Stack,
  Avatar,
  Chip,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhoneIcon from '@mui/icons-material/Phone';
import ChatIcon from '@mui/icons-material/Chat';
import VerifiedIcon from '@mui/icons-material/Verified';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';

import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { getBookingTimeline } from '../../store/bookingSlice';
import { TrackingTimeline, Button } from '../../components';

export const TrackBookingPage: React.FC = () => {
  const { bookingId: paramBookingId } = useParams<{ bookingId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const bookingId = paramBookingId || searchParams.get('id') || 'BK-89421';
  const tracking = useAppSelector((state) => state.tracking);

  useEffect(() => {
    if (bookingId) {
      void dispatch(getBookingTimeline(bookingId));
    }
  }, [dispatch, bookingId]);

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 8 }}>
      {/* Top Header */}
      <Box sx={{ bgcolor: '#0F172A', color: '#FFF', py: 4, mb: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Button
              size="small"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/my-bookings')}
              sx={{ color: '#FFF', borderColor: 'rgba(255,255,255,0.3)' }}
            >
              Back to Bookings
            </Button>
            <Chip label="LIVE TRACKING" color="secondary" sx={{ fontWeight: 800 }} />
          </Box>

          <Typography variant="h3" fontWeight={800} color="#FFF">
            Live Tracking #{bookingId}
          </Typography>
          <Typography variant="body2" color="#94A3B8" sx={{ mt: 0.5 }}>
            Real-time GPS tracking and live status of your assigned staff.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Animated ETA Card */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 4,
            background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
            color: '#FFF',
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
              }}
            >
              <DirectionsRunIcon sx={{ fontSize: 32, color: '#FFF' }} />
            </Box>
            <Box>
              <Typography variant="caption" color="#94A3B8" fontWeight={700}>
                ESTIMATED ARRIVAL TIME
              </Typography>
              <Typography variant="h4" fontWeight={900} color="#60A5FA">
                {tracking.etaMinutes} Minutes
              </Typography>
            </Box>
          </Box>

          <Chip
            icon={<AccessTimeIcon sx={{ color: '#FFF !important' }} />}
            label="Staff Partner En Route"
            color="primary"
            sx={{ fontWeight: 800, px: 1 }}
          />
        </Paper>

        <Grid2 container spacing={4}>
          {/* Timeline Column */}
          <Grid2 size={{ xs: 12, md: 7 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFF' }}>
              <Typography variant="h6" fontWeight={800} gutterBottom>
                Service Execution Timeline
              </Typography>
              <Box sx={{ mt: 3 }}>
                <TrackingTimeline
                  currentStepIndex={tracking.currentStepIndex}
                />
              </Box>
            </Paper>
          </Grid2>

          {/* Assigned Staff Info Column */}
          <Grid2 size={{ xs: 12, md: 5 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFF', mb: 3 }}>
              <Typography variant="subtitle2" fontWeight={800} color="text.secondary" gutterBottom>
                Assigned Staff Member
              </Typography>

              <Stack direction="row" spacing={2} alignItems="center" sx={{ my: 2 }}>
                <Avatar
                  src={tracking.providerAvatar}
                  alt={tracking.providerName}
                  sx={{ width: 64, height: 64, border: '2px solid #2563EB' }}
                />
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <Typography variant="h6" fontWeight={800}>
                      {tracking.providerName}
                    </Typography>
                    <VerifiedIcon color="primary" sx={{ fontSize: 18 }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    {tracking.providerPhone}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<PhoneIcon />}
                  sx={{ borderRadius: '10px', fontWeight: 800 }}
                >
                  Call Staff
                </Button>
                <IconButton
                  sx={{ border: '1px solid #E2E8F0', borderRadius: '10px', p: 1.2, color: 'primary.main' }}
                >
                  <ChatIcon />
                </IconButton>
              </Stack>
            </Paper>
          </Grid2>
        </Grid2>
      </Container>
    </Box>
  );
};

export default TrackBookingPage;

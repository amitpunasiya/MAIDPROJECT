import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Container, Grid2, Typography, Breadcrumbs, Link, Button as MuiButton, CircularProgress } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import {
  ProviderHeader,
  ProviderProfile,
  ProviderServices,
  ProviderGallery,
  ProviderAvailability,
  ProviderLocation,
  ProviderReviews,
  FaqSection,
  QuickBookingDialog,
} from '../components';

import { MOCK_COOKS, MOCK_MAIDS } from '../services/mockData';
import { ICookProfile, IMaidProfile } from '../types';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import { getProviderDetails } from '../store/serviceSlice';

export const ProviderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { selectedProvider: apiProvider, providerDetailsLoading } = useAppSelector((state) => state.service);

  const typeParam = searchParams.get('type') as 'cook' | 'maid' | null;

  // Fetch live provider details from backend API
  useEffect(() => {
    if (id) {
      void dispatch(getProviderDetails(id));
    }
  }, [dispatch, id]);

  // Look up provider in API response first, then MOCK_COOKS, then MOCK_MAIDS
  const cookMatch = MOCK_COOKS.find((c) => c.id === id);
  const maidMatch = MOCK_MAIDS.find((m) => m.id === id);

  const provider: ICookProfile | IMaidProfile | null =
    apiProvider || cookMatch || maidMatch || MOCK_COOKS[0];

  const providerType: 'cook' | 'maid' =
    typeParam ||
    (apiProvider && 'skills' in apiProvider ? 'cook' : 'maid') ||
    (cookMatch ? 'cook' : 'maid');

  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

  if (providerDetailsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!provider) {
    return (
      <Container maxWidth="md" sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Provider Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          The requested provider profile does not exist or has been unlisted.
        </Typography>
        <MuiButton variant="contained" onClick={() => navigate('/providers')}>
          Back to Staff Directory
        </MuiButton>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 10 }}>
      {/* Top Breadcrumb Navigation */}
      <Box sx={{ bgcolor: '#0B132B', borderBottom: '1px solid rgba(255,255,255,0.1)', py: 1.5 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Breadcrumbs
              separator={<NavigateNextIcon fontSize="small" sx={{ color: 'rgba(255,255,255,0.4)' }} />}
              aria-label="breadcrumb"
            >
              <Link
                underline="hover"
                color="inherit"
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/home');
                }}
                sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: 500 }}
              >
                Home
              </Link>
              <Link
                underline="hover"
                color="inherit"
                href={providerType === 'cook' ? '/cooks' : '/maids'}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(providerType === 'cook' ? '/cooks' : '/maids');
                }}
                sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: 500 }}
              >
                {providerType === 'cook' ? 'Home Cooks' : 'House Maids'}
              </Link>
              <Typography color="primary.light" sx={{ fontSize: '0.85rem', fontWeight: 700 }}>
                {provider.name}
              </Typography>
            </Breadcrumbs>

            <MuiButton
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
              size="small"
              sx={{ color: '#FFF', fontWeight: 700, fontSize: '0.8rem' }}
            >
              Back
            </MuiButton>
          </Box>
        </Container>
      </Box>

      {/* Main Profile Layout */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid2 container spacing={4}>
          {/* Main Content Area */}
          <Grid2 size={{ xs: 12, md: 8 }}>
            <ProviderHeader provider={provider} type={providerType} onBookNow={() => setBookingDialogOpen(true)} />
            <Box sx={{ mt: 3 }}>
              <ProviderProfile provider={provider} type={providerType} />
            </Box>
            <Box sx={{ mt: 3 }}>
              <ProviderServices provider={provider} type={providerType} />
            </Box>
            <Box sx={{ mt: 3 }}>
              <ProviderGallery gallery={provider.gallery} providerName={provider.name} />
            </Box>
            <Box sx={{ mt: 3 }}>
              <ProviderReviews reviewsList={provider.reviewsList} averageRating={provider.averageRating} totalRatings={provider.totalRatings} />
            </Box>
          </Grid2>

          {/* Sidebar Area */}
          <Grid2 size={{ xs: 12, md: 4 }}>
            <ProviderAvailability availableSlots={provider.availableSlots} />
            <Box sx={{ mt: 3 }}>
              <ProviderLocation city={provider.city} area={provider.area} distance={provider.distance} />
            </Box>
          </Grid2>
        </Grid2>

        <Box sx={{ mt: 6 }}>
          <FaqSection />
        </Box>
      </Container>

      {/* Booking Dialog */}
      <QuickBookingDialog
        open={bookingDialogOpen}
        onClose={() => setBookingDialogOpen(false)}
        serviceTitle={providerType === 'cook' ? 'Home Chef Service' : 'Housekeeping Maid Service'}
        providerName={provider.name}
        estimatedPrice={`₹${provider.hourlyRate}/hr`}
      />
    </Box>
  );
};

export default ProviderDetails;

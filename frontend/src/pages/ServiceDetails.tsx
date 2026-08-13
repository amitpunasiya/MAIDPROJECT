import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid2,
  Typography,
  Breadcrumbs,
  Link,
  Button as MuiButton,
  Chip,
  Stack,
  Rating,
  Avatar,
  Divider,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VerifiedIcon from '@mui/icons-material/Verified';
import TranslateIcon from '@mui/icons-material/Translate';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';

import {
  BookingWidget,
  Gallery,
  ReviewCard,
  ProviderServices,
  ProviderLocation,
  ProviderAvailability,
  UnifiedProviderCard,
  QuickBookingDialog,
} from '../components';

import { MOCK_COOKS, MOCK_MAIDS } from '../services/mockData';
import { ICookProfile, IMaidProfile } from '../types';

export const ServiceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Search by ID or fallback
  const cookMatch = MOCK_COOKS.find((c) => c.id === id);
  const maidMatch = MOCK_MAIDS.find((m) => m.id === id);

  const provider: ICookProfile | IMaidProfile = cookMatch || maidMatch || MOCK_COOKS[0];
  const providerType: 'cook' | 'maid' = cookMatch ? 'cook' : 'maid';

  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingData, setBookingData] = useState<{ date: string; timeSlot: string; address: string } | null>(null);

  // Similar providers (exclude current)
  const similarProviders = (providerType === 'cook' ? MOCK_COOKS : MOCK_MAIDS)
    .filter((p) => p.id !== provider.id)
    .slice(0, 2);

  const handleStartBooking = (data: { date: string; timeSlot: string; address: string }) => {
    setBookingData(data);
    setBookingDialogOpen(true);
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 10 }}>
      {/* Top Navigation Bar */}
      <Box sx={{ bgcolor: '#0B132B', py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Breadcrumbs
              separator={<NavigateNextIcon fontSize="small" sx={{ color: '#64748B' }} />}
              sx={{ '& a': { color: '#94A3B8', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' } }}
            >
              <Link onClick={() => navigate('/home')} sx={{ cursor: 'pointer', '&:hover': { color: '#FFF' } }}>
                Home
              </Link>
              <Link onClick={() => navigate('/services')} sx={{ cursor: 'pointer', '&:hover': { color: '#FFF' } }}>
                Services
              </Link>
              <Typography variant="caption" sx={{ color: '#FFF', fontWeight: 700, fontSize: '0.85rem' }}>
                {provider.name}
              </Typography>
            </Breadcrumbs>

            <MuiButton
              size="small"
              startIcon={<ArrowBackIcon fontSize="small" />}
              onClick={() => navigate(-1)}
              sx={{ color: '#94A3B8', fontWeight: 700, textTransform: 'none', '&:hover': { color: '#FFF' } }}
            >
              Back
            </MuiButton>
          </Box>
        </Container>
      </Box>

      {/* Hero Banner Section */}
      <Box sx={{ bgcolor: '#0F172A', color: '#FFF', py: 6, position: 'relative', overflow: 'hidden' }}>
        <Container maxWidth="lg">
          <Grid2 container spacing={4} alignItems="center">
            <Grid2 size={{ xs: 12, md: 8 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                {provider.verified && (
                  <Chip
                    icon={<VerifiedIcon sx={{ fontSize: '16px !important', color: '#FFF !important' }} />}
                    label="Verified Professional"
                    color="primary"
                    size="small"
                    sx={{ fontWeight: 800 }}
                  />
                )}
                <Chip
                  label={providerType === 'cook' ? 'Culinary Specialist' : 'Housekeeping Expert'}
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#FFF', fontWeight: 700 }}
                />
              </Stack>

              <Typography variant="h3" fontWeight={800} color="#FFF" gutterBottom>
                {provider.name}
              </Typography>

              <Typography variant="body1" sx={{ color: '#94A3B8', mb: 2 }}>
                📍 {provider.area}, {provider.city} • {provider.experienceYears} Years Experience
              </Typography>

              <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(255,255,255,0.1)', px: 2, py: 0.8, borderRadius: 2 }}>
                  <Rating value={provider.averageRating} precision={0.1} readOnly size="small" />
                  <Typography variant="body1" fontWeight={800} color="#FBBF24">
                    {provider.averageRating}
                  </Typography>
                  <Typography variant="caption" color="#94A3B8">
                    ({provider.totalRatings} Reviews)
                  </Typography>
                </Box>
                <Typography variant="body2" fontWeight={700} color="#CBD5E1">
                  🏆 {provider.completedBookings}+ Bookings Completed
                </Typography>
              </Stack>
            </Grid2>

            <Grid2 size={{ xs: 12, md: 4 }} sx={{ textAlign: { md: 'right' } }}>
              <Avatar
                src={provider.avatar}
                alt={provider.name}
                sx={{
                  width: 140,
                  height: 140,
                  border: '4px solid #2563EB',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
                  ml: { md: 'auto' },
                }}
              />
            </Grid2>
          </Grid2>
        </Container>
      </Box>

      {/* Main Content Layout */}
      <Container maxWidth="lg" sx={{ mt: 5 }}>
        <Grid2 container spacing={4}>
          {/* Left Column: Full Details */}
          <Grid2 size={{ xs: 12, md: 7.5 }}>
            {/* About & Bio */}
            <Box sx={{ p: 3.5, bgcolor: '#FFF', borderRadius: 4, border: '1px solid #E2E8F0', mb: 4 }}>
              <Typography variant="h6" fontWeight={800} gutterBottom>
                About {provider.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.75, mb: 3 }}>
                {provider.bio}
              </Typography>

              <Divider sx={{ my: 2.5 }} />

              {/* Skills */}
              <Typography variant="subtitle1" fontWeight={800} gutterBottom>
                Skills & Specializations
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
                {(providerType === 'cook' ? (provider as ICookProfile).skills : (provider as IMaidProfile).services).map((s) => (
                  <Chip key={s} label={s} color="primary" sx={{ fontWeight: 700, borderRadius: '8px' }} />
                ))}
              </Stack>

              {/* Languages & Certificates */}
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" fontWeight={800} gutterBottom>
                    Languages Spoken
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    {provider.languages.map((l) => (
                      <Chip key={l} label={l} variant="outlined" size="small" icon={<TranslateIcon fontSize="small" />} />
                    ))}
                  </Stack>
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" fontWeight={800} gutterBottom>
                    Certifications & Verification
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WorkspacePremiumIcon color="warning" fontSize="small" />
                    <Typography variant="caption" fontWeight={700}>
                      Aadhaar & Police Clearance Verified
                    </Typography>
                  </Box>
                </Grid2>
              </Grid2>
            </Box>

            {/* Pricing Packages */}
            <ProviderServices provider={provider} type={providerType} />

            {/* Available Time Slots */}
            <ProviderAvailability availableSlots={provider.availableSlots} />

            {/* Location & Map Distance */}
            <ProviderLocation city={provider.city} area={provider.area} distance={provider.distance} />

            {/* Work Showcase Gallery */}
            <Gallery images={provider.gallery} title={`${provider.name}'s Work Showcase`} />

            {/* Customer Reviews Section */}
            <Typography variant="h6" fontWeight={800} gutterBottom sx={{ mb: 2 }}>
              Client Testimonials & Feedback
            </Typography>
            <Grid2 container spacing={2.5} sx={{ mb: 4 }}>
              {(provider.reviewsList || [
                {
                  id: 'r1',
                  userName: 'Rahul Verma',
                  rating: 5,
                  date: '3 days ago',
                  comment: 'Exceptional service! Extremely hygienic, well-mannered, and punctual.',
                },
                {
                  id: 'r2',
                  userName: 'Sneha Kapoor',
                  rating: 5,
                  date: '1 week ago',
                  comment: 'Highly recommended for any family looking for honest, reliable staff.',
                },
              ]).map((rev) => (
                <Grid2 key={rev.id} size={{ xs: 12, sm: 6 }}>
                  <ReviewCard review={rev} />
                </Grid2>
              ))}
            </Grid2>

            {/* Similar Providers Section */}
            <Typography variant="h6" fontWeight={800} gutterBottom sx={{ mb: 2 }}>
              Similar Recommended Professionals
            </Typography>
            <Grid2 container spacing={3}>
              {similarProviders.map((sim) => (
                <Grid2 key={sim.id} size={{ xs: 12, sm: 6 }}>
                  <UnifiedProviderCard provider={sim} type={providerType} onBookClick={() => setBookingDialogOpen(true)} />
                </Grid2>
              ))}
            </Grid2>
          </Grid2>

          {/* Right Column: Sticky Booking Widget */}
          <Grid2 size={{ xs: 12, md: 4.5 }}>
            <Box sx={{ position: 'sticky', top: 90 }}>
              <BookingWidget
                serviceTitle={`${providerType === 'cook' ? 'Chef' : 'Housemaid'} Booking`}
                providerName={provider.name}
                startingPrice={`₹${provider.hourlyRate}/hr`}
                onContinueBooking={handleStartBooking}
              />
            </Box>
          </Grid2>
        </Grid2>
      </Container>

      {/* Quick Booking Confirmation Dialog */}
      <QuickBookingDialog
        open={bookingDialogOpen}
        onClose={() => setBookingDialogOpen(false)}
        serviceTitle={provider.name}
        providerName={provider.name}
        estimatedPrice={bookingData ? `₹${provider.hourlyRate}/hr (${bookingData.timeSlot})` : `₹${provider.hourlyRate}/hr`}
      />
    </Box>
  );
};

export default ServiceDetails;

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid2,
  Paper,
  Tabs,
  Tab,
  Chip,
  Stack,
} from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import StarIcon from '@mui/icons-material/Star';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import VerifiedIcon from '@mui/icons-material/Verified';
import { Button } from '../';
import { MOCK_COOKS, MOCK_MAIDS } from '../../services/mockData';
import { ICookProfile, IMaidProfile } from '../../types';

interface FeaturedProvidersSectionProps {
  onBookProvider: (provider: ICookProfile | IMaidProfile, type: 'cook' | 'maid') => void;
}

export const FeaturedProvidersSection: React.FC<FeaturedProvidersSectionProps> = ({ onBookProvider }) => {
  const [filterTab, setFilterTab] = useState<'all' | 'cook' | 'maid'>('all');

  // Combine cook and maid profiles into normalized provider list
  const cookList = MOCK_COOKS.map((c) => ({ ...c, providerType: 'cook' as const }));
  const maidList = MOCK_MAIDS.map((m) => ({ ...m, providerType: 'maid' as const }));

  const combinedProviders = filterTab === 'cook'
    ? cookList
    : filterTab === 'maid'
    ? maidList
    : [...cookList, ...maidList];

  return (
    <Box id="featured-providers" sx={{ py: 10, bgcolor: '#FFFFFF' }}>
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'flex-end' }, mb: 5, gap: 2 }}>
          <Box>
            <Chip
              label="TOP RATED HELPERS"
              color="primary"
              size="small"
              sx={{ fontWeight: 800, mb: 1.5, letterSpacing: '0.05em' }}
            />
            <Typography variant="h3" fontWeight={800} color="text.primary">
              Featured Local Professionals
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              Police-verified cooks and maids with proven customer satisfaction scores.
            </Typography>
          </Box>

          {/* Filter Tabs */}
          <Tabs
            value={filterTab}
            onChange={(_e, val) => setFilterTab(val)}
            sx={{
              bgcolor: '#F1F5F9',
              borderRadius: '12px',
              p: 0.5,
              '& .MuiTabs-indicator': {
                bgcolor: '#FFFFFF',
                borderRadius: '8px',
                height: '100%',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              },
            }}
          >
            <Tab
              label="All Providers"
              value="all"
              sx={{ fontWeight: 700, zIndex: 2, minHeight: 42, px: 2.5 }}
            />
            <Tab
              label="Cooks"
              value="cook"
              icon={<RestaurantIcon fontSize="small" />}
              iconPosition="start"
              sx={{ fontWeight: 700, zIndex: 2, minHeight: 42, px: 2.5 }}
            />
            <Tab
              label="Maids"
              value="maid"
              icon={<CleaningServicesIcon fontSize="small" />}
              iconPosition="start"
              sx={{ fontWeight: 700, zIndex: 2, minHeight: 42, px: 2.5 }}
            />
          </Tabs>
        </Box>

        {/* Providers Grid */}
        <Grid2 container spacing={3.5}>
          {combinedProviders.map((provider) => {
            const isCook = provider.providerType === 'cook';
            const skillsOrServices = isCook
              ? (provider as ICookProfile).skills
              : (provider as IMaidProfile).services;

            return (
              <Grid2 key={provider.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper
                  elevation={0}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 4,
                    border: '1px solid #E2E8F0',
                    overflow: 'hidden',
                    bgcolor: '#FFFFFF',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: '0 18px 36px -6px rgba(15, 23, 42, 0.12)',
                      borderColor: isCook ? '#2563EB' : '#0D9488',
                    },
                  }}
                >
                  {/* Provider Image Header */}
                  <Box sx={{ position: 'relative' }}>
                    <Box
                      component="img"
                      src={provider.avatar}
                      alt={provider.name}
                      sx={{ width: '100%', height: 230, objectFit: 'cover' }}
                    />
                    <Chip
                      label={provider.isAvailable ? 'Available Today' : 'Slot Booked'}
                      color={provider.isAvailable ? 'success' : 'default'}
                      size="small"
                      sx={{ position: 'absolute', top: 14, right: 14, fontWeight: 800 }}
                    />
                    <Chip
                      icon={<VerifiedIcon sx={{ fontSize: '16px !important', color: '#FFF !important' }} />}
                      label="Police Verified"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 14,
                        left: 14,
                        fontWeight: 700,
                        bgcolor: 'rgba(15, 23, 42, 0.8)',
                        color: '#FFF',
                        backdropFilter: 'blur(8px)',
                      }}
                    />
                    <Chip
                      label={`₹${provider.hourlyRate}/hr`}
                      color={isCook ? 'primary' : 'secondary'}
                      size="small"
                      sx={{
                        position: 'absolute',
                        bottom: 14,
                        left: 14,
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      }}
                    />
                  </Box>

                  {/* Provider Info Body */}
                  <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" fontWeight={800} color="text.primary">
                        {provider.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <StarIcon sx={{ color: '#F59E0B', fontSize: 18 }} />
                        <Typography variant="body2" fontWeight={800}>
                          {provider.averageRating}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({provider.totalRatings})
                        </Typography>
                      </Box>
                    </Box>

                    {/* Metadata chips */}
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOnIcon fontSize="small" sx={{ color: 'text.secondary', fontSize: 16 }} />
                        <Typography variant="caption" fontWeight={600} color="text.secondary">
                          {provider.city}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <WorkHistoryIcon fontSize="small" sx={{ color: 'text.secondary', fontSize: 16 }} />
                        <Typography variant="caption" fontWeight={600} color="text.secondary">
                          {provider.experienceYears} Yrs Exp.
                        </Typography>
                      </Box>
                    </Stack>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.5, flexGrow: 1 }}>
                      {provider.bio}
                    </Typography>

                    {/* Skill tags */}
                    <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap sx={{ mb: 2.5 }}>
                      {skillsOrServices.slice(0, 3).map((item) => (
                        <Chip
                          key={item}
                          label={item}
                          variant="outlined"
                          color={isCook ? 'primary' : 'secondary'}
                          size="small"
                          sx={{ fontSize: '0.7rem', fontWeight: 600 }}
                        />
                      ))}
                    </Stack>

                    {/* Action Button */}
                    <Button
                      variant="contained"
                      color={isCook ? 'primary' : 'secondary'}
                      fullWidth
                      onClick={() => onBookProvider(provider, provider.providerType)}
                      sx={{ py: 1.2, fontWeight: 700, borderRadius: '10px' }}
                    >
                      Book {isCook ? 'Chef' : 'Maid'}
                    </Button>
                  </Box>
                </Paper>
              </Grid2>
            );
          })}
        </Grid2>
      </Container>
    </Box>
  );
};

export default FeaturedProvidersSection;

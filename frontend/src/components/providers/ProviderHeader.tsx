import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Chip,
  Avatar,
  Stack,
  Rating,
  IconButton,
  Tooltip,
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShareIcon from '@mui/icons-material/Share';
import NearMeIcon from '@mui/icons-material/NearMe';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import { Button } from '../';
import { ICookProfile, IMaidProfile } from '../../types';

interface ProviderHeaderProps {
  provider: ICookProfile | IMaidProfile;
  type: 'cook' | 'maid';
  onBookNow: () => void;
}

export const ProviderHeader: React.FC<ProviderHeaderProps> = ({
  provider,
  type,
  onBookNow,
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const isCook = type === 'cook';
  const distanceText = provider.distance || '2.4 km away';

  return (
    <Box
      sx={{
        bgcolor: '#0F172A',
        color: '#FFFFFF',
        pt: { xs: 4, md: 6 },
        pb: { xs: 6, md: 8 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Ambient Blur Circles */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 350,
          height: 350,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.25) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems={{ xs: 'flex-start', md: 'center' }}>
          {/* Avatar Photo */}
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={provider.avatar}
              alt={provider.name}
              sx={{
                width: { xs: 120, md: 150 },
                height: { xs: 120, md: 150 },
                border: '4px solid #2563EB',
                boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
              }}
            />
            {provider.isAvailable && (
              <Chip
                icon={<FlashOnIcon sx={{ fontSize: '14px !important', color: '#FFF !important' }} />}
                label="Available Today"
                color="success"
                size="small"
                sx={{
                  position: 'absolute',
                  bottom: -8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontWeight: 800,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                }}
              />
            )}
          </Box>

          {/* Profile Header Details */}
          <Box sx={{ flexGrow: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              {provider.verified && (
                <Chip
                  icon={<VerifiedIcon sx={{ fontSize: '16px !important', color: '#FFF !important' }} />}
                  label="100% Police Verified"
                  color="primary"
                  size="small"
                  sx={{ fontWeight: 800 }}
                />
              )}
              <Chip
                label={isCook ? 'Professional Chef' : 'Housekeeper'}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#FFF', fontWeight: 700 }}
              />
            </Stack>

            <Typography variant="h3" fontWeight={800} color="#FFF" gutterBottom sx={{ letterSpacing: '-0.02em' }}>
              {provider.name}
            </Typography>

            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
              <Typography variant="body1" sx={{ color: '#94A3B8', fontWeight: 500 }}>
                📍 {provider.area}, {provider.city}
              </Typography>
              <Typography variant="body1" sx={{ color: '#94A3B8', fontWeight: 500 }}>
                • {provider.experienceYears} Years Experience
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <NearMeIcon fontSize="small" sx={{ color: '#38BDF8', fontSize: 16 }} />
                <Typography variant="body2" fontWeight={800} sx={{ color: '#38BDF8' }}>
                  {distanceText}
                </Typography>
              </Box>
            </Stack>

            {/* Ratings & Stats Row */}
            <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap" useFlexGap>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(255,255,255,0.08)', px: 2, py: 0.8, borderRadius: 3 }}>
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
          </Box>

          {/* Action CTAs */}
          <Stack direction={{ xs: 'row', md: 'column' }} spacing={1.5} sx={{ width: { xs: '100%', md: 'auto' } }}>
            <Button
              variant="contained"
              color={isCook ? 'primary' : 'secondary'}
              size="large"
              onClick={onBookNow}
              sx={{ px: 4, py: 1.5, borderRadius: '12px', fontWeight: 800, minWidth: 180 }}
            >
              Book {provider.name.split(' ')[0]} Now
            </Button>

            <Stack direction="row" spacing={1} justifyContent="center">
              <Tooltip title={isFavorite ? 'Saved to Wishlist' : 'Add to Wishlist'}>
                <IconButton
                  onClick={() => setIsFavorite((prev) => !prev)}
                  sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: isFavorite ? '#EF4444' : '#FFF', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
                >
                  {isFavorite ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
                </IconButton>
              </Tooltip>

              <Tooltip title="Share Profile">
                <IconButton
                  onClick={() => navigator.clipboard?.writeText(window.location.href)}
                  sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#FFF', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
                >
                  <ShareIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default ProviderHeader;

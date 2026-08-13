import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Button } from '../';
import { ICookProfile, IMaidProfile } from '../../types';
import { ViewMode } from '../../store/serviceSlice';
import RatingStars from './RatingStars';
import PriceChip from './PriceChip';
import AvailabilityChip from './AvailabilityChip';

interface ProviderCardProps {
  provider: ICookProfile | IMaidProfile;
  type: 'cook' | 'maid';
  viewMode?: ViewMode;
  onBookClick: (provider: ICookProfile | IMaidProfile, type: 'cook' | 'maid') => void;
  onViewProfileClick: (provider: ICookProfile | IMaidProfile, type: 'cook' | 'maid') => void;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  type,
  viewMode = 'grid',
  onBookClick,
  onViewProfileClick,
}) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const isCook = type === 'cook';
  const skills = isCook
    ? (provider as ICookProfile).skills
    : (provider as IMaidProfile).services;

  const isList = viewMode === 'list';

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: isList ? { xs: 'column', sm: 'row' } : 'column',
        borderRadius: 4,
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
        bgcolor: '#FFFFFF',
        boxShadow: '0 4px 18px rgba(15, 23, 42, 0.04)',
        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: isList ? 'none' : 'translateY(-6px)',
          boxShadow: '0 20px 40px -6px rgba(15, 23, 42, 0.12)',
          borderColor: isCook ? '#2563EB' : '#0D9488',
          '& .provider-img': {
            transform: 'scale(1.05)',
          },
        },
      }}
    >
      {/* Provider Photo & Badge Container */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          width: isList ? { xs: '100%', sm: 260 } : '100%',
          height: isList ? { xs: 200, sm: 'auto' } : 220,
          flexShrink: 0,
        }}
      >
        <Box
          className="provider-img"
          component="img"
          src={provider.avatar}
          alt={provider.name}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
          }}
        />

        {/* Gradient Overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(15, 23, 42, 0.65) 0%, transparent 60%)',
          }}
        />

        {/* Verified Badge */}
        {provider.verified && (
          <Chip
            icon={<VerifiedIcon sx={{ fontSize: '15px !important', color: '#FFF !important' }} />}
            label="Verified"
            size="small"
            color="primary"
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              fontWeight: 800,
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          />
        )}

        {/* Wishlist Icon */}
        <Tooltip title={isFavorite ? 'Remove Favorite' : 'Save Favorite'}>
          <IconButton
            size="small"
            onClick={() => setIsFavorite((prev) => !prev)}
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              color: isFavorite ? '#EF4444' : '#64748B',
              '&:hover': { bgcolor: '#FFFFFF', transform: 'scale(1.1)' },
            }}
          >
            {isFavorite ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
          </IconButton>
        </Tooltip>

        {/* Available Today Badge */}
        <Box sx={{ position: 'absolute', bottom: 12, left: 12 }}>
          <AvailabilityChip isAvailable={provider.isAvailable} />
        </Box>
      </Box>

      {/* Card Content Body */}
      <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Box>
              <Typography variant="h6" fontWeight={800} color="text.primary" lineHeight={1.2}>
                {provider.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                📍 {provider.area}, {provider.city}
              </Typography>
            </Box>

            {/* Rating Stars Component */}
            <RatingStars rating={provider.averageRating} totalRatings={provider.totalRatings} />
          </Box>

          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1.5, mt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <WorkHistoryIcon fontSize="small" sx={{ color: 'text.secondary', fontSize: 16 }} />
              <Typography variant="caption" fontWeight={700} color="text.secondary">
                {provider.experienceYears} Yrs Experience
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LocationOnIcon fontSize="small" sx={{ color: 'text.secondary', fontSize: 16 }} />
              <Typography variant="caption" fontWeight={600} color="text.secondary">
                {provider.completedBookings}+ Done
              </Typography>
            </Box>
          </Stack>

          {/* Bio excerpt */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.5 }}>
            {provider.bio}
          </Typography>

          {/* Skills Chips */}
          <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap sx={{ mb: 2.5 }}>
            {skills.slice(0, 3).map((skill) => (
              <Chip
                key={skill}
                label={skill}
                variant="outlined"
                color={isCook ? 'primary' : 'secondary'}
                size="small"
                sx={{ fontSize: '0.7rem', fontWeight: 600 }}
              />
            ))}
          </Stack>
        </Box>

        {/* Pricing & CTA Buttons */}
        <Box sx={{ pt: 2, borderTop: '1px solid #F1F5F9' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                Starting Hourly Rate
              </Typography>
              <PriceChip price={`₹${provider.hourlyRate}`} period="hr" />
            </Box>

            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                Monthly Plan
              </Typography>
              <PriceChip price={`₹${provider.monthlyRate.toLocaleString()}`} period="mo" isMonthly />
            </Box>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              size="small"
              startIcon={<VisibilityIcon />}
              onClick={() => onViewProfileClick(provider, type)}
              sx={{ borderRadius: '10px', fontWeight: 700 }}
            >
              View Profile
            </Button>

            <Button
              variant="contained"
              color={isCook ? 'primary' : 'secondary'}
              fullWidth
              size="small"
              onClick={() => onBookClick(provider, type)}
              sx={{ borderRadius: '10px', fontWeight: 700 }}
            >
              Book Now
            </Button>
          </Stack>
        </Box>
      </Box>
    </Paper>
  );
};

export default ProviderCard;

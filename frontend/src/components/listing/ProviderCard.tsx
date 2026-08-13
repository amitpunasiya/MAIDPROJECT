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
import StarIcon from '@mui/icons-material/Star';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import VerifiedIcon from '@mui/icons-material/Verified';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import TranslateIcon from '@mui/icons-material/Translate';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import { Button } from '../';
import { ICookProfile, IMaidProfile } from '../../types';

interface ProviderCardProps {
  provider: ICookProfile | IMaidProfile;
  type: 'cook' | 'maid';
  onBookClick?: (provider: ICookProfile | IMaidProfile, type: 'cook' | 'maid') => void;
  onBookNow?: (provider: ICookProfile | IMaidProfile) => void;
  onViewDetailsClick?: (provider: ICookProfile | IMaidProfile, type: 'cook' | 'maid') => void;
  onViewDetails?: (provider: ICookProfile | IMaidProfile) => void;
  viewMode?: string;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  type,
  onBookClick,
  onBookNow,
  onViewDetailsClick,
  onViewDetails,
}) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const isCook = type === 'cook';
  const specializations = isCook
    ? (provider as ICookProfile).skills || []
    : (provider as IMaidProfile).services || [];

  const handleBook = () => {
    if (onBookClick) onBookClick(provider, type);
    else if (onBookNow) onBookNow(provider);
  };

  const handleView = () => {
    if (onViewDetailsClick) onViewDetailsClick(provider, type);
    else if (onViewDetails) onViewDetails(provider);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        border: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
        overflow: 'hidden',
        transition: 'all 0.25s ease',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.03)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 30px -4px rgba(15, 23, 42, 0.1)',
          borderColor: 'primary.light',
        },
      }}
    >
      {/* Top Media / Header Area */}
      <Box sx={{ position: 'relative', height: 210, bgcolor: '#F1F5F9', overflow: 'hidden' }}>
        <img
          src={provider.avatar}
          alt={provider.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* Favorite Overlay Button */}
        <IconButton
          onClick={() => setIsFavorite(!isFavorite)}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(4px)',
            '&:hover': { bgcolor: '#FFF' },
          }}
        >
          {isFavorite ? (
            <FavoriteIcon sx={{ color: 'error.main', fontSize: 20 }} />
          ) : (
            <FavoriteBorderIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
          )}
        </IconButton>

        {/* Verified Badge */}
        {provider.verified && (
          <Chip
            icon={<VerifiedIcon sx={{ fontSize: '0.9rem !important', color: '#FFF' }} />}
            label="Verified Pro"
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              bgcolor: 'primary.main',
              color: '#FFF',
              fontWeight: 800,
              fontSize: '0.7rem',
              boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
            }}
          />
        )}

        {/* Availability Badge */}
        <Box sx={{ position: 'absolute', bottom: 12, left: 12 }}>
          <Chip
            label={provider.isAvailable ? 'Available Today' : 'Booked out'}
            size="small"
            sx={{
              bgcolor: provider.isAvailable ? 'rgba(16, 185, 129, 0.95)' : 'rgba(100, 116, 139, 0.95)',
              color: '#FFF',
              fontWeight: 700,
              fontSize: '0.7rem',
              backdropFilter: 'blur(4px)',
            }}
          />
        </Box>
      </Box>

      {/* Profile Info Content */}
      <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box>
            <Typography variant="h6" fontWeight={800} color="text.primary" sx={{ lineHeight: 1.2 }}>
              {provider.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {provider.area}, {provider.city}
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'right' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <StarIcon sx={{ fontSize: 16, color: '#F59E0B' }} />
              <Typography variant="subtitle2" fontWeight={800} color="text.primary">
                {provider.averageRating.toFixed(1)}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              ({provider.totalRatings})
            </Typography>
          </Box>
        </Box>

        {/* Experience & Languages info */}
        <Stack direction="row" spacing={1.5} sx={{ my: 1.5 }}>
          <Chip
            icon={<WorkHistoryIcon sx={{ fontSize: '0.85rem !important' }} />}
            label={`${provider.experienceYears} yrs exp`}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.72rem', fontWeight: 700, borderColor: '#E2E8F0' }}
          />
          <Chip
            icon={<TranslateIcon sx={{ fontSize: '0.85rem !important' }} />}
            label={provider.languages.slice(0, 2).join(', ')}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.72rem', fontWeight: 600, borderColor: '#E2E8F0' }}
          />
        </Stack>

        {/* Skills / Services Chips */}
        <Box sx={{ mb: 2.5, display: 'flex', flexWrap: 'wrap', gap: 0.6, minHeight: 46 }}>
          {specializations.slice(0, 3).map((spec, idx) => (
            <Chip
              key={idx}
              label={spec}
              size="small"
              sx={{
                bgcolor: '#F1F5F9',
                color: '#334155',
                fontSize: '0.7rem',
                fontWeight: 600,
                borderRadius: '6px',
              }}
            />
          ))}
          {specializations.length > 3 && (
            <Chip
              label={`+${specializations.length - 3} more`}
              size="small"
              sx={{ bgcolor: '#F8FAFC', color: 'text.secondary', fontSize: '0.7rem' }}
            />
          )}
        </Box>

        {/* Price & Action Buttons */}
        <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={500} display="block">
              Starting from
            </Typography>
            <Typography variant="subtitle1" fontWeight={900} color="primary.main">
              ₹{provider.hourlyRate}
              <Typography component="span" variant="caption" color="text.secondary" fontWeight={600}>
                /hr
              </Typography>
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Tooltip title="View Profile">
              <IconButton
                onClick={handleView}
                sx={{
                  bgcolor: '#F1F5F9',
                  color: 'text.primary',
                  borderRadius: '10px',
                  '&:hover': { bgcolor: '#E2E8F0' },
                }}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<FlashOnIcon />}
              onClick={handleBook}
              sx={{ borderRadius: '10px', fontWeight: 800, px: 2, fontSize: '0.8rem' }}
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

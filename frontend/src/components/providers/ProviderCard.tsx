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
import VisibilityIcon from '@mui/icons-material/Visibility';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NearMeIcon from '@mui/icons-material/NearMe';
import { useNavigate } from 'react-router-dom';
import { Button } from '../';
import { ICookProfile, IMaidProfile } from '../../types';

interface ProviderCardProps {
  provider: ICookProfile | IMaidProfile;
  type: 'cook' | 'maid';
  viewMode?: 'grid' | 'list';
  onBookClick?: (provider: ICookProfile | IMaidProfile, type: 'cook' | 'maid') => void;
  onBookNow?: () => void;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  type,
  viewMode = 'grid',
  onBookClick,
  onBookNow,
}) => {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);

  const isCook = type === 'cook';
  const skills = isCook
    ? (provider as ICookProfile).skills || []
    : (provider as IMaidProfile).services || [];

  const isList = viewMode === 'list';

  const handleBook = () => {
    if (onBookClick) onBookClick(provider, type);
    else if (onBookNow) onBookNow();
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
        flexDirection: isList ? { xs: 'column', sm: 'row' } : 'column',
        height: '100%',
        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.03)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 30px -4px rgba(15, 23, 42, 0.1)',
          borderColor: 'primary.light',
        },
      }}
    >
      {/* Top Media / Avatar */}
      <Box
        sx={{
          position: 'relative',
          height: isList ? { xs: 200, sm: 'auto' } : 210,
          width: isList ? { xs: '100%', sm: 220 } : '100%',
          bgcolor: '#F1F5F9',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <img
          src={provider.avatar}
          alt={provider.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

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
            }}
          />
        )}
      </Box>

      {/* Content */}
      <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box>
            <Typography variant="h6" fontWeight={800} color="text.primary" sx={{ lineHeight: 1.2 }}>
              {provider.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <LocationOnIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {provider.area}, {provider.city}
              </Typography>
              {provider.distance && (
                <Chip
                  icon={<NearMeIcon sx={{ fontSize: '0.75rem !important' }} />}
                  label={provider.distance}
                  size="small"
                  sx={{ height: 18, fontSize: '0.65rem', ml: 0.5 }}
                />
              )}
            </Box>
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

        <Stack direction="row" spacing={1} sx={{ my: 1.5 }}>
          <Chip
            icon={<WorkHistoryIcon sx={{ fontSize: '0.85rem !important' }} />}
            label={`${provider.experienceYears} yrs exp`}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.72rem', fontWeight: 700 }}
          />
          <Chip
            icon={<FlashOnIcon sx={{ fontSize: '0.85rem !important', color: provider.isAvailable ? '#10B981' : '#64748B' }} />}
            label={provider.isAvailable ? 'Available' : 'Booked'}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.72rem', fontWeight: 700 }}
          />
        </Stack>

        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {skills.slice(0, 3).map((sk, idx) => (
            <Chip key={idx} label={sk} size="small" sx={{ bgcolor: '#F1F5F9', fontSize: '0.7rem', fontWeight: 600 }} />
          ))}
        </Box>

        <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" fontWeight={900} color="primary.main">
            ₹{provider.hourlyRate}
            <Typography component="span" variant="caption" color="text.secondary" fontWeight={600}>
              /hr
            </Typography>
          </Typography>

          <Stack direction="row" spacing={1}>
            <Tooltip title="View Profile">
              <IconButton onClick={() => navigate(`/providers/${provider.id}?type=${type}`)} size="small">
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Button variant="contained" size="small" onClick={handleBook} sx={{ borderRadius: '8px', fontWeight: 800 }}>
              Book
            </Button>
          </Stack>
        </Box>
      </Box>
    </Paper>
  );
};

export default ProviderCard;

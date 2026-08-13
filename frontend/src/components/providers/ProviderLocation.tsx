import React from 'react';
import { Paper, Box, Typography, Stack, Chip } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NavigationIcon from '@mui/icons-material/Navigation';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

interface ProviderLocationProps {
  city: string;
  area: string;
  distance?: string;
}

export const ProviderLocation: React.FC<ProviderLocationProps> = ({
  city,
  area,
  distance = '2.4 km away',
}) => {
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
        <LocationOnIcon color="primary" />
        <Typography variant="h6" fontWeight={800} color="text.primary">
          Service Location & Travel Distance
        </Typography>
      </Box>

      {/* Mock Map View Placeholder Box */}
      <Box
        sx={{
          height: 180,
          borderRadius: 3,
          bgcolor: '#E2E8F0',
          backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
          backgroundSize: '16px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
          border: '1px solid #CBD5E1',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            color: '#FFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(37, 99, 235, 0.4)',
            mb: 1,
          }}
        >
          <NavigationIcon />
        </Box>
        <Typography variant="subtitle2" fontWeight={800} color="text.primary">
          📍 {area}, {city}
        </Typography>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          Servicing within 5 km coverage radius
        </Typography>
      </Box>

      <Stack direction="row" spacing={2} alignItems="center">
        <Chip
          icon={<DirectionsCarIcon fontSize="small" />}
          label={`Estimated Travel Distance: ${distance}`}
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 800 }}
        />
        <Chip label="Home Visit Included" size="small" sx={{ fontWeight: 700 }} />
      </Stack>
    </Paper>
  );
};

export default ProviderLocation;

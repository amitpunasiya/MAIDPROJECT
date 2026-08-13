import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { Button } from '../';

interface EmptyListingStateProps {
  onResetFilters?: () => void;
  onReset?: () => void;
  title?: string;
  subtitle?: string;
}

export const EmptyListingState: React.FC<EmptyListingStateProps> = ({
  onResetFilters,
  onReset,
  title = 'No Professionals Found',
  subtitle = 'We couldn’t find any verified cooks or maids matching your exact filter criteria. Try expanding your price range or resetting filters.',
}) => {
  const handleReset = onResetFilters || onReset || (() => {});

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 4, sm: 6 },
        textAlign: 'center',
        borderRadius: 5,
        border: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
        my: 4,
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          bgcolor: '#F1F5F9',
          color: '#2563EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 3,
        }}
      >
        <PersonSearchIcon sx={{ fontSize: 44 }} />
      </Box>

      <Typography variant="h5" fontWeight={800} color="text.primary" gutterBottom>
        {title}
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ maxWidth: 500, mx: 'auto', mb: 4, lineHeight: 1.6 }}
      >
        {subtitle}
      </Typography>

      <Button
        variant="contained"
        color="primary"
        size="large"
        startIcon={<RestartAltIcon />}
        onClick={handleReset}
        sx={{ px: 4, borderRadius: '12px', fontWeight: 700 }}
      >
        Change & Reset Filters
      </Button>
    </Paper>
  );
};

export default EmptyListingState;

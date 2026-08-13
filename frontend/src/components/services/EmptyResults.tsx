import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { Button } from '../';

interface EmptyResultsProps {
  onResetFilters?: () => void;
  onReset?: () => void;
  title?: string;
  subtitle?: string;
}

export const EmptyResults: React.FC<EmptyResultsProps> = ({
  onResetFilters,
  onReset,
  title = 'No Matching Services Found',
  subtitle = 'We couldn’t find any verified cooks, maids or service packages matching your exact search or filter options.',
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
          width: 76,
          height: 76,
          borderRadius: '50%',
          bgcolor: '#F1F5F9',
          color: '#2563EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 2.5,
        }}
      >
        <SearchOffIcon sx={{ fontSize: 40 }} />
      </Box>

      <Typography variant="h5" fontWeight={800} color="text.primary" gutterBottom>
        {title}
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ maxWidth: 480, mx: 'auto', mb: 3.5, lineHeight: 1.6 }}
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
        Reset Filters & Clear Search
      </Button>
    </Paper>
  );
};

export default EmptyResults;

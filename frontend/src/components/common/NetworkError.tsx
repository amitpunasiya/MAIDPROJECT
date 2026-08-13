import React from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import RefreshIcon from '@mui/icons-material/Refresh';

export interface NetworkErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({
  title = 'Network Connection Lost',
  message = 'Please check your internet connection or try reconnecting.',
  onRetry,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 4,
        width: '100%',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 4,
          border: '1px solid #FCA5A5',
          bgcolor: '#FEF2F2',
          maxWidth: 480,
          textAlign: 'center',
          width: '100%',
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            bgcolor: '#FEE2E2',
            color: '#EF4444',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <WifiOffIcon sx={{ fontSize: 36 }} />
        </Box>

        <Typography variant="h6" fontWeight={800} color="#991B1B" gutterBottom>
          {title}
        </Typography>

        <Typography variant="body2" color="#B91C1C" sx={{ mb: 3 }}>
          {message}
        </Typography>

        {onRetry && (
          <Button
            variant="contained"
            color="error"
            startIcon={<RefreshIcon />}
            onClick={onRetry}
            sx={{ borderRadius: '10px', fontWeight: 700 }}
          >
            Retry Connection
          </Button>
        )}
      </Paper>
    </Box>
  );
};

export default NetworkError;

import React from 'react';
import { Box, Container, Typography, Paper, Button } from '@mui/material';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import ReplayIcon from '@mui/icons-material/Replay';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';

export const OfflinePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '85vh', display: 'flex', alignItems: 'center', py: 8 }}>
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{ p: { xs: 4, sm: 6 }, borderRadius: 5, border: '1px solid #E2E8F0', textAlign: 'center', bgcolor: 'background.paper' }}>
          <Box
            sx={{
              width: 88,
              height: 88,
              borderRadius: '50%',
              bgcolor: '#FEF2F2',
              color: '#EF4444',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <WifiOffIcon sx={{ fontSize: 52 }} />
          </Box>

          <Typography variant="h3" fontWeight={800} color="text.primary" gutterBottom>
            You are Offline
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            It looks like you've lost your internet connection. Some features may be unavailable until you reconnect.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<ReplayIcon />}
              onClick={() => window.location.reload()}
              sx={{ borderRadius: '12px', fontWeight: 800, px: 3 }}
            >
              Try Reconnecting
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/home')}
              sx={{ borderRadius: '12px', fontWeight: 700, px: 3 }}
            >
              Cached Home
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default OfflinePage;

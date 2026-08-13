import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import MemoryIcon from '@mui/icons-material/Memory';
import HomeIcon from '@mui/icons-material/Home';
import ReplayIcon from '@mui/icons-material/Replay';
import { useNavigate } from 'react-router-dom';

import { Button } from '../components';

export const ServerErrorPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', alignItems: 'center', py: 8 }}>
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{ p: 5, borderRadius: 5, border: '1px solid #E2E8F0', textAlign: 'center', bgcolor: '#FFF' }}>
          <Box
            sx={{
              width: 88,
              height: 88,
              borderRadius: '50%',
              bgcolor: '#FEF2F2',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <MemoryIcon sx={{ fontSize: 54 }} />
          </Box>

          <Typography variant="h3" fontWeight={800} color="text.primary" gutterBottom>
            500 Internal Server Error
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Our servers encountered a temporary issue. Please refresh or try again in a few moments.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="contained" startIcon={<ReplayIcon />} onClick={() => window.location.reload()} sx={{ borderRadius: '12px', fontWeight: 800 }}>
              Refresh Page
            </Button>
            <Button variant="outlined" startIcon={<HomeIcon />} onClick={() => navigate('/home')} sx={{ borderRadius: '12px', fontWeight: 700 }}>
              Back to Home
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ServerErrorPage;

import React, { useEffect } from 'react';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import SoupKitchenIcon from '@mui/icons-material/SoupKitchen';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';

export const Splash: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/home');
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #1E3A8A 100%)',
        color: '#FFFFFF',
        textAlign: 'center',
        p: 3,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative Glow */}
      <Box
        sx={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(80px)',
        }}
      />

      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #2563EB 0%, #0D9488 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 20px 40px rgba(37, 99, 235, 0.4)',
            mb: 3,
          }}
        >
          <SoupKitchenIcon sx={{ fontSize: 44, color: '#FFF' }} />
        </Box>

        <Typography variant="h3" fontWeight={800} gutterBottom sx={{ letterSpacing: '-0.02em' }}>
          Maid & Cook
        </Typography>
        <Typography variant="h6" color="#94A3B8" sx={{ maxWidth: 460, mb: 4, fontWeight: 400 }}>
          Book Trusted Home Cooks & Verified Maids On-Demand
        </Typography>

        <CircularProgress size={36} color="primary" sx={{ mb: 3 }} />

        <Button
          variant="outlined"
          color="inherit"
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate('/home')}
          sx={{ borderColor: 'rgba(255,255,255,0.3)', borderRadius: 3 }}
        >
          Skip to Home
        </Button>
      </Box>
    </Box>
  );
};

export default Splash;

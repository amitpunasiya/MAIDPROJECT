import React from 'react';
import { Box, Container } from '@mui/material';
import { Outlet } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 45%, #0F2942 100%)',
        py: { xs: 4, sm: 6 },
        px: 2,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative Blur Circles with Keyframe Glow */}
      <Box
        sx={{
          position: 'absolute',
          top: '-15%',
          left: '-10%',
          width: '550px',
          height: '550px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.28) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(80px)',
          zIndex: 0,
          pointerEvents: 'none',
          animation: 'floatAura 10s infinite alternate ease-in-out',
          '@keyframes floatAura': {
            '0%': { transform: 'scale(1) translate(0, 0)' },
            '100%': { transform: 'scale(1.1) translate(20px, 20px)' },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-15%',
          right: '-10%',
          width: '550px',
          height: '550px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(13, 148, 136, 0.25) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(80px)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1, py: 2 }}>
        <Outlet />
      </Container>
    </Box>
  );
};

export default AuthLayout;

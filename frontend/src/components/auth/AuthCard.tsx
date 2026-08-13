import React from 'react';
import { Paper, Box, Typography, Link } from '@mui/material';
import SoupKitchenIcon from '@mui/icons-material/SoupKitchen';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBackHome?: boolean;
}

export const AuthCard: React.FC<AuthCardProps> = ({
  children,
  title,
  subtitle,
  showBackHome = true,
}) => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        width: '100%',
        animation: 'fadeScaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        '@keyframes fadeScaleIn': {
          '0%': { opacity: 0, transform: 'scale(0.95) translateY(10px)' },
          '100%': { opacity: 1, transform: 'scale(1) translateY(0)' },
        },
      }}
    >
      {showBackHome && (
        <Link
          component="button"
          type="button"
          onClick={() => navigate('/home')}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            color: '#94A3B8',
            mb: 2.5,
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: 600,
            transition: 'color 0.2s ease',
            '&:hover': { color: '#FFFFFF' },
          }}
        >
          <ArrowBackIcon fontSize="small" /> Back to Home
        </Link>
      )}

      <Paper
        elevation={10}
        sx={{
          p: { xs: 3.5, sm: 4.5 },
          borderRadius: 5,
          bgcolor: 'rgba(255, 255, 255, 0.97)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 30px 60px -12px rgba(15, 23, 42, 0.45)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
        }}
      >
        {/* Brand Header */}
        <Box sx={{ textAlign: 'center', mb: 3.5 }}>
          <Box
            onClick={() => navigate('/home')}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #2563EB 0%, #0D9488 100%)',
              color: '#FFF',
              boxShadow: '0 6px 16px rgba(37, 99, 235, 0.35)',
              mb: 1.5,
              cursor: 'pointer',
            }}
          >
            <SoupKitchenIcon />
          </Box>
          <Typography
            variant="h5"
            fontWeight={800}
            sx={{
              background: 'linear-gradient(135deg, #0F172A 0%, #2563EB 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>

        {children}
      </Paper>
    </Box>
  );
};

export default AuthCard;

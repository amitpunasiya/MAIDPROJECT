import React from 'react';
import { Box, Button, Divider, Typography } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import AppleIcon from '@mui/icons-material/Apple';

interface SocialLoginUIProps {
  onGoogleClick?: () => void;
  onAppleClick?: () => void;
}

export const SocialLoginUI: React.FC<SocialLoginUIProps> = ({
  onGoogleClick,
  onAppleClick,
}) => {
  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Divider sx={{ my: 2 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          OR CONTINUE WITH
        </Typography>
      </Divider>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<GoogleIcon sx={{ color: '#EA4335' }} />}
          onClick={onGoogleClick}
          sx={{
            py: 1,
            borderRadius: '10px',
            borderColor: '#CBD5E1',
            color: 'text.primary',
            fontWeight: 700,
            fontSize: '0.85rem',
            '&:hover': { borderColor: '#94A3B8', bgcolor: '#F8FAFC' },
          }}
        >
          Google
        </Button>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<AppleIcon sx={{ color: '#000' }} />}
          onClick={onAppleClick}
          sx={{
            py: 1,
            borderRadius: '10px',
            borderColor: '#CBD5E1',
            color: 'text.primary',
            fontWeight: 700,
            fontSize: '0.85rem',
            '&:hover': { borderColor: '#94A3B8', bgcolor: '#F8FAFC' },
          }}
        >
          Apple
        </Button>
      </Box>
    </Box>
  );
};

export default SocialLoginUI;

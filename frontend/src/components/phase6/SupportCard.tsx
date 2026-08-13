import React from 'react';
import { Paper, Box, Typography, Button as MuiButton } from '@mui/material';

interface SupportCardProps {
  title: string;
  description: string;
  actionText: string;
  icon: React.ReactElement;
  color?: 'primary' | 'secondary' | 'success' | 'warning';
  onClick: () => void;
}

export const SupportCard: React.FC<SupportCardProps> = ({
  title,
  description,
  actionText,
  icon,
  color = 'primary',
  onClick,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        border: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
        boxShadow: '0 4px 18px rgba(15, 23, 42, 0.04)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justify: 'space-between',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 28px rgba(15, 23, 42, 0.08)',
        },
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '14px',
            bgcolor: `${color}.light`,
            color: `${color}.main`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          {icon}
        </Box>

        <Typography variant="h6" fontWeight={800} color="text.primary" gutterBottom>
          {title}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          {description}
        </Typography>
      </Box>

      <MuiButton
        variant="contained"
        color={color}
        fullWidth
        onClick={onClick}
        sx={{ borderRadius: '10px', fontWeight: 800, textTransform: 'none' }}
      >
        {actionText}
      </MuiButton>
    </Paper>
  );
};

export default SupportCard;

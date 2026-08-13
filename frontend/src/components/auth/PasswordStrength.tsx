import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';

interface PasswordStrengthProps {
  password?: string;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password = '' }) => {
  const getStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score += 25;
    if (/[A-Z]/.test(pwd)) score += 25;
    if (/[0-9]/.test(pwd)) score += 25;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 25;
    return score;
  };

  const score = getStrength(password);

  let label = 'Too Short';
  let color: 'error' | 'warning' | 'info' | 'success' = 'error';

  if (score >= 100) {
    label = 'Strong Password';
    color = 'success';
  } else if (score >= 75) {
    label = 'Good Password';
    color = 'info';
  } else if (score >= 50) {
    label = 'Medium Password';
    color = 'warning';
  }

  if (!password) return null;

  return (
    <Box sx={{ mt: 1, mb: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          Password Strength:
        </Typography>
        <Typography variant="caption" color={`${color}.main`} fontWeight={800}>
          {label}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={score}
        color={color}
        sx={{ height: 6, borderRadius: 3, bgcolor: '#E2E8F0' }}
      />
    </Box>
  );
};

export default PasswordStrength;

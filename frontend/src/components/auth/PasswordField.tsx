import React, { useState } from 'react';
import {
  TextField,
  IconButton,
  InputAdornment,
  Box,
  Typography,
  LinearProgress,
  TextFieldProps,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

export interface PasswordFieldProps extends Omit<TextFieldProps, 'type'> {
  showStrengthIndicator?: boolean;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  value = '',
  showStrengthIndicator = false,
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return { score: 0, label: '', color: 'inherit' as const, percent: 0 };

    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score, label: 'Weak Password', color: 'error' as const, percent: 33 };
    if (score <= 4) return { score, label: 'Medium Strength', color: 'warning' as const, percent: 66 };
    return { score, label: 'Strong Password', color: 'success' as const, percent: 100 };
  };

  const str = calculatePasswordStrength(String(value || ''));

  return (
    <Box sx={{ width: '100%' }}>
      <TextField
        {...rest}
        value={value}
        type={showPassword ? 'text' : 'password'}
        fullWidth
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <LockOutlinedIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword((prev) => !prev)}
                  edge="end"
                  aria-label="toggle password visibility"
                >
                  {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            bgcolor: '#FFFFFF',
            transition: 'all 0.2s ease',
            '&:hover fieldset': {
              borderColor: '#94A3B8',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2563EB',
              borderWidth: '2px',
            },
          },
          ...rest.sx,
        }}
      />

      {showStrengthIndicator && String(value).length > 0 && (
        <Box sx={{ mt: 1, px: 0.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Password Strength:
            </Typography>
            <Typography variant="caption" color={`${str.color}.main`} fontWeight={700}>
              {str.label}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={str.percent}
            color={str.color}
            sx={{ height: 6, borderRadius: 3, bgcolor: '#E2E8F0' }}
          />
        </Box>
      )}
    </Box>
  );
};

export default PasswordField;

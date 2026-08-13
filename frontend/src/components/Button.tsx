import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress } from '@mui/material';

export interface AppButtonProps extends MuiButtonProps {
  loading?: boolean;
  loadingText?: string;
}

export const Button: React.FC<AppButtonProps> = ({
  children,
  loading = false,
  loadingText,
  disabled,
  startIcon,
  ...props
}) => {
  return (
    <MuiButton
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={18} color="inherit" /> : startIcon}
      {...props}
    >
      {loading ? (loadingText || children) : children}
    </MuiButton>
  );
};

export default Button;

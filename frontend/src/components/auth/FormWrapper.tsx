import React from 'react';
import { Box, Alert } from '@mui/material';

interface FormWrapperProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  error?: string | null;
  success?: string | null;
}

export const FormWrapper: React.FC<FormWrapperProps> = ({
  children,
  onSubmit,
  error,
  success,
}) => {
  return (
    <Box component="form" onSubmit={onSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {error && (
        <Alert severity="error" sx={{ borderRadius: 3, fontWeight: 500 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ borderRadius: 3, fontWeight: 500 }}>
          {success}
        </Alert>
      )}

      {children}
    </Box>
  );
};

export default FormWrapper;

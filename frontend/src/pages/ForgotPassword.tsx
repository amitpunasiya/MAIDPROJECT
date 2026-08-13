import React, { useState } from 'react';
import { Typography, InputAdornment, Link, Box } from '@mui/material';
import ContactPhoneOutlinedIcon from '@mui/icons-material/ContactPhoneOutlined';
import SendIcon from '@mui/icons-material/Send';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button, Input, AuthCard, FormWrapper } from '../components';
import { useAuth } from '../hooks/useAuth';
import { forgotPasswordSchema, ForgotPasswordFormData } from '../utils/validationSchemas';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { forgotPassword, loading, error, clearError } = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      identifier: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLocalError(null);
    clearError();

    const isEmail = data.identifier.includes('@');
    const payload = isEmail ? { email: data.identifier } : { phone: data.identifier };

    try {
      await forgotPassword(payload);
      navigate('/verify-otp', {
        state: {
          mobile: data.identifier,
          from: 'forgot-password',
        },
      });
    } catch (err: unknown) {
      setLocalError(err instanceof Error ? err.message : 'Failed to request password reset.');
    }
  };

  return (
    <AuthCard
      title="Reset Your Password"
      subtitle="Enter your registered Mobile Number or Email address to receive a verification OTP code"
    >
      <FormWrapper onSubmit={handleSubmit(onSubmit)} error={localError || error}>
        <Controller
          name="identifier"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="Registered Mobile or Email"
              placeholder="e.g. 9876543210 or user@example.com"
              error={Boolean(errors.identifier)}
              helperText={errors.identifier?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <ContactPhoneOutlinedIcon color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          loading={loading}
          loadingText="Sending OTP..."
          endIcon={<SendIcon />}
          sx={{ py: 1.4, fontWeight: 700, borderRadius: '12px', mt: 1 }}
        >
          Send OTP Code
        </Button>
      </FormWrapper>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Remember your password?{' '}
          <Link
            component="button"
            type="button"
            onClick={() => navigate('/login')}
            fontWeight={700}
            color="primary.main"
            underline="hover"
          >
            Back to Login
          </Link>
        </Typography>
      </Box>
    </AuthCard>
  );
};

export default ForgotPassword;

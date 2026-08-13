import React, { useState } from 'react';
import { Typography, Link, Box } from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button, PasswordField, AuthCard, FormWrapper } from '../components';
import { useAuth } from '../hooks/useAuth';
import { resetPasswordSchema, ResetPasswordFormData } from '../utils/validationSchemas';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resetTokenFromUrl = searchParams.get('token') || 'demo-reset-token';

  const { resetPassword, loading, error, clearError } = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setLocalError(null);
    clearError();

    try {
      await resetPassword({
        resetToken: resetTokenFromUrl,
        newPassword: data.newPassword,
      });
      setIsSuccess(true);
    } catch (err: unknown) {
      setLocalError(err instanceof Error ? err.message : 'Failed to update password.');
    }
  };

  return (
    <AuthCard
      title="Set New Password"
      subtitle="Create a strong new password for your Maid & Cook account"
    >
      {isSuccess ? (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
          <Typography variant="h6" fontWeight={800} gutterBottom>
            Password Reset Successful!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Your account password has been updated. You can now log in using your new credentials.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => navigate('/login')}
            sx={{ py: 1.2, fontWeight: 700, borderRadius: '12px' }}
          >
            Go to Login
          </Button>
        </Box>
      ) : (
        <FormWrapper onSubmit={handleSubmit(onSubmit)} error={localError || error}>
          {/* New Password */}
          <Controller
            name="newPassword"
            control={control}
            render={({ field }) => (
              <PasswordField
                {...field}
                label="New Password"
                placeholder="At least 6 characters"
                showStrengthIndicator
                error={Boolean(errors.newPassword)}
                helperText={errors.newPassword?.message}
              />
            )}
          />

          {/* Confirm Password */}
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <PasswordField
                {...field}
                label="Confirm New Password"
                placeholder="Re-enter new password"
                error={Boolean(errors.confirmPassword)}
                helperText={errors.confirmPassword?.message}
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
            loadingText="Resetting Password..."
            startIcon={<LockResetIcon />}
            sx={{ py: 1.4, fontWeight: 700, borderRadius: '12px', mt: 1 }}
          >
            Update Password
          </Button>
        </FormWrapper>
      )}

      {!isSuccess && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Remember password?{' '}
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
      )}
    </AuthCard>
  );
};

export default ResetPassword;

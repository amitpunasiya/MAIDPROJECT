import React, { useState, useEffect } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import KeyIcon from '@mui/icons-material/Key';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button, OtpInput, AuthCard, FormWrapper } from '../components';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import { otpSchema, OtpFormData } from '../utils/validationSchemas';

export const OtpVerification: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp, sendOtp, loginDemoUser, loading, error, clearError } = useAuth();

  const stateData = (location.state as {
    mobile?: string;
    email?: string;
    fullName?: string;
    userType?: UserRole;
    from?: string;
  }) || {};

  const targetIdentifier = stateData.mobile || stateData.email || '+91 9876543210';
  const targetRole = stateData.userType || UserRole.CUSTOMER;

  const [timerSeconds, setTimerSeconds] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  });

  // Countdown timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timerSeconds]);

  const handleResend = async () => {
    if (!canResend) return;
    setTimerSeconds(60);
    setCanResend(false);
    setResendSuccess(true);
    setLocalError(null);
    clearError();
    setValue('otp', '');

    try {
      if (stateData.mobile) {
        await sendOtp(stateData.mobile);
      }
      setTimeout(() => setResendSuccess(false), 4000);
    } catch (err: unknown) {
      setLocalError(err instanceof Error ? err.message : 'Failed to resend OTP.');
    }
  };

  const onSubmit = async (data: OtpFormData) => {
    setLocalError(null);
    clearError();

    try {
      if (stateData.mobile) {
        await verifyOtp({
          phone: stateData.mobile,
          otp: data.otp,
        });
      } else {
        loginDemoUser(targetRole);
      }

      if (stateData.from === 'forgot-password') {
        navigate('/reset-password');
      } else {
        navigate('/home');
      }
    } catch (err: unknown) {
      setLocalError(err instanceof Error ? err.message : 'Invalid OTP. Please check the 6-digit code.');
    }
  };

  return (
    <AuthCard
      title="Enter Verification Code"
      subtitle={`We have sent a 6-digit OTP code to ${targetIdentifier}`}
    >
      <FormWrapper onSubmit={handleSubmit(onSubmit)} error={localError || error}>
        {resendSuccess && (
          <Alert severity="success" sx={{ borderRadius: 3 }}>
            New OTP code has been resent to your mobile/email!
          </Alert>
        )}

        {/* 6 Digit OTP Input */}
        <Controller
          name="otp"
          control={control}
          render={({ field }) => (
            <OtpInput
              value={field.value}
              onChange={(val) => {
                field.onChange(val);
                if (val.length === 6) {
                  handleSubmit(onSubmit)();
                }
              }}
              error={Boolean(errors.otp)}
            />
          )}
        />

        {errors.otp && (
          <Typography variant="caption" color="error" textAlign="center" fontWeight={600} display="block">
            {errors.otp.message}
          </Typography>
        )}

        {/* Timer & Resend OTP */}
        <Box sx={{ textAlign: 'center', my: 1 }}>
          {timerSeconds > 0 ? (
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Resend OTP in{' '}
              <Typography component="span" fontWeight={800} color="primary.main">
                {timerSeconds}s
              </Typography>
            </Typography>
          ) : (
            <Button
              variant="text"
              color="primary"
              onClick={handleResend}
              disabled={!canResend}
              startIcon={<RefreshIcon />}
              sx={{ fontWeight: 700 }}
            >
              Resend OTP Code
            </Button>
          )}
        </Box>

        {/* Verify Action Button */}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          loading={loading}
          loadingText="Verifying OTP..."
          startIcon={<KeyIcon />}
          endIcon={<CheckCircleOutlineIcon />}
          sx={{ py: 1.4, fontWeight: 700, borderRadius: '12px' }}
        >
          Verify & Proceed
        </Button>
      </FormWrapper>
    </AuthCard>
  );
};

export default OtpVerification;

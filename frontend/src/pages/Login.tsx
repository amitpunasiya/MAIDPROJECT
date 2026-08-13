import React, { useState } from 'react';
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Link,
  Divider,
  InputAdornment,
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SmsOutlinedIcon from '@mui/icons-material/SmsOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button, Input, PasswordField, AuthCard, FormWrapper } from '../components';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import { loginSchema, LoginFormData } from '../utils/validationSchemas';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginDemoUser, loading, error, clearError } = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      mobileOrEmail: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLocalError(null);
    clearError();

    const isEmail = data.mobileOrEmail.includes('@');
    const payload = {
      ...(isEmail ? { email: data.mobileOrEmail } : { phone: data.mobileOrEmail }),
      password: data.password,
    };

    try {
      await login(payload);
      navigate('/home');
    } catch (err: unknown) {
      setLocalError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    }
  };

  const handleLoginWithOtp = () => {
    navigate('/verify-otp', { state: { from: 'login' } });
  };

  const handleContinueAsGuest = () => {
    loginDemoUser(UserRole.CUSTOMER);
    navigate('/home');
  };

  const handleDemoRoleLogin = (role: UserRole) => {
    loginDemoUser(role);
    navigate('/home');
  };

  return (
    <AuthCard
      title="Welcome Back"
      subtitle="Sign in to access your home care bookings & verified helpers"
    >
      <FormWrapper onSubmit={handleSubmit(onSubmit)} error={localError || error}>
        {/* Mobile / Email Field */}
        <Controller
          name="mobileOrEmail"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="Mobile Number or Email"
              placeholder="e.g. 9876543210 or user@example.com"
              error={Boolean(errors.mobileOrEmail)}
              helperText={errors.mobileOrEmail?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineIcon color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        />

        {/* Password Field */}
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <PasswordField
              {...field}
              label="Password"
              placeholder="••••••••"
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
            />
          )}
        />

        {/* Remember me & Forgot Password */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <FormControlLabel
            control={<Checkbox color="primary" size="small" defaultChecked />}
            label={<Typography variant="body2" color="text.secondary" fontWeight={500}>Remember me</Typography>}
          />
          <Link
            component="button"
            type="button"
            onClick={() => navigate('/forgot-password')}
            variant="body2"
            fontWeight={700}
            color="primary.main"
            underline="hover"
          >
            Forgot Password?
          </Link>
        </Box>

        {/* Action Buttons */}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          loading={loading}
          loadingText="Signing In..."
          endIcon={<LockOutlinedIcon />}
          sx={{ py: 1.4, fontWeight: 700, borderRadius: '12px' }}
        >
          Login to Account
        </Button>

        {/* Login with OTP Button */}
        <Button
          variant="outlined"
          color="primary"
          size="large"
          fullWidth
          onClick={handleLoginWithOtp}
          startIcon={<SmsOutlinedIcon />}
          sx={{ py: 1.2, fontWeight: 700, borderRadius: '12px' }}
        >
          Login with OTP
        </Button>

        {/* Continue as Guest */}
        <Button
          variant="text"
          color="secondary"
          fullWidth
          onClick={handleContinueAsGuest}
          endIcon={<ArrowForwardIcon />}
          sx={{ fontWeight: 700 }}
        >
          Continue as Guest
        </Button>
      </FormWrapper>

      {/* Quick Demo Login Divider */}
      <Divider sx={{ my: 3 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={700}>
          QUICK DEMO LOGIN
        </Typography>
      </Divider>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="outlined"
          size="small"
          fullWidth
          onClick={() => handleDemoRoleLogin(UserRole.CUSTOMER)}
          sx={{ fontSize: '0.75rem', py: 0.8 }}
        >
          Customer
        </Button>
        <Button
          variant="outlined"
          size="small"
          fullWidth
          color="secondary"
          onClick={() => handleDemoRoleLogin(UserRole.COOK)}
          sx={{ fontSize: '0.75rem', py: 0.8 }}
        >
          Cook
        </Button>
        <Button
          variant="outlined"
          size="small"
          fullWidth
          color="secondary"
          onClick={() => handleDemoRoleLogin(UserRole.MAID)}
          sx={{ fontSize: '0.75rem', py: 0.8 }}
        >
          Maid
        </Button>
      </Box>

      {/* Register Link */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Don&apos;t have an account?{' '}
          <Link
            component="button"
            type="button"
            onClick={() => navigate('/register')}
            fontWeight={700}
            color="primary.main"
            underline="hover"
          >
            Register Now
          </Link>
        </Typography>
      </Box>
    </AuthCard>
  );
};

export default Login;

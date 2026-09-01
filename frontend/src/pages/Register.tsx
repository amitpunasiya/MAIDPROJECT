import React, { useState } from 'react';
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Link,
  InputAdornment,
  Grid2,
  Paper,
  FormHelperText,
  Chip,
  Divider,
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import ElderlyIcon from '@mui/icons-material/Elderly';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ParkIcon from '@mui/icons-material/Park';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import BuildIcon from '@mui/icons-material/Build';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';

import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button, Input, PasswordField, AuthCard, FormWrapper } from '../components';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import { registerSchema, RegisterFormData } from '../utils/validationSchemas';

export interface CategoryOption {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactElement;
  role: UserRole;
}

export const SERVICE_CATEGORIES: CategoryOption[] = [
  {
    id: 'cook',
    title: 'Home Cook',
    subtitle: 'Culinary & Meal Prep',
    icon: <RestaurantIcon sx={{ fontSize: 24, color: '#2563EB' }} />,
    role: UserRole.COOK,
  },
  {
    id: 'maid',
    title: 'House Maid',
    subtitle: 'Daily Housekeeping',
    icon: <CleaningServicesIcon sx={{ fontSize: 24, color: '#0D9488' }} />,
    role: UserRole.MAID,
  },
  {
    id: 'physiotherapist',
    title: 'Physiotherapist',
    subtitle: 'Home Visit Therapy',
    icon: <ElderlyIcon sx={{ fontSize: 24, color: '#0284C7' }} />,
    role: UserRole.PHYSIOTHERAPIST,
  },
  {
    id: 'occupational_therapist',
    title: 'Occupational Therapist',
    subtitle: 'ADL & Pediatric OT',
    icon: <ElderlyIcon sx={{ fontSize: 24, color: '#0D9488' }} />,
    role: UserRole.OCCUPATIONAL_THERAPIST,
  },
  {
    id: 'baby_sitter',
    title: 'Baby Sitter',
    subtitle: 'Child Care & Nanny',
    icon: <ChildCareIcon sx={{ fontSize: 24, color: '#EC4899' }} />,
    role: UserRole.MAID,
  },
  {
    id: 'elder_care',
    title: 'Elder Care',
    subtitle: 'Senior Companion',
    icon: <ElderlyIcon sx={{ fontSize: 24, color: '#8B5CF6' }} />,
    role: UserRole.MAID,
  },
  {
    id: 'patient_care',
    title: 'Patient Care',
    subtitle: 'Health & Recovery',
    icon: <LocalHospitalIcon sx={{ fontSize: 24, color: '#EF4444' }} />,
    role: UserRole.MAID,
  },
  {
    id: 'cleaner',
    title: 'Home Cleaner',
    subtitle: 'Deep House Cleaning',
    icon: <AutoAwesomeIcon sx={{ fontSize: 24, color: '#06B6D4' }} />,
    role: UserRole.MAID,
  },
  {
    id: 'gardener',
    title: 'Gardener',
    subtitle: 'Lawn & Plant Care',
    icon: <ParkIcon sx={{ fontSize: 24, color: '#10B981' }} />,
    role: UserRole.MAID,
  },
  {
    id: 'laundry',
    title: 'Laundry Helper',
    subtitle: 'Washing & Steam Ironing',
    icon: <LocalLaundryServiceIcon sx={{ fontSize: 24, color: '#3B82F6' }} />,
    role: UserRole.MAID,
  },
  {
    id: 'home_helper',
    title: 'General Helper',
    subtitle: 'Errands & Home Setup',
    icon: <HomeWorkIcon sx={{ fontSize: 24, color: '#6366F1' }} />,
    role: UserRole.MAID,
  },
  {
    id: 'other',
    title: 'Other Services',
    subtitle: 'Custom Home Help',
    icon: <BuildIcon sx={{ fontSize: 24, color: '#F59E0B' }} />,
    role: UserRole.MAID,
  },
];

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, sendOtp, clearError, error } = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);

  // Account Type Choice: 'customer' vs 'provider'
  const [accountType, setAccountType] = useState<'customer' | 'provider'>('customer');
  const [selectedServices, setSelectedServices] = useState<string[]>(['cook']);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      mobile: '',
      email: '',
      password: '',
      confirmPassword: '',
      userType: UserRole.CUSTOMER,
      termsAccepted: false,
    },
  });

  const handleAccountTypeChange = (type: 'customer' | 'provider') => {
    setAccountType(type);
    if (type === 'customer') {
      setValue('userType', UserRole.CUSTOMER, { shouldValidate: true });
    } else {
      setValue('userType', UserRole.PROVIDER, { shouldValidate: true });
    }
  };

  const handleToggleService = (catId: string) => {
    if (selectedServices.includes(catId)) {
      if (selectedServices.length > 1) {
        setSelectedServices(selectedServices.filter((id) => id !== catId));
      }
    } else {
      setSelectedServices([...selectedServices, catId]);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    setLocalError(null);
    clearError();

    try {
      await register({
        name: data.fullName,
        phone: data.mobile,
        email: data.email,
        password: data.password,
        role: accountType === 'customer' ? UserRole.CUSTOMER : UserRole.PROVIDER,
        isProvider: accountType === 'provider',
        services: accountType === 'provider' ? selectedServices : [],
        serviceTypes: accountType === 'provider' ? selectedServices : [],
      } as any);

      // Send OTP
      try {
        await sendOtp(data.mobile);
      } catch {
        // Ignored
      }

      navigate('/verify-otp', {
        state: {
          mobile: data.mobile,
          email: data.email,
          fullName: data.fullName,
          userType: accountType === 'provider' ? UserRole.PROVIDER : UserRole.CUSTOMER,
          services: accountType === 'provider' ? selectedServices : undefined,
          from: 'register',
        },
      });
    } catch (err: unknown) {
      setLocalError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    }
  };

  return (
    <AuthCard
      title="Create an Account"
      subtitle="Join 50,000+ happy homes and verified home service providers"
    >
      <FormWrapper onSubmit={handleSubmit(onSubmit)} error={localError || error}>
        {/* Account Type Toggle */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            SELECT YOUR ACCOUNT TYPE
          </Typography>

          <Grid2 container spacing={1.5}>
            <Grid2 size={{ xs: 6 }}>
              <Paper
                onClick={() => handleAccountTypeChange('customer')}
                elevation={0}
                sx={{
                  p: 1.5,
                  textAlign: 'center',
                  borderRadius: 3,
                  border: '2px solid',
                  borderColor: accountType === 'customer' ? 'primary.main' : '#E2E8F0',
                  bgcolor: accountType === 'customer' ? 'rgba(37, 99, 235, 0.06)' : '#F8FAFC',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  '&:hover': { borderColor: 'primary.main' },
                }}
              >
                {accountType === 'customer' && (
                  <CheckCircleIcon color="primary" sx={{ position: 'absolute', top: 6, right: 6, fontSize: 18 }} />
                )}
                <PersonIcon sx={{ fontSize: 28, color: accountType === 'customer' ? 'primary.main' : 'text.secondary', mb: 0.5 }} />
                <Typography variant="subtitle2" fontWeight={800} color={accountType === 'customer' ? 'primary.main' : 'text.primary'}>
                  Customer
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Book Cooks & Helpers
                </Typography>
              </Paper>
            </Grid2>

            <Grid2 size={{ xs: 6 }}>
              <Paper
                onClick={() => handleAccountTypeChange('provider')}
                elevation={0}
                sx={{
                  p: 1.5,
                  textAlign: 'center',
                  borderRadius: 3,
                  border: '2px solid',
                  borderColor: accountType === 'provider' ? 'primary.main' : '#E2E8F0',
                  bgcolor: accountType === 'provider' ? 'rgba(37, 99, 235, 0.06)' : '#F8FAFC',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  '&:hover': { borderColor: 'primary.main' },
                }}
              >
                {accountType === 'provider' && (
                  <CheckCircleIcon color="primary" sx={{ position: 'absolute', top: 6, right: 6, fontSize: 18 }} />
                )}
                <WorkOutlineIcon sx={{ fontSize: 28, color: accountType === 'provider' ? 'primary.main' : 'text.secondary', mb: 0.5 }} />
                <Typography variant="subtitle2" fontWeight={800} color={accountType === 'provider' ? 'primary.main' : 'text.primary'}>
                  Service Provider
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Offer Home Services
                </Typography>
              </Paper>
            </Grid2>
          </Grid2>
        </Box>

        {/* Multi-Service Picker when Service Provider is selected */}
        {accountType === 'provider' && (
          <Box sx={{ mb: 2.5, p: 2, bgcolor: '#F8FAFC', borderRadius: 3, border: '1px solid #E2E8F0' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="caption" fontWeight={800} color="primary.main">
                WHAT SERVICES DO YOU PROVIDE? (SELECT ALL THAT APPLY)
              </Typography>
              <Chip label={`${selectedServices.length} Selected`} size="small" color="primary" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800 }} />
            </Box>

            <Grid2 container spacing={1}>
              {SERVICE_CATEGORIES.map((cat) => {
                const isSelected = selectedServices.includes(cat.id);
                return (
                  <Grid2 key={cat.id} size={{ xs: 6, sm: 4 }}>
                    <Paper
                      onClick={() => handleToggleService(cat.id)}
                      elevation={0}
                      sx={{
                        p: 1.2,
                        borderRadius: 2.5,
                        border: '1.5px solid',
                        borderColor: isSelected ? 'primary.main' : '#CBD5E1',
                        bgcolor: isSelected ? '#EFF6FF' : '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        position: 'relative',
                        transition: 'all 0.15s ease',
                        '&:hover': { borderColor: 'primary.main' },
                      }}
                    >
                      {isSelected && (
                        <CheckCircleIcon color="primary" sx={{ position: 'absolute', top: 4, right: 4, fontSize: 16 }} />
                      )}
                      <Box sx={{ mb: 0.5 }}>{cat.icon}</Box>
                      <Typography variant="caption" fontWeight={800} display="block" color={isSelected ? 'primary.main' : 'text.primary'}>
                        {cat.title}
                      </Typography>
                    </Paper>
                  </Grid2>
                );
              })}
            </Grid2>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Full Name */}
        <Controller
          name="fullName"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="Full Name"
              placeholder="e.g. Anita Sharma"
              error={Boolean(errors.fullName)}
              helperText={errors.fullName?.message}
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

        {/* Mobile Number */}
        <Controller
          name="mobile"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="Mobile Number"
              placeholder="e.g. 9876543210"
              error={Boolean(errors.mobile)}
              helperText={errors.mobile?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIphoneIcon color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        />

        {/* Email Address */}
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="Email Address"
              type="email"
              placeholder="e.g. anita@example.com"
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        />

        {/* Password */}
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <PasswordField
              {...field}
              label="Password"
              placeholder="Min 8 chars, uppercase, lowercase & number"
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
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
              label="Confirm Password"
              placeholder="Re-enter your password"
              error={Boolean(errors.confirmPassword)}
              helperText={errors.confirmPassword?.message}
            />
          )}
        />

        {/* Terms and Conditions Checkbox */}
        <Controller
          name="termsAccepted"
          control={control}
          render={({ field }) => (
            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    color="primary"
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                    I agree to the{' '}
                    <Link href="/terms" target="_blank" underline="hover" color="primary">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" target="_blank" underline="hover" color="primary">
                      Privacy Policy
                    </Link>
                  </Typography>
                }
              />
              {errors.termsAccepted && (
                <FormHelperText error sx={{ ml: 1.5 }}>
                  {errors.termsAccepted.message}
                </FormHelperText>
              )}
            </Box>
          )}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          sx={{ py: 1.5, fontSize: '1rem', fontWeight: 700, mb: 2 }}
        >
          {accountType === 'customer'
            ? 'Create Customer Account'
            : `Register as Service Provider (${selectedServices.length} Selected)`}
        </Button>

        {/* Link to Login */}
        <Box sx={{ textAlign: 'center', mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Link
              component="button"
              type="button"
              variant="subtitle2"
              onClick={() => navigate('/login')}
              color="primary"
              sx={{ fontWeight: 700, textDecoration: 'none' }}
            >
              Sign In
            </Link>
          </Typography>
        </Box>
      </FormWrapper>
    </AuthCard>
  );
};

export default Register;

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Paper,
  Typography,
  Grid2,
  MenuItem,
  Select,
  FormControl,
  Alert,
  InputAdornment,
  TextField,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

import DashboardHeader from '../../components/dashboard/DashboardHeader';
import { Button, ProfileCard, AvatarUploader } from '../../components';
import { useAuth } from '../../hooks/useAuth';
import { mediaApi } from '../../services/api';

const profileSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  gender: z.enum(['Male', 'Female', 'Other']),
  dob: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
});

type ProfileFormInputs = z.infer<typeof profileSchema>;

export const DashboardProfile: React.FC = () => {
  const { user, updateProfile, getProfile, error } = useAuth();
  const [successMsg, setSuccessMsg] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormInputs>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      gender: 'Male',
      dob: '1995-06-15',
      address: 'Flat 402, Sunshine Apartments, HSR Layout Sector 2, Bengaluru',
      emergencyContact: '9876543211',
    },
  });

  useEffect(() => {
    void getProfile();
  }, [getProfile]);

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: 'Male',
        dob: '1995-06-15',
        address: 'Flat 402, Sunshine Apartments, HSR Layout Sector 2, Bengaluru',
        emergencyContact: '9876543211',
      });
    }
  }, [user, reset]);

  const genderValue = watch('gender');

  const handleAvatarUpload = async (file: File) => {
    try {
      setAvatarLoading(true);
      const res = await mediaApi.uploadAvatar(file);
      const newAvatarUrl = res.data?.avatarUrl || URL.createObjectURL(file);
      await updateProfile({ avatar: newAvatarUrl });
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 4000);
    } catch {
      setLocalError('Failed to upload avatar image');
    } finally {
      setAvatarLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormInputs) => {
    try {
      setLocalError(null);
      await updateProfile(data);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile';
      setLocalError(msg);
    }
  };

  return (
    <Box>
      <DashboardHeader title="My Profile Settings" subtitle="Manage your personal details, contact preferences & avatar." />

      {successMsg && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }} onClose={() => setSuccessMsg(false)}>
          Profile updated successfully!
        </Alert>
      )}

      {(error || localError) && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }} onClose={() => setLocalError(null)}>
          {error || localError}
        </Alert>
      )}

      <Grid2 container spacing={4}>
        {/* Left Profile Overview Card */}
        <Grid2 size={{ xs: 12, md: 4 }}>
          <ProfileCard
            user={user}
            onAvatarUpload={handleAvatarUpload}
            isLoading={avatarLoading}
          />
        </Grid2>

        {/* Right Form Card */}
        <Grid2 size={{ xs: 12, md: 8 }}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFF' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3.5 }}>
              <AvatarUploader
                currentAvatarUrl={user?.avatar}
                userName={user?.name || 'User'}
                size={64}
                onAvatarUpload={handleAvatarUpload}
                isLoading={avatarLoading}
              />
              <Box>
                <Typography variant="subtitle1" fontWeight={800}>
                  Update Personal Information
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Ensure your mobile number & email are up to date for booking alerts.
                </Typography>
              </Box>
            </Box>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid2 container spacing={2.5}>
                {/* Full Name */}
                <Grid2 size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Full Name"
                    placeholder="Enter full name"
                    {...register('name')}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                    size="small"
                    fullWidth
                  />
                </Grid2>

                {/* Email Address */}
                <Grid2 size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Email Address"
                    placeholder="Enter email address"
                    {...register('email')}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                    size="small"
                    fullWidth
                  />
                </Grid2>

                {/* Phone */}
                <Grid2 size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Mobile Phone"
                    placeholder="10-digit phone"
                    {...register('phone')}
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                    size="small"
                    fullWidth
                  />
                </Grid2>

                {/* Gender */}
                <Grid2 size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" sx={{ mb: 0.5 }}>
                    Gender
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={genderValue}
                      onChange={(e) => setValue('gender', e.target.value as any)}
                      sx={{ borderRadius: '10px', bgcolor: '#F8FAFC' }}
                    >
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid2>

                {/* Date of Birth */}
                <Grid2 size={{ xs: 12, sm: 6 }}>
                  <TextField
                    type="date"
                    label="Date of Birth"
                    {...register('dob')}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarMonthIcon sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                    size="small"
                    fullWidth
                  />
                </Grid2>

                {/* Emergency Contact */}
                <Grid2 size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Emergency Phone Contact"
                    placeholder="10-digit number"
                    {...register('emergencyContact')}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <ContactPhoneIcon sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                    size="small"
                    fullWidth
                  />
                </Grid2>

                {/* Street Address */}
                <Grid2 size={{ xs: 12 }}>
                  <TextField
                    label="Home / Default Location Address"
                    placeholder="Enter full address"
                    multiline
                    rows={2}
                    {...register('address')}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationOnIcon sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                    size="small"
                    fullWidth
                  />
                </Grid2>

                <Grid2 size={{ xs: 12 }} sx={{ mt: 1 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={isSubmitting}
                    sx={{ borderRadius: '10px', px: 4, fontWeight: 800 }}
                  >
                    {isSubmitting ? 'Saving Profile...' : 'Save Profile Changes'}
                  </Button>
                </Grid2>
              </Grid2>
            </form>
          </Paper>
        </Grid2>
      </Grid2>
    </Box>
  );
};

export default DashboardProfile;

import React from 'react';
import { Paper, Box, Typography, Stack, Chip, Divider } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

import AvatarUploader from './AvatarUploader';
import { AuthUser } from '../../services/api';

export interface ProfileCardProps {
  user: AuthUser | null;
  onAvatarUpload: (file: File) => Promise<void> | void;
  isLoading?: boolean;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  user,
  onAvatarUpload,
  isLoading = false,
}) => {
  if (!user) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3.5,
        borderRadius: 4,
        border: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
        textAlign: 'center',
        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
      }}
    >
      <Box sx={{ mb: 2 }}>
        <AvatarUploader
          currentAvatarUrl={user.avatar}
          userName={user.name || 'User'}
          size={110}
          onAvatarUpload={onAvatarUpload}
          isLoading={isLoading}
        />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.8, mb: 0.5 }}>
        <Typography variant="h6" fontWeight={800} color="text.primary">
          {user.name}
        </Typography>
        <VerifiedIcon color="primary" sx={{ fontSize: 18 }} />
      </Box>

      <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 2 }}>
        <Chip label={(user.role || 'CUSTOMER').toUpperCase()} color="primary" size="small" sx={{ fontWeight: 800 }} />
        {user.isPhoneVerified && <Chip label="Phone Verified" color="success" size="small" sx={{ fontWeight: 800 }} />}
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Stack spacing={1.5} sx={{ textAlign: 'left' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <EmailIcon color="action" fontSize="small" />
          <Typography variant="body2" color="text.secondary" fontWeight={600} noWrap>
            {user.email || 'No email provided'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <PhoneIcon color="action" fontSize="small" />
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            +91 {user.phone || '9876543210'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <LocationOnIcon color="action" fontSize="small" />
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            {user.city || 'Bengaluru'}, India
          </Typography>
        </Box>

        {user.createdAt && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CalendarMonthIcon color="action" fontSize="small" />
            <Typography variant="caption" color="text.secondary">
              Member since {new Date(user.createdAt).getFullYear() || 2026}
            </Typography>
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

export default ProfileCard;

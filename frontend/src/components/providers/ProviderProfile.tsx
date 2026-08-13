import React from 'react';
import { Paper, Box, Typography, Chip, Stack, Grid2, Divider } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import TranslateIcon from '@mui/icons-material/Translate';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { ICookProfile, IMaidProfile } from '../../types';

interface ProviderProfileProps {
  provider: ICookProfile | IMaidProfile;
  type: 'cook' | 'maid';
}

export const ProviderProfile: React.FC<ProviderProfileProps> = ({
  provider,
  type,
}) => {
  const isCook = type === 'cook';
  const skills = isCook
    ? (provider as ICookProfile).skills
    : (provider as IMaidProfile).services;

  const certificates = provider.certificates || [
    'Food Safety & Kitchen Hygiene Certified',
    'Government Skill Development Certificate',
    'Background Verification Cleared',
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3.5,
        borderRadius: 4,
        border: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
        mb: 4,
      }}
    >
      {/* About Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <InfoIcon color="primary" />
        <Typography variant="h6" fontWeight={800} color="text.primary">
          About {provider.name}
        </Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.75, mb: 3 }}>
        {provider.bio}
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* Verification & Badges */}
      <Grid2 container spacing={3} sx={{ mb: 3 }}>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <Box sx={{ p: 2, borderRadius: 3, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <VerifiedUserIcon sx={{ color: '#2563EB' }} />
              <Typography variant="subtitle2" fontWeight={800}>
                Background & Trust Verification
              </Typography>
            </Box>
            <Stack spacing={0.8}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon sx={{ color: 'success.main', fontSize: 16 }} />
                <Typography variant="caption" fontWeight={700}>Aadhaar Identity Verified</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon sx={{ color: 'success.main', fontSize: 16 }} />
                <Typography variant="caption" fontWeight={700}>Local Police Verification Clearance</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon sx={{ color: 'success.main', fontSize: 16 }} />
                <Typography variant="caption" fontWeight={700}>Address & Reference Checked</Typography>
              </Box>
            </Stack>
          </Box>
        </Grid2>

        <Grid2 size={{ xs: 12, sm: 6 }}>
          <Box sx={{ p: 2, borderRadius: 3, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <WorkspacePremiumIcon sx={{ color: '#F59E0B' }} />
              <Typography variant="subtitle2" fontWeight={800}>
                Certified Credentials
              </Typography>
            </Box>
            <Stack spacing={0.8}>
              {certificates.map((cert) => (
                <Box key={cert} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon sx={{ color: 'primary.main', fontSize: 16 }} />
                  <Typography variant="caption" fontWeight={700}>{cert}</Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </Grid2>
      </Grid2>

      <Divider sx={{ my: 3 }} />

      {/* Specializations & Skills */}
      <Typography variant="subtitle1" fontWeight={800} gutterBottom>
        {isCook ? 'Cuisines & Dietary Expertise' : 'Housekeeping & Maintenance Skills'}
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
        {skills.map((skill) => (
          <Chip
            key={skill}
            label={skill}
            color={isCook ? 'primary' : 'secondary'}
            sx={{ fontWeight: 700, borderRadius: '8px', px: 1 }}
          />
        ))}
      </Stack>

      {/* Languages Spoken */}
      <Typography variant="subtitle1" fontWeight={800} gutterBottom>
        Languages Spoken
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap">
        {provider.languages.map((lang) => (
          <Chip
            key={lang}
            label={lang}
            variant="outlined"
            size="small"
            icon={<TranslateIcon fontSize="small" />}
            sx={{ fontWeight: 600 }}
          />
        ))}
      </Stack>
    </Paper>
  );
};

export default ProviderProfile;

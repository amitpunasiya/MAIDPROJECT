import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid2,
  Paper,
  Chip,
} from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import BoltIcon from '@mui/icons-material/Bolt';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';

export const WhyChooseUsSection: React.FC = () => {
  const features = [
    {
      icon: <VerifiedUserIcon sx={{ fontSize: 36, color: '#2563EB' }} />,
      title: 'Verified Professionals',
      description: '3-tier verification including Aadhaar ID, local police record check, and physical address validation.',
      badge: 'Safety First',
      color: '#2563EB',
    },
    {
      icon: <AccountBalanceWalletIcon sx={{ fontSize: 36, color: '#0D9488' }} />,
      title: 'Affordable Prices',
      description: 'Transparent hourly & monthly pricing with zero hidden commission or agency lock-in fees.',
      badge: 'Best Value',
      color: '#0D9488',
    },
    {
      icon: <BoltIcon sx={{ fontSize: 36, color: '#F59E0B' }} />,
      title: 'Same Day Booking',
      description: 'Need urgent cooking or cleaning assistance? Get verified helpers at your home within 60 minutes.',
      badge: 'Fastest Delivery',
      color: '#F59E0B',
    },
    {
      icon: <SupportAgentIcon sx={{ fontSize: 36, color: '#8B5CF6' }} />,
      title: '24x7 Support',
      description: 'Dedicated customer success team to assist with replacements, custom menus, and scheduling requests.',
      badge: 'Always Active',
      color: '#8B5CF6',
    },
    {
      icon: <WorkspacePremiumIcon sx={{ fontSize: 36, color: '#EC4899' }} />,
      title: 'Experienced Staff',
      description: 'Handpicked home cooks and maids with minimum 3+ years experience and 4.8+ average customer ratings.',
      badge: 'Top Rated',
      color: '#EC4899',
    },
  ];

  return (
    <Box id="why-choose-us" sx={{ py: 10, bgcolor: '#FFFFFF' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', maxWidth: 700, mx: 'auto', mb: 8 }}>
          <Chip
            label="THE MAID & COOK ADVANTAGE"
            color="primary"
            size="small"
            sx={{ fontWeight: 800, mb: 1.5, letterSpacing: '0.05em' }}
          />
          <Typography variant="h3" fontWeight={800} color="text.primary" gutterBottom>
            Why Thousands Trust Us Daily
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
            We bring complete peace of mind, high hygiene standards, and total reliability to home care.
          </Typography>
        </Box>

        {/* Feature Cards */}
        <Grid2 container spacing={3.5} justifyContent="center">
          {features.map((item) => (
            <Grid2 key={item.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: 5,
                  border: '1px solid #E2E8F0',
                  bgcolor: '#F8FAFC',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 20px 40px -8px rgba(15, 23, 42, 0.1)',
                    bgcolor: '#FFFFFF',
                    borderColor: item.color,
                  },
                }}
              >
                {/* Decorative background glow */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 90,
                    height: 90,
                    borderRadius: '50%',
                    bgcolor: item.color,
                    opacity: 0.08,
                  }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 4,
                      bgcolor: '#FFFFFF',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Chip label={item.badge} size="small" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                </Box>

                <Typography variant="h6" fontWeight={800} color="text.primary" gutterBottom>
                  {item.title}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {item.description}
                </Typography>
              </Paper>
            </Grid2>
          ))}
        </Grid2>
      </Container>
    </Box>
  );
};

export default WhyChooseUsSection;

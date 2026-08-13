import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid2,
  Paper,
  Chip,
  Avatar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Search Service',
      description: 'Enter your city, preferred service (Cook, Maid or Combo), and select your desired date and meal time.',
      icon: <SearchIcon sx={{ color: '#2563EB', fontSize: 32 }} />,
      tag: 'Step 1',
    },
    {
      step: '02',
      title: 'Choose Provider',
      description: 'Compare profiles of verified local cooks & maids, check customer ratings, cuisine specialties & experience.',
      icon: <PersonSearchIcon sx={{ color: '#0D9488', fontSize: 32 }} />,
      tag: 'Step 2',
    },
    {
      step: '03',
      title: 'Book Service',
      description: 'Select one-time hourly slot or recurring monthly plan and complete your instant booking in seconds.',
      icon: <EventAvailableIcon sx={{ color: '#F59E0B', fontSize: 32 }} />,
      tag: 'Step 3',
    },
    {
      step: '04',
      title: 'Relax & Enjoy',
      description: 'Your background-checked helper arrives on time. Sit back while delicious food is prepared or your home shines.',
      icon: <SentimentVerySatisfiedIcon sx={{ color: '#10B981', fontSize: 32 }} />,
      tag: 'Step 4',
    },
  ];

  return (
    <Box id="how-it-works" sx={{ py: 10, bgcolor: '#F8FAFC' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', maxWidth: 700, mx: 'auto', mb: 8 }}>
          <Chip
            label="EFFORTLESS PROCESS"
            color="primary"
            size="small"
            sx={{ fontWeight: 800, mb: 1.5, letterSpacing: '0.05em' }}
          />
          <Typography variant="h3" fontWeight={800} color="text.primary" gutterBottom>
            How It Works
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
            Book your trusted home cook or house maid in 4 simple steps.
          </Typography>
        </Box>

        {/* Timeline UI Grid */}
        <Box sx={{ position: 'relative' }}>
          {/* Connector Line for Desktop */}
          <Box
            sx={{
              display: { xs: 'none', md: 'block' },
              position: 'absolute',
              top: '80px',
              left: '10%',
              right: '10%',
              height: '4px',
              bgcolor: '#E2E8F0',
              background: 'linear-gradient(90deg, #2563EB 0%, #0D9488 50%, #10B981 100%)',
              zIndex: 1,
              borderRadius: 2,
            }}
          />

          <Grid2 container spacing={4} sx={{ position: 'relative', zIndex: 2 }}>
            {steps.map((item) => (
              <Grid2 key={item.step} size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3.5,
                    height: '100%',
                    borderRadius: 5,
                    bgcolor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 18px rgba(15, 23, 42, 0.04)',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: '0 16px 32px -4px rgba(15, 23, 42, 0.12)',
                      borderColor: '#2563EB',
                    },
                  }}
                >
                  {/* Step Number Circle */}
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      mx: 'auto',
                      mb: 2.5,
                      bgcolor: '#F1F5F9',
                      border: '3px solid #FFFFFF',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                    }}
                  >
                    {item.icon}
                  </Avatar>

                  <Chip
                    label={item.tag}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 800, mb: 1.5, fontSize: '0.75rem' }}
                  />

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
        </Box>
      </Container>
    </Box>
  );
};

export default HowItWorksSection;

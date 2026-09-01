import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid2,
  Paper,
  Chip,
  Stack,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Button } from '../';
import { MOCK_MAIN_SERVICES, IMainServiceCard } from '../../services/mockData';

interface MainServicesSectionProps {
  onBookServiceClick: (service: IMainServiceCard) => void;
}

export const MainServicesSection: React.FC<MainServicesSectionProps> = ({ onBookServiceClick }) => {
  return (
    <Box id="services" sx={{ py: 10, bgcolor: '#FFFFFF' }}>
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', maxWidth: 700, mx: 'auto', mb: 7 }}>
          <Chip
            label="OUR CORE OFFERINGS"
            color="primary"
            size="small"
            sx={{ fontWeight: 800, mb: 1.5, letterSpacing: '0.05em' }}
          />
          <Typography variant="h3" fontWeight={800} color="text.primary" gutterBottom>
            Tailored Home Care Services
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
            Whether you need a master culinary chef, an efficient housemaid, or an all-in-one monthly combo, we have verified professionals ready for your home.
          </Typography>
        </Box>

        {/* Main Service Cards Grid */}
        <Grid2 container spacing={3.5}>
          {MOCK_MAIN_SERVICES.map((service) => (
            <Grid2 key={service.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 5,
                  overflow: 'hidden',
                  border: '1px solid #E2E8F0',
                  bgcolor: '#FFFFFF',
                  boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.06)',
                  transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px -8px rgba(15, 23, 42, 0.16)',
                    borderColor: '#2563EB',
                    '& .service-card-img': {
                      transform: 'scale(1.06)',
                    },
                  },
                }}
              >
                {/* Image Box */}
                <Box sx={{ position: 'relative', overflow: 'hidden', height: 240 }}>
                  <Box
                    className="service-card-img"
                    component="img"
                    src={service.image}
                    alt={service.title}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.5s ease',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(15, 23, 42, 0.8) 0%, transparent 60%)',
                    }}
                  />
                  <Chip
                    label={service.tag}
                    color={service.id === 'main-combo' ? 'secondary' : 'primary'}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      left: 16,
                      fontWeight: 800,
                      boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                    }}
                  />
                  <Box sx={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
                    <Typography variant="caption" sx={{ color: '#2DD4BF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Starts from {service.startingPrice}
                    </Typography>
                    <Typography variant="h5" fontWeight={800} color="#FFFFFF" lineHeight={1.2}>
                      {service.title}
                    </Typography>
                  </Box>
                </Box>

                {/* Card Content Body */}
                <Box sx={{ p: 3.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="subtitle2" fontWeight={700} color="primary.main" sx={{ mb: 1 }}>
                    {service.subtitle}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6, flexGrow: 1 }}>
                    {service.description}
                  </Typography>

                  {/* Feature Checkmarks */}
                  <Stack spacing={1.2} sx={{ mb: 3.5 }}>
                    {service.features.map((feature) => (
                      <Box key={feature} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleOutlineIcon sx={{ color: 'secondary.main', fontSize: 18 }} />
                        <Typography variant="body2" fontWeight={600} color="text.primary">
                          {feature}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>

                  {/* Book Button */}
                  <Button
                    variant="contained"
                    color={service.id === 'main-combo' ? 'secondary' : 'primary'}
                    fullWidth
                    size="large"
                    onClick={() => onBookServiceClick(service)}
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      py: 1.4,
                      fontWeight: 700,
                      borderRadius: '12px',
                    }}
                  >
                    Book {service.title}
                  </Button>
                </Box>
              </Paper>
            </Grid2>
          ))}
        </Grid2>
      </Container>
    </Box>
  );
};

export default MainServicesSection;

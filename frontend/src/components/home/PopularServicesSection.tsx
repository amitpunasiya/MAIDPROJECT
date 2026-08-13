import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid2,
  Paper,
  Chip,
  Rating,
  Stack,
} from '@mui/material';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import { Button } from '../';
import { MOCK_POPULAR_SERVICES, IPopularService } from '../../services/mockData';

interface PopularServicesSectionProps {
  onBookPopularService: (service: IPopularService) => void;
}

export const PopularServicesSection: React.FC<PopularServicesSectionProps> = ({ onBookPopularService }) => {
  return (
    <Box id="popular-services" sx={{ py: 10, bgcolor: '#F8FAFC' }}>
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', maxWidth: 700, mx: 'auto', mb: 7 }}>
          <Chip
            label="MOST REQUESTED"
            color="secondary"
            size="small"
            sx={{ fontWeight: 800, mb: 1.5, letterSpacing: '0.05em' }}
          />
          <Typography variant="h3" fontWeight={800} color="text.primary" gutterBottom>
            Popular Home Services
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
            Choose from our top-rated hourly and monthly plans crafted for modern urban households.
          </Typography>
        </Box>

        {/* 6 Popular Cards Grid */}
        <Grid2 container spacing={3.5}>
          {MOCK_POPULAR_SERVICES.map((item) => (
            <Grid2 key={item.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 4,
                  border: '1px solid #E2E8F0',
                  bgcolor: '#FFFFFF',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 16px 30px -4px rgba(15, 23, 42, 0.12)',
                    borderColor: item.category === 'cook' ? '#2563EB' : '#0D9488',
                  },
                }}
              >
                {/* Header Badge & Image */}
                <Box sx={{ position: 'relative', mb: 2 }}>
                  <Box
                    component="img"
                    src={item.image}
                    alt={item.title}
                    sx={{
                      width: '100%',
                      height: 180,
                      objectFit: 'cover',
                      borderRadius: 3,
                    }}
                  />
                  <Chip
                    label={item.badge}
                    color={item.category === 'cook' ? 'primary' : item.category === 'maid' ? 'secondary' : 'warning'}
                    size="small"
                    sx={{ position: 'absolute', top: 12, left: 12, fontWeight: 700 }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 12,
                      right: 12,
                      bgcolor: 'rgba(15, 23, 42, 0.85)',
                      color: '#FFF',
                      px: 1.2,
                      py: 0.4,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    {item.category === 'cook' ? (
                      <RestaurantIcon sx={{ fontSize: 16, color: '#FBBF24' }} />
                    ) : (
                      <CleaningServicesIcon sx={{ fontSize: 16, color: '#2DD4BF' }} />
                    )}
                    <Typography variant="caption" fontWeight={700}>
                      {item.category.toUpperCase()}
                    </Typography>
                  </Box>
                </Box>

                {/* Content */}
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" fontWeight={700} color="text.primary">
                      {item.title}
                    </Typography>
                  </Box>

                  {/* Ratings */}
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                    <Rating value={item.rating} precision={0.1} readOnly size="small" />
                    <Typography variant="body2" fontWeight={700} color="text.primary">
                      {item.rating}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ({item.reviewsCount} reviews)
                    </Typography>
                  </Stack>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.5, flexGrow: 1 }}>
                    {item.description}
                  </Typography>

                  {/* Feature Tags */}
                  <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap sx={{ mb: 2.5 }}>
                    {item.features.map((feat) => (
                      <Chip
                        key={feat}
                        label={feat}
                        variant="outlined"
                        size="small"
                        sx={{ fontSize: '0.7rem', fontWeight: 600, borderColor: '#CBD5E1' }}
                      />
                    ))}
                  </Stack>

                  {/* Price & Action */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 2, borderTop: '1px solid #F1F5F9' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block" fontWeight={500}>
                        Pricing
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={800} color="primary.main">
                        {item.price}
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<FlashOnIcon />}
                      onClick={() => onBookPopularService(item)}
                      sx={{ borderRadius: '10px', px: 2.5 }}
                    >
                      Book Now
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Grid2>
          ))}
        </Grid2>
      </Container>
    </Box>
  );
};

export default PopularServicesSection;

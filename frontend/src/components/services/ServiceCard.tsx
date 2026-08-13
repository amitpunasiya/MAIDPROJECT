import React from 'react';
import { Box, Paper, Typography, Chip, Stack } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Button } from '../';
import { IMainServiceCard } from '../../services/mockData';
import PriceChip from './PriceChip';

interface ServiceCardProps {
  service: IMainServiceCard;
  onBookClick: (service: IMainServiceCard) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onBookClick }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 4,
        overflow: 'hidden',
        border: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
        boxShadow: '0 4px 18px rgba(15, 23, 42, 0.04)',
        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: '0 20px 40px -6px rgba(15, 23, 42, 0.12)',
          borderColor: '#2563EB',
          '& .service-img': {
            transform: 'scale(1.05)',
          },
        },
      }}
    >
      <Box sx={{ position: 'relative', overflow: 'hidden', height: 210 }}>
        <Box
          className="service-img"
          component="img"
          src={service.image}
          alt={service.title}
          sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
        />
        <Chip
          label={service.tag}
          color="primary"
          size="small"
          sx={{ position: 'absolute', top: 12, left: 12, fontWeight: 800 }}
        />
        <Box sx={{ position: 'absolute', bottom: 12, right: 12 }}>
          <PriceChip price={service.startingPrice} size="medium" />
        </Box>
      </Box>

      <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" fontWeight={800} color="text.primary" gutterBottom>
          {service.title}
        </Typography>
        <Typography variant="caption" fontWeight={700} color="primary.main" sx={{ mb: 1.5, display: 'block' }}>
          {service.subtitle}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.5, flexGrow: 1 }}>
          {service.description}
        </Typography>

        <Stack spacing={1} sx={{ mb: 3 }}>
          {service.features.map((feat) => (
            <Box key={feat} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleOutlineIcon sx={{ color: 'secondary.main', fontSize: 16 }} />
              <Typography variant="caption" fontWeight={600} color="text.primary">
                {feat}
              </Typography>
            </Box>
          ))}
        </Stack>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={() => onBookClick(service)}
          endIcon={<ArrowForwardIcon />}
          sx={{ py: 1.2, fontWeight: 700, borderRadius: '10px' }}
        >
          Book Service
        </Button>
      </Box>
    </Paper>
  );
};

export default ServiceCard;

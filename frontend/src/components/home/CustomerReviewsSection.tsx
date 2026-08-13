import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  Avatar,
  Rating,
  IconButton,
  Stack,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import VerifiedIcon from '@mui/icons-material/Verified';
import { MOCK_REVIEWS } from '../../services/mockData';

export const CustomerReviewsSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto slide change every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % MOCK_REVIEWS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % MOCK_REVIEWS.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + MOCK_REVIEWS.length) % MOCK_REVIEWS.length);
  };

  const currentReview = MOCK_REVIEWS[activeIndex];

  return (
    <Box id="reviews" sx={{ py: 10, bgcolor: '#F8FAFC', position: 'relative', overflow: 'hidden' }}>
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', maxWidth: 700, mx: 'auto', mb: 7 }}>
          <Chip
            label="CUSTOMER REVIEWS & TESTIMONIALS"
            color="primary"
            size="small"
            sx={{ fontWeight: 800, mb: 1.5, letterSpacing: '0.05em' }}
          />
          <Typography variant="h3" fontWeight={800} color="text.primary" gutterBottom>
            Loved By 50,000+ Households
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
            Hear how our verified cooks and maids make daily home life easier, healthier, and happier.
          </Typography>
        </Box>

        {/* Carousel Showcase Card */}
        <Box sx={{ maxWidth: 840, mx: 'auto', position: 'relative' }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              borderRadius: 6,
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.08)',
              position: 'relative',
              transition: 'all 0.4s ease',
            }}
          >
            {/* Quote Icon */}
            <FormatQuoteIcon
              sx={{
                position: 'absolute',
                top: 24,
                right: 32,
                fontSize: 80,
                color: 'rgba(37, 99, 235, 0.08)',
              }}
            />

            {/* Rating Stars & Service Tag */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Rating value={currentReview.rating} readOnly precision={0.5} size="medium" />
                <Typography variant="body2" fontWeight={800} color="text.primary">
                  5.0 Exceptional
                </Typography>
              </Stack>
              <Chip
                label={currentReview.serviceType}
                color="secondary"
                size="small"
                sx={{ fontWeight: 700 }}
              />
            </Box>

            {/* Review Body */}
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: '#1E293B',
                lineHeight: 1.6,
                mb: 4,
                fontStyle: 'italic',
                fontSize: { xs: '1.15rem', md: '1.35rem' },
              }}
            >
              &ldquo;{currentReview.comment}&rdquo;
            </Typography>

            {/* Author Details */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 3, borderTop: '1px solid #F1F5F9' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={currentReview.customerAvatar}
                  alt={currentReview.customerName}
                  sx={{ width: 54, height: 54, border: '2px solid #2563EB' }}
                />
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <Typography variant="subtitle1" fontWeight={800} color="text.primary">
                      {currentReview.customerName}
                    </Typography>
                    <VerifiedIcon sx={{ color: '#2563EB', fontSize: 18 }} />
                  </Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Verified Customer • {currentReview.date}
                  </Typography>
                </Box>
              </Box>

              {/* Navigation Controls */}
              <Stack direction="row" spacing={1}>
                <IconButton
                  onClick={handlePrev}
                  sx={{
                    bgcolor: '#F1F5F9',
                    color: 'text.primary',
                    '&:hover': { bgcolor: '#2563EB', color: '#FFF' },
                  }}
                  aria-label="Previous Testimonial"
                >
                  <ArrowBackIcon fontSize="small" />
                </IconButton>
                <IconButton
                  onClick={handleNext}
                  sx={{
                    bgcolor: '#F1F5F9',
                    color: 'text.primary',
                    '&:hover': { bgcolor: '#2563EB', color: '#FFF' },
                  }}
                  aria-label="Next Testimonial"
                >
                  <ArrowForwardIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Box>
          </Paper>

          {/* Pagination Indicators / Bullets */}
          <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 3 }}>
            {MOCK_REVIEWS.map((_, idx) => (
              <Box
                key={idx}
                onClick={() => setActiveIndex(idx)}
                sx={{
                  width: activeIndex === idx ? 28 : 10,
                  height: 10,
                  borderRadius: 5,
                  bgcolor: activeIndex === idx ? 'primary.main' : '#CBD5E1',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default CustomerReviewsSection;

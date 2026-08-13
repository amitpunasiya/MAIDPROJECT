import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid2,
  Paper,
  Chip,
  InputAdornment,
  Stack,
  Button as MuiButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import StarIcon from '@mui/icons-material/Star';
import { Button, Input } from '../';
import { MOCK_STATS } from '../../services/mockData';
import { SearchableCitySelector } from '../common/SearchableCitySelector';
import GlobalSearchBar from '../common/GlobalSearchBar';

interface HeroSectionProps {
  onQuickBookClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onQuickBookClick }) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchCity, setSearchCity] = useState('Bengaluru');
  const [searchDate, setSearchDate] = useState(() => new Date().toISOString().split('T')[0]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetSection = document.getElementById('featured-providers') || document.getElementById('services');
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExploreClick = () => {
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 45%, #0F2942 100%)',
        color: '#FFFFFF',
        pt: { xs: 6, md: 10 },
        pb: { xs: 10, md: 14 },
        overflow: 'hidden',
      }}
    >
      {/* Animated Aura Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, rgba(13, 148, 136, 0.05) 60%, rgba(0,0,0,0) 80%)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
          animation: 'pulseAura 8s infinite alternate ease-in-out',
          '@keyframes pulseAura': {
            '0%': { transform: 'scale(1) translate(0, 0)' },
            '100%': { transform: 'scale(1.15) translate(-30px, 30px)' },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-10%',
          left: '-5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(13, 148, 136, 0.2) 0%, rgba(0,0,0,0) 75%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Grid2 container spacing={6} alignItems="center">
          {/* Left Column: Heading & Subtitle */}
          <Grid2 size={{ xs: 12, md: 7 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
              <Chip
                icon={<VerifiedUserIcon sx={{ fontSize: '18px !important', color: '#60A5FA !important' }} />}
                label="Verified & Police Checked Staff"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                  color: '#60A5FA',
                  fontWeight: 700,
                  px: 1,
                  py: 0.5,
                  fontSize: '0.85rem',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(96, 165, 250, 0.3)',
                }}
              />
              <Chip
                label="⚡ Instant Booking"
                sx={{
                  bgcolor: 'rgba(45, 212, 191, 0.15)',
                  color: '#2DD4BF',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  border: '1px solid rgba(45, 212, 191, 0.3)',
                }}
              />
            </Stack>

            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '3.8rem' },
                fontWeight: 800,
                lineHeight: 1.12,
                mb: 2.5,
                letterSpacing: '-0.02em',
              }}
            >
              Book Trusted <Box component="span" sx={{ color: '#60A5FA', background: 'linear-gradient(135deg, #60A5FA 0%, #93C5FD 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Cook</Box> & <Box component="span" sx={{ color: '#2DD4BF', background: 'linear-gradient(135deg, #2DD4BF 0%, #5EEAD4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Maid</Box> Services At Home
            </Typography>

            <Typography
              variant="h6"
              sx={{
                color: '#94A3B8',
                fontWeight: 400,
                mb: 4,
                maxWidth: 600,
                lineHeight: 1.6,
                fontSize: { xs: '1.05rem', md: '1.2rem' },
              }}
            >
              Enjoy delicious authentic homemade food and a sparkling clean home with verified, background-checked home cooks and housemaids available on demand.
            </Typography>

            {/* Global Search Bar Integration */}
            <Box sx={{ mb: 4, maxWidth: 640 }}>
              <GlobalSearchBar placeholder="Search cooks, maids, workers, services, tasks or locations..." />
            </Box>

            {/* Action CTA Buttons */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 5 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={onQuickBookClick}
                sx={{
                  height: 54,
                  px: 4,
                  fontSize: '1rem',
                  fontWeight: 700,
                  borderRadius: '12px',
                  boxShadow: '0 8px 20px rgba(37, 99, 235, 0.35)',
                }}
                endIcon={<ArrowForwardIcon />}
              >
                Book Now
              </Button>
              <MuiButton
                variant="outlined"
                size="large"
                onClick={handleExploreClick}
                sx={{
                  height: 54,
                  px: 3.5,
                  fontSize: '1rem',
                  fontWeight: 700,
                  borderRadius: '12px',
                  color: '#FFFFFF',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(8px)',
                  '&:hover': {
                    borderColor: '#FFFFFF',
                    bgcolor: 'rgba(255, 255, 255, 0.12)',
                  },
                }}
              >
                Explore Services
              </MuiButton>
            </Stack>

            {/* Key Statistics */}
            <Grid2 container spacing={3} sx={{ pt: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              {MOCK_STATS.map((stat) => (
                <Grid2 key={stat.label} size={{ xs: 6, sm: 3 }}>
                  <Typography variant="h5" fontWeight={800} color="#FFFFFF" sx={{ lineHeight: 1 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="#94A3B8" fontWeight={600} sx={{ mt: 0.5, display: 'block' }}>
                    {stat.label}
                  </Typography>
                </Grid2>
              ))}
            </Grid2>
          </Grid2>

          {/* Right Column: Hero Visual Card with Glassmorphic Badges */}
          <Grid2 size={{ xs: 12, md: 5 }}>
            <Box sx={{ position: 'relative' }}>
              <Paper
                elevation={12}
                sx={{
                  p: 2,
                  borderRadius: 6,
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  boxShadow: '0 30px 60px -15px rgba(0,0,0,0.6)',
                }}
              >
                <Box
                  component="img"
                  src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80"
                  alt="Professional Home Cook & Maid"
                  sx={{
                    width: '100%',
                    height: { xs: 300, sm: 360 },
                    objectFit: 'cover',
                    borderRadius: 4,
                  }}
                />
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CheckCircleIcon sx={{ color: '#2DD4BF', fontSize: 24 }} />
                    <Box>
                      <Typography variant="body2" fontWeight={700} color="#FFF">
                        100% Police Verified Staff
                      </Typography>
                      <Typography variant="caption" color="#94A3B8">
                        Document & reference cleared
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label="Active in 7 Cities"
                    color="secondary"
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                </Box>
              </Paper>

              {/* Floating Glass Badges */}
              <Paper
                elevation={8}
                sx={{
                  position: 'absolute',
                  top: 20,
                  left: -20,
                  display: { xs: 'none', sm: 'flex' },
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.5,
                  px: 2,
                  borderRadius: 4,
                  bgcolor: 'rgba(15, 23, 42, 0.85)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#FFF',
                }}
              >
                <StarIcon sx={{ color: '#F59E0B' }} />
                <Box>
                  <Typography variant="caption" fontWeight={800} display="block" lineHeight={1}>
                    4.9 / 5.0 Rating
                  </Typography>
                  <Typography variant="caption" color="#94A3B8" sx={{ fontSize: '0.65rem' }}>
                    From 50,000+ bookings
                  </Typography>
                </Box>
              </Paper>

              <Paper
                elevation={8}
                sx={{
                  position: 'absolute',
                  bottom: 30,
                  right: -20,
                  display: { xs: 'none', sm: 'flex' },
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.5,
                  px: 2,
                  borderRadius: 4,
                  bgcolor: 'rgba(15, 23, 42, 0.85)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#FFF',
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: 'success.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                  }}
                >
                  ⚡
                </Box>
                <Box>
                  <Typography variant="caption" fontWeight={800} display="block" lineHeight={1}>
                    Same Day Booking
                  </Typography>
                  <Typography variant="caption" color="#94A3B8" sx={{ fontSize: '0.65rem' }}>
                    Arrives in 60 mins
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Grid2>
        </Grid2>

        {/* Embedded Interactive Search Box */}
        <Box sx={{ mt: { xs: 6, md: 8 } }}>
          <Paper
            component="form"
            onSubmit={handleSearchSubmit}
            elevation={10}
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: 5,
              bgcolor: '#FFFFFF',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
              border: '1px solid #E2E8F0',
            }}
          >
            <Grid2 container spacing={2} alignItems="center">
              <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                <Input
                  label="Service or Skill"
                  placeholder="e.g. North Indian Cook, Deep Cleaning..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="primary" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid2>

              <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                  City
                </Typography>
                <SearchableCitySelector
                  variant="hero"
                  fullWidth
                  value={searchCity}
                  onChange={(val) => setSearchCity(val.cityName)}
                />
              </Grid2>

              <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                <Input
                  label="Preferred Date"
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarMonthIcon color="primary" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid2>

              <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
                <Typography variant="caption" color="transparent" sx={{ mb: 0.5, display: 'block' }}>
                  Action
                </Typography>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ height: 50, fontSize: '0.95rem', fontWeight: 700, borderRadius: '10px' }}
                >
                  Search
                </Button>
              </Grid2>
            </Grid2>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSection;

import React, { useState } from 'react';
import { Box, Typography, Button, Container, Paper, TextField, InputAdornment, Stack, Chip } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useNavigate } from 'react-router-dom';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: 8,
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="md">
        <Paper elevation={0} sx={{ p: { xs: 4, sm: 6 }, borderRadius: 5, border: '1px solid #E2E8F0', bgcolor: 'background.paper' }}>
          <Box
            sx={{
              width: 96,
              height: 96,
              borderRadius: '50%',
              bgcolor: 'error.50',
              color: 'error.main',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <ErrorOutlineIcon sx={{ fontSize: 56 }} />
          </Box>

          <Typography variant="h1" fontWeight={900} color="text.primary" sx={{ fontSize: { xs: '3.5rem', sm: '5rem' }, lineHeight: 1 }}>
            404
          </Typography>

          <Typography variant="h4" fontWeight={800} color="text.primary" gutterBottom sx={{ mt: 1 }}>
            Oops! Page Not Found
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 520, mx: 'auto' }}>
            We couldn't find the page you're looking for. Try searching for a service or jump back to one of our popular sections.
          </Typography>

          {/* Quick Search */}
          <Box component="form" onSubmit={handleSearch} sx={{ maxWidth: 460, mx: 'auto', mb: 4 }}>
            <TextField
              fullWidth
              placeholder="Search for home cooks, maids, deep cleaning..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button type="submit" variant="contained" size="small" sx={{ borderRadius: '8px' }}>
                        Search
                      </Button>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>

          {/* Popular Shortcuts */}
          <Typography variant="subtitle2" color="text.secondary" fontWeight={700} sx={{ mb: 1.5 }}>
            Popular Destinations:
          </Typography>
          <Stack direction="row" spacing={1.5} justifyContent="center" flexWrap="wrap" sx={{ gap: 1, mb: 4 }}>
            <Chip
              icon={<HomeIcon fontSize="small" />}
              label="Home"
              onClick={() => navigate('/home')}
              clickable
              color="primary"
              variant="outlined"
            />
            <Chip
              icon={<RestaurantIcon fontSize="small" />}
              label="Find Cooks"
              onClick={() => navigate('/cooks')}
              clickable
              color="primary"
              variant="outlined"
            />
            <Chip
              icon={<CleaningServicesIcon fontSize="small" />}
              label="Find Maids"
              onClick={() => navigate('/maids')}
              clickable
              color="primary"
              variant="outlined"
            />
            <Chip
              icon={<HelpOutlineIcon fontSize="small" />}
              label="Help Center"
              onClick={() => navigate('/help')}
              clickable
              color="primary"
              variant="outlined"
            />
          </Stack>

          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/home')}
            sx={{ borderRadius: '12px', fontWeight: 800, px: 4 }}
          >
            Back to Home Page
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default NotFound;

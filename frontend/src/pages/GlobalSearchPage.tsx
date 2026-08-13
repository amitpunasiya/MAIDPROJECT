import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid2,
  Paper,
  Chip,
  Select,
  MenuItem,
  CircularProgress,
  Divider,
  Stack,
  Avatar,
  Rating as MuiRating,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VerifiedIcon from '@mui/icons-material/Verified';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../components';
import GlobalSearchBar from '../components/common/GlobalSearchBar';
import TaskBookingDialog from '../components/booking/TaskBookingDialog';
import api from '../services/api';

export const GlobalSearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryParam = searchParams.get('q') || '';

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    providers: any[];
    services: any[];
    tasks: any[];
    locations: any[];
  }>({
    providers: [],
    services: [],
    tasks: [],
    locations: [],
  });

  // Filter & Sort State
  const [providerTypeFilter, setProviderTypeFilter] = useState('all');
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'recommended' | 'rating' | 'price' | 'nearest'>('recommended');

  // Booking Modal State
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedTaskName, setSelectedTaskName] = useState('Household Cleaning');
  const [selectedProviderId, setSelectedProviderId] = useState<string | undefined>(undefined);
  const [selectedProviderName, setSelectedProviderName] = useState<string | undefined>(undefined);

  const fetchSearchData = async (queryText: string) => {
    if (!queryText.trim()) return;
    setLoading(true);
    try {
      const res = await api.get(`/search?q=${encodeURIComponent(queryText.trim())}`);
      const data = res.data?.data || res.data || {};
      setResults({
        providers: data.providers || [],
        services: data.services || [],
        tasks: data.tasks || [],
        locations: data.locations || [],
      });
    } catch (_err) {
      setResults({ providers: [], services: [], tasks: [], locations: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryParam) {
      void fetchSearchData(queryParam);
    }
  }, [queryParam]);

  // Filter & Sort Logic
  const filteredProviders = results.providers
    .filter((p) => {
      if (providerTypeFilter !== 'all' && p.providerType?.toLowerCase() !== providerTypeFilter.toLowerCase()) {
        return false;
      }
      if (minRatingFilter > 0 && p.rating < minRatingFilter) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price') return a.hourlyPrice - b.hourlyPrice;
      if (sortBy === 'nearest') return a.distanceKm - b.distanceKm;
      return 0;
    });

  const handleOpenTaskBooking = (taskName: string, providerId?: string, providerName?: string) => {
    setSelectedTaskName(taskName);
    setSelectedProviderId(providerId);
    setSelectedProviderName(providerName);
    setBookingDialogOpen(true);
  };

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', pb: 10 }}>
      {/* Header Search Section */}
      <Paper
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #2563EB 100%)',
          color: '#FFF',
          py: { xs: 4, md: 5 },
          borderRadius: 0,
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight={900} gutterBottom>
            Global Marketplace Search
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.85, mb: 3 }}>
            Search verified cooks, maids, household services, tasks, or cities worldwide.
          </Typography>

          <Box sx={{ maxWidth: 700 }}>
            <GlobalSearchBar
              placeholder="Search cooks, maids, workers, services, tasks or locations..."
              onSelectTask={(tName) => handleOpenTaskBooking(tName)}
            />
          </Box>
        </Container>
      </Paper>

      {/* Main Results Container */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {/* Filters Header */}
        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid #E2E8F0', mb: 4, bgcolor: '#FFF' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="subtitle2" fontWeight={800} color="text.secondary" sx={{ mr: 1 }}>
                FILTERS:
              </Typography>
              {['all', 'cook', 'maid', 'provider'].map((type) => (
                <Chip
                  key={type}
                  label={type === 'all' ? 'All Staff' : type.toUpperCase()}
                  color={providerTypeFilter === type ? 'primary' : 'default'}
                  onClick={() => setProviderTypeFilter(type)}
                  sx={{ fontWeight: 700 }}
                />
              ))}

              <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

              {[0, 4.5, 4.0].map((ratingVal) => (
                <Chip
                  key={ratingVal}
                  label={ratingVal === 0 ? 'All Ratings' : `${ratingVal}+ ⭐`}
                  color={minRatingFilter === ratingVal ? 'secondary' : 'default'}
                  onClick={() => setMinRatingFilter(ratingVal)}
                  sx={{ fontWeight: 700 }}
                />
              ))}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="caption" fontWeight={700} color="text.secondary">
                SORT BY:
              </Typography>
              <Select size="small" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} sx={{ fontWeight: 700 }}>
                <MenuItem value="recommended">Recommended</MenuItem>
                <MenuItem value="rating">Highest Rated</MenuItem>
                <MenuItem value="nearest">Nearest Proximity</MenuItem>
                <MenuItem value="price">Lowest Price</MenuItem>
              </Select>
            </Box>
          </Box>
        </Paper>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress size={32} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontWeight: 700 }}>
              Searching marketplace catalog...
            </Typography>
          </Box>
        ) : (
          <Grid2 container spacing={4}>
            {/* MATCHING PROVIDERS */}
            <Grid2 size={{ xs: 12 }}>
              <Typography variant="h6" fontWeight={800} gutterBottom>
                Staff & Service Partners ({filteredProviders.length})
              </Typography>
              {filteredProviders.length === 0 ? (
                <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: '1px solid #E2E8F0' }}>
                  <Typography variant="body1" color="text.secondary">
                    No matching staff partners found for "{queryParam}". Try adjusting your query or location.
                  </Typography>
                </Paper>
              ) : (
                <Grid2 container spacing={3}>
                  {filteredProviders.map((p) => (
                    <Grid2 key={p.id} size={{ xs: 12, sm: 6, md: 4 }}>
                      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFF', position: 'relative' }}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                          <Avatar src={p.avatar} alt={p.name} sx={{ width: 56, height: 56, bgcolor: '#2563EB', fontWeight: 800 }}>
                            {p.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography variant="subtitle1" fontWeight={800}>
                                {p.name}
                              </Typography>
                              <VerifiedIcon color="primary" sx={{ fontSize: 16 }} />
                            </Box>
                            <Chip label={p.providerType} size="small" color="primary" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800 }} />
                          </Box>
                        </Stack>

                        <Divider sx={{ my: 1.5 }} />

                        <Stack spacing={1} sx={{ mb: 2, fontSize: '0.85rem' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <MuiRating value={p.rating} precision={0.5} readOnly size="small" />
                              <Typography variant="caption" fontWeight={800}>
                                ({p.rating})
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary" fontWeight={700}>
                              {p.totalJobs} Completed Jobs
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                              <LocationOnIcon sx={{ fontSize: 14 }} />
                              <Typography variant="caption">{p.city}, {p.state}</Typography>
                            </Box>
                            <Typography variant="caption" fontWeight={800} color="success.main">
                              📍 {p.distanceKm} km away
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" color="text.secondary">Hourly Rate:</Typography>
                            <Typography variant="subtitle2" fontWeight={900} color="primary.main">₹{p.hourlyPrice}/hr</Typography>
                          </Box>
                        </Stack>

                        <Stack direction="row" spacing={1}>
                          <Button variant="outlined" fullWidth size="small" onClick={() => navigate(`/providers/${p.id}`)}>
                            View Profile
                          </Button>
                          <Button variant="contained" color="primary" fullWidth size="small" onClick={() => handleOpenTaskBooking('Household Service', p.id, p.name)}>
                            Book Staff
                          </Button>
                        </Stack>
                      </Paper>
                    </Grid2>
                  ))}
                </Grid2>
              )}
            </Grid2>

            {/* MATCHING SERVICES & TASKS */}
            {results.services.length > 0 && (
              <Grid2 size={{ xs: 12 }}>
                <Typography variant="h6" fontWeight={800} gutterBottom sx={{ mt: 2 }}>
                  Household Services & Catalog Tasks ({results.services.length})
                </Typography>
                <Grid2 container spacing={2}>
                  {results.services.map((s) => (
                    <Grid2 key={s.id} size={{ xs: 12, sm: 6, md: 4 }}>
                      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFF' }}>
                        <Typography variant="subtitle1" fontWeight={800} gutterBottom>
                          {s.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 40, overflow: 'hidden' }}>
                          {s.description}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Chip label={s.categoryName} size="small" sx={{ bgcolor: '#EFF6FF', color: '#1E40AF', fontWeight: 700 }} />
                          <Typography variant="subtitle1" fontWeight={900} color="primary.main">
                            ₹{s.basePrice}
                          </Typography>
                        </Box>
                        <Button variant="contained" fullWidth size="small" onClick={() => handleOpenTaskBooking(s.name)}>
                          Book Task Now
                        </Button>
                      </Paper>
                    </Grid2>
                  ))}
                </Grid2>
              </Grid2>
            )}
          </Grid2>
        )}
      </Container>

      {/* Task Booking Modal Integration */}
      <TaskBookingDialog
        open={bookingDialogOpen}
        onClose={() => setBookingDialogOpen(false)}
        taskName={selectedTaskName}
        initialWorkerId={selectedProviderId}
        initialWorkerName={selectedProviderName}
      />
    </Box>
  );
};

export default GlobalSearchPage;

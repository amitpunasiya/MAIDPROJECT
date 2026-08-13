import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid2,
  Pagination,
  Button as MuiButton,
  Drawer,
  Chip,
  Stack,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import BadgeIcon from '@mui/icons-material/Badge';

import {
  ProviderSearch,
  ProviderFilter,
  ProviderSort,
  UnifiedProviderCard,
  ListingSkeleton,
  EmptyListingState,
  QuickBookingDialog,
} from '../components';

import { MOCK_COOKS, MOCK_MAIDS } from '../services/mockData';
import { ICookProfile, IMaidProfile, ISearchFilters } from '../types';

const ITEMS_PER_PAGE = 6;

const defaultFilters: ISearchFilters = {
  city: 'all',
  serviceType: 'all',
  minExperience: 0,
  minRating: 0,
  priceRange: [150, 600],
  availableOnly: false,
  verifiedOnly: false,
};

export const Providers: React.FC = () => {
  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [filters, setFilters] = useState<ISearchFilters>(defaultFilters);
  const [sortBy, setSortBy] = useState('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Pagination & Loading State
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Dialog State
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ICookProfile | IMaidProfile | null>(null);

  // Loading Skeleton Effect
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(timer);
  }, [filters.serviceType, selectedCity, sortBy]);

  const handleFilterChange = (newFilters: Partial<ISearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
    setSearchQuery('');
    setSelectedCity('all');
    setPage(1);
  };

  // Combine Cooks & Maids list with normalized type tag
  const allProviders = useMemo(() => {
    const cooks = MOCK_COOKS.map((c) => ({ ...c, type: 'cook' as const }));
    const maids = MOCK_MAIDS.map((m) => ({ ...m, type: 'maid' as const }));
    return [...cooks, ...maids];
  }, []);

  // Filter & Search Logic
  const filteredProviders = useMemo(() => {
    return allProviders.filter((prov) => {
      // 1. Staff Category Filter (Cook vs Maid)
      if (filters.serviceType === 'cook' && prov.type !== 'cook') return false;
      if (filters.serviceType === 'maid' && prov.type !== 'maid') return false;

      // 2. City Filter
      if (selectedCity !== 'all' && prov.city !== selectedCity) return false;

      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = prov.name.toLowerCase().includes(q);
        const matchesBio = prov.bio.toLowerCase().includes(q);
        const matchesCity = prov.city.toLowerCase().includes(q);
        const matchesArea = prov.area.toLowerCase().includes(q);
        const skills = prov.type === 'cook' ? (prov as ICookProfile).skills : (prov as IMaidProfile).services;
        const matchesSkills = skills.some((s) => s.toLowerCase().includes(q));
        if (!matchesName && !matchesBio && !matchesCity && !matchesArea && !matchesSkills) return false;
      }

      // 4. Verified Only
      if (filters.verifiedOnly && !prov.verified) return false;

      // 5. Available Only
      if (filters.availableOnly && !prov.isAvailable) return false;

      // 6. Minimum Experience
      if (filters.minExperience && filters.minExperience > 0 && prov.experienceYears < filters.minExperience) return false;

      // 7. Minimum Rating
      if (filters.minRating && filters.minRating > 0 && prov.averageRating < filters.minRating) return false;

      // 8. Price Range
      if (filters.priceRange) {
        if (prov.hourlyRate < filters.priceRange[0] || prov.hourlyRate > filters.priceRange[1]) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.averageRating - a.averageRating;
      if (sortBy === 'price_low') return a.hourlyRate - b.hourlyRate;
      if (sortBy === 'price_high') return b.hourlyRate - a.hourlyRate;
      if (sortBy === 'experience') return b.experienceYears - a.experienceYears;
      return b.totalRatings - a.totalRatings;
    });
  }, [allProviders, filters, selectedCity, searchQuery, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredProviders.length / ITEMS_PER_PAGE);
  const displayedProviders = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredProviders.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProviders, page]);

  const handleOpenBooking = (provider: ICookProfile | IMaidProfile) => {
    setSelectedProvider(provider);
    setBookingDialogOpen(true);
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg">
        {/* Page Banner Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Chip
                icon={<BadgeIcon fontSize="small" sx={{ color: 'primary.main' }} />}
                label="Verified Staff Directory"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 800 }}
              />
              <Chip label={`${allProviders.length} Total Verified Providers`} size="small" sx={{ fontWeight: 700 }} />
            </Stack>
            <Typography variant="h3" fontWeight={800} color="text.primary">
              Home Staff & Professionals
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              Browse background-checked home cooks, chefs, maids, and housekeepers in your city.
            </Typography>
          </Box>

          {/* Mobile Filter Toggle */}
          <MuiButton
            variant="outlined"
            color="primary"
            startIcon={<FilterListIcon />}
            onClick={() => setMobileFilterOpen(true)}
            sx={{ display: { xs: 'flex', md: 'none' }, fontWeight: 700, borderRadius: '10px' }}
          >
            Filters
          </MuiButton>
        </Box>

        {/* 1. TOP SEARCH BAR */}
        <Box sx={{ mb: 4 }}>
          <ProviderSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCity={selectedCity}
            onCityChange={setSelectedCity}
            onSearchSubmit={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 300);
            }}
          />
        </Box>

        {/* MAIN BODY: SIDEBAR FILTERS + RESULTS */}
        <Grid2 container spacing={4}>
          {/* DESKTOP FILTER SIDEBAR */}
          <Grid2 size={{ xs: 12, md: 3.5 }} sx={{ display: { xs: 'none', md: 'block' } }}>
            <ProviderFilter
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              totalCount={filteredProviders.length}
            />
          </Grid2>

          {/* RESULTS CONTENT COLUMN */}
          <Grid2 size={{ xs: 12, md: 8.5 }}>
            {/* Sort & Grid/List View Controls */}
            <ProviderSort
              sortBy={sortBy}
              onSortChange={setSortBy}
              totalCount={filteredProviders.length}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />

            {/* Loading Skeleton */}
            {loading ? (
              <ListingSkeleton />
            ) : filteredProviders.length === 0 ? (
              /* Empty State */
              <EmptyListingState
                onResetFilters={handleResetFilters}
                title="No Providers Found"
                subtitle="We couldn't find any verified cooks or maids matching your exact filter criteria. Try adjusting your city, experience, or price range."
              />
            ) : (
              /* Providers List / Grid */
              <Box>
                <Grid2 container spacing={3.5}>
                  {displayedProviders.map((prov) => (
                    <Grid2 key={prov.id} size={{ xs: 12, sm: viewMode === 'list' ? 12 : 6, lg: viewMode === 'list' ? 12 : 6 }}>
                      <UnifiedProviderCard
                        provider={prov}
                        type={prov.type}
                        viewMode={viewMode}
                        onBookClick={(p) => handleOpenBooking(p)}
                      />
                    </Grid2>
                  ))}
                </Grid2>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={(_e, val) => {
                        setPage(val);
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                      color="primary"
                      size="large"
                      sx={{
                        '& .MuiPaginationItem-root': {
                          fontWeight: 700,
                          borderRadius: '10px',
                        },
                      }}
                    />
                  </Box>
                )}
              </Box>
            )}
          </Grid2>
        </Grid2>

        {/* MOBILE FILTERS DRAWER */}
        <Drawer
          anchor="left"
          open={mobileFilterOpen}
          onClose={() => setMobileFilterOpen(false)}
          PaperProps={{ sx: { width: 300, p: 2 } }}
        >
          <ProviderFilter
            filters={filters}
            onFilterChange={(newF) => {
              handleFilterChange(newF);
              setMobileFilterOpen(false);
            }}
            onResetFilters={() => {
              handleResetFilters();
              setMobileFilterOpen(false);
            }}
            totalCount={filteredProviders.length}
          />
        </Drawer>

        {/* QUICK BOOKING DIALOG */}
        <QuickBookingDialog
          open={bookingDialogOpen}
          onClose={() => setBookingDialogOpen(false)}
          serviceTitle={selectedProvider ? `${selectedProvider.name} Booking` : 'Staff Booking'}
          providerName={selectedProvider?.name}
          estimatedPrice={selectedProvider ? `₹${selectedProvider.hourlyRate}/hr` : undefined}
        />
      </Container>
    </Box>
  );
};

export default Providers;

import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid2,
  ToggleButtonGroup,
  ToggleButton,
  Button as MuiButton,
  Drawer,
  Chip,
  Paper,
  Stack,
  Tooltip,
} from '@mui/material';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import FilterListIcon from '@mui/icons-material/FilterList';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import { useAppSelector, useAppDispatch } from '../hooks/useAppStore';
import {
  setSearchQuery,
  setCategory,
  setMinRating,
  setPriceRange,
  setSortBy,
  setViewMode,
  setCurrentPage,
  toggleOnlyVerified,
  toggleOnlyAvailable,
  resetAllServiceFilters,
  getProviders,
  getCategories,
  SortOption,
  ViewMode,
} from '../store/serviceSlice';

import {
  SearchBar,
  CategoryTabs,
  ServiceFilters,
  ServiceCard,
  EmptyResults,
  ServicePagination,
  ListingSkeleton,
  ProviderCard,
  ProviderDetailDialog,
  QuickBookingDialog,
} from '../components';

import { MOCK_COOKS, MOCK_MAIDS, MOCK_MAIN_SERVICES, IMainServiceCard } from '../services/mockData';
import { ICookProfile, IMaidProfile } from '../types';

export const Services: React.FC = () => {
  const dispatch = useAppDispatch();
  const serviceState = useAppSelector((state) => state.service);

  const {
    searchQuery,
    category,
    minRating,
    priceRange,
    sortBy,
    viewMode,
    currentPage,
    itemsPerPage,
    onlyVerified,
    onlyAvailable,
    city,
    providers: apiProviders,
    providersLoading,
  } = serviceState;

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Dialog State
  const [selectedProvider, setSelectedProvider] = useState<ICookProfile | IMaidProfile | null>(null);
  const [selectedType, setSelectedType] = useState<'cook' | 'maid'>('cook');
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingTitle, setBookingTitle] = useState('Home Service');
  const [bookingPrice, setBookingPrice] = useState('₹250/hr');

  // Trigger live backend provider fetch when filter criteria change
  useEffect(() => {
    void dispatch(getCategories());
    void dispatch(
      getProviders({
        serviceType: category !== 'all' ? category : undefined,
        city: city !== 'all' ? city : undefined,
        minRating: minRating > 0 ? minRating : undefined,
        search: searchQuery || undefined,
        verified: onlyVerified || undefined,
        isAvailable: onlyAvailable || undefined,
        sortBy,
        page: currentPage,
        limit: itemsPerPage,
      }),
    );
  }, [dispatch, category, city, minRating, searchQuery, onlyVerified, onlyAvailable, sortBy, currentPage, itemsPerPage]);

  // Combined Normalized Data List (API data with Mock fallback)
  const normalizedData = useMemo(() => {
    if (apiProviders && apiProviders.length > 0) {
      return apiProviders.map((p) => {
        const type = ('skills' in p && (p as ICookProfile).skills ? 'cook' : 'maid') as 'cook' | 'maid';
        return { ...p, itemType: type };
      });
    }

    const cooks = MOCK_COOKS.map((c) => ({ ...c, itemType: 'cook' as const }));
    const maids = MOCK_MAIDS.map((m) => ({ ...m, itemType: 'maid' as const }));
    const mainCards = MOCK_MAIN_SERVICES.map((s) => ({ ...s, itemType: 'card' as const }));

    if (category === 'cook') return cooks;
    if (category === 'maid') return maids;
    if (category === 'combo') {
      return [...cooks.slice(0, 3), ...maids.slice(0, 3), mainCards.find((c) => c.id === 'main-combo')!].filter(Boolean);
    }
    if (category === 'cleaning') {
      return maids.filter((m) => m.services.some((s) => s.toLowerCase().includes('clean') || s.toLowerCase().includes('deep')));
    }
    return [...cooks, ...maids, ...mainCards];
  }, [apiProviders, category]);

  // Filtered Data
  const filteredData = useMemo(() => {
    return normalizedData.filter((item) => {
      if (item.itemType === 'card') {
        const card = item as IMainServiceCard;
        if (searchQuery) {
          return (
            card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            card.description.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        return true;
      }

      const provider = item as ICookProfile | IMaidProfile;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const nameMatch = provider.name.toLowerCase().includes(q);
        const bioMatch = provider.bio.toLowerCase().includes(q);
        const cityMatch = provider.city.toLowerCase().includes(q);
        const skillMatch =
          'skills' in provider
            ? (provider as ICookProfile).skills?.some((s) => s.toLowerCase().includes(q))
            : (provider as IMaidProfile).services?.some((s) => s.toLowerCase().includes(q));

        if (!nameMatch && !bioMatch && !cityMatch && !skillMatch) return false;
      }

      if (minRating > 0 && provider.averageRating < minRating) return false;
      if (provider.hourlyRate < priceRange[0] || provider.hourlyRate > priceRange[1]) return false;
      if (onlyVerified && !provider.verified) return false;
      if (onlyAvailable && !provider.isAvailable) return false;

      return true;
    });
  }, [normalizedData, searchQuery, minRating, priceRange, onlyVerified, onlyAvailable]);

  // Sorted Data
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      if (a.itemType === 'card' || b.itemType === 'card') return 0;
      const pA = a as ICookProfile | IMaidProfile;
      const pB = b as ICookProfile | IMaidProfile;

      if (sortBy === 'rating') return pB.averageRating - pA.averageRating;
      if (sortBy === 'price_low') return pA.hourlyRate - pB.hourlyRate;
      if (sortBy === 'price_high') return pB.hourlyRate - pA.hourlyRate;
      if (sortBy === 'experience') return pB.experienceYears - pA.experienceYears;
      return pB.totalRatings - pA.totalRatings;
    });
  }, [filteredData, sortBy]);

  // Paginated View Items
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  // Handlers
  const handleOpenDetail = (provider: ICookProfile | IMaidProfile, type: 'cook' | 'maid') => {
    setSelectedProvider(provider);
    setSelectedType(type);
    setDetailDialogOpen(true);
  };

  const handleOpenBooking = (title: string, price: string) => {
    setBookingTitle(title);
    setBookingPrice(price);
    setBookingDialogOpen(true);
  };

  const handleBookFromDetail = (provider: ICookProfile | IMaidProfile) => {
    setBookingTitle(provider.name);
    setBookingPrice(`₹${provider.hourlyRate}/hr`);
    setDetailDialogOpen(false);
    setBookingDialogOpen(true);
  };

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', pb: 10 }}>
      {/* Header Banner */}
      <Paper
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #2563EB 100%)',
          color: '#FFF',
          py: { xs: 5, md: 7 },
          borderRadius: 0,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ maxWidth: 720 }}>
            <Chip
              icon={<AutoAwesomeIcon sx={{ fontSize: '1rem !important', color: '#60A5FA' }} />}
              label="Verified Home Service Partners"
              sx={{
                bgcolor: 'rgba(255,255,255,0.1)',
                color: '#93C5FD',
                fontWeight: 700,
                fontSize: '0.8rem',
                mb: 2,
                backdropFilter: 'blur(8px)',
              }}
            />
            <Typography variant="h3" fontWeight={900} letterSpacing="-0.02em" sx={{ fontSize: { xs: '2rem', md: '2.75rem' } }} gutterBottom>
              Find & Book Verified Home Staff
            </Typography>

            {/* Live Search Bar */}
            <Box sx={{ mt: 3 }}>
              <SearchBar
                value={searchQuery}
                onChange={(val) => dispatch(setSearchQuery(val))}
                onClear={() => dispatch(setSearchQuery(''))}
                placeholder="Search by cook, maid, dish name, cleaning service..."
              />
            </Box>
          </Box>
        </Container>
      </Paper>

      {/* Main Catalog Content */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {/* Category Tabs */}
        <Box sx={{ mb: 4 }}>
          <CategoryTabs activeCategory={category} onCategoryChange={(cat) => dispatch(setCategory(cat))} />
        </Box>

        {/* Toolbar Header */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 3,
            border: '1px solid #E2E8F0',
            bgcolor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              Showing <strong style={{ color: '#0F172A' }}>{filteredData.length}</strong> services & staff
            </Typography>
            {category !== 'all' && (
              <Chip
                label={category.toUpperCase()}
                size="small"
                onDelete={() => dispatch(setCategory('all'))}
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 700, fontSize: '0.7rem' }}
              />
            )}
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center">
            {/* Mobile Filter Button */}
            <MuiButton
              variant="outlined"
              size="small"
              startIcon={<FilterListIcon />}
              onClick={() => setMobileFilterOpen(true)}
              sx={{ display: { xs: 'flex', md: 'none' }, borderRadius: '8px', fontWeight: 700 }}
            >
              Filters
            </MuiButton>

            {/* Grid / List View Mode Toggle */}
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, val) => val && dispatch(setViewMode(val as ViewMode))}
              size="small"
              sx={{ bgcolor: '#F1F5F9', p: 0.5, borderRadius: '8px' }}
            >
              <ToggleButton value="grid" aria-label="grid view">
                <Tooltip title="Grid View">
                  <GridViewIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="list" aria-label="list view">
                <Tooltip title="List View">
                  <ViewListIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Paper>

        {/* Grid Layout: Desktop Sidebar Filters + Catalog Cards */}
        <Grid2 container spacing={3.5}>
          {/* Desktop Filter Panel Sidebar */}
          <Grid2 size={{ xs: 12, md: 3.2 }} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3.5,
                border: '1px solid #E2E8F0',
                bgcolor: '#FFFFFF',
                position: 'sticky',
                top: 88,
              }}
            >
              <ServiceFilters
                category={category}
                onCategoryChange={(cat) => dispatch(setCategory(cat))}
                minRating={minRating}
                onMinRatingChange={(r) => dispatch(setMinRating(r))}
                priceRange={priceRange}
                onPriceRangeChange={(r) => dispatch(setPriceRange(r))}
                sortBy={sortBy}
                onSortByChange={(s) => dispatch(setSortBy(s as SortOption))}
                onlyVerified={onlyVerified}
                onToggleVerified={() => dispatch(toggleOnlyVerified())}
                onlyAvailable={onlyAvailable}
                onToggleAvailable={() => dispatch(toggleOnlyAvailable())}
                onResetAll={() => dispatch(resetAllServiceFilters())}
              />
            </Paper>
          </Grid2>

          {/* Catalog Items Listing */}
          <Grid2 size={{ xs: 12, md: 8.8 }}>
            {providersLoading ? (
              <ListingSkeleton count={itemsPerPage} viewMode={viewMode} />
            ) : paginatedData.length === 0 ? (
              <EmptyResults onResetFilters={() => dispatch(resetAllServiceFilters())} />
            ) : (
              <Grid2 container spacing={2.5}>
                {paginatedData.map((item) => {
                  if (item.itemType === 'card') {
                    const card = item as IMainServiceCard;
                    return (
                      <Grid2 key={card.id} size={{ xs: 12, sm: viewMode === 'grid' ? 6 : 12 }}>
                        <ServiceCard service={card} onBookClick={(s) => handleOpenBooking(s.title, s.startingPrice)} />
                      </Grid2>
                    );
                  }

                  const provider = item as ICookProfile | IMaidProfile;
                  const type = item.itemType as 'cook' | 'maid';

                  return (
                    <Grid2 key={provider.id} size={{ xs: 12, sm: viewMode === 'grid' ? 6 : 12 }}>
                      <ProviderCard
                        provider={provider}
                        type={type}
                        onViewDetailsClick={(p, t) => handleOpenDetail(p, t)}
                        onBookClick={(p) => handleOpenBooking(p.name, `₹${p.hourlyRate}/hr`)}
                      />
                    </Grid2>
                  );
                })}
              </Grid2>
            )}

            {/* Pagination Controls */}
            {!providersLoading && paginatedData.length > 0 && (
              <Box sx={{ mt: 5 }}>
                <ServicePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredData.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={(p: number) => dispatch(setCurrentPage(p))}
                />
              </Box>
            )}
          </Grid2>
        </Grid2>
      </Container>

      {/* Mobile Drawer Filter */}
      <Drawer anchor="bottom" open={mobileFilterOpen} onClose={() => setMobileFilterOpen(false)} PaperProps={{ sx: { borderTopLeftRadius: 20, borderTopRightRadius: 20, p: 3, maxHeight: '85vh' } }}>
        <ServiceFilters
          category={category}
          onCategoryChange={(cat) => dispatch(setCategory(cat))}
          minRating={minRating}
          onMinRatingChange={(r) => dispatch(setMinRating(r))}
          priceRange={priceRange}
          onPriceRangeChange={(r) => dispatch(setPriceRange(r))}
          sortBy={sortBy}
          onSortByChange={(s) => dispatch(setSortBy(s as SortOption))}
          onlyVerified={onlyVerified}
          onToggleVerified={() => dispatch(toggleOnlyVerified())}
          onlyAvailable={onlyAvailable}
          onToggleAvailable={() => dispatch(toggleOnlyAvailable())}
          onResetAll={() => dispatch(resetAllServiceFilters())}
        />
        <MuiButton variant="contained" fullWidth onClick={() => setMobileFilterOpen(false)} sx={{ mt: 3, py: 1.2, fontWeight: 700, borderRadius: '10px' }}>
          Apply Filters ({filteredData.length})
        </MuiButton>
      </Drawer>

      {/* Dialog Modals */}
      <ProviderDetailDialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        provider={selectedProvider}
        type={selectedType}
        onBookNow={handleBookFromDetail}
      />

      <QuickBookingDialog
        open={bookingDialogOpen}
        onClose={() => setBookingDialogOpen(false)}
        serviceTitle={bookingTitle}
        estimatedPrice={bookingPrice}
      />
    </Box>
  );
};

export default Services;

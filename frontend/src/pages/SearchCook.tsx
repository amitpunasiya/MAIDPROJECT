import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid2,
  Pagination,
  Button as MuiButton,
  Drawer,
  Stack,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import RestaurantIcon from '@mui/icons-material/Restaurant';

import {
  SearchFilterBar,
  FilterPanel,
  FilterState,
  ProviderCard,
  ProviderDetailDialog,
  QuickBookingDialog,
  ListingSkeleton,
  EmptyListingState,
  SortControl,
} from '../components';

import { MOCK_COOKS } from '../services/mockData';
import { ICookProfile, ServiceType } from '../types';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import { searchProviders } from '../store/serviceSlice';

const ITEMS_PER_PAGE = 6;

const defaultFilters: FilterState = {
  minExperience: 0,
  minRating: 0,
  gender: 'all',
  languages: [],
  priceRange: [150, 600],
  availableOnly: false,
  verifiedOnly: false,
};

export const SearchCook: React.FC = () => {
  const dispatch = useAppDispatch();
  const { providers: apiProviders, providersLoading, totalPages: apiTotalPages } = useAppSelector((state) => state.service);

  // Search Bar State
  const [searchKeyword, setSearchKeyword] = useState('');
  const [city, setCity] = useState('all');
  const [serviceType, setServiceType] = useState<ServiceType>(ServiceType.COOK);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('all');

  // Advanced Filters State
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [sortBy, setSortBy] = useState<'rating' | 'price_low' | 'price_high' | 'experience' | 'newest'>('rating');

  // UI State
  const [page, setPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Dialog Modals State
  const [selectedCook, setSelectedCook] = useState<ICookProfile | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedCookForBooking, setSelectedCookForBooking] = useState<ICookProfile | null>(null);

  // Trigger live backend provider search on filter changes
  useEffect(() => {
    void dispatch(
      searchProviders({
        serviceType: 'cook',
        search: searchKeyword || undefined,
        city: city !== 'all' ? city : undefined,
        minRating: filters.minRating > 0 ? filters.minRating : undefined,
        minExperience: filters.minExperience > 0 ? filters.minExperience : undefined,
        gender: filters.gender !== 'all' ? filters.gender : undefined,
        isAvailable: filters.availableOnly || undefined,
        verified: filters.verifiedOnly || undefined,
        sortBy,
        page,
        limit: ITEMS_PER_PAGE,
      }),
    );
  }, [dispatch, searchKeyword, city, filters, sortBy, page]);

  // Cook list (API items with fallback to MOCK_COOKS)
  const cookList = useMemo(() => {
    if (apiProviders && apiProviders.length > 0) {
      return apiProviders as ICookProfile[];
    }
    return MOCK_COOKS;
  }, [apiProviders]);

  // Client-side filtering logic for refined precision
  const filteredCooks = useMemo(() => {
    return cookList.filter((cook) => {
      if (city !== 'all' && cook.city.toLowerCase() !== city.toLowerCase()) return false;

      if (searchKeyword.trim() !== '') {
        const query = searchKeyword.toLowerCase();
        const nameMatch = cook.name.toLowerCase().includes(query);
        const bioMatch = cook.bio.toLowerCase().includes(query);
        const areaMatch = cook.area.toLowerCase().includes(query);
        const skillMatch = cook.skills?.some((s) => s.toLowerCase().includes(query));

        if (!nameMatch && !bioMatch && !areaMatch && !skillMatch) return false;
      }

      if (filters.minExperience > 0 && cook.experienceYears < filters.minExperience) return false;
      if (filters.minRating > 0 && cook.averageRating < filters.minRating) return false;
      if (filters.gender !== 'all' && cook.gender.toLowerCase() !== filters.gender.toLowerCase()) return false;

      if (filters.languages.length > 0) {
        const hasLang = filters.languages.some((l) => cook.languages.includes(l));
        if (!hasLang) return false;
      }

      if (cook.hourlyRate < filters.priceRange[0] || cook.hourlyRate > filters.priceRange[1]) return false;
      if (filters.availableOnly && !cook.isAvailable) return false;
      if (filters.verifiedOnly && !cook.verified) return false;

      return true;
    });
  }, [cookList, city, searchKeyword, filters]);

  // Sorted list
  const sortedCooks = useMemo(() => {
    return [...filteredCooks].sort((a, b) => {
      if (sortBy === 'rating') return b.averageRating - a.averageRating;
      if (sortBy === 'price_low') return a.hourlyRate - b.hourlyRate;
      if (sortBy === 'price_high') return b.hourlyRate - a.hourlyRate;
      if (sortBy === 'experience') return b.experienceYears - a.experienceYears;
      return b.totalRatings - a.totalRatings;
    });
  }, [filteredCooks, sortBy]);

  // Paginated list
  const totalPages = Math.ceil(sortedCooks.length / ITEMS_PER_PAGE) || apiTotalPages || 1;
  const paginatedCooks = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return sortedCooks.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedCooks, page]);

  // Handlers
  const handleResetFilters = () => {
    setFilters(defaultFilters);
    setSearchKeyword('');
    setCity('all');
    setSortBy('rating');
    setPage(1);
  };

  const handleOpenDetail = (cook: ICookProfile) => {
    setSelectedCook(cook);
    setDetailDialogOpen(true);
  };

  const handleOpenBooking = (cook: ICookProfile) => {
    setSelectedCookForBooking(cook);
    setBookingDialogOpen(true);
  };

  const handleFilterPanelChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', pb: 10 }}>
      {/* Search Header Banner */}
      <Box sx={{ bgcolor: '#0F172A', color: '#FFF', py: { xs: 4, md: 6 } }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <RestaurantIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h4" fontWeight={900}>
              Find Verified Home Chefs & Cooks
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 600 }}>
            Book professional North/South Indian, Chinese, Continental & Dietary specialists near you.
          </Typography>

          <SearchFilterBar
            searchKeyword={searchKeyword}
            onSearchKeywordChange={setSearchKeyword}
            city={city}
            onCityChange={setCity}
            serviceType={serviceType}
            onServiceTypeChange={(val) => setServiceType(val as ServiceType)}
            date={date}
            onDateChange={setDate}
            timeSlot={timeSlot}
            onTimeSlotChange={setTimeSlot}
            onSearch={() => setPage(1)}
          />
        </Container>
      </Box>

      {/* Main Results Container */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid2 container spacing={3.5}>
          {/* Desktop Filter Sidebar */}
          <Grid2 size={{ xs: 12, md: 3.2 }} sx={{ display: { xs: 'none', md: 'block' } }}>
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterPanelChange}
              onResetFilters={handleResetFilters}
              totalResults={sortedCooks.length}
            />
          </Grid2>

          {/* Results List */}
          <Grid2 size={{ xs: 12, md: 8.8 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  Available Home Cooks ({sortedCooks.length})
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Showing results in {city === 'all' ? 'All Cities' : city}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1.5} alignItems="center">
                <MuiButton
                  variant="outlined"
                  size="small"
                  startIcon={<FilterListIcon />}
                  onClick={() => setMobileFilterOpen(true)}
                  sx={{ display: { xs: 'flex', md: 'none' }, borderRadius: '8px', fontWeight: 700 }}
                >
                  Filter ({sortedCooks.length})
                </MuiButton>

                <SortControl sortBy={sortBy} onSortChange={(s) => setSortBy(s)} totalCount={sortedCooks.length} itemType="cook" />
              </Stack>
            </Box>

            {providersLoading ? (
              <ListingSkeleton count={6} />
            ) : paginatedCooks.length === 0 ? (
              <EmptyListingState onResetFilters={handleResetFilters} />
            ) : (
              <Grid2 container spacing={2.5}>
                {paginatedCooks.map((cook) => (
                  <Grid2 key={cook.id} size={{ xs: 12, sm: 6 }}>
                    <ProviderCard
                      provider={cook}
                      type="cook"
                      onViewDetailsClick={(p) => handleOpenDetail(p as ICookProfile)}
                      onBookClick={(p) => handleOpenBooking(p as ICookProfile)}
                    />
                  </Grid2>
                ))}
              </Grid2>
            )}

            {!providersLoading && paginatedCooks.length > 0 && (
              <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center' }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, p) => setPage(p)}
                  color="primary"
                  size="large"
                  sx={{ '& .MuiPaginationItem-root': { fontWeight: 700, borderRadius: '10px' } }}
                />
              </Box>
            )}
          </Grid2>
        </Grid2>
      </Container>

      {/* Mobile Drawer Filter */}
      <Drawer anchor="bottom" open={mobileFilterOpen} onClose={() => setMobileFilterOpen(false)} PaperProps={{ sx: { borderTopLeftRadius: 20, borderTopRightRadius: 20, p: 3, maxHeight: '85vh' } }}>
        <FilterPanel filters={filters} onFilterChange={handleFilterPanelChange} onResetFilters={handleResetFilters} totalResults={sortedCooks.length} />
        <MuiButton variant="contained" fullWidth onClick={() => setMobileFilterOpen(false)} sx={{ mt: 3, py: 1.2, fontWeight: 700, borderRadius: '10px' }}>
          Apply Filters ({sortedCooks.length})
        </MuiButton>
      </Drawer>

      {/* Modals */}
      <ProviderDetailDialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        provider={selectedCook}
        type="cook"
        onBookNow={(cook) => {
          setDetailDialogOpen(false);
          handleOpenBooking(cook as ICookProfile);
        }}
      />

      <QuickBookingDialog
        open={bookingDialogOpen}
        onClose={() => setBookingDialogOpen(false)}
        serviceTitle="Home Chef Service"
        providerName={selectedCookForBooking?.name}
        estimatedPrice={selectedCookForBooking ? `₹${selectedCookForBooking.hourlyRate}/hr` : '₹250/hr'}
      />
    </Box>
  );
};

export default SearchCook;

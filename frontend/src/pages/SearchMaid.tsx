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
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';

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

import { MOCK_MAIDS } from '../services/mockData';
import { IMaidProfile, ServiceType } from '../types';
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

export const SearchMaid: React.FC = () => {
  const dispatch = useAppDispatch();
  const { providers: apiProviders, providersLoading, totalPages: apiTotalPages } = useAppSelector((state) => state.service);

  // Search Bar State
  const [searchKeyword, setSearchKeyword] = useState('');
  const [city, setCity] = useState('all');
  const [serviceType, setServiceType] = useState<ServiceType>(ServiceType.MAID);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('all');

  // Advanced Filters State
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [sortBy, setSortBy] = useState<'rating' | 'price_low' | 'price_high' | 'experience' | 'newest'>('rating');

  // UI State
  const [page, setPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Dialog Modals State
  const [selectedMaid, setSelectedMaid] = useState<IMaidProfile | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedMaidForBooking, setSelectedMaidForBooking] = useState<IMaidProfile | null>(null);

  // Trigger live backend provider search on filter changes
  useEffect(() => {
    void dispatch(
      searchProviders({
        serviceType: 'maid',
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

  // Maid list (API items with fallback to MOCK_MAIDS)
  const maidList = useMemo(() => {
    if (apiProviders && apiProviders.length > 0) {
      return apiProviders as IMaidProfile[];
    }
    return MOCK_MAIDS;
  }, [apiProviders]);

  // Client-side filtering logic
  const filteredMaids = useMemo(() => {
    return maidList.filter((maid) => {
      if (city !== 'all' && maid.city.toLowerCase() !== city.toLowerCase()) return false;

      if (searchKeyword.trim() !== '') {
        const query = searchKeyword.toLowerCase();
        const nameMatch = maid.name.toLowerCase().includes(query);
        const bioMatch = maid.bio.toLowerCase().includes(query);
        const areaMatch = maid.area.toLowerCase().includes(query);
        const serviceMatch = maid.services?.some((s) => s.toLowerCase().includes(query));

        if (!nameMatch && !bioMatch && !areaMatch && !serviceMatch) return false;
      }

      if (filters.minExperience > 0 && maid.experienceYears < filters.minExperience) return false;
      if (filters.minRating > 0 && maid.averageRating < filters.minRating) return false;
      if (filters.gender !== 'all' && maid.gender.toLowerCase() !== filters.gender.toLowerCase()) return false;

      if (filters.languages.length > 0) {
        const hasLang = filters.languages.some((l) => maid.languages.includes(l));
        if (!hasLang) return false;
      }

      if (maid.hourlyRate < filters.priceRange[0] || maid.hourlyRate > filters.priceRange[1]) return false;
      if (filters.availableOnly && !maid.isAvailable) return false;
      if (filters.verifiedOnly && !maid.verified) return false;

      return true;
    });
  }, [maidList, city, searchKeyword, filters]);

  // Sorted list
  const sortedMaids = useMemo(() => {
    return [...filteredMaids].sort((a, b) => {
      if (sortBy === 'rating') return b.averageRating - a.averageRating;
      if (sortBy === 'price_low') return a.hourlyRate - b.hourlyRate;
      if (sortBy === 'price_high') return b.hourlyRate - a.hourlyRate;
      if (sortBy === 'experience') return b.experienceYears - a.experienceYears;
      return b.totalRatings - a.totalRatings;
    });
  }, [filteredMaids, sortBy]);

  // Paginated list
  const totalPages = Math.ceil(sortedMaids.length / ITEMS_PER_PAGE) || apiTotalPages || 1;
  const paginatedMaids = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return sortedMaids.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedMaids, page]);

  // Handlers
  const handleResetFilters = () => {
    setFilters(defaultFilters);
    setSearchKeyword('');
    setCity('all');
    setSortBy('rating');
    setPage(1);
  };

  const handleOpenDetail = (maid: IMaidProfile) => {
    setSelectedMaid(maid);
    setDetailDialogOpen(true);
  };

  const handleOpenBooking = (maid: IMaidProfile) => {
    setSelectedMaidForBooking(maid);
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
            <CleaningServicesIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h4" fontWeight={900}>
              Find Verified Housekeeping & House Maids
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 600 }}>
            Book experienced house cleaning, deep cleaning, utensil washing & laundry staff near you.
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
              totalResults={sortedMaids.length}
            />
          </Grid2>

          {/* Results List */}
          <Grid2 size={{ xs: 12, md: 8.8 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  Available House Maids ({sortedMaids.length})
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
                  Filter ({sortedMaids.length})
                </MuiButton>

                <SortControl sortBy={sortBy} onSortChange={(s) => setSortBy(s)} totalCount={sortedMaids.length} itemType="maid" />
              </Stack>
            </Box>

            {providersLoading ? (
              <ListingSkeleton count={6} />
            ) : paginatedMaids.length === 0 ? (
              <EmptyListingState onResetFilters={handleResetFilters} />
            ) : (
              <Grid2 container spacing={2.5}>
                {paginatedMaids.map((maid) => (
                  <Grid2 key={maid.id} size={{ xs: 12, sm: 6 }}>
                    <ProviderCard
                      provider={maid}
                      type="maid"
                      onViewDetailsClick={(p) => handleOpenDetail(p as IMaidProfile)}
                      onBookClick={(p) => handleOpenBooking(p as IMaidProfile)}
                    />
                  </Grid2>
                ))}
              </Grid2>
            )}

            {!providersLoading && paginatedMaids.length > 0 && (
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
        <FilterPanel filters={filters} onFilterChange={handleFilterPanelChange} onResetFilters={handleResetFilters} totalResults={sortedMaids.length} />
        <MuiButton variant="contained" fullWidth onClick={() => setMobileFilterOpen(false)} sx={{ mt: 3, py: 1.2, fontWeight: 700, borderRadius: '10px' }}>
          Apply Filters ({sortedMaids.length})
        </MuiButton>
      </Drawer>

      {/* Modals */}
      <ProviderDetailDialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        provider={selectedMaid}
        type="maid"
        onBookNow={(maid) => {
          setDetailDialogOpen(false);
          handleOpenBooking(maid as IMaidProfile);
        }}
      />

      <QuickBookingDialog
        open={bookingDialogOpen}
        onClose={() => setBookingDialogOpen(false)}
        serviceTitle="Housekeeping Maid Service"
        providerName={selectedMaidForBooking?.name}
        estimatedPrice={selectedMaidForBooking ? `₹${selectedMaidForBooking.hourlyRate}/hr` : '₹200/hr'}
      />
    </Box>
  );
};

export default SearchMaid;

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ICookProfile, IMaidProfile } from '../types';
import {
  serviceApi,
  providerApi,
  ICatalogCategory,
  ICatalogService,
  ProviderQueryFilterParams,
} from '../services/api';

export type ServiceCategory = 'all' | 'cook' | 'maid' | 'combo' | 'cleaning' | 'healthcare';
export type HealthcareSubService = 'all' | 'physiotherapy' | 'occupational_therapy' | 'child_care' | 'adult_care';
export type SortOption = 'popular' | 'rating' | 'price_low' | 'price_high' | 'experience';
export type ViewMode = 'grid' | 'list';

export interface ServiceState {
  // Filter UI State
  searchQuery: string;
  category: ServiceCategory;
  healthcareSubService: HealthcareSubService;
  minRating: number;
  priceRange: [number, number];
  sortBy: SortOption;
  viewMode: ViewMode;
  currentPage: number;
  itemsPerPage: number;
  city: string;
  onlyVerified: boolean;
  onlyAvailable: boolean;

  // Live Data State
  categories: ICatalogCategory[];
  services: ICatalogService[];
  providers: (ICookProfile | IMaidProfile)[];
  selectedProvider: (ICookProfile | IMaidProfile) | null;
  selectedService: ICatalogService | null;
  totalProviders: number;
  totalPages: number;

  // Loading & Error States
  categoriesLoading: boolean;
  servicesLoading: boolean;
  providersLoading: boolean;
  providerDetailsLoading: boolean;
  error: string | null;
}

const initialState: ServiceState = {
  searchQuery: '',
  category: 'all',
  healthcareSubService: 'all',
  minRating: 0,
  priceRange: [150, 1000],
  sortBy: 'popular',
  viewMode: 'grid',
  currentPage: 1,
  itemsPerPage: 6,
  city: 'all',
  onlyVerified: false,
  onlyAvailable: false,

  categories: [],
  services: [],
  providers: [],
  selectedProvider: null,
  selectedService: null,
  totalProviders: 0,
  totalPages: 1,

  categoriesLoading: false,
  servicesLoading: false,
  providersLoading: false,
  providerDetailsLoading: false,
  error: null,
};

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const getCategories = createAsyncThunk(
  'service/getCategories',
  async (_, { rejectWithValue }) => {
    try {
      const res = await serviceApi.getCategories();
      return res.data || [];
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch categories';
      return rejectWithValue(msg);
    }
  },
);

export const getServices = createAsyncThunk(
  'service/getServices',
  async (categoryId: string, { rejectWithValue }) => {
    try {
      const res = await serviceApi.getServicesByCategory(categoryId);
      return res.data || [];
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch services';
      return rejectWithValue(msg);
    }
  },
);

export const getProviders = createAsyncThunk(
  'service/getProviders',
  async (params: ProviderQueryFilterParams | undefined, { rejectWithValue }) => {
    try {
      const res = await providerApi.getProviders(params);
      return {
        items: res.data?.items || [],
        total: res.data?.total || 0,
        page: res.data?.page || 1,
        totalPages: res.data?.totalPages || 1,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch providers';
      return rejectWithValue(msg);
    }
  },
);

export const searchProviders = createAsyncThunk(
  'service/searchProviders',
  async (params: ProviderQueryFilterParams, { rejectWithValue }) => {
    try {
      const res = await providerApi.searchProviders(params);
      return {
        items: res.data?.items || [],
        total: res.data?.total || 0,
        page: res.data?.page || 1,
        totalPages: res.data?.totalPages || 1,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to search providers';
      return rejectWithValue(msg);
    }
  },
);

export const filterProviders = createAsyncThunk(
  'service/filterProviders',
  async (params: ProviderQueryFilterParams, { rejectWithValue }) => {
    try {
      const res = await providerApi.getProviders(params);
      return {
        items: res.data?.items || [],
        total: res.data?.total || 0,
        page: res.data?.page || 1,
        totalPages: res.data?.totalPages || 1,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to filter providers';
      return rejectWithValue(msg);
    }
  },
);

export const getProviderDetails = createAsyncThunk(
  'service/getProviderDetails',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await providerApi.getProviderById(id);
      if (!res.data) throw new Error('Provider not found');
      return res.data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch provider details';
      return rejectWithValue(msg);
    }
  },
);

// ─── Service Slice ────────────────────────────────────────────────────────────

const serviceSlice = createSlice({
  name: 'service',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.currentPage = 1;
    },
    setCategory: (state, action: PayloadAction<ServiceCategory>) => {
      state.category = action.payload;
      state.currentPage = 1;
    },
    setHealthcareSubService: (state, action: PayloadAction<HealthcareSubService>) => {
      state.healthcareSubService = action.payload;
      state.currentPage = 1;
    },
    setMinRating: (state, action: PayloadAction<number>) => {
      state.minRating = action.payload;
      state.currentPage = 1;
    },
    setPriceRange: (state, action: PayloadAction<[number, number]>) => {
      state.priceRange = action.payload;
      state.currentPage = 1;
    },
    setSortBy: (state, action: PayloadAction<SortOption>) => {
      state.sortBy = action.payload;
      state.currentPage = 1;
    },
    setViewMode: (state, action: PayloadAction<ViewMode>) => {
      state.viewMode = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setCityFilter: (state, action: PayloadAction<string>) => {
      state.city = action.payload;
      state.currentPage = 1;
    },
    toggleOnlyVerified: (state) => {
      state.onlyVerified = !state.onlyVerified;
      state.currentPage = 1;
    },
    toggleOnlyAvailable: (state) => {
      state.onlyAvailable = !state.onlyAvailable;
      state.currentPage = 1;
    },
    setSelectedProvider: (state, action: PayloadAction<(ICookProfile | IMaidProfile) | null>) => {
      state.selectedProvider = action.payload;
    },
    resetAllServiceFilters: (state) => {
      state.searchQuery = '';
      state.category = 'all';
      state.minRating = 0;
      state.priceRange = [150, 1000];
      state.sortBy = 'popular';
      state.currentPage = 1;
      state.city = 'all';
      state.onlyVerified = false;
      state.onlyAvailable = false;
    },
  },
  extraReducers: (builder) => {
    // ── Get Categories ──
    builder.addCase(getCategories.pending, (state) => {
      state.categoriesLoading = true;
    });
    builder.addCase(getCategories.fulfilled, (state, action) => {
      state.categoriesLoading = false;
      state.categories = action.payload;
    });
    builder.addCase(getCategories.rejected, (state, action) => {
      state.categoriesLoading = false;
      state.error = (action.payload as string) || 'Failed to load categories';
    });

    // ── Get Services ──
    builder.addCase(getServices.pending, (state) => {
      state.servicesLoading = true;
    });
    builder.addCase(getServices.fulfilled, (state, action) => {
      state.servicesLoading = false;
      state.services = action.payload;
    });
    builder.addCase(getServices.rejected, (state, action) => {
      state.servicesLoading = false;
      state.error = (action.payload as string) || 'Failed to load services';
    });

    // ── Get Providers ──
    builder.addCase(getProviders.pending, (state) => {
      state.providersLoading = true;
      state.error = null;
    });
    builder.addCase(getProviders.fulfilled, (state, action) => {
      state.providersLoading = false;
      state.providers = action.payload.items;
      state.totalProviders = action.payload.total;
      state.totalPages = action.payload.totalPages;
    });
    builder.addCase(getProviders.rejected, (state, action) => {
      state.providersLoading = false;
      state.error = (action.payload as string) || 'Failed to load providers';
    });

    // ── Search Providers ──
    builder.addCase(searchProviders.pending, (state) => {
      state.providersLoading = true;
      state.error = null;
    });
    builder.addCase(searchProviders.fulfilled, (state, action) => {
      state.providersLoading = false;
      state.providers = action.payload.items;
      state.totalProviders = action.payload.total;
      state.totalPages = action.payload.totalPages;
    });
    builder.addCase(searchProviders.rejected, (state, action) => {
      state.providersLoading = false;
      state.error = (action.payload as string) || 'Search failed';
    });

    // ── Filter Providers ──
    builder.addCase(filterProviders.pending, (state) => {
      state.providersLoading = true;
      state.error = null;
    });
    builder.addCase(filterProviders.fulfilled, (state, action) => {
      state.providersLoading = false;
      state.providers = action.payload.items;
      state.totalProviders = action.payload.total;
      state.totalPages = action.payload.totalPages;
    });
    builder.addCase(filterProviders.rejected, (state, action) => {
      state.providersLoading = false;
      state.error = (action.payload as string) || 'Filter failed';
    });

    // ── Get Provider Details ──
    builder.addCase(getProviderDetails.pending, (state) => {
      state.providerDetailsLoading = true;
      state.error = null;
    });
    builder.addCase(getProviderDetails.fulfilled, (state, action) => {
      state.providerDetailsLoading = false;
      state.selectedProvider = action.payload;
    });
    builder.addCase(getProviderDetails.rejected, (state, action) => {
      state.providerDetailsLoading = false;
      state.error = (action.payload as string) || 'Failed to load provider details';
    });
  },
});

export const {
  setSearchQuery,
  setCategory,
  setHealthcareSubService,
  setMinRating,
  setPriceRange,
  setSortBy,
  setViewMode,
  setCurrentPage,
  setCityFilter,
  toggleOnlyVerified,
  toggleOnlyAvailable,
  setSelectedProvider,
  resetAllServiceFilters,
} = serviceSlice.actions;

export default serviceSlice.reducer;

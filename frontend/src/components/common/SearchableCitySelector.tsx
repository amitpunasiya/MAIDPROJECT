import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Popover,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import MyLocationIcon from '@mui/icons-material/MyLocation';

import locationApi, {
  IGlobalSearchResult,
  IReverseGeocodeResult,
} from '../../services/api/location.api';

export interface SearchableCityValue {
  cityName: string;
  stateName?: string;
  countryName?: string;
  stateCode?: string;
  countryCode?: string;
  latitude?: number | null;
  longitude?: number | null;
}

const POPULAR_CITIES = [
  { cityName: 'Bengaluru', stateName: 'Karnataka', countryName: 'India' },
  { cityName: 'Mumbai', stateName: 'Maharashtra', countryName: 'India' },
  { cityName: 'Delhi NCR', stateName: 'Delhi', countryName: 'India' },
  { cityName: 'Hyderabad', stateName: 'Telangana', countryName: 'India' },
  { cityName: 'Pune', stateName: 'Maharashtra', countryName: 'India' },
  { cityName: 'Chennai', stateName: 'Tamil Nadu', countryName: 'India' },
  { cityName: 'Kolkata', stateName: 'West Bengal', countryName: 'India' },
];

interface SearchableCitySelectorProps {
  value: string | SearchableCityValue;
  onChange: (val: SearchableCityValue) => void;
  variant?: 'navbar' | 'hero' | 'default';
  fullWidth?: boolean;
}

export const SearchableCitySelector: React.FC<SearchableCitySelectorProps> = ({
  value,
  onChange,
  variant = 'default',
  fullWidth = false,
}) => {
  const currentCityName = typeof value === 'string' ? value : value?.cityName || 'Bengaluru';

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<IGlobalSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsAlert, setGpsAlert] = useState<string | null>(null);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
    setQuery('');
    setResults([]);
    setApiError(null);
    setGpsAlert(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Debounced search when query changes
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      setApiError(null);
      return;
    }

    setLoading(true);
    setApiError(null);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const searchResults = await locationApi.searchGlobalLocations(query.trim(), 20);
        setResults(searchResults);
      } catch (_err) {
        setApiError('Unable to search locations. Please try again.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [query]);

  // Current Location Handler
  const handleUseCurrentLocation = () => {
    setGpsAlert(null);
    if (!navigator.geolocation) {
      setGpsAlert('Unable to detect your location. Please try again or search manually.');
      return;
    }

    setDetectingGps(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const res: IReverseGeocodeResult = await locationApi.reverseGeocode(lat, lng);

          onChange({
            cityName: res.city,
            stateName: res.state,
            countryName: res.country,
            stateCode: res.stateCode,
            countryCode: res.countryCode,
            latitude: lat,
            longitude: lng,
          });

          handleClose();
        } catch (_e) {
          setGpsAlert('Could not determine your address. Please search manually.');
        } finally {
          setDetectingGps(false);
        }
      },
      (err) => {
        setDetectingGps(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsAlert('Location permission was denied. Please search for your address manually.');
        } else {
          setGpsAlert('Unable to detect your location. Please try again or search manually.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSelectCity = (city: SearchableCityValue) => {
    onChange(city);
    handleClose();
  };

  const isOpen = Boolean(anchorEl);

  return (
    <>
      {variant === 'hero' ? (
        <Button
          onClick={handleOpen}
          fullWidth={fullWidth}
          variant="outlined"
          startIcon={<LocationOnIcon color="primary" />}
          endIcon={<KeyboardArrowDownIcon />}
          sx={{
            justify: 'space-between',
            borderRadius: '10px',
            borderColor: '#CBD5E1',
            color: '#1E293B',
            fontWeight: 700,
            py: 1.3,
            px: 2,
            bgcolor: '#FFF',
            textTransform: 'none',
            '&:hover': { bgcolor: '#F8FAFC', borderColor: 'primary.main' },
          }}
        >
          <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mr: 'auto' }}>
            {currentCityName}
          </Box>
        </Button>
      ) : variant === 'navbar' ? (
        <Button
          onClick={handleOpen}
          startIcon={<LocationOnIcon sx={{ color: 'primary.main' }} />}
          endIcon={<KeyboardArrowDownIcon sx={{ color: 'text.secondary', fontSize: 18 }} />}
          sx={{
            bgcolor: 'background.default',
            color: 'text.primary',
            fontWeight: 700,
            fontSize: '0.875rem',
            borderRadius: '10px',
            px: 1.8,
            py: 0.8,
            border: '1px solid',
            borderColor: 'divider',
            textTransform: 'none',
          }}
        >
          {currentCityName}
        </Button>
      ) : (
        <Button
          onClick={handleOpen}
          fullWidth={fullWidth}
          startIcon={<LocationOnIcon color="primary" />}
          endIcon={<KeyboardArrowDownIcon />}
          sx={{ fontWeight: 700, textTransform: 'none' }}
        >
          {currentCityName}
        </Button>
      )}

      <Popover
        open={isOpen}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          sx: {
            mt: 1,
            width: { xs: 300, sm: 340 },
            borderRadius: 3.5,
            boxShadow: '0 12px 32px -4px rgba(15, 23, 42, 0.15)',
            overflow: 'hidden',
            border: '1px solid #E2E8F0',
          },
        }}
      >
        <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
          <TextField
            autoFocus
            fullWidth
            size="small"
            placeholder="🔍 Search city (e.g. Indore, London)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ bgcolor: '#FFF', borderRadius: 2 }}
          />

          <Button
            variant="text"
            color="primary"
            size="small"
            startIcon={detectingGps ? <CircularProgress size={14} /> : <MyLocationIcon fontSize="small" />}
            onClick={handleUseCurrentLocation}
            disabled={detectingGps}
            sx={{ mt: 1, fontWeight: 700, fontSize: '0.78rem', textTransform: 'none', px: 0 }}
          >
            {detectingGps ? 'Detecting location...' : '📍 Use my current location'}
          </Button>

          {gpsAlert && (
            <Alert severity="warning" sx={{ mt: 1, fontSize: '0.75rem', py: 0, borderRadius: 2 }}>
              {gpsAlert}
            </Alert>
          )}
        </Box>

        <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3, gap: 1.5 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                Searching locations...
              </Typography>
            </Box>
          ) : apiError ? (
            <Box sx={{ p: 2.5, textAlign: 'center' }}>
              <Typography variant="body2" color="error.main" fontWeight={600}>
                {apiError}
              </Typography>
            </Box>
          ) : query.trim().length >= 2 ? (
            results.length > 0 ? (
              <List disablePadding>
                {results.map((item, idx) => (
                  <ListItem key={`${item.cityName}-${item.countryCode}-${idx}`} disablePadding>
                    <ListItemButton
                      onClick={() =>
                        handleSelectCity({
                          cityName: item.cityName,
                          stateName: item.stateName,
                          countryName: item.countryName,
                          stateCode: item.stateCode,
                          countryCode: item.countryCode,
                          latitude: item.latitude,
                          longitude: item.longitude,
                        })
                      }
                      sx={{ py: 1.2, px: 2 }}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <LocationOnIcon fontSize="small" color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" fontWeight={800} color="text.primary">
                            {item.cityName}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {item.stateName ? `${item.stateName}, ` : ''}
                            {item.countryName}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  No cities found
                </Typography>
              </Box>
            )
          ) : (
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ px: 2, pt: 1.5, pb: 0.5, display: 'block' }}>
                POPULAR CITIES
              </Typography>
              <List disablePadding>
                {POPULAR_CITIES.map((c) => (
                  <ListItem key={c.cityName} disablePadding>
                    <ListItemButton onClick={() => handleSelectCity(c)} sx={{ py: 1, px: 2 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <LocationOnIcon fontSize="small" sx={{ color: c.cityName === currentCityName ? 'primary.main' : 'text.disabled' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight={c.cityName === currentCityName ? 800 : 600}>
                            {c.cityName}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {c.stateName}, {c.countryName}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default SearchableCitySelector;

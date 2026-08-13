import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Grid2,
  Autocomplete,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import myLocationIcon from '@mui/icons-material/MyLocation';
import locationOnIcon from '@mui/icons-material/LocationOn';
import locationApi, {
  IGlobalCountry,
  IGlobalState,
  IGlobalCity,
  IReverseGeocodeResult,
} from '../../services/api/location.api';

export interface LocationSelectionValue {
  country: string;
  countryCode: string;
  state: string;
  stateCode: string;
  city: string;
  pincode?: string;
  street?: string;
  formattedAddress?: string;
  latitude?: number;
  longitude?: number;
}

interface GlobalLocationSelectorProps {
  value?: Partial<LocationSelectionValue>;
  onChange: (val: LocationSelectionValue) => void;
  showCurrentLocationButton?: boolean;
  compact?: boolean;
}

export const GlobalLocationSelector: React.FC<GlobalLocationSelectorProps> = ({
  value,
  onChange,
  showCurrentLocationButton = true,
  compact = false,
}) => {
  const [countries, setCountries] = useState<IGlobalCountry[]>([]);
  const [states, setStates] = useState<IGlobalState[]>([]);
  const [cities, setCities] = useState<IGlobalCity[]>([]);

  const [selectedCountry, setSelectedCountry] = useState<IGlobalCountry | null>(null);
  const [selectedState, setSelectedState] = useState<IGlobalState | null>(null);
  const [selectedCity, setSelectedCity] = useState<IGlobalCity | null>(null);

  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  const [detectingLocation, setDetectingLocation] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Fetch Countries on mount
  useEffect(() => {
    let isMounted = true;
    const loadCountries = async () => {
      setLoadingCountries(true);
      try {
        const list = await locationApi.getCountries();
        if (isMounted) {
          setCountries(list);
          // Default to India if not specified
          const defaultC = list.find((c) => c.isoCode === (value?.countryCode || 'IN')) || list[0] || null;
          if (defaultC) setSelectedCountry(defaultC);
        }
      } catch (_err) {
        if (isMounted) setCountries([]);
      } finally {
        if (isMounted) setLoadingCountries(false);
      }
    };
    void loadCountries();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch States when Selected Country changes
  useEffect(() => {
    if (!selectedCountry) {
      setStates([]);
      setSelectedState(null);
      return;
    }

    let isMounted = true;
    const loadStates = async () => {
      setLoadingStates(true);
      try {
        const list = await locationApi.getStates(selectedCountry.isoCode);
        if (isMounted) {
          setStates(list);
          if (value?.stateCode || value?.state) {
            const matchedS = list.find(
              (s) => s.isoCode === value.stateCode || s.name.toLowerCase() === value.state?.toLowerCase()
            );
            if (matchedS) setSelectedState(matchedS);
          }
        }
      } catch (_err) {
        if (isMounted) setStates([]);
      } finally {
        if (isMounted) setLoadingStates(false);
      }
    };
    void loadStates();
    return () => {
      isMounted = false;
    };
  }, [selectedCountry]);

  // Fetch Cities when Selected State changes
  useEffect(() => {
    if (!selectedState || !selectedCountry) {
      setCities([]);
      setSelectedCity(null);
      return;
    }

    let isMounted = true;
    const loadCities = async () => {
      setLoadingCities(true);
      try {
        const list = await locationApi.getCities(selectedState.isoCode, selectedCountry.isoCode);
        if (isMounted) {
          setCities(list);
          if (value?.city) {
            const matchedC = list.find((c) => c.name.toLowerCase() === value.city?.toLowerCase());
            if (matchedC) setSelectedCity(matchedC);
          }
        }
      } catch (_err) {
        if (isMounted) setCities([]);
      } finally {
        if (isMounted) setLoadingCities(false);
      }
    };
    void loadCities();
    return () => {
      isMounted = false;
    };
  }, [selectedState, selectedCountry]);

  const emitChange = useCallback(
    (c: IGlobalCountry | null, s: IGlobalState | null, ci: IGlobalCity | null, extra?: Partial<LocationSelectionValue>) => {
      onChange({
        country: c ? c.name : value?.country || 'India',
        countryCode: c ? c.isoCode : value?.countryCode || 'IN',
        state: s ? s.name : value?.state || '',
        stateCode: s ? s.isoCode : value?.stateCode || '',
        city: ci ? ci.name : value?.city || '',
        pincode: extra?.pincode || value?.pincode || '',
        street: extra?.street || value?.street || '',
        formattedAddress: extra?.formattedAddress || (ci && s && c ? `${ci.name}, ${s.name}, ${c.name}` : ''),
        latitude: extra?.latitude || ci?.latitude || undefined,
        longitude: extra?.longitude || ci?.longitude || undefined,
      });
    },
    [onChange, value]
  );

  const handleCountrySelect = (_: any, newC: IGlobalCountry | null) => {
    setSelectedCountry(newC);
    setSelectedState(null);
    setSelectedCity(null);
    emitChange(newC, null, null);
  };

  const handleStateSelect = (_: any, newS: IGlobalState | null) => {
    setSelectedState(newS);
    setSelectedCity(null);
    emitChange(selectedCountry, newS, null);
  };

  const handleCitySelect = (_: any, newCi: IGlobalCity | null) => {
    setSelectedCity(newCi);
    emitChange(selectedCountry, selectedState, newCi);
  };

  // "Use My Current Location" via Browser Geolocation API
  const handleUseCurrentLocation = () => {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setDetectingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const resolved: IReverseGeocodeResult = await locationApi.reverseGeocode(lat, lng);

          // Find country & state
          const matchedCountry = countries.find((c) => c.isoCode === resolved.countryCode || c.name.toLowerCase() === resolved.country.toLowerCase()) || null;
          setSelectedCountry(matchedCountry);

          if (matchedCountry) {
            const stateList = await locationApi.getStates(matchedCountry.isoCode);
            setStates(stateList);
            const matchedState = stateList.find((s) => s.isoCode === resolved.stateCode || s.name.toLowerCase() === resolved.state.toLowerCase()) || null;
            setSelectedState(matchedState);

            if (matchedState) {
              const cityList = await locationApi.getCities(matchedState.isoCode, matchedCountry.isoCode);
              setCities(cityList);
              const matchedCity = cityList.find((ci) => ci.name.toLowerCase() === resolved.city.toLowerCase()) || null;
              setSelectedCity(matchedCity);
            }
          }

          onChange({
            country: resolved.country,
            countryCode: resolved.countryCode,
            state: resolved.state,
            stateCode: resolved.stateCode,
            city: resolved.city,
            pincode: resolved.pincode,
            street: resolved.street,
            formattedAddress: resolved.formattedAddress,
            latitude: lat,
            longitude: lng,
          });
        } catch (_err) {
          setGeoError('Failed to resolve current coordinates into location details.');
        } finally {
          setDetectingLocation(false);
        }
      },
      (error) => {
        setDetectingLocation(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGeoError('Location permission denied. Please select your country, state, and city manually.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setGeoError('Location position unavailable. Please select location manually.');
        } else if (error.code === error.TIMEOUT) {
          setGeoError('Location request timed out. Please try again or select manually.');
        } else {
          setGeoError('Unable to detect location. Please select manually.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      {showCurrentLocationButton && (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            startIcon={detectingLocation ? <CircularProgress size={16} /> : React.createElement(myLocationIcon)}
            onClick={handleUseCurrentLocation}
            disabled={detectingLocation}
            sx={{ fontWeight: 700, borderRadius: '10px', textTransform: 'none' }}
          >
            {detectingLocation ? 'Detecting Location...' : 'Use My Current Location'}
          </Button>
        </Box>
      )}

      {geoError && (
        <Alert severity="warning" onClose={() => setGeoError(null)} sx={{ mb: 2, borderRadius: 2 }}>
          {geoError}
        </Alert>
      )}

      <Grid2 container spacing={2}>
        {/* Country Selector */}
        <Grid2 size={{ xs: 12, sm: compact ? 12 : 4 }}>
          <Autocomplete
            options={countries}
            getOptionLabel={(option) => `${option.flag ? option.flag + ' ' : ''}${option.name}`}
            value={selectedCountry}
            onChange={handleCountrySelect}
            loading={loadingCountries}
            isOptionEqualToValue={(opt, val) => opt.isoCode === val.isoCode}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Country"
                size="small"
                required
                placeholder="Search Country..."
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingCountries ? <CircularProgress color="inherit" size={18} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Grid2>

        {/* State / Province Selector */}
        <Grid2 size={{ xs: 12, sm: compact ? 12 : 4 }}>
          <Autocomplete
            options={states}
            getOptionLabel={(option) => option.name}
            value={selectedState}
            onChange={handleStateSelect}
            disabled={!selectedCountry || loadingStates}
            loading={loadingStates}
            isOptionEqualToValue={(opt, val) => opt.isoCode === val.isoCode}
            renderInput={(params) => (
              <TextField
                {...params}
                label="State / Province"
                size="small"
                required
                placeholder={selectedCountry ? 'Select State...' : 'Select Country First'}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingStates ? <CircularProgress color="inherit" size={18} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Grid2>

        {/* City Selector */}
        <Grid2 size={{ xs: 12, sm: compact ? 12 : 4 }}>
          <Autocomplete
            options={cities}
            getOptionLabel={(option) => option.name}
            value={selectedCity}
            onChange={handleCitySelect}
            disabled={!selectedState || loadingCities}
            loading={loadingCities}
            isOptionEqualToValue={(opt, val) => opt.name === val.name}
            renderInput={(params) => (
              <TextField
                {...params}
                label="City"
                size="small"
                required
                placeholder={selectedState ? 'Select City...' : 'Select State First'}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: React.createElement(locationOnIcon, { color: 'action', fontSize: 'small', sx: { mr: 0.5 } }),
                  endAdornment: (
                    <>
                      {loadingCities ? <CircularProgress color="inherit" size={18} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Grid2>
      </Grid2>
    </Box>
  );
};

export default GlobalLocationSelector;

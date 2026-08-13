import React, { useEffect, useState } from 'react';
import { Paper, InputBase, IconButton, Box, Select, MenuItem, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import locationApi from '../../services/api/location.api';

interface ProviderSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCity: string;
  onCityChange: (city: string) => void;
  onSearchSubmit?: () => void;
}

export const ProviderSearch: React.FC<ProviderSearchProps> = ({
  searchQuery,
  onSearchChange,
  selectedCity,
  onCityChange,
  onSearchSubmit,
}) => {
  const [cityList, setCityList] = useState<string[]>(['Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Indore', 'London', 'Toronto', 'Dubai']);

  useEffect(() => {
    let isMounted = true;
    const fetchGlobalCities = async () => {
      try {
        const citiesData = await locationApi.getCities('KA', 'IN');
        if (isMounted && citiesData.length > 0) {
          const names = Array.from(new Set([...citiesData.map((c) => c.name), 'Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Indore', 'London', 'Toronto', 'Dubai']));
          setCityList(names);
        }
      } catch (_e) {
        // Keep default list
      }
    };
    void fetchGlobalCities();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchSubmit) onSearchSubmit();
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      elevation={3}
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        width: '100%',
        bgcolor: '#FFFFFF',
        borderRadius: 4,
        p: 1.5,
        gap: 1.5,
        boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.08)',
        border: '1px solid #E2E8F0',
      }}
    >
      {/* City Location Dropdown */}
      <Box sx={{ width: { xs: '100%', sm: 190 } }}>
        <Select
          fullWidth
          size="small"
          value={selectedCity}
          onChange={(e) => onCityChange(e.target.value)}
          startAdornment={
            <InputAdornment position="start">
              <LocationOnIcon color="primary" fontSize="small" />
            </InputAdornment>
          }
          sx={{ borderRadius: '12px', bgcolor: '#F8FAFC', fontWeight: 700 }}
        >
          <MenuItem value="all">All Cities</MenuItem>
          {cityList.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* Search Input Box */}
      <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, width: '100%', px: 1 }}>
        <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 22 }} />
        <InputBase
          fullWidth
          placeholder="Search by provider name, specialty, cook, maid, or area..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{ fontSize: '0.95rem', fontWeight: 500 }}
        />
        {searchQuery && (
          <IconButton size="small" onClick={() => onSearchChange('')}>
            <ClearIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Search Submit Button */}
      <Box
        onClick={handleSubmit}
        sx={{
          bgcolor: 'primary.main',
          color: '#FFF',
          px: 3.5,
          py: 1.2,
          borderRadius: '12px',
          fontWeight: 800,
          fontSize: '0.9rem',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          width: { xs: '100%', sm: 'auto' },
          textAlign: 'center',
          transition: 'all 0.2s ease',
          '&:hover': { bgcolor: 'primary.dark' },
        }}
      >
        Find Providers
      </Box>
    </Paper>
  );
};

export default ProviderSearch;

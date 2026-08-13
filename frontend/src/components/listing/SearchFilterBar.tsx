import React, { useEffect, useState } from 'react';
import {
  Paper,
  Grid2,
  MenuItem,
  Select,
  InputAdornment,
  TextField,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CategoryIcon from '@mui/icons-material/Category';
import { Button } from '../';
import locationApi from '../../services/api/location.api';

interface SearchFilterBarProps {
  searchKeyword: string;
  onSearchKeywordChange: (val: string) => void;
  city: string;
  onCityChange: (val: string) => void;
  serviceType: string;
  onServiceTypeChange: (val: string) => void;
  date: string;
  onDateChange: (val: string) => void;
  timeSlot: string;
  onTimeSlotChange: (val: string) => void;
  onSearchSubmit?: () => void;
  onSearch?: () => void;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchKeyword,
  onSearchKeywordChange,
  city,
  onCityChange,
  serviceType,
  onServiceTypeChange,
  date,
  onDateChange,
  timeSlot,
  onTimeSlotChange,
  onSearchSubmit,
  onSearch,
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

  const handleSubmit = () => {
    if (onSearchSubmit) onSearchSubmit();
    else if (onSearch) onSearch();
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 2.5 },
        borderRadius: 4,
        border: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
        boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.08)',
      }}
    >
      <Grid2 container spacing={2} alignItems="center">
        {/* Keyword Search Input */}
        <Grid2 size={{ xs: 12, md: 3 }}>
          <TextField
            placeholder="Search cook name or specialty..."
            value={searchKeyword}
            onChange={(e) => onSearchKeywordChange(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              },
            }}
            size="small"
            fullWidth
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#F8FAFC' } }}
          />
        </Grid2>

        {/* City Filter */}
        <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
          <Select
            size="small"
            fullWidth
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <LocationOnIcon fontSize="small" color="primary" />
              </InputAdornment>
            }
            sx={{ borderRadius: '10px', bgcolor: '#F8FAFC' }}
          >
            <MenuItem value="all">All Cities</MenuItem>
            {cityList.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </Select>
        </Grid2>

        {/* Service Type Selection */}
        <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
          <Select
            size="small"
            fullWidth
            value={serviceType}
            onChange={(e) => onServiceTypeChange(e.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <CategoryIcon fontSize="small" color="primary" />
              </InputAdornment>
            }
            sx={{ borderRadius: '10px', bgcolor: '#F8FAFC' }}
          >
            <MenuItem value="cook">Cook / Chef</MenuItem>
            <MenuItem value="maid">House Maid</MenuItem>
            <MenuItem value="both">Cook + Maid Combo</MenuItem>
          </Select>
        </Grid2>

        {/* Booking Start Date */}
        <Grid2 size={{ xs: 6, sm: 6, md: 2 }}>
          <TextField
            type="date"
            size="small"
            fullWidth
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarMonthIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#F8FAFC' } }}
          />
        </Grid2>

        {/* Preferred Time Slot */}
        <Grid2 size={{ xs: 6, sm: 6, md: 1.5 }}>
          <Select
            size="small"
            fullWidth
            value={timeSlot}
            onChange={(e) => onTimeSlotChange(e.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <AccessTimeIcon fontSize="small" color="action" />
              </InputAdornment>
            }
            sx={{ borderRadius: '10px', bgcolor: '#F8FAFC' }}
          >
            <MenuItem value="all">Any Time</MenuItem>
            <MenuItem value="morning">Morning (7 AM - 12 PM)</MenuItem>
            <MenuItem value="afternoon">Afternoon (12 PM - 4 PM)</MenuItem>
            <MenuItem value="evening">Evening (4 PM - 9 PM)</MenuItem>
          </Select>
        </Grid2>

        {/* Search CTA Button */}
        <Grid2 size={{ xs: 12, md: 1.5 }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSubmit}
            sx={{ borderRadius: '10px', py: 1, fontWeight: 800 }}
          >
            Search
          </Button>
        </Grid2>
      </Grid2>
    </Paper>
  );
};

export default SearchFilterBar;

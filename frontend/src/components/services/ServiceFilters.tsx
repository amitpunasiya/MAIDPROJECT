import React from 'react';
import {
  Box,
  Typography,
  Divider,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Slider,
  Switch,
  Button as MuiButton,
} from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import { ServiceCategory, HealthcareSubService, SortOption } from '../../store/serviceSlice';

interface ServiceFiltersProps {
  category?: ServiceCategory;
  onCategoryChange?: (category: ServiceCategory) => void;
  healthcareSubService?: HealthcareSubService;
  onHealthcareSubServiceChange?: (sub: HealthcareSubService) => void;
  minRating: number;
  onRatingChange?: (val: number) => void;
  onMinRatingChange?: (val: number) => void;
  priceRange: [number, number];
  onPriceRangeChange: (val: [number, number]) => void;
  sortBy?: SortOption;
  onSortByChange?: (val: SortOption) => void;
  onlyVerified: boolean;
  onVerifiedToggle?: () => void;
  onToggleVerified?: () => void;
  onlyAvailable: boolean;
  onAvailableToggle?: () => void;
  onToggleAvailable?: () => void;
  onResetAll: () => void;
}

export const ServiceFilters: React.FC<ServiceFiltersProps> = ({
  category,
  onCategoryChange,
  healthcareSubService,
  onHealthcareSubServiceChange,
  minRating,
  onRatingChange,
  onMinRatingChange,
  priceRange,
  onPriceRangeChange,
  onlyVerified,
  onVerifiedToggle,
  onToggleVerified,
  onlyAvailable,
  onAvailableToggle,
  onToggleAvailable,
  onResetAll,
}) => {
  const handleRating = onRatingChange || onMinRatingChange || (() => {});
  const handleVerified = onVerifiedToggle || onToggleVerified || (() => {});
  const handleAvailable = onAvailableToggle || onToggleAvailable || (() => {});

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterAltIcon color="primary" />
          <Typography variant="h6" fontWeight={800}>
            Filter Results
          </Typography>
        </Box>
        <MuiButton
          size="small"
          startIcon={<RestartAltIcon />}
          onClick={onResetAll}
          sx={{ fontWeight: 700, fontSize: '0.75rem' }}
        >
          Reset
        </MuiButton>
      </Box>
      <Divider sx={{ mb: 3 }} />

      {/* Category Radio Filter */}
      {category && onCategoryChange && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={800} gutterBottom>
            Service Category
          </Typography>
          <FormControl component="fieldset">
            <RadioGroup
              value={category}
              onChange={(e) => onCategoryChange(e.target.value as ServiceCategory)}
            >
              <FormControlLabel value="all" control={<Radio size="small" />} label="All Categories" />
              <FormControlLabel value="cook" control={<Radio size="small" />} label="Home Cooks" />
              <FormControlLabel value="maid" control={<Radio size="small" />} label="House Maids" />
              <FormControlLabel value="combo" control={<Radio size="small" />} label="Cook + Maid Combo" />
              <FormControlLabel value="cleaning" control={<Radio size="small" />} label="Deep Cleaning" />
              <FormControlLabel value="healthcare" control={<Radio size="small" />} label="Health Care" />
            </RadioGroup>
          </FormControl>
          <Divider sx={{ my: 2.5 }} />
        </Box>
      )}

      {/* Health Care Sub-Service Specific Radio Filter */}
      {category === 'healthcare' && onHealthcareSubServiceChange && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={800} color="primary.main" gutterBottom>
            Health Care Service Type
          </Typography>
          <FormControl component="fieldset">
            <RadioGroup
              value={healthcareSubService || 'all'}
              onChange={(e) => onHealthcareSubServiceChange(e.target.value as HealthcareSubService)}
            >
              <FormControlLabel value="all" control={<Radio size="small" />} label="All Health Care" />
              <FormControlLabel value="physiotherapy" control={<Radio size="small" />} label="Physiotherapy" />
              <FormControlLabel value="occupational_therapy" control={<Radio size="small" />} label="Occupational Therapy" />
              <FormControlLabel value="child_care" control={<Radio size="small" />} label="Child Care" />
              <FormControlLabel value="adult_care" control={<Radio size="small" />} label="Adult Care" />
            </RadioGroup>
          </FormControl>
          <Divider sx={{ my: 2.5 }} />
        </Box>
      )}

      {/* Minimum Rating */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" fontWeight={800} gutterBottom>
          Minimum Rating
        </Typography>
        <FormControl component="fieldset">
          <RadioGroup value={minRating} onChange={(e) => handleRating(Number(e.target.value))}>
            <FormControlLabel value={0} control={<Radio size="small" />} label="Any Rating" />
            <FormControlLabel value={4} control={<Radio size="small" />} label="4.0 ⭐ and above" />
            <FormControlLabel value={4.5} control={<Radio size="small" />} label="4.5 ⭐ and above" />
            <FormControlLabel value={4.8} control={<Radio size="small" />} label="4.8 ⭐ Top Rated" />
          </RadioGroup>
        </FormControl>
      </Box>
      <Divider sx={{ mb: 3 }} />

      {/* Price Range Slider */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" fontWeight={800} gutterBottom>
          Hourly Rate (₹)
        </Typography>
        <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 1 }}>
          ₹{priceRange[0]} — ₹{priceRange[1]}/hr
        </Typography>
        <Slider
          value={priceRange}
          onChange={(_, val) => onPriceRangeChange(val as [number, number])}
          min={100}
          max={1200}
          step={50}
          valueLabelDisplay="auto"
          size="small"
        />
      </Box>
      <Divider sx={{ mb: 3 }} />

      {/* Toggles */}
      <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <FormControlLabel
          control={<Switch checked={onlyVerified} onChange={handleVerified} color="primary" size="small" />}
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <VerifiedUserIcon fontSize="small" color="primary" />
              <Typography variant="body2" fontWeight={700}>
                Verified Only
              </Typography>
            </Box>
          }
        />
        <FormControlLabel
          control={<Switch checked={onlyAvailable} onChange={handleAvailable} color="primary" size="small" />}
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <FlashOnIcon fontSize="small" color="success" />
              <Typography variant="body2" fontWeight={700}>
                Available Today
              </Typography>
            </Box>
          }
        />
      </Box>
    </Box>
  );
};

export default ServiceFilters;

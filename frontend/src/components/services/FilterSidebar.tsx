import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Divider,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Slider,
  Switch,
  Select,
  MenuItem,
  Button as MuiButton,
  Chip,
  Stack,
} from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import VerifiedIcon from '@mui/icons-material/Verified';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import { ISearchFilters } from '../../types';

interface FilterSidebarProps {
  filters: ISearchFilters;
  onFilterChange: (newFilters: Partial<ISearchFilters>) => void;
  onResetFilters: () => void;
  totalCount?: number;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalCount,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        border: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterAltIcon color="primary" />
          <Typography variant="h6" fontWeight={800} color="text.primary">
            Filter Services {totalCount !== undefined && `(${totalCount})`}
          </Typography>
        </Box>
        <MuiButton
          size="small"
          onClick={onResetFilters}
          startIcon={<RestartAltIcon fontSize="small" />}
          sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
        >
          Reset
        </MuiButton>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* 1. Category Filter */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1.5 }}>
          Category
        </Typography>
        <Select
          fullWidth
          size="small"
          value={filters.serviceType || 'all'}
          onChange={(e) => onFilterChange({ serviceType: e.target.value })}
          sx={{ borderRadius: '10px', fontWeight: 700 }}
        >
          <MenuItem value="all">All Categories</MenuItem>
          <MenuItem value="cook">Cook / Chef</MenuItem>
          <MenuItem value="maid">House Maid</MenuItem>
          <MenuItem value="babysitter">Babysitter & Nanny</MenuItem>
          <MenuItem value="eldercare">Elder Care</MenuItem>
          <MenuItem value="driver">Personal Driver</MenuItem>
          <MenuItem value="cleaning">House Cleaning</MenuItem>
          <MenuItem value="laundry">Laundry Care</MenuItem>
          <MenuItem value="cooking_helper">Cooking Helper</MenuItem>
        </Select>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* 2. Rating Filter */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
          Minimum Rating
        </Typography>
        <FormControl component="fieldset">
          <RadioGroup
            value={filters.minRating?.toString() || '0'}
            onChange={(e) => onFilterChange({ minRating: Number(e.target.value) })}
          >
            <FormControlLabel value="0" control={<Radio size="small" />} label={<Typography variant="body2">All Ratings</Typography>} />
            <FormControlLabel value="4.0" control={<Radio size="small" />} label={<Typography variant="body2">4.0 ★ & above</Typography>} />
            <FormControlLabel value="4.5" control={<Radio size="small" />} label={<Typography variant="body2">4.5 ★ & above</Typography>} />
            <FormControlLabel value="4.8" control={<Radio size="small" />} label={<Typography variant="body2">4.8 ★ Top Rated</Typography>} />
          </RadioGroup>
        </FormControl>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* 3. Gender Filter */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1.5 }}>
          Staff Gender
        </Typography>
        <Stack direction="row" spacing={1}>
          {[
            { label: 'All', val: 'all' },
            { label: 'Female', val: 'Female' },
            { label: 'Male', val: 'Male' },
          ].map((g) => (
            <Chip
              key={g.val}
              label={g.label}
              onClick={() => onFilterChange({ gender: g.val })}
              color={filters.gender === g.val ? 'primary' : 'default'}
              variant={filters.gender === g.val ? 'filled' : 'outlined'}
              sx={{ fontWeight: 700, borderRadius: '8px' }}
            />
          ))}
        </Stack>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* 4. Price Range Slider */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle2" fontWeight={800}>
            Price Range (₹)
          </Typography>
          <Typography variant="caption" fontWeight={800} color="primary.main">
            ₹{filters.priceRange?.[0] || 150} - ₹{filters.priceRange?.[1] || 1000}
          </Typography>
        </Box>
        <Slider
          value={filters.priceRange || [150, 1000]}
          onChange={(_e, val) => onFilterChange({ priceRange: val as [number, number] })}
          valueLabelDisplay="auto"
          min={150}
          max={1000}
          step={50}
          sx={{ color: 'primary.main' }}
        />
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* 5. Toggles */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <FormControlLabel
          control={
            <Switch
              checked={Boolean(filters.verifiedOnly)}
              onChange={(e) => onFilterChange({ verifiedOnly: e.target.checked })}
              color="primary"
              size="small"
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <VerifiedIcon sx={{ color: '#2563EB', fontSize: 18 }} />
              <Typography variant="body2" fontWeight={700}>
                Verified Only
              </Typography>
            </Box>
          }
        />

        <FormControlLabel
          control={
            <Switch
              checked={Boolean(filters.availableOnly)}
              onChange={(e) => onFilterChange({ availableOnly: e.target.checked })}
              color="success"
              size="small"
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <FlashOnIcon sx={{ color: '#10B981', fontSize: 18 }} />
              <Typography variant="body2" fontWeight={700}>
                Available Today Only
              </Typography>
            </Box>
          }
        />
      </Box>
    </Paper>
  );
};

export default FilterSidebar;

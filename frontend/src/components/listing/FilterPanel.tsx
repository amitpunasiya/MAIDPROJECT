import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Slider,
  Switch,
  Chip,
  Stack,
  Button as MuiButton,
} from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import { MOCK_LANGUAGES } from '../../services/mockData';

export interface FilterState {
  minExperience: number;
  minRating: number;
  gender: string;
  languages: string[];
  priceRange: [number, number];
  availableOnly: boolean;
  verifiedOnly: boolean;
}

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  totalCount?: number;
  totalResults?: number;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalCount,
  totalResults,
}) => {
  const displayTotal = typeof totalCount === 'number' ? totalCount : totalResults;

  const handleLanguageToggle = (lang: string) => {
    const exists = filters.languages.includes(lang);
    const updated = exists
      ? filters.languages.filter((l) => l !== lang)
      : [...filters.languages, lang];
    onFilterChange({ languages: updated });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        border: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.03)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterAltIcon color="primary" />
          <Typography variant="h6" fontWeight={800}>
            Filters {displayTotal !== undefined && `(${displayTotal})`}
          </Typography>
        </Box>
        <MuiButton
          size="small"
          startIcon={<RestartAltIcon />}
          onClick={onResetFilters}
          sx={{ fontWeight: 700, fontSize: '0.75rem' }}
        >
          Reset
        </MuiButton>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Verified & Available Toggles */}
      <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <FormControlLabel
          control={
            <Switch
              checked={filters.verifiedOnly}
              onChange={(e) => onFilterChange({ verifiedOnly: e.target.checked })}
              color="primary"
              size="small"
            />
          }
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
          control={
            <Switch
              checked={filters.availableOnly}
              onChange={(e) => onFilterChange({ availableOnly: e.target.checked })}
              color="primary"
              size="small"
            />
          }
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

      <Divider sx={{ mb: 3 }} />

      {/* Hourly Rate Price Range Slider */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" fontWeight={800} gutterBottom>
          Hourly Rate (₹)
        </Typography>
        <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 1 }}>
          ₹{filters.priceRange[0]} — ₹{filters.priceRange[1]}/hr
        </Typography>
        <Slider
          value={filters.priceRange}
          onChange={(_, val) => onFilterChange({ priceRange: val as [number, number] })}
          min={100}
          max={1000}
          step={50}
          valueLabelDisplay="auto"
          size="small"
        />
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Minimum Rating */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" fontWeight={800} gutterBottom>
          Minimum Rating
        </Typography>
        <FormControl component="fieldset">
          <RadioGroup
            value={filters.minRating}
            onChange={(e) => onFilterChange({ minRating: Number(e.target.value) })}
          >
            <FormControlLabel value={0} control={<Radio size="small" />} label="Any Rating" />
            <FormControlLabel value={4} control={<Radio size="small" />} label="4.0 ⭐ and above" />
            <FormControlLabel value={4.5} control={<Radio size="small" />} label="4.5 ⭐ and above" />
            <FormControlLabel value={4.8} control={<Radio size="small" />} label="4.8 ⭐ Top Rated" />
          </RadioGroup>
        </FormControl>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Minimum Experience */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" fontWeight={800} gutterBottom>
          Experience Level
        </Typography>
        <FormControl component="fieldset">
          <RadioGroup
            value={filters.minExperience}
            onChange={(e) => onFilterChange({ minExperience: Number(e.target.value) })}
          >
            <FormControlLabel value={0} control={<Radio size="small" />} label="Any Experience" />
            <FormControlLabel value={2} control={<Radio size="small" />} label="2+ Years" />
            <FormControlLabel value={5} control={<Radio size="small" />} label="5+ Years" />
            <FormControlLabel value={8} control={<Radio size="small" />} label="8+ Years (Master)" />
          </RadioGroup>
        </FormControl>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Gender Filter */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" fontWeight={800} gutterBottom>
          Gender Preference
        </Typography>
        <FormControl component="fieldset">
          <RadioGroup
            value={filters.gender}
            onChange={(e) => onFilterChange({ gender: e.target.value })}
          >
            <FormControlLabel value="all" control={<Radio size="small" />} label="No Preference" />
            <FormControlLabel value="female" control={<Radio size="small" />} label="Female Staff" />
            <FormControlLabel value="male" control={<Radio size="small" />} label="Male Staff" />
          </RadioGroup>
        </FormControl>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Languages Spoken */}
      <Box>
        <Typography variant="subtitle2" fontWeight={800} gutterBottom>
          Languages Spoken
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={0.8} sx={{ mt: 1 }}>
          {MOCK_LANGUAGES.map((lang) => {
            const selected = filters.languages.includes(lang);
            return (
              <Chip
                key={lang}
                label={lang}
                size="small"
                onClick={() => handleLanguageToggle(lang)}
                color={selected ? 'primary' : 'default'}
                variant={selected ? 'filled' : 'outlined'}
                sx={{ fontWeight: 600, fontSize: '0.75rem', borderRadius: '6px' }}
              />
            );
          })}
        </Stack>
      </Box>
    </Paper>
  );
};

export default FilterPanel;

import React from 'react';
import { Paper, Box, TextField, MenuItem, Select, FormControl, InputAdornment, Button as MuiButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

export interface AdminFiltersProps {
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  statusFilter?: string;
  onStatusChange?: (value: string) => void;
  statusOptions?: Array<{ label: string; value: string }>;
  onResetFilters?: () => void;
}

export const AdminFilters: React.FC<AdminFiltersProps> = ({
  searchTerm = '',
  onSearchChange,
  statusFilter = 'all',
  onStatusChange,
  statusOptions = [
    { label: 'All Statuses', value: 'all' },
    { label: 'Active / Confirmed', value: 'active' },
    { label: 'Pending / Unread', value: 'pending' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled / Suspended', value: 'cancelled' },
  ],
  onResetFilters,
}) => {
  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFF', mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        {/* Search Field */}
        <TextField
          placeholder="Search by name, ID, phone, or email..."
          size="small"
          value={searchTerm}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ flexGrow: 1, minWidth: 260, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
        />

        {/* Status Dropdown Filter */}
        {onStatusChange && (
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <Select
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <FilterListIcon fontSize="small" color="action" />
                </InputAdornment>
              }
              sx={{ borderRadius: '10px', bgcolor: '#F8FAFC' }}
            >
              {statusOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Reset Button */}
        {onResetFilters && (
          <MuiButton
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={<RestartAltIcon fontSize="small" />}
            onClick={onResetFilters}
            sx={{ borderRadius: '10px', fontWeight: 700, textTransform: 'none' }}
          >
            Reset
          </MuiButton>
        )}
      </Box>
    </Paper>
  );
};

export default AdminFilters;

import React from 'react';
import { Box, Typography, Select, MenuItem, InputAdornment, Paper, ToggleButtonGroup, ToggleButton, Tooltip } from '@mui/material';
import SortIcon from '@mui/icons-material/Sort';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';

interface ProviderSortProps {
  sortBy: string;
  onSortChange: (val: string) => void;
  totalCount: number;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export const ProviderSort: React.FC<ProviderSortProps> = ({
  sortBy,
  onSortChange,
  totalCount,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 2,
        mb: 3,
      }}
    >
      <Typography variant="body2" color="text.secondary" fontWeight={600}>
        Showing <Typography component="span" fontWeight={800} color="text.primary">{totalCount}</Typography> verified providers
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: { sm: 'auto' }, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" fontWeight={700} color="text.secondary">
            Sort By:
          </Typography>
          <Select
            size="small"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <SortIcon fontSize="small" color="primary" />
              </InputAdornment>
            }
            sx={{ borderRadius: '10px', bgcolor: '#FFFFFF', minWidth: 180, fontWeight: 700 }}
          >
            <MenuItem value="rating">Highest Rated ★</MenuItem>
            <MenuItem value="price_low">Lowest Price (Hourly)</MenuItem>
            <MenuItem value="price_high">Highest Price (Hourly)</MenuItem>
            <MenuItem value="experience">Highest Experience</MenuItem>
            <MenuItem value="newest">Newest Listed</MenuItem>
          </Select>
        </Box>

        <Paper elevation={0} sx={{ border: '1px solid #CBD5E1', borderRadius: '10px', p: 0.4, bgcolor: '#FFFFFF' }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_e, val) => val && onViewModeChange(val)}
            size="small"
          >
            <Tooltip title="Grid View">
              <ToggleButton value="grid" sx={{ borderRadius: '8px', px: 1.2 }}>
                <GridViewIcon fontSize="small" />
              </ToggleButton>
            </Tooltip>
            <Tooltip title="List View">
              <ToggleButton value="list" sx={{ borderRadius: '8px', px: 1.2 }}>
                <ViewListIcon fontSize="small" />
              </ToggleButton>
            </Tooltip>
          </ToggleButtonGroup>
        </Paper>
      </Box>
    </Box>
  );
};

export default ProviderSort;

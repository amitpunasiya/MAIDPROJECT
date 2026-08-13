import React from 'react';
import { Box, Typography, Select, MenuItem } from '@mui/material';

interface SortControlProps {
  sortBy: string;
  onSortChange: (val: any) => void;
  totalCount?: number;
  itemType?: string;
}

export const SortControl: React.FC<SortControlProps> = ({
  sortBy,
  onSortChange,
  totalCount,
  itemType = 'professional',
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
      {typeof totalCount === 'number' && (
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          Showing <Typography component="span" fontWeight={800} color="text.primary">{totalCount}</Typography> verified {itemType}s
        </Typography>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: { sm: 'auto' } }}>
        <Typography variant="body2" fontWeight={700} color="text.secondary">
          Sort By:
        </Typography>
        <Select
          size="small"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          sx={{ borderRadius: '10px', bgcolor: '#FFF', minWidth: 160, fontWeight: 600 }}
        >
          <MenuItem value="rating">Top Rated ⭐</MenuItem>
          <MenuItem value="price_low">Price: Low to High</MenuItem>
          <MenuItem value="price_high">Price: High to Low</MenuItem>
          <MenuItem value="experience">Most Experienced</MenuItem>
        </Select>
      </Box>
    </Box>
  );
};

export default SortControl;

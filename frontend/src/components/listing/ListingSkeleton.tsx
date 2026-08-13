import React from 'react';
import { Grid2, Paper, Skeleton, Box } from '@mui/material';

interface ListingSkeletonProps {
  count?: number;
  viewMode?: string;
}

export const ListingSkeleton: React.FC<ListingSkeletonProps> = ({ count = 6 }) => {
  return (
    <Grid2 container spacing={3.5}>
      {Array.from({ length: count }).map((_, idx) => (
        <Grid2 key={idx} size={{ xs: 12, sm: 6, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
              p: 0,
            }}
          >
            <Skeleton variant="rectangular" height={220} width="100%" />
            <Box sx={{ p: 3 }}>
              <Skeleton variant="text" width="60%" height={28} />
              <Skeleton variant="text" width="40%" height={20} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" height={60} sx={{ mb: 2, borderRadius: 2 }} />
              <Skeleton variant="text" width="90%" height={20} />
              <Skeleton variant="text" width="80%" height={20} sx={{ mb: 3 }} />
              <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 2.5 }} />
            </Box>
          </Paper>
        </Grid2>
      ))}
    </Grid2>
  );
};

export default ListingSkeleton;

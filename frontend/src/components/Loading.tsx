import React from 'react';
import { Box, CircularProgress, Typography, Skeleton, Container, Paper, Grid2 } from '@mui/material';

export interface LoadingProps {
  message?: string;
  fullPage?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  message = 'Loading...',
  fullPage = false,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
        minHeight: fullPage ? '70vh' : '200px',
        width: '100%',
      }}
      aria-busy="true"
      aria-live="polite"
    >
      <CircularProgress size={44} thickness={4} color="primary" sx={{ mb: 2 }} />
      {message && (
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {message}
        </Typography>
      )}
    </Box>
  );
};

export const CardSkeleton: React.FC<{ height?: number }> = ({ height = 240 }) => (
  <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #E2E8F0', width: '100%' }}>
    <Skeleton variant="rectangular" height={height} sx={{ borderRadius: 3, mb: 2 }} />
    <Skeleton variant="text" width="60%" height={28} />
    <Skeleton variant="text" width="80%" height={20} />
    <Skeleton variant="text" width="40%" height={20} />
  </Paper>
);

export const PageSkeleton: React.FC = () => (
  <Container maxWidth="lg" sx={{ py: 6 }}>
    <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 4, mb: 4 }} />
    <Grid2 container spacing={3}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Grid2 key={i} size={{ xs: 12, sm: 6, md: 4 }}>
          <CardSkeleton />
        </Grid2>
      ))}
    </Grid2>
  </Container>
);

export default Loading;

import React from 'react';
import { Paper, Box, Typography, Grid2, LinearProgress } from '@mui/material';

export const AnalyticsCharts: React.FC = () => {
  const categoryBreakdown = [
    { label: 'Home Cooks / Chefs', percent: 48, count: '198 Bookings', color: '#2563EB' },
    { label: 'Housekeeping Maids', percent: 32, count: '132 Bookings', color: '#10B981' },
    { label: 'Deep Home Cleaning', percent: 12, count: '50 Bookings', color: '#F59E0B' },
    { label: 'Baby / Elder Care', percent: 8, count: '32 Bookings', color: '#8B5CF6' },
  ];

  const monthlyGrowth = [
    { month: 'Apr', value: 65 },
    { month: 'May', value: 80 },
    { month: 'Jun', value: 72 },
    { month: 'Jul', value: 94 },
    { month: 'Aug', value: 100 },
  ];

  return (
    <Grid2 container spacing={3}>
      {/* Category Share Progress */}
      <Grid2 size={{ xs: 12, md: 6 }}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFF' }}>
          <Typography variant="h6" fontWeight={800} gutterBottom>
            Service Category Revenue Share
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>
            Breakdown of total platform bookings by staff category.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {categoryBreakdown.map((cat) => (
              <Box key={cat.label}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {cat.label}
                  </Typography>
                  <Typography variant="caption" fontWeight={800} color="text.secondary">
                    {cat.percent}% ({cat.count})
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={cat.percent}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: '#F1F5F9',
                    '& .MuiLinearProgress-bar': { bgcolor: cat.color },
                  }}
                />
              </Box>
            ))}
          </Box>
        </Paper>
      </Grid2>

      {/* Monthly Bar Chart Simulation */}
      <Grid2 size={{ xs: 12, md: 6 }}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFF' }}>
          <Typography variant="h6" fontWeight={800} gutterBottom>
            Monthly Revenue Trend (2026)
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>
            Platform revenue growth over past 5 months.
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 160, pt: 2, px: 2 }}>
            {monthlyGrowth.map((g) => (
              <Box key={g.month} sx={{ textAlign: 'center', flexGrow: 1, mx: 1 }}>
                <Box
                  sx={{
                    height: `${g.value}%`,
                    bgcolor: '#2563EB',
                    borderRadius: '8px 8px 0 0',
                    transition: 'all 0.3s ease',
                    '&:hover': { bgcolor: '#1D4ED8' },
                  }}
                />
                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {g.month}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Grid2>
    </Grid2>
  );
};

export default AnalyticsCharts;

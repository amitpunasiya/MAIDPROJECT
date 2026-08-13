import React from 'react';
import { Paper, Box, Typography, Chip } from '@mui/material';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement;
  trend?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'info';
  bgGradient?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = 'primary',
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        border: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
        boxShadow: '0 4px 18px rgba(15, 23, 42, 0.04)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justify: 'space-between',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 28px rgba(15, 23, 42, 0.08)',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '14px',
            bgcolor: `${color}.light`,
            color: `${color}.main`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>

        {trend && (
          <Chip label={trend} size="small" color={color} sx={{ fontWeight: 800, fontSize: '0.7rem' }} />
        )}
      </Box>

      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
        </Typography>
        <Typography variant="h4" fontWeight={800} color="text.primary" sx={{ mt: 0.5 }}>
          {value}
        </Typography>
      </Box>
    </Paper>
  );
};

export default StatsCard;

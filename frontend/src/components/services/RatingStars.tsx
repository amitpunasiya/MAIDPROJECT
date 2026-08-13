import React from 'react';
import { Box, Typography, Rating } from '@mui/material';

interface RatingStarsProps {
  rating: number;
  totalRatings?: number;
  showCount?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  totalRatings,
  showCount = true,
  size = 'small',
}) => {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.8 }}>
      <Rating value={rating} precision={0.1} readOnly size={size} />
      <Typography variant="body2" fontWeight={800} color="text.primary">
        {rating.toFixed(1)}
      </Typography>
      {showCount && totalRatings !== undefined && (
        <Typography variant="caption" color="text.secondary" fontWeight={500}>
          ({totalRatings})
        </Typography>
      )}
    </Box>
  );
};

export default RatingStars;

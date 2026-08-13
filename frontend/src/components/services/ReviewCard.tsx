import React from 'react';
import { Paper, Box, Typography, Avatar, Rating } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import { IProviderReview } from '../../types';

interface ReviewCardProps {
  review: IProviderReview;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: '1px solid #E2E8F0',
        bgcolor: '#F8FAFC',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justify: 'space-between',
      }}
    >
      <Box sx={{ mb: 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar src={review.userAvatar} alt={review.userName} sx={{ width: 40, height: 40 }} />
            <Box>
              <Typography variant="subtitle2" fontWeight={800} color="text.primary">
                {review.userName}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <VerifiedIcon sx={{ fontSize: 13, color: 'primary.main' }} />
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Verified Client • {review.date}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Rating value={review.rating} precision={0.5} readOnly size="small" />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mt: 1 }}>
          "{review.comment}"
        </Typography>
      </Box>
    </Paper>
  );
};

export default ReviewCard;

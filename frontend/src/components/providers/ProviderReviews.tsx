import React from 'react';
import { Paper, Box, Typography, Avatar, Rating, Stack, Divider, LinearProgress } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import RateReviewIcon from '@mui/icons-material/RateReview';
import VerifiedIcon from '@mui/icons-material/Verified';
import { IProviderReview } from '../../types';

interface ProviderReviewsProps {
  averageRating: number;
  totalRatings: number;
  reviewsList?: IProviderReview[];
}

const defaultReviews: IProviderReview[] = [
  {
    id: 'rev-1',
    userName: 'Ananya Sharma',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    date: '2 days ago',
    comment: 'Punctual, extremely polite, and cooks amazing North Indian thalis! Everything was prepared with minimal oil as requested.',
  },
  {
    id: 'rev-2',
    userName: 'Vikram Malhotra',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    date: '1 week ago',
    comment: 'Polite behavior and immaculate housekeeping service. Floors were spotless and utensils cleaned thoroughly.',
  },
  {
    id: 'rev-3',
    userName: 'Pooja Hegde',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    rating: 4.8,
    date: '2 weeks ago',
    comment: 'Very reliable and trustworthy! Always arrives right on time.',
  },
];

export const ProviderReviews: React.FC<ProviderReviewsProps> = ({
  averageRating,
  totalRatings,
  reviewsList = defaultReviews,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3.5,
        borderRadius: 4,
        border: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
        mb: 4,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <RateReviewIcon color="primary" />
        <Typography variant="h6" fontWeight={800} color="text.primary">
          Customer Reviews & Ratings
        </Typography>
      </Box>

      {/* Average Rating Score Box */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 4, alignItems: 'center', p: 3, bgcolor: '#F8FAFC', borderRadius: 3, mb: 4, border: '1px solid #E2E8F0' }}>
        <Box sx={{ textAlign: 'center', minWidth: 120 }}>
          <Typography variant="h2" fontWeight={800} color="text.primary" lineHeight={1}>
            {averageRating}
          </Typography>
          <Rating value={averageRating} precision={0.1} readOnly sx={{ my: 1 }} />
          <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
            Based on {totalRatings} verified reviews
          </Typography>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />

        {/* Rating Breakdown Progress Bars */}
        <Box sx={{ flexGrow: 1, width: '100%' }}>
          {[
            { label: '5 Stars', pct: 88 },
            { label: '4 Stars', pct: 10 },
            { label: '3 Stars', pct: 2 },
            { label: '2 Stars', pct: 0 },
            { label: '1 Star', pct: 0 },
          ].map((item) => (
            <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.8 }}>
              <Typography variant="caption" fontWeight={700} sx={{ width: 50 }}>
                {item.label}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={item.pct}
                sx={{ flexGrow: 1, height: 8, borderRadius: 4, bgcolor: '#E2E8F0', '& .MuiLinearProgress-bar': { bgcolor: '#F59E0B' } }}
              />
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ width: 35 }}>
                {item.pct}%
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Reviews List */}
      <Stack spacing={3}>
        {reviewsList.map((rev, idx) => (
          <Box key={rev.id || idx}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar src={rev.userAvatar} alt={rev.userName} sx={{ width: 42, height: 42 }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight={800}>
                    {rev.userName}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <VerifiedIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Verified Booking Customer • {rev.date}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#FEF3C7', px: 1, py: 0.2, borderRadius: 1.5 }}>
                <StarIcon sx={{ color: '#F59E0B', fontSize: 16 }} />
                <Typography variant="caption" fontWeight={800} color="#92400E">
                  {rev.rating}
                </Typography>
              </Box>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ pl: { sm: 6.8 }, lineHeight: 1.6 }}>
              "{rev.comment}"
            </Typography>

            {idx < reviewsList.length - 1 && <Divider sx={{ mt: 2.5 }} />}
          </Box>
        ))}
      </Stack>
    </Paper>
  );
};

export default ProviderReviews;

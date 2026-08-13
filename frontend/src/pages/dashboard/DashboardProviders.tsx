import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid2,
  Paper,
  Avatar,
  Stack,
  Rating,
  Button as MuiButton,
  Chip,
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useNavigate } from 'react-router-dom';

import DashboardHeader from '../../components/dashboard/DashboardHeader';
import { MOCK_COOKS, MOCK_MAIDS } from '../../services/mockData';
import { ICookProfile, IMaidProfile } from '../../types';

export const DashboardProviders: React.FC = () => {
  const navigate = useNavigate();
  const [savedList, setSavedList] = useState<(ICookProfile | IMaidProfile)[]>([
    MOCK_COOKS[0],
    MOCK_COOKS[1],
    MOCK_MAIDS[0],
    MOCK_MAIDS[1],
  ]);

  const handleRemove = (id: string) => {
    setSavedList((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <Box>
      <DashboardHeader title="Saved Favorite Providers" subtitle="Bookmark preferred home cooks & housemaids for quick rebooking." />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight={800}>
          Your Bookmarked Professionals ({savedList.length})
        </Typography>
      </Box>

      {savedList.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
          <FavoriteIcon sx={{ fontSize: 56, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" fontWeight={800} gutterBottom>
            No Saved Providers
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Save your favorite chefs and housemaids to rebook them easily in 1 click.
          </Typography>
          <MuiButton variant="contained" onClick={() => navigate('/services')}>
            Browse Services
          </MuiButton>
        </Paper>
      ) : (
        <Grid2 container spacing={3.5}>
          {savedList.map((prov) => {
            const isCook = 'skills' in prov;
            return (
              <Grid2 key={prov.id} size={{ xs: 12, sm: 6 }}>
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
                  }}
                >
                  <Box>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                      <Avatar src={prov.avatar} alt={prov.name} sx={{ width: 60, height: 60, border: '2px solid #2563EB' }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <Typography variant="h6" fontWeight={800} color="text.primary">
                            {prov.name}
                          </Typography>
                          {prov.verified && <VerifiedIcon sx={{ fontSize: 16, color: 'primary.main' }} />}
                        </Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          {isCook ? 'Home Culinary Specialist' : 'Housekeeping Expert'} • {prov.experienceYears} Yrs Exp
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.5 }}>
                          <Rating value={prov.averageRating} precision={0.1} readOnly size="small" />
                          <Typography variant="caption" fontWeight={800}>
                            {prov.averageRating} ({prov.totalRatings})
                          </Typography>
                        </Box>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                      <Chip label={`₹${prov.hourlyRate}/hr`} color="primary" size="small" sx={{ fontWeight: 800 }} />
                      <Chip label={`📍 ${prov.area}, ${prov.city}`} variant="outlined" size="small" sx={{ fontWeight: 600 }} />
                    </Stack>
                  </Box>

                  {/* Actions Footer */}
                  <Stack direction="row" spacing={1} justifyContent="space-between" sx={{ pt: 2, borderTop: '1px solid #F1F5F9' }}>
                    <MuiButton
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<DeleteOutlineIcon fontSize="small" />}
                      onClick={() => handleRemove(prov.id)}
                      sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
                    >
                      Remove
                    </MuiButton>

                    <Stack direction="row" spacing={1}>
                      <MuiButton
                        variant="outlined"
                        size="small"
                        onClick={() => navigate(`/service/${prov.id}`)}
                        sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
                      >
                        View Profile
                      </MuiButton>
                      <MuiButton
                        variant="contained"
                        size="small"
                        startIcon={<CalendarMonthIcon fontSize="small" />}
                        onClick={() => navigate('/booking')}
                        sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 800 }}
                      >
                        Book Again
                      </MuiButton>
                    </Stack>
                  </Stack>
                </Paper>
              </Grid2>
            );
          })}
        </Grid2>
      )}
    </Box>
  );
};

export default DashboardProviders;

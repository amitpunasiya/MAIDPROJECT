import React, { useEffect } from 'react';
import { Box, Typography, Slide } from '@mui/material';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { setOfflineStatus } from '../../store/uiSlice';

export const OfflineBanner: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOffline = useAppSelector((state) => state.ui.isOffline);

  useEffect(() => {
    const handleOnline = () => dispatch(setOfflineStatus(false));
    const handleOffline = () => dispatch(setOfflineStatus(true));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch]);

  return (
    <Slide direction="down" in={isOffline} mountOnEnter unmountOnExit>
      <Box
        sx={{
          bgcolor: '#EF4444',
          color: '#FFFFFF',
          py: 1,
          px: 2,
          textAlign: 'center',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
        }}
      >
        <WifiOffIcon fontSize="small" />
        <Typography variant="body2" fontWeight={700}>
          You are currently offline. Showing cached app state.
        </Typography>
      </Box>
    </Slide>
  );
};

export default OfflineBanner;
